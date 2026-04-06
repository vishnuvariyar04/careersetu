import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { GEMINI_FLASH_MODEL } from "@/lib/gemini-models"
import { parseJsonFromModelText } from "@/lib/parse-json-response"
import { createClient } from "@/lib/server-supabase"

export const runtime = "nodejs"
export const maxDuration = 120

type SkillInput = {
  skill_name: string
  repo_url: string
}

type AnalysisResult = {
  skill_name: string
  repo_url: string
  experience_level: "beginner" | "intermediate" | "advanced"
  /** Set from Gemini when we get a valid level string from the model */
  level_source: "model" | "fallback"
  /** Present when level_source is "fallback" (machine-readable for UI copy) */
  fallback_reason?:
    | "invalid_github_repo"
    | "ai_error"
    | "ai_invalid_level"
    | null
}

type TreeItem = {
  path: string
  type: "blob" | "tree"
  size?: number
}

type CodeSnapshot = {
  readme: string | null
  files: Array<{ path: string; content: string }>
}

function parseGithubRepo(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url)
    if (u.hostname !== "github.com") return null
    const parts = u.pathname.split("/").filter(Boolean)
    if (parts.length < 2) return null
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") }
  } catch {
    return null
  }
}

async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  const branches = ["main", "master"]
  for (const branch of branches) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`
    try {
      const res = await fetch(url)
      if (res.ok) {
        const text = await res.text()
        if (text.trim()) return text
      }
    } catch {
      // ignore and try next branch
    }
  }
  return null
}

function githubHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function fetchRepoTree(owner: string, repo: string, token?: string): Promise<TreeItem[]> {
  const branches = ["main", "master"]
  for (const branch of branches) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        { headers: githubHeaders(token) }
      )
      if (!res.ok) continue
      const data = (await res.json()) as { tree?: TreeItem[] }
      if (Array.isArray(data.tree)) return data.tree
    } catch {
      // try next branch
    }
  }
  return []
}

function pickRelevantFiles(tree: TreeItem[], skill: string): string[] {
  const blocked = [/^node_modules\//, /^dist\//, /^build\//, /^\.next\//, /^coverage\//]
  const codeExt = /\.(ts|tsx|js|jsx|py|java|go|rs|rb|php|cs|cpp|c|swift|kt|sql|html|css)$/i
  const priorityBySkill: Record<string, RegExp[]> = {
    react: [/tsx?$/i, /jsx$/i, /components?/i],
    "node.js": [/ts$/i, /js$/i, /routes?/i, /controllers?/i],
    python: [/py$/i, /requirements\.txt$/i, /fastapi|flask|django/i],
    postgresql: [/sql$/i, /migrations?/i, /prisma|typeorm|sequelize/i],
    mongodb: [/schema/i, /mongoose/i],
    docker: [/dockerfile$/i, /docker-compose/i],
    typescript: [/ts$/i, /tsx$/i, /tsconfig\.json$/i],
    supabase: [/supabase/i, /migrations?/i, /sql$/i],
    fastapi: [/py$/i, /fastapi/i],
    aws: [/terraform|cloudformation|serverless/i, /yml$/i],
  }

  const skillKey = skill.toLowerCase()
  const skillMatchers = priorityBySkill[skillKey] || []

  const candidates = tree
    .filter((x) => x.type === "blob")
    .filter((x) => !blocked.some((re) => re.test(x.path)))
    .filter((x) => (x.size || 0) > 0 && (x.size || 0) <= 60_000)
    .map((x) => x.path)

  const high = candidates.filter((p) => skillMatchers.some((re) => re.test(p)))
  const medium = candidates.filter((p) => codeExt.test(p))
  const must = candidates.filter((p) =>
    /(^|\/)(readme\.md|package\.json|requirements\.txt|pyproject\.toml|dockerfile|tsconfig\.json)$/i.test(
      p
    )
  )

  const ordered = Array.from(new Set([...must, ...high, ...medium]))
  return ordered.slice(0, 8)
}

async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
      { headers: githubHeaders(token) }
    )
    if (!res.ok) return null
    const data = (await res.json()) as { content?: string; encoding?: string; size?: number }
    if (!data.content || data.encoding !== "base64") return null
    if ((data.size || 0) > 80_000) return null
    const decoded = Buffer.from(data.content, "base64").toString("utf8")
    return decoded.slice(0, 3500)
  } catch {
    return null
  }
}

async function buildCodeSnapshot(
  owner: string,
  repo: string,
  skill: string,
  token?: string
): Promise<CodeSnapshot> {
  const readme = await fetchReadme(owner, repo)
  const tree = await fetchRepoTree(owner, repo, token)
  const picked = pickRelevantFiles(tree, skill)
  const files: Array<{ path: string; content: string }> = []
  for (const path of picked) {
    const content = await fetchFileContent(owner, repo, path, token)
    if (content && content.trim()) files.push({ path, content })
  }
  return { readme, files }
}

export async function POST(req: Request) {
  try {
    const key = process.env.GEMINI_API_KEY
    if (!key) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server" },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as {
      githubAccessToken?: string
      skills?: SkillInput[]
    }
    const githubAccessToken = body.githubAccessToken
      ? String(body.githubAccessToken).trim()
      : ""
    const skills = Array.isArray(body.skills) ? body.skills : []
    const cleaned: SkillInput[] = skills
      .map((s) => ({
        skill_name: String(s.skill_name || "").trim(),
        repo_url: String(s.repo_url || "").trim(),
      }))
      .filter((s) => s.skill_name && s.repo_url)

    if (!cleaned.length) {
      return NextResponse.json({ error: "No skills provided" }, { status: 400 })
    }
    if (!githubAccessToken) {
      return NextResponse.json(
        { error: "Missing GitHub access token. Sign in with GitHub and try again." },
        { status: 400 }
      )
    }

    const genAI = new GoogleGenerativeAI(key)
    const modelName = process.env.GEMINI_MODEL || GEMINI_FLASH_MODEL

    const results: AnalysisResult[] = []

    for (const skill of cleaned) {
      const parsedRepo = parseGithubRepo(skill.repo_url)
      if (!parsedRepo) {
        results.push({
          skill_name: skill.skill_name,
          repo_url: skill.repo_url,
          experience_level: "beginner",
          level_source: "fallback",
          fallback_reason: "invalid_github_repo",
        })
        continue
      }

      const snapshot = await buildCodeSnapshot(
        parsedRepo.owner,
        parsedRepo.repo,
        skill.skill_name,
        githubAccessToken
      )

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      })

      const codeBlock =
        snapshot.files.length > 0
          ? snapshot.files
              .map(
                (f) =>
                  `FILE: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``
              )
              .join("\n\n")
          : "(no code files fetched)"

      const prompt = `
You are assessing a student's practical coding proficiency for one specific skill from a real repository.

Return ONLY valid JSON with this exact shape:
{
  "experience_level": "beginner" | "intermediate" | "advanced"
}

Skill being assessed: ${skill.skill_name}
GitHub repository URL: ${skill.repo_url}

Repository README (if available):
${snapshot.readme ? snapshot.readme.slice(0, 5000) : "(no README content could be fetched)"}

Representative repository code/files:
${codeBlock}

Assessment guidance:
- beginner: basic usage, limited architecture/testing depth
- intermediate: solid implementation patterns, reasonable structure and integration
- advanced: strong architecture, robustness, maintainability, and clear skill mastery`

      let level: "beginner" | "intermediate" | "advanced" = "beginner"
      let levelSource: "model" | "fallback" = "fallback"
      let fallbackReason: AnalysisResult["fallback_reason"] = "ai_invalid_level"
      try {
        const resp = await model.generateContent([{ text: prompt }])
        const text = resp.response.text()
        const parsed = parseJsonFromModelText(text) as { experience_level?: string }
        const raw = String(parsed.experience_level || "").toLowerCase()
        if (raw === "advanced" || raw === "intermediate" || raw === "beginner") {
          level = raw
          levelSource = "model"
          fallbackReason = null
        }
      } catch (e) {
        console.error("[analyze-repos] Gemini error for skill", skill.skill_name, e)
        fallbackReason = "ai_error"
      }

      results.push({
        skill_name: skill.skill_name,
        repo_url: skill.repo_url,
        experience_level: level,
        level_source: levelSource,
        fallback_reason: levelSource === "model" ? null : fallbackReason,
      })
    }

    // Upsert into student_skills
    // We treat (student_id, skill_name) as logical key and overwrite repo_url/experience_level
    for (const r of results) {
      const { data: existing, error: existingErr } = await supabase
        .from("student_skills")
        .select("id")
        .eq("student_id", user.id)
        .eq("skill_name", r.skill_name)
        .maybeSingle()
      if (existingErr) {
        console.error("[analyze-repos] read student_skills failed", existingErr)
        return NextResponse.json(
          { error: `Failed to read student_skills for ${r.skill_name}: ${existingErr.message}` },
          { status: 500 }
        )
      }

      if (existing) {
        const { error: updateErr } = await supabase
          .from("student_skills")
          .update({
            repo_url: r.repo_url,
            experience_level: r.experience_level,
          })
          .eq("id", existing.id)
        if (updateErr) {
          console.error("[analyze-repos] update student_skills failed", updateErr)
          return NextResponse.json(
            { error: `Failed to update student_skills for ${r.skill_name}: ${updateErr.message}` },
            { status: 500 }
          )
        }
      } else {
        const { error: insertErr } = await supabase.from("student_skills").insert({
          student_id: user.id,
          skill_name: r.skill_name,
          repo_url: r.repo_url,
          experience_level: r.experience_level,
        })
        if (insertErr) {
          console.error("[analyze-repos] insert student_skills failed", insertErr)
          return NextResponse.json(
            { error: `Failed to insert student_skills for ${r.skill_name}: ${insertErr.message}` },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json({ skills: results })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Analysis failed"
    console.error("[student/onboarding/analyze-repos]", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

