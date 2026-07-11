import { NextResponse } from "next/server"
import { createClient } from "@/lib/server-supabase"

export const runtime = "nodejs"

const EXP_WEIGHT: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 }

/**
 * POST /api/student/apply-job
 * Body: { jobId: string, coverLetter?: string }
 *
 * Calculates a match_score by comparing student_skills vs job required_skills,
 * weighting by experience level. Inserts a job_application with status 'applied'.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentId = user.id
    const body = await req.json()
    const jobId = String(body.jobId || "").trim()
    const coverLetter = String(body.coverLetter || "").trim() || null

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 })
    }

    // Validate job exists and is open
    const { data: job, error: jobErr } = await supabase
      .from("job_openings")
      .select("id, title, required_skills, status, company_id")
      .eq("id", jobId)
      .single()

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }
    if (job.status !== "open") {
      return NextResponse.json({ error: "This job is no longer accepting applications" }, { status: 400 })
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from("job_applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("student_id", studentId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "You have already applied to this job" }, { status: 409 })
    }

    // Fetch student skills
    const { data: studentSkills } = await supabase
      .from("student_skills")
      .select("skill_name, experience_level")
      .eq("student_id", studentId)

    // Calculate match score
    const requiredSkills: string[] = job.required_skills || []
    const studentSkillMap: Record<string, string> = {}
    ;(studentSkills || []).forEach((s: any) => {
      studentSkillMap[s.skill_name.toLowerCase()] = s.experience_level || "beginner"
    })

    let totalWeight = 0
    let matchedWeight = 0
    const matchReasons: string[] = []

    if (requiredSkills.length === 0) {
      // No skills required — 100% match
      totalWeight = 1
      matchedWeight = 1
      matchReasons.push("No specific skills required for this role")
    } else {
      requiredSkills.forEach((skill) => {
        const skillLower = skill.toLowerCase()
        const maxPossible = 3 // advanced weight
        totalWeight += maxPossible

        if (studentSkillMap[skillLower]) {
          const level = studentSkillMap[skillLower]
          const weight = EXP_WEIGHT[level] || 1
          matchedWeight += weight
          matchReasons.push(`✓ ${skill} — ${level} (${weight}/${maxPossible} pts)`)
        } else {
          matchReasons.push(`✗ ${skill} — not on profile (0/${maxPossible} pts)`)
        }
      })
    }

    const matchScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0

    // Insert application
    const { data: application, error: insertErr } = await supabase
      .from("job_applications")
      .insert({
        job_id: jobId,
        student_id: studentId,
        status: "applied",
        match_score: matchScore,
        match_reasons: matchReasons,
        cover_letter: coverLetter,
      })
      .select("id, status, match_score")
      .single()

    if (insertErr) {
      console.error("apply-job insert error:", insertErr)
      if (insertErr.code === "23505") {
        return NextResponse.json({ error: "You have already applied to this job" }, { status: 409 })
      }
      return NextResponse.json({ error: insertErr.message || "Could not submit application" }, { status: 500 })
    }

    return NextResponse.json({ ok: true, application, matchReasons })
  } catch (e) {
    console.error("apply-job error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
