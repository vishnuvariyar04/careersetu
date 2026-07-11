"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useStudentAuth } from "@/hooks/use-student-auth"
import { useSidebarContext } from "@/components/student/sidebar-context"
import {
  Loader2, Briefcase, MapPin, Search, Send, CheckCircle2, Clock,
  Star, ChevronRight, ExternalLink, AlertCircle, Sparkles,
} from "lucide-react"

const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #171a1a; color: #e4e4e7; }
    .mono { font-family: 'JetBrains Mono', monospace; }
  `}</style>
)

const STATUS_STYLES: Record<string, string> = {
  applied: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  shortlisted: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  interviewed: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  offered: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  rejected: "text-red-400 bg-red-400/10 border-red-400/20",
  matched: "text-blue-400 bg-blue-400/10 border-blue-400/20",
}

const PIPELINE_STEPS = ["applied", "shortlisted", "interviewed", "offered"]

export default function JobsPage() {
  const params = useParams()
  const studentId = params.student_id as string
  const isAuthorized = useStudentAuth(studentId)
  const { setStudent: setSidebarStudent, setWorkspace } = useSidebarContext()

  const [tab, setTab] = useState<"browse" | "applications">("browse")
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<any[]>([])
  const [myApps, setMyApps] = useState<any[]>([])
  const [studentSkills, setStudentSkills] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Apply dialog
  const [applyingJob, setApplyingJob] = useState<any | null>(null)
  const [coverLetter, setCoverLetter] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => { setWorkspace(null) }, [setWorkspace])

  const fetchData = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    try {
      const { data: student } = await supabase.from("students").select("*").eq("student_id", studentId).single()
      if (student) setSidebarStudent(student)

      const [{ data: allJobs }, { data: skills }, { data: applications }] = await Promise.all([
        supabase.from("job_openings").select("*, companies(name)").eq("status", "open").order("created_at", { ascending: false }),
        supabase.from("student_skills").select("*").eq("student_id", studentId),
        supabase.from("job_applications").select("*, job_openings(title, description, required_skills, job_type, location, status, company_id, companies(name))").eq("student_id", studentId).order("created_at", { ascending: false }),
      ])

      setJobs(allJobs || [])
      setStudentSkills(skills || [])
      setMyApps(applications || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }, [studentId, setSidebarStudent])

  useEffect(() => {
    if (isAuthorized === true) fetchData()
  }, [isAuthorized, fetchData])

  // Calculate match for each job
  const appliedJobIds = useMemo(() => new Set(myApps.map((a: any) => a.job_id)), [myApps])
  const skillMap = useMemo(() => {
    const map: Record<string, string> = {}
    studentSkills.forEach((s: any) => { map[s.skill_name.toLowerCase()] = s.experience_level || "beginner" })
    return map
  }, [studentSkills])

  const EXP_WEIGHT: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 }

  const getMatchInfo = useCallback((requiredSkills: string[]) => {
    if (!requiredSkills || requiredSkills.length === 0) return { pct: 100, matched: [], missing: [] }
    const matched = requiredSkills.filter((s) => skillMap[s.toLowerCase()])
    const missing = requiredSkills.filter((s) => !skillMap[s.toLowerCase()])
    let totalWeight = 0
    let matchedWeight = 0
    requiredSkills.forEach((skill) => {
      const maxPossible = 3
      totalWeight += maxPossible
      const level = skillMap[skill.toLowerCase()]
      if (level) matchedWeight += EXP_WEIGHT[level] || 1
    })
    const pct = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0
    return { pct, matched, missing }
  }, [skillMap])

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return jobs.filter((j: any) => {
      if (!q) return true
      return j.title.toLowerCase().includes(q) || (j.companies?.name || "").toLowerCase().includes(q) || (j.description || "").toLowerCase().includes(q)
    })
  }, [jobs, searchQuery])

  const handleApply = async () => {
    if (!applyingJob) return
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    try {
      const res = await fetch("/api/student/apply-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: applyingJob.id, coverLetter }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to apply")
      setSubmitSuccess(true)
      setCoverLetter("")
      // Refresh applications
      const { data: applications } = await supabase
        .from("job_applications")
        .select("*, job_openings(title, description, required_skills, job_type, location, status, company_id, companies(name))")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
      setMyApps(applications || [])
      setTimeout(() => { setApplyingJob(null); setSubmitSuccess(false) }, 1500)
    } catch (err: any) {
      setSubmitError(err.message || "Failed to apply")
    } finally {
      setSubmitting(false)
    }
  }

  if (isAuthorized === null || loading) return (
    <div className="flex-1 bg-[#171a1a] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
    </div>
  )
  if (isAuthorized === false) return <div className="flex-1 bg-[#171a1a]" />

  return (
    <div className="flex-1 overflow-y-auto bg-[#171a1a]">
      <GlobalStyles />
      <div className="max-w-[1400px] mx-auto p-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-xl font-medium text-white mb-1">
              {tab === "browse" ? "Browse Jobs" : "My Applications"}
            </h1>
            <p className="text-xs text-zinc-500 mono">
              {tab === "browse" ? `${filteredJobs.length} OPEN POSITIONS` : `${myApps.length} APPLICATION${myApps.length === 1 ? "" : "S"}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("browse")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${tab === "browse" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
            >Browse Jobs</button>
            <button
              onClick={() => setTab("applications")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${tab === "applications" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
            >My Applications{myApps.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-white/10 text-[9px]">{myApps.length}</span>}</button>
          </div>
        </div>

        {/* Browse Jobs Tab */}
        {tab === "browse" && (
          <>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, company..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#1c2020] border border-white/5 rounded-lg text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-white/20"
              />
            </div>

            {filteredJobs.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-white/5 rounded-lg bg-white/[0.01]">
                <Briefcase className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No open positions available right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job: any) => {
                  const match = getMatchInfo(job.required_skills || [])
                  const alreadyApplied = appliedJobIds.has(job.id)
                  return (
                    <div key={job.id} className="rounded-xl border border-white/5 bg-[#1c2020] p-5 hover:border-white/10 transition group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-[15px] font-medium text-white group-hover:text-emerald-400/90 transition-colors">{job.title}</h3>
                            <span className="text-[9px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-zinc-400 uppercase tracking-wider">{job.job_type?.replace("_", " ")}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-zinc-500 mb-3">
                            <span className="font-medium">{job.companies?.name || "Company"}</span>
                            {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                            <span className="capitalize">Min: {job.min_experience_level}</span>
                          </div>
                          {job.description && (
                            <p className="text-[12px] text-zinc-500 line-clamp-2 leading-relaxed mb-3">{job.description}</p>
                          )}
                          {/* Skills */}
                          <div className="flex flex-wrap gap-1.5">
                            {(job.required_skills || []).map((skill: string) => {
                              const hasSkill = skillMap[skill.toLowerCase()]
                              return (
                                <span key={skill} className={`text-[10px] px-2 py-0.5 rounded border mono ${hasSkill ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-zinc-500 bg-zinc-500/5 border-zinc-500/10"}`}>
                                  {hasSkill && "✓ "}{skill}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3 shrink-0">
                          {/* Match Score */}
                          <div className="text-center">
                            <div className={`text-lg font-bold ${match.pct >= 70 ? "text-emerald-400" : match.pct >= 40 ? "text-amber-400" : "text-zinc-500"}`}>{match.pct}%</div>
                            <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Match</p>
                          </div>
                          {alreadyApplied ? (
                            <span className="text-[10px] px-3 py-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />Applied
                            </span>
                          ) : (
                            <button
                              onClick={() => { setApplyingJob(job); setCoverLetter(""); setSubmitError(null); setSubmitSuccess(false) }}
                              className="text-[10px] px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium border border-white/10 hover:border-white/20 transition flex items-center gap-1.5 uppercase tracking-wider"
                            >
                              <Send className="w-3 h-3" />Apply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* My Applications Tab */}
        {tab === "applications" && (
          <>
            {myApps.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-white/5 rounded-lg bg-white/[0.01]">
                <Briefcase className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm mb-3">You haven&apos;t applied to any jobs yet.</p>
                <button onClick={() => setTab("browse")} className="text-[11px] text-blue-400 font-medium hover:text-blue-300 transition">
                  Browse open positions →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myApps.map((app: any) => {
                  const job = app.job_openings
                  const statusIdx = PIPELINE_STEPS.indexOf(app.status)
                  return (
                    <div key={app.id} className="rounded-xl border border-white/5 bg-[#1c2020] p-5">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-medium text-white mb-1">{job?.title || "Job"}</h3>
                          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                            <span>{job?.companies?.name || "Company"}</span>
                            {job?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                            <span className="capitalize">{job?.job_type?.replace("_", " ")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <span className="text-lg font-bold text-white">{app.match_score ?? 0}%</span>
                            <p className="text-[9px] text-zinc-600">MATCH</p>
                          </div>
                          <span className={`text-[9px] px-2 py-1 rounded border uppercase tracking-wider font-medium ${STATUS_STYLES[app.status] || STATUS_STYLES.matched}`}>
                            {app.status}
                          </span>
                        </div>
                      </div>

                      {/* Pipeline Steps */}
                      {app.status !== "rejected" && (
                        <div className="flex items-center gap-1 mb-3">
                          {PIPELINE_STEPS.map((step, idx) => (
                            <div key={step} className="flex items-center gap-1 flex-1">
                              <div className={`h-1 flex-1 rounded-full ${idx <= statusIdx ? "bg-emerald-500" : "bg-zinc-800"}`} />
                              <span className={`text-[8px] uppercase tracking-wider ${idx <= statusIdx ? "text-emerald-400" : "text-zinc-700"}`}>
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {app.status === "rejected" && (
                        <div className="flex items-center gap-2 mb-3 text-[11px] text-red-400/80">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Application was not selected to proceed further.
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-zinc-600">
                        <span>Applied {new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        {app.match_reasons && Array.isArray(app.match_reasons) && app.match_reasons.length > 0 && (
                          <span className="text-zinc-500">{app.match_reasons.filter((r: string) => r.startsWith("✓")).length} skills matched</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Apply Dialog Overlay */}
        {applyingJob && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !submitting && setApplyingJob(null)}>
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1c2020] shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-5 border-b border-white/5">
                <h3 className="text-[15px] font-medium text-white">Apply to {applyingJob.title}</h3>
                <p className="text-[11px] text-zinc-500 mt-1">{applyingJob.companies?.name || "Company"}</p>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Match preview */}
                {(() => {
                  const match = getMatchInfo(applyingJob.required_skills || [])
                  return (
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1"><Sparkles className="w-3 h-3 text-violet-400" />Skill Match</span>
                        <span className={`text-sm font-bold ${match.pct >= 70 ? "text-emerald-400" : match.pct >= 40 ? "text-amber-400" : "text-zinc-500"}`}>{match.pct}%</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {match.matched.map((s: string) => (
                          <span key={s} className="text-[9px] px-1.5 py-0.5 rounded border text-emerald-400 bg-emerald-400/10 border-emerald-400/20 mono">✓ {s}</span>
                        ))}
                        {match.missing.map((s: string) => (
                          <span key={s} className="text-[9px] px-1.5 py-0.5 rounded border text-zinc-500 bg-zinc-500/5 border-zinc-500/10 mono">✗ {s}</span>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Cover letter */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium mb-1.5 block">Cover Letter (optional)</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell the company why you're a great fit for this role..."
                    rows={5}
                    className="w-full bg-[#171a1a] border border-white/10 rounded-lg px-3 py-2.5 text-[12px] text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-white/20 resize-none"
                  />
                </div>

                {submitError && (
                  <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-[11px] text-red-400">{submitError}</div>
                )}
                {submitSuccess && (
                  <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />Application submitted successfully!
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  onClick={() => setApplyingJob(null)}
                  disabled={submitting}
                  className="px-4 py-2 text-[11px] text-zinc-400 hover:text-white transition rounded-lg hover:bg-white/5"
                >Cancel</button>
                <button
                  onClick={handleApply}
                  disabled={submitting || submitSuccess}
                  className="px-5 py-2 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg transition flex items-center gap-1.5 uppercase tracking-wider"
                >
                  {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
