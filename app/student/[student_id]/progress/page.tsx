"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useStudentAuth } from "@/hooks/use-student-auth"
import { useSidebarContext } from "@/components/student/sidebar-context"
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from "recharts"
import {
  Loader2, TrendingUp, Target, Award, Star, ChevronDown, ChevronUp,
  CheckCircle2, Clock, Lock, AlertCircle, Code2, Shield, ShieldAlert,
  ShieldCheck, FileText, ChevronRight, AlertTriangle, XCircle, MinusCircle,
} from "lucide-react"

// --- Styles (match student dashboard dark theme) ---
const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #171a1a; color: #e4e4e7; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    @keyframes barFill { from { width: 0%; } }
    .bar-animate { animation: barFill 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
    .detail-panel { animation: panelSlide 0.3s ease forwards; }
    @keyframes panelSlide { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  `}</style>
)

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#f43f5e", "#6366f1"]
const EXP_MAP: Record<string, number> = { beginner: 30, intermediate: 60, advanced: 90 }

export default function ProgressPage() {
  const params = useParams()
  const studentId = params.student_id as string
  const isAuthorized = useStudentAuth(studentId)
  const { setStudent: setSidebarStudent, setWorkspace } = useSidebarContext()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [expandedEnv, setExpandedEnv] = useState<string | null>(null)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedVulns, setExpandedVulns] = useState<Set<number>>(new Set())

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const toggleVuln = (idx: number) => {
    setExpandedVulns(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  useEffect(() => { setWorkspace(null) }, [setWorkspace])

  const fetchData = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    try {
      // Fetch student
      const { data: student } = await supabase.from("students").select("*").eq("student_id", studentId).single()
      if (student) setSidebarStudent(student)

      // Fetch skills
      const { data: skills } = await supabase.from("student_skills").select("*").eq("student_id", studentId)

      // Fetch environments joined
      const { data: participations } = await supabase
        .from("environment_participants")
        .select("environment_id, virtual_environments(title, status, company_id, companies(name))")
        .eq("student_id", studentId)

      const envIds = (participations || []).map((p: any) => p.environment_id).filter(Boolean)
      let environments: any[] = []
      let allTaskProgress: any[] = []
      let allPrReviews: any[] = []

      if (envIds.length > 0) {
        const { data: tasks } = await supabase.from("tasks").select("*").in("environment_id", envIds).order("task_order")
        const taskIds = (tasks || []).map((t: any) => t.task_id)

        if (taskIds.length > 0) {
          const [{ data: progress }, { data: prReviews }] = await Promise.all([
            supabase.from("task_progress").select("*").eq("student_id", studentId).in("task_id", taskIds),
            supabase.from("pr_reviews").select("*").eq("student_id", studentId).in("task_id", taskIds),
          ])
          allTaskProgress = progress || []
          allPrReviews = prReviews || []
        }

        // Build per-environment data
        const pMap: Record<string, any> = {}
        allTaskProgress.forEach((p: any) => { pMap[p.task_id] = p })
        const prMap: Record<string, any> = {}
        allPrReviews.forEach((p: any) => { prMap[p.task_id] = p })

        environments = (participations || []).map((p: any) => {
          const env = p.virtual_environments
          const envTasks = (tasks || []).filter((t: any) => t.environment_id === p.environment_id)
          const envTasksWithProgress = envTasks.map((t: any) => ({
            ...t,
            progress: pMap[t.task_id] || null,
            pr: prMap[t.task_id] || null,
          }))
          const completed = envTasksWithProgress.filter((t: any) =>
            t.progress?.status === "approved" || t.progress?.status === "submitted"
          ).length
          const total = envTasksWithProgress.length
          const envPrs = envTasksWithProgress.filter((t: any) => t.pr?.ai_score).map((t: any) => t.pr.ai_score)
          const avgScore = envPrs.length > 0 ? Math.round(envPrs.reduce((a: number, b: number) => a + b, 0) / envPrs.length) : 0

          return {
            environment_id: p.environment_id,
            title: env?.title || "Environment",
            status: env?.status || "open",
            company_name: env?.companies?.name || "Company",
            tasks: envTasksWithProgress,
            completed,
            total,
            avgScore,
            completionPct: total > 0 ? Math.round((completed / total) * 100) : 0,
          }
        })
      }

      // Overall stats
      const totalEnvs = environments.length
      const totalCompleted = environments.reduce((a: number, e: any) => a + e.completed, 0)
      const totalTasks = environments.reduce((a: number, e: any) => a + e.total, 0)
      const allPrScores = allPrReviews.filter((p: any) => p.ai_score).map((p: any) => p.ai_score)
      const avgPrScore = allPrScores.length > 0 ? Math.round(allPrScores.reduce((a: number, b: number) => a + b, 0) / allPrScores.length) : 0
      const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0

      // Skills radar data
      const skillsRadar = (skills || []).map((s: any) => ({
        skill: s.skill_name,
        level: EXP_MAP[s.experience_level || "beginner"] || 30,
      }))

      // Score trend (PR scores over time)
      const scoreTrend = allPrReviews
        .filter((p: any) => p.ai_score && p.created_at)
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((p: any) => ({
          date: new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          score: p.ai_score,
        }))

      // Activity timeline
      const activities: any[] = []
      allTaskProgress.forEach((p: any) => {
        if (p.status === "approved" || p.status === "submitted") {
          activities.push({ type: p.status, date: p.updated_at, task_id: p.task_id })
        }
      })
      allPrReviews.forEach((p: any) => {
        activities.push({ type: "pr_review", date: p.created_at, task_id: p.task_id, score: p.ai_score, verdict: p.ai_verdict })
      })
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Get task title lookup
      const taskTitles: Record<string, string> = {}
      environments.forEach((e: any) => { e.tasks.forEach((t: any) => { taskTitles[t.task_id] = t.title }) })

      setData({
        student,
        skills: skills || [],
        environments,
        stats: { totalEnvs, totalCompleted, totalTasks, avgPrScore, completionRate },
        skillsRadar,
        scoreTrend,
        activities: activities.slice(0, 20),
        taskTitles,
      })
    } catch (err) {
      console.error("Error fetching progress:", err)
    } finally {
      setLoading(false)
    }
  }, [studentId, setSidebarStudent])

  useEffect(() => {
    if (isAuthorized === true) fetchData()
  }, [isAuthorized, fetchData])

  if (isAuthorized === null || loading) return (
    <div className="flex-1 bg-[#171a1a] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
    </div>
  )
  if (isAuthorized === false || !data) return <div className="flex-1 bg-[#171a1a]" />

  return (
    <div className="flex-1 overflow-y-auto bg-[#171a1a]">
      <GlobalStyles />
      <div className="max-w-[1400px] mx-auto p-8">
        {/* Header */}
        <div className="mb-8 pb-4 border-b border-white/5">
          <h1 className="text-xl font-medium text-white mb-1">Your Progress</h1>
          <p className="text-xs text-zinc-500 mono">PERFORMANCE OVERVIEW</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Target className="w-4 h-4 text-emerald-400" />} label="Environments" value={data.stats.totalEnvs} sub="Joined" />
          <StatCard icon={<CheckCircle2 className="w-4 h-4 text-blue-400" />} label="Tasks Done" value={`${data.stats.totalCompleted}/${data.stats.totalTasks}`} sub={`${data.stats.completionRate}% completion`} />
          <StatCard icon={<Star className="w-4 h-4 text-amber-400" />} label="Avg PR Score" value={`${data.stats.avgPrScore}%`} sub="AI code review" />
          <StatCard icon={<TrendingUp className="w-4 h-4 text-violet-400" />} label="Completion Rate" value={`${data.stats.completionRate}%`} sub="Overall progress" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Skills Radar */}
          <div className="rounded-xl border border-white/5 bg-[#1c2020] p-5">
            <h3 className="text-sm font-medium text-white mb-1 flex items-center gap-2"><Code2 className="w-4 h-4 text-blue-400" />Skills Radar</h3>
            <p className="text-[11px] text-zinc-500 mb-4">Your skill levels at a glance</p>
            {data.skillsRadar.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={data.skillsRadar}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#52525b", fontSize: 9 }} />
                  <Radar name="Level" dataKey="level" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-zinc-600 text-sm">No skills added yet</div>
            )}
          </div>

          {/* Score Trend */}
          <div className="rounded-xl border border-white/5 bg-[#1c2020] p-5">
            <h3 className="text-sm font-medium text-white mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" />PR Score Trend</h3>
            <p className="text-[11px] text-zinc-500 mb-4">AI review scores over time</p>
            {data.scoreTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#1c2020", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-zinc-600 text-sm">No PR reviews yet</div>
            )}
          </div>
        </div>

        {/* Per-Environment Progress */}
        <div className="mb-8">
          <h2 className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Environment Progress</h2>
          {data.environments.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-white/5 rounded-lg bg-white/[0.01]">
              <AlertCircle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">Join environments to track your progress here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.environments.map((env: any) => (
                <div key={env.environment_id} className="rounded-xl border border-white/5 bg-[#1c2020] overflow-hidden">
                  <button
                    onClick={() => setExpandedEnv(expandedEnv === env.environment_id ? null : env.environment_id)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-[11px] shrink-0">
                        {env.title.charAt(0)}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[13px] font-medium text-white truncate">{env.title}</p>
                        <p className="text-[10px] text-zinc-500">{env.company_name} · {env.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[13px] font-medium text-white">{env.completionPct}%</p>
                        <p className="text-[10px] text-zinc-500">{env.completed}/{env.total} tasks</p>
                      </div>
                      <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${env.completionPct}%` }} />
                      </div>
                      {env.avgScore > 0 && (
                        <span className="text-[11px] text-zinc-400 mono">{env.avgScore}% avg</span>
                      )}
                      {expandedEnv === env.environment_id ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </div>
                  </button>

                  {expandedEnv === env.environment_id && (
                    <div className="px-5 pb-4 border-t border-white/5">
                      <div className="pt-3 space-y-1">
                        {env.tasks.map((task: any, idx: number) => (
                          <div key={task.task_id}>
                            <div
                              onClick={() => task.pr && setExpandedTask(expandedTask === task.task_id ? null : task.task_id)}
                              className={`flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.02] text-[12px] ${
                                task.pr ? "cursor-pointer" : ""
                              } ${expandedTask === task.task_id ? "bg-white/[0.03]" : ""}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <TaskIcon status={task.progress?.status || "locked"} index={idx} />
                                <span className={`truncate ${task.progress?.status === "locked" ? "text-zinc-600" : "text-zinc-300"}`}>{task.title}</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                {task.pr && (
                                  <span className={`mono text-[10px] px-2 py-0.5 rounded border ${
                                    task.pr.ai_verdict === "approved" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                                    task.pr.ai_verdict === "changes_requested" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
                                    "text-red-400 bg-red-400/10 border-red-400/20"
                                  }`}>
                                    {task.pr.ai_score}% · {task.pr.ai_verdict}
                                  </span>
                                )}
                                <StatusPill status={task.progress?.status || "locked"} />
                                {task.pr && (
                                  <ChevronRight className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
                                    expandedTask === task.task_id ? "rotate-90" : ""
                                  }`} />
                                )}
                              </div>
                            </div>
                            {expandedTask === task.task_id && task.pr && (
                              <PRReviewDetail
                                pr={task.pr}
                                expandedCategories={expandedCategories}
                                toggleCategory={toggleCategory}
                                expandedVulns={expandedVulns}
                                toggleVuln={toggleVuln}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        {data.activities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Recent Activity</h2>
            <div className="rounded-xl border border-white/5 bg-[#1c2020] p-5">
              <div className="space-y-3">
                {data.activities.map((act: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-[12px]">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      act.type === "approved" ? "bg-emerald-400" :
                      act.type === "submitted" ? "bg-blue-400" :
                      act.type === "pr_review" ? "bg-violet-400" : "bg-zinc-500"
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-zinc-300">
                        {act.type === "approved" && "Task approved: "}
                        {act.type === "submitted" && "Task submitted: "}
                        {act.type === "pr_review" && `PR reviewed (${act.score}%, ${act.verdict}): `}
                        <span className="text-white font-medium">{data.taskTitles[act.task_id] || "Task"}</span>
                      </p>
                      <p className="text-[10px] text-zinc-600 mono mt-0.5">{new Date(act.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#1c2020] p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>
    </div>
  )
}

function TaskIcon({ status, index }: { status: string; index: number }) {
  return (
    <span className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold border border-white/10 bg-white/5">
      {status === "locked" ? <Lock className="w-2.5 h-2.5 text-white/20" /> :
       status === "approved" ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> :
       status === "submitted" ? <Clock className="w-3 h-3 text-amber-400" /> :
       status === "in_progress" ? <div className="w-2 h-2 rounded-full bg-blue-400" /> :
       <span className="text-white/40">{index + 1}</span>}
    </span>
  )
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    submitted: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    in_progress: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    unlocked: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
    locked: "text-zinc-600 bg-zinc-600/5 border-zinc-600/10",
  }
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-medium ${styles[status] || styles.locked}`}>
      {status.replace("_", " ")}
    </span>
  )
}

// --- PR Review Detail Panel ---

const CATEGORY_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  task_completion: { label: "Task Completion", color: "#8b5cf6", icon: <Target className="w-3.5 h-3.5" /> },
  logic_correctness: { label: "Logic Correctness", color: "#3b82f6", icon: <Code2 className="w-3.5 h-3.5" /> },
  code_quality: { label: "Code Quality", color: "#10b981", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  best_practices: { label: "Best Practices", color: "#f59e0b", icon: <Award className="w-3.5 h-3.5" /> },
}

function getScoreColor(score: number, max: number): string {
  if (score === max) return "#10b981"
  if (score > max * 0.5) return "#f59e0b"
  return "#ef4444"
}

function getSeverityStyle(severity: string): { bg: string; text: string; border: string; icon: React.ReactNode } {
  switch (severity) {
    case "critical":
      return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", icon: <XCircle className="w-3.5 h-3.5 text-red-400" /> }
    case "major":
      return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" /> }
    case "minor":
    default:
      return { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20", icon: <MinusCircle className="w-3.5 h-3.5 text-yellow-400" /> }
  }
}

function PRReviewDetail({
  pr,
  expandedCategories,
  toggleCategory,
  expandedVulns,
  toggleVuln,
}: {
  pr: any
  expandedCategories: Set<string>
  toggleCategory: (key: string) => void
  expandedVulns: Set<number>
  toggleVuln: (idx: number) => void
}) {
  const breakdown = pr.ai_score_breakdown
  const vulnerabilities = pr.ai_vulnerabilities
  const verdictDetails = pr.ai_verdict_details

  return (
    <div className="detail-panel ml-7 mr-1 mt-1 mb-3 space-y-3">

      {/* --- Section 1: Evaluator Report --- */}
      {verdictDetails && (
        <div className="rounded-lg border border-white/5 bg-[#1a1f1f] overflow-hidden">
          <div className="flex items-start gap-3 p-4" style={{ borderLeft: "3px solid #8b5cf6" }}>
            <div className="shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-violet-400 font-semibold mb-2">Evaluator Report</p>
              <p className="text-[12px] leading-relaxed text-zinc-300">{verdictDetails}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- Section 2: Score Breakdown --- */}
      {breakdown && typeof breakdown === "object" && (
        <div className="rounded-lg border border-white/5 bg-[#1a1f1f] p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-3 flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            Score Breakdown
          </p>
          <div className="space-y-2">
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const cat = breakdown[key]
              if (!cat) return null
              const pct = cat.max > 0 ? (cat.score / cat.max) * 100 : 0
              const color = getScoreColor(cat.score, cat.max)
              const isExpanded = expandedCategories.has(key)

              return (
                <div key={key}>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleCategory(key) }}
                    className="w-full group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: meta.color }}>{meta.icon}</span>
                      <span className="text-[11px] text-zinc-300 font-medium flex-1 text-left">{meta.label}</span>
                      <span className="mono text-[11px] font-semibold" style={{ color }}>{cat.score}/{cat.max}</span>
                      <ChevronRight className={`w-3 h-3 text-zinc-600 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                    <div className="h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bar-animate"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="detail-panel mt-2 ml-5 mb-2 pl-3 border-l-2" style={{ borderColor: `${meta.color}33` }}>
                      {cat.feedback && (
                        <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">{cat.feedback}</p>
                      )}
                      {cat.deductions && cat.deductions.length > 0 ? (
                        <div className="space-y-1.5">
                          {cat.deductions.map((d: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-[11px]">
                              <span className="shrink-0 mono text-red-400 font-semibold">−{d.points}</span>
                              <span className="text-zinc-400">{d.reason}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-emerald-400/70 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Full marks — no deductions
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* --- Section 3: Vulnerabilities --- */}
      {(() => {
        const vulns = Array.isArray(vulnerabilities) ? vulnerabilities : []
        if (vulns.length === 0) {
          return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-medium">No security vulnerabilities detected</span>
            </div>
          )
        }

        return (
          <div className="rounded-lg border border-white/5 bg-[#1a1f1f] p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-3 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              Vulnerabilities
              <span className="mono text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                {vulns.length}
              </span>
            </p>
            <div className="space-y-2">
              {vulns.map((v: any, idx: number) => {
                const sev = getSeverityStyle(v.severity)
                const isOpen = expandedVulns.has(idx)

                return (
                  <div key={idx} className={`rounded-lg border ${sev.border} ${sev.bg} overflow-hidden`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleVuln(idx) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
                    >
                      {sev.icon}
                      <span className={`text-[9px] uppercase tracking-wider font-bold ${sev.text} px-1.5 py-0.5 rounded bg-black/20`}>
                        {v.severity}
                      </span>
                      <span className="text-[11px] text-zinc-200 font-medium flex-1 truncate">{v.type}</span>
                      <span className="mono text-[10px] text-zinc-500 shrink-0">{v.file}:{v.line}</span>
                      <ChevronRight className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                    </button>

                    {isOpen && (
                      <div className="detail-panel px-3 pb-3 space-y-2.5 border-t border-white/5">
                        <p className="text-[11px] text-zinc-300 leading-relaxed pt-2.5">{v.description}</p>
                        {v.code_snippet && (
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-semibold mb-1">Problematic Code</p>
                            <pre className="mono text-[11px] bg-black/30 rounded-md px-3 py-2 text-red-300 overflow-x-auto border border-white/5">
                              <code>{v.code_snippet}</code>
                            </pre>
                          </div>
                        )}
                        {v.recommendation && (
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-semibold mb-1">Recommended Fix</p>
                            <pre className="mono text-[11px] bg-emerald-500/5 rounded-md px-3 py-2 text-emerald-300 overflow-x-auto border border-emerald-500/10">
                              <code>{v.recommendation}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
