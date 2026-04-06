"use client"

import { useState } from "react"
import { TECH_STACK_OPTIONS } from "@/components/onboarding/constants"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useEffect } from "react"
import { Loader2, Sparkles } from "lucide-react"

type SkillEntry = {
  id: string
  skill_name: string
  repo_url: string
}

interface Props {
  initialGithubUrl?: string | null
  onCompleted?: () => void
}

export function StudentOnboardingSurvey({
  initialGithubUrl,
  onCompleted,
}: Props) {
  const [githubUrl, setGithubUrl] = useState(initialGithubUrl ?? "")
  const [skills, setSkills] = useState<SkillEntry[]>([])
  const [selectedTech, setSelectedTech] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [skillDuplicateHint, setSkillDuplicateHint] = useState<string | null>(null)

  const normalizeSkillName = (s: string) =>
    s.trim().replace(/\s+/g, " ").toLowerCase()

  useEffect(() => {
    if (githubUrl) return
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const identities = Array.isArray(user?.identities) ? user.identities : []
      const ghIdentity = identities.find((i: any) => i.provider === "github")
      const identityData = (ghIdentity as any)?.identity_data || {}
      const login =
        String(identityData.user_name || identityData.preferred_username || identityData.login || "").trim() ||
        String((user as any)?.user_metadata?.user_name || (user as any)?.user_metadata?.preferred_username || "").trim()
      if (login) {
        setGithubUrl(`https://github.com/${login}`)
      }
    })()
  }, [githubUrl])

  const addSkillByName = (rawName: string) => {
    const skill = rawName.trim().replace(/\s+/g, " ")
    if (!skill) return
    const key = normalizeSkillName(skill)
    if (skills.some((s) => normalizeSkillName(s.skill_name) === key)) {
      setSkillDuplicateHint(`You already added “${skill}”. Each skill can only appear once.`)
      return
    }
    setSkillDuplicateHint(null)
    setSkills((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${skill}`,
        skill_name: skill,
        repo_url: "",
      },
    ])
    setSelectedTech("")
  }

  const addSkill = () => addSkillByName(selectedTech)

  const updateRepo = (id: string, repo_url: string) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, repo_url } : s)))
  }

  const removeSkill = (id: string) => {
    setSkillDuplicateHint(null)
    setSkills((prev) => prev.filter((s) => s.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!githubUrl.trim()) {
      setError("GitHub profile not found in your session. Please sign in with GitHub again.")
      return
    }
    const effectiveSkills = skills.filter((s) => s.repo_url.trim())
    if (!effectiveSkills.length) {
      setError("Please add at least one skill and repository URL.")
      return
    }

    const nameKeys = effectiveSkills.map((s) => normalizeSkillName(s.skill_name))
    if (new Set(nameKeys).size !== nameKeys.length) {
      setError("You have the same skill twice. Remove the duplicate before continuing.")
      return
    }

    setSkillDuplicateHint(null)
    setIsSubmitting(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const githubAccessToken = session?.provider_token || null

      if (!githubAccessToken) {
        throw new Error("GitHub access token missing. Please sign in with GitHub as a student.")
      }

      // 1) Save GitHub base URL on student
      const profileRes = await fetch("/api/student/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_url: githubUrl.trim() }),
      })
      const profileData = await profileRes.json().catch(() => ({}))
      if (!profileRes.ok) {
        throw new Error((profileData as { error?: string }).error || "Failed to save GitHub profile")
      }

      // 2) Call analyze-repos to score skills and write into student_skills
      const resAnalyze = await fetch("/api/student/onboarding/analyze-repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubAccessToken,
          skills: effectiveSkills.map((s) => ({
            skill_name: s.skill_name,
            repo_url: s.repo_url.trim(),
          })),
        }),
      })
      const dataAnalyze = await resAnalyze.json()
      if (!resAnalyze.ok) {
        throw new Error(dataAnalyze.error || "Failed to analyze repositories")
      }

      setSuccess("Onboarding completed. Your skills and experience levels have been saved.")
      if (onCompleted) {
        onCompleted()
      }
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : "Failed to complete onboarding. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableTech = TECH_STACK_OPTIONS.filter(
    (t) => !skills.some((s) => s.skill_name === t)
  )

  return (
    <div className="max-w-3xl mx-auto border border-white/5 rounded-xl bg-[#171a1a]">
      <div className="px-6 py-4 border-b border-white/5 bg-[#1c2020]">
        <h2 className="text-lg font-semibold text-white">Finish your developer profile</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Tell us your GitHub profile and link repos that showcase your skills. We’ll generate a resume for you.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
        {error && (
          <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-md px-3 py-2">
            {success}
          </div>
        )}

        {isSubmitting && skills.length > 0 && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl border border-violet-500/35 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 px-4 py-4 flex gap-4 items-start"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 border border-violet-400/30">
              <Sparkles className="h-5 w-5 text-violet-200 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-violet-100 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-violet-300 shrink-0" />
                AI is analyzing your repositories
              </p>
              <p className="text-xs text-violet-200/75 mt-1.5 leading-relaxed">
                Processing {skills.length} skill{skills.length === 1 ? "" : "s"}: fetching READMEs and code from GitHub, then running the model for each. This can take a minute or more.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs text-zinc-400">GitHub profile</Label>
          <div className="h-9 px-3 rounded-md bg-[#111315] border border-white/10 text-xs text-zinc-300 flex items-center">
            {githubUrl || "Reading from your GitHub sign-in..."}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-zinc-400">Skills & GitHub repositories</Label>
          <p className="text-[11px] text-zinc-500">
            Pick a skill and paste a repository URL that best demonstrates it. Gemini will assess your level.
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            {availableTech.map((tech) => (
              <Button
                key={tech}
                type="button"
                size="sm"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => addSkillByName(tech)}
                className="h-6 text-[11px] rounded-full border-white/10 text-zinc-200 px-2"
              >
                + {tech}
              </Button>
            ))}
          </div>
          {skillDuplicateHint && (
            <p className="text-[11px] text-amber-300/90 mt-1">{skillDuplicateHint}</p>
          )}

          {skills.length > 0 && (
            <div className="mt-4 space-y-3">
              {skills.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-white/10 bg-[#111315] px-3 py-2 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[11px] border-blue-500/40 text-blue-300 bg-blue-500/10"
                      >
                        {s.skill_name}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => removeSkill(s.id)}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                  <Input
                    value={s.repo_url}
                    onChange={(e) => updateRepo(s.id, e.target.value)}
                    disabled={isSubmitting}
                    placeholder="https://github.com/your-username/your-repo"
                    className="h-8 bg-transparent border-white/10 text-xs"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-white/5 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 px-4 text-xs bg-emerald-600 hover:bg-emerald-500"
          >
            {isSubmitting ? "Analyzing…" : "Save & continue"}
          </Button>
        </div>
      </form>
    </div>
  )
}

