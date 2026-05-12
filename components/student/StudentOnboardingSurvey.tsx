"use client"

import { useState, useEffect } from "react"
import { TECH_STACK_OPTIONS } from "@/components/onboarding/constants"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { Loader2, Sparkles, Plus, X, Briefcase } from "lucide-react"

type SkillEntry = {
  id: string
  skill_name: string
  repo_url: string
}

type ExperienceEntry = {
  id: string
  company_name: string
  role: string
  exp_years: string // e.g. "2" — will be stored as interval
  technologies_used: string[]
  description: string
}

interface Props {
  initialGithubUrl?: string | null
  initialAbout?: string | null
  onCompleted?: () => void
}

export function StudentOnboardingSurvey({
  initialGithubUrl,
  initialAbout,
  onCompleted,
}: Props) {
  // --- Step management ---
  const [currentStep, setCurrentStep] = useState(0) // 0=about, 1=skills, 2=experience

  // --- About ---
  const [about, setAbout] = useState(initialAbout ?? "")

  // --- GitHub + Skills ---
  const [githubUrl, setGithubUrl] = useState(initialGithubUrl ?? "")
  const [skills, setSkills] = useState<SkillEntry[]>([])
  const [selectedTech, setSelectedTech] = useState<string>("")
  const [skillDuplicateHint, setSkillDuplicateHint] = useState<string | null>(null)

  // --- Experience ---
  const [hasExperience, setHasExperience] = useState(true)
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([])
  const [techInput, setTechInput] = useState<Record<string, string>>({}) // per-experience tech input

  // --- Submission ---
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const normalizeSkillName = (s: string) =>
    s.trim().replace(/\s+/g, " ").toLowerCase()

  // Auto-detect GitHub URL from auth
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

  // --- Skill helpers ---
  const addSkillByName = (rawName: string) => {
    const skill = rawName.trim().replace(/\s+/g, " ")
    if (!skill) return
    const key = normalizeSkillName(skill)
    if (skills.some((s) => normalizeSkillName(s.skill_name) === key)) {
      setSkillDuplicateHint(`You already added "${skill}". Each skill can only appear once.`)
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

  const updateRepo = (id: string, repo_url: string) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, repo_url } : s)))
  }

  const removeSkill = (id: string) => {
    setSkillDuplicateHint(null)
    setSkills((prev) => prev.filter((s) => s.id !== id))
  }

  // --- Experience helpers ---
  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        company_name: "",
        role: "",
        exp_years: "",
        technologies_used: [],
        description: "",
      },
    ])
  }

  const updateExperience = (id: string, field: keyof ExperienceEntry, value: any) => {
    setExperiences((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    )
  }

  const removeExperience = (id: string) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id))
    setTechInput((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const addTechToExperience = (expId: string) => {
    const tech = (techInput[expId] || "").trim()
    if (!tech) return
    setExperiences((prev) =>
      prev.map((e) => {
        if (e.id !== expId) return e
        if (e.technologies_used.includes(tech)) return e
        return { ...e, technologies_used: [...e.technologies_used, tech] }
      })
    )
    setTechInput((prev) => ({ ...prev, [expId]: "" }))
  }

  const removeTechFromExperience = (expId: string, tech: string) => {
    setExperiences((prev) =>
      prev.map((e) => {
        if (e.id !== expId) return e
        return { ...e, technologies_used: e.technologies_used.filter((t) => t !== tech) }
      })
    )
  }

  const availableTech = TECH_STACK_OPTIONS.filter(
    (t) => !skills.some((s) => s.skill_name === t)
  )

  // --- Step validation ---
  const canAdvanceFromAbout = about.trim().length >= 10

  const canAdvanceFromSkills = (() => {
    const effectiveSkills = skills.filter((s) => s.repo_url.trim())
    return Boolean(githubUrl.trim()) && effectiveSkills.length > 0
  })()

  // --- Submit ---
  const handleSubmit = async () => {
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

    // Validate experience entries if user says they have experience
    if (hasExperience && experiences.length > 0) {
      for (const exp of experiences) {
        if (!exp.company_name.trim() || !exp.role.trim()) {
          setError("Each experience entry needs a company name and role.")
          return
        }
      }
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

      // 1) Save GitHub base URL + about on student
      const profileRes = await fetch("/api/student/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github_url: githubUrl.trim(),
          about: about.trim(),
        }),
      })
      const profileData = await profileRes.json().catch(() => ({}))
      if (!profileRes.ok) {
        throw new Error((profileData as { error?: string }).error || "Failed to save profile")
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

      // 3) Save experiences (if any)
      if (hasExperience && experiences.length > 0) {
        const userId = session?.user?.id
        if (userId) {
          const experienceRows = experiences
            .filter((exp) => exp.company_name.trim() && exp.role.trim())
            .map((exp) => ({
              student_id: userId,
              company_name: exp.company_name.trim(),
              role: exp.role.trim(),
              exp_years: exp.exp_years.trim() ? `${exp.exp_years.trim()} years` : null,
              technologies_used: exp.technologies_used,
              description: exp.description.trim() || null,
            }))

          if (experienceRows.length > 0) {
            const { error: expError } = await supabase
              .from("experience")
              .insert(experienceRows)

            if (expError) {
              console.error("Failed to save experience:", expError)
              // Non-blocking — skills and profile are already saved
            }
          }
        }
      }

      setSuccess("Onboarding completed! Your profile, skills, and experience have been saved.")
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

  const steps = [
    { label: "About You", number: 1 },
    { label: "Skills & GitHub", number: 2 },
    { label: "Experience", number: 3 },
  ]

  return (
    <div className="max-w-3xl mx-auto border border-white/5 rounded-xl bg-[#171a1a]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-[#1c2020]">
        <h2 className="text-lg font-semibold text-white">Finish your developer profile</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Tell us about yourself, link repos that showcase your skills, and add any work experience.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 px-6 pt-5 pb-2">
        {steps.map((step, i) => (
          <div key={step.number} className="flex items-center gap-1 flex-1">
            <button
              type="button"
              onClick={() => {
                if (i < currentStep) setCurrentStep(i)
              }}
              className={`
                flex items-center gap-2 text-xs font-medium rounded-full px-3 py-1.5 transition-colors
                ${currentStep === i
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                  : currentStep > i
                    ? "bg-emerald-600/10 text-emerald-500/70 border border-emerald-500/20 cursor-pointer hover:bg-emerald-600/15"
                    : "bg-white/5 text-zinc-500 border border-white/5"
                }
              `}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep > i ? "bg-emerald-500 text-white" : "bg-white/10"
              }`}>
                {currentStep > i ? "✓" : step.number}
              </span>
              {step.label}
            </button>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${currentStep > i ? "bg-emerald-500/30" : "bg-white/5"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="px-6 py-5 space-y-5">
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

        {/* ===== STEP 0: ABOUT ===== */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">About you</Label>
              <p className="text-[11px] text-zinc-500">
                Write a short bio — your background, interests, and what you&apos;re looking to learn or work on. This helps companies understand who you are.
              </p>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="I'm a 3rd year CS student passionate about building web applications. I have experience with React and Node.js, and I'm eager to learn cloud technologies and system design..."
                rows={5}
                className="w-full rounded-md bg-[#111315] border border-white/10 text-sm text-zinc-300 px-3 py-2 placeholder:text-zinc-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 resize-none"
              />
              <p className="text-[11px] text-zinc-600">
                {about.trim().length < 10
                  ? `${10 - about.trim().length} more characters needed`
                  : `${about.trim().length} characters`}
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-end">
              <Button
                type="button"
                disabled={!canAdvanceFromAbout}
                onClick={() => setCurrentStep(1)}
                className="h-9 px-4 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40"
              >
                Next: Skills &amp; GitHub →
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 1: SKILLS & GITHUB ===== */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">GitHub profile</Label>
              <div className="h-9 px-3 rounded-md bg-[#111315] border border-white/10 text-xs text-zinc-300 flex items-center">
                {githubUrl || "Reading from your GitHub sign-in..."}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Skills &amp; GitHub repositories</Label>
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

            <div className="pt-2 border-t border-white/5 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(0)}
                className="h-9 px-4 text-xs bg-transparent border-white/10 text-zinc-300 hover:bg-white/5"
              >
                ← Back
              </Button>
              <Button
                type="button"
                disabled={!canAdvanceFromSkills}
                onClick={() => setCurrentStep(2)}
                className="h-9 px-4 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40"
              >
                Next: Experience →
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 2: EXPERIENCE ===== */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs text-zinc-400">Professional experience</Label>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Add any internships, jobs, or freelance work. This helps companies match you to openings.
                  </p>
                </div>
              </div>

              {/* Toggle */}
              <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#111315] px-4 py-3 cursor-pointer hover:bg-[#151819] transition-colors">
                <input
                  type="checkbox"
                  checked={!hasExperience}
                  onChange={(e) => {
                    setHasExperience(!e.target.checked)
                    if (e.target.checked) {
                      setExperiences([])
                    }
                  }}
                  className="rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500/30 w-4 h-4"
                />
                <span className="text-sm text-zinc-300">I have no professional experience yet</span>
              </label>

              {hasExperience && (
                <div className="space-y-4">
                  {experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="rounded-xl border border-white/10 bg-[#111315] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-zinc-500" />
                          <span className="text-xs font-medium text-zinc-300">
                            {exp.company_name || "New Entry"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-zinc-500">Company name *</Label>
                          <Input
                            value={exp.company_name}
                            onChange={(e) => updateExperience(exp.id, "company_name", e.target.value)}
                            placeholder="e.g. Google, Acme Inc."
                            className="h-8 bg-transparent border-white/10 text-xs text-zinc-200"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-zinc-500">Role *</Label>
                          <Input
                            value={exp.role}
                            onChange={(e) => updateExperience(exp.id, "role", e.target.value)}
                            placeholder="e.g. Software Engineer Intern"
                            className="h-8 bg-transparent border-white/10 text-xs text-zinc-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] text-zinc-500">Duration (years)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={exp.exp_years}
                          onChange={(e) => updateExperience(exp.id, "exp_years", e.target.value)}
                          placeholder="e.g. 0.5"
                          className="h-8 bg-transparent border-white/10 text-xs text-zinc-200 w-32"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] text-zinc-500">Technologies used</Label>
                        <div className="flex gap-2">
                          <Input
                            value={techInput[exp.id] || ""}
                            onChange={(e) => setTechInput((prev) => ({ ...prev, [exp.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addTechToExperience(exp.id)
                              }
                            }}
                            placeholder="e.g. React, Python"
                            className="h-8 bg-transparent border-white/10 text-xs text-zinc-200 flex-1"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addTechToExperience(exp.id)}
                            className="h-8 text-[11px] border-white/10 text-zinc-300 px-3"
                          >
                            Add
                          </Button>
                        </div>
                        {exp.technologies_used.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {exp.technologies_used.map((tech) => (
                              <Badge
                                key={tech}
                                variant="outline"
                                className="text-[11px] border-violet-500/40 text-violet-300 bg-violet-500/10 gap-1 pr-1"
                              >
                                {tech}
                                <button
                                  type="button"
                                  onClick={() => removeTechFromExperience(exp.id, tech)}
                                  className="ml-0.5 hover:text-red-300"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] text-zinc-500">Description</Label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                          placeholder="What did you work on? What was your impact?"
                          rows={2}
                          className="w-full rounded-md bg-transparent border border-white/10 text-xs text-zinc-300 px-3 py-2 placeholder:text-zinc-600 focus:border-white/20 focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addExperience}
                    className="w-full h-9 text-xs border-dashed border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add experience
                  </Button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="h-9 px-4 text-xs bg-transparent border-white/10 text-zinc-300 hover:bg-white/5"
              >
                ← Back
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="h-9 px-5 text-xs bg-emerald-600 hover:bg-emerald-500"
              >
                {isSubmitting ? "Analyzing…" : "Save & complete onboarding"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
