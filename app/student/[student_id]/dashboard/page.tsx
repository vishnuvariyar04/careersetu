"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import staticCompaniesForStudents from "@/data/static_companies_for_students.json"
import staticStudentProfile from "@/data/static_student_profile.json"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TECH_STACK_OPTIONS } from "@/components/onboarding/constants"
import { 
  Search, 
  ArrowRight,
  Terminal,
  Layers,
  ChevronRight,
  User,
  Mail,
  Github,
  Code2,
  Plus,
  Loader2,
  ExternalLink,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
  Briefcase,
  Building2,
  FileText,
  Calendar,
  Clock,
  Pen,
  Trash2,
  MapPin,
} from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useStudentAuth } from "@/hooks/use-student-auth"
import { StudentOnboardingSurvey } from "@/components/student/StudentOnboardingSurvey"
import { useSidebarContext } from "@/components/student/sidebar-context"

// --- 0. Professional Engineering Styles ---
const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    
    body {
      font-family: 'Inter', sans-serif;
      background-color: #171a1a;
      color: #e4e4e7;
    }
    
    .mono {
      font-family: 'JetBrains Mono', monospace;
    }
    
    /* --- TABLE STYLES UPDATED --- */
    th {
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 10px;
      color: #71717a; /* zinc-500 */
      
      /* INCREASED HEIGHT HERE */
      padding-top: 18px;    /* Added top padding */
      padding-bottom: 18px; /* Increased bottom padding */
      
      text-align: left;
      border-bottom: 1px solid rgba(255,255,255,0.05); /* Added separator for header */
    }
    
    td {
      padding-top: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      font-size: 13px;
      color: #d4d4d8; /* zinc-300 */
    }

    tr:last-child td {
      border-bottom: none;
    }
    
    tr:hover td {
      background-color: rgba(255,255,255,0.02);
    }
  `}</style>
)

// --- 1. UI Atoms ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    inactive: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
    pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  }
  const s = status.toLowerCase() as keyof typeof styles
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wide ${styles[s] || styles.inactive}`}>
      {status}
    </span>
  )
}

// --- 2. Main Page Component ---

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState("companies")
  const [student, setStudent] = useState<any>()
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([])
  const [exploreQuery, setExploreQuery] = useState("")
  const [environmentCards, setEnvironmentCards] = useState<
    Array<{
      environment_id: string
      title: string
      description: string | null
      status: string | null
      company_id: string
      company_name: string
      company_logo: string
    }>
  >([])
  const [joinedEnvironmentIds, setJoinedEnvironmentIds] = useState<string[]>([])
  const [loadingEnvironments, setLoadingEnvironments] = useState(true)
  const [studentSkillsRows, setStudentSkillsRows] = useState<
    Array<{
      id?: string
      skill_name: string
      experience_level: string | null
      repo_url: string | null
    }>
  >([])
  const [loadingStudentSkills, setLoadingStudentSkills] = useState(true)
  const [newSkillName, setNewSkillName] = useState("")
  const [newSkillRepo, setNewSkillRepo] = useState("")
  const [savingNewSkill, setSavingNewSkill] = useState(false)
  const [skillFormError, setSkillFormError] = useState<string | null>(null)
  /** While submitting: which UX path is active */
  const [addSkillPhase, setAddSkillPhase] = useState<null | "ai" | "beginner">(null)
  /** Shown after a successful add */
  const [skillOutcome, setSkillOutcome] = useState<{
    tone: "success" | "info" | "warning"
    title: string
    body: string
  } | null>(null)

  // Experience state
  const [experienceRows, setExperienceRows] = useState<any[]>([])
  const [loadingExperience, setLoadingExperience] = useState(true)
  const [showAddExperience, setShowAddExperience] = useState(false)
  const [savingExperience, setSavingExperience] = useState(false)
  const [expForm, setExpForm] = useState({ company_name: "", role: "", exp_years: "", technologies_used: "", description: "" })
  // About editing
  const [editingAbout, setEditingAbout] = useState(false)
  const [aboutDraft, setAboutDraft] = useState("")
  const [savingAbout, setSavingAbout] = useState(false)

  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentId = params.student_id as string
  const isAuthorized = useStudentAuth(studentId)
  const { setStudent: setSidebarStudent, setWorkspace } = useSidebarContext()

  // Clear workspace context when on dashboard (no environment open)
  useEffect(() => { setWorkspace(null) }, [setWorkspace])

  // Keep sidebar student in sync
  useEffect(() => {
    if (student) setSidebarStudent(student)
  }, [student, setSidebarStudent])

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "companies" || tab === "explore" || tab === "profile") {
      setActiveTab(tab)
    } else {
      setActiveTab("companies")
    }
  }, [searchParams])

  const refreshStudentSkills = useCallback(async () => {
    setLoadingStudentSkills(true)
    try {
      const { data: skillRows, error: skillsError } = await supabase
        .from("student_skills")
        .select("id, skill_name, experience_level, repo_url")
        .eq("student_id", studentId)
        .order("skill_name", { ascending: true })
      if (!skillsError && Array.isArray(skillRows)) {
        setStudentSkillsRows(
          skillRows.map((row: any) => ({
            id: row.id,
            skill_name: row.skill_name,
            experience_level: row.experience_level ?? null,
            repo_url: row.repo_url ?? null,
          }))
        )
      } else {
        setStudentSkillsRows([])
      }
    } catch {
      setStudentSkillsRows([])
    } finally {
      setLoadingStudentSkills(false)
    }
  }, [studentId])

  // --- Data Fetching Logic ---
  useEffect(() => {
    if (isAuthorized !== true) return
    ;(async () => {
      const { data: studentRow, error: studentError } = await supabase
        .from("students").select("*").eq("student_id", studentId).single()

      // Use DB student or fallback to static profile (preserves implementation logic)
      const studentData = studentRow ?? { ...staticStudentProfile, student_id: studentId }
      setStudent(studentData)

      await refreshStudentSkills()

      // Fetch experience
      const { data: expRows } = await supabase
        .from("experience")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
      setExperienceRows(expRows || [])
      setLoadingExperience(false)

      const { data: allCompanies } = await supabase.from("companies").select("*")
      const staticList = staticCompaniesForStudents as Array<Record<string, unknown>>

      // DB companies (when present) + static companies
      const dbAvailable =
        allCompanies && allCompanies.length > 0
          ? allCompanies
              .map((c) => ({
                ...c,
                requiredSkills: c.tech_stack ?? (c as any).requiredSkills ?? [],
                logo: (c as any).logo ?? String(c.name || "").slice(0, 2).toUpperCase(),
                difficulty: (c as any).difficulty ?? "intermediate",
                totalProjects: (c as any).totalProjects ?? 0,
              }))
          : []

      const dbIds = new Set(dbAvailable.map((c) => c.company_id))
      const staticToAdd = staticList.filter((c) => !dbIds.has(c.company_id as string))
      setAvailableCompanies([...dbAvailable, ...staticToAdd])

      // Joined virtual environments for this student (source of truth for dashboard join state)
      const { data: participantRows, error: participantsError } = await supabase
        .from("environment_participants")
        .select("environment_id")
        .eq("student_id", studentId)
      if (!participantsError && Array.isArray(participantRows)) {
        setJoinedEnvironmentIds(
          participantRows
            .map((row: any) => row.environment_id)
            .filter((id: unknown): id is string => typeof id === "string")
        )
      } else {
        setJoinedEnvironmentIds([])
      }
    })()
  }, [studentId, isAuthorized, refreshStudentSkills])

  useEffect(() => {
    if (isAuthorized !== true) return
    const allCompanyRows = [...availableCompanies]
    const companyIds = Array.from(
      new Set(
        allCompanyRows
          .map((c: { company_id?: string }) => c.company_id)
          .filter((id): id is string => Boolean(id))
      )
    )

    if (!companyIds.length) {
      setEnvironmentCards([])
      setLoadingEnvironments(false)
      return
    }

    setLoadingEnvironments(true)
    ;(async () => {
      const { data, error } = await supabase
        .from("virtual_environments")
        .select("environment_id, title, description, status, company_id")
        .in("company_id", companyIds)
        .order("created_at", { ascending: false })

      const byCompany = Object.fromEntries(
        allCompanyRows.map((c: { company_id: string; name?: string; logo?: string }) => [
          c.company_id,
          c,
        ])
      )

      if (!error && data?.length) {
        setEnvironmentCards(
          data.map((row: any) => ({
            environment_id: row.environment_id,
            title: row.title,
            description: row.description ?? null,
            status: row.status ?? null,
            company_id: row.company_id,
            company_name: byCompany[row.company_id]?.name ?? "Company",
            company_logo:
              byCompany[row.company_id]?.logo ??
              String(byCompany[row.company_id]?.name ?? "C").slice(0, 2).toUpperCase(),
          }))
        )
      } else {
        setEnvironmentCards([])
      }
      setLoadingEnvironments(false)
    })()
  }, [isAuthorized, availableCompanies])

  // --- Actions ---
  const handleJoinEnvironmentFromDirectory = (companyId: string, environmentId: string) => {
    ;(async () => {
      const res = await fetch("/api/student/join-environment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environmentId, companyId }),
      })
      if (!res.ok) return
      setJoinedEnvironmentIds((prev) =>
        prev.includes(environmentId) ? prev : [...prev, environmentId]
      )
      setActiveTab("companies")
    })()
  }

  const normalizeSkillKey = (s: string) =>
    s.trim().replace(/\s+/g, " ").toLowerCase()

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newSkillName.trim().replace(/\s+/g, " ")
    if (!name) {
      setSkillFormError("Enter a skill name.")
      return
    }
    const key = normalizeSkillKey(name)
    if (
      studentSkillsRows.some(
        (r) => normalizeSkillKey(r.skill_name) === key
      )
    ) {
      setSkillFormError(
        `You already have “${name}” on your profile. Each skill can only be added once.`
      )
      return
    }
    setSkillFormError(null)
    setSkillOutcome(null)
    const repo = newSkillRepo.trim()
    setAddSkillPhase(repo ? "ai" : "beginner")
    setSavingNewSkill(true)
    try {
      if (repo) {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const githubAccessToken = session?.provider_token ?? null
        if (!githubAccessToken) {
          setSkillFormError(
            "Analyzing a repo needs a GitHub sign-in. Sign in with GitHub, or leave the repo URL empty to add the skill as beginner."
          )
          return
        }
        const res = await fetch("/api/student/onboarding/analyze-repos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            githubAccessToken,
            skills: [{ skill_name: name, repo_url: repo }],
          }),
        })
        const data = (await res.json().catch(() => ({}))) as {
          error?: string
          skills?: Array<{
            experience_level?: string
            level_source?: string
            fallback_reason?: string | null
          }>
        }
        if (!res.ok) {
          throw new Error(data.error || "Could not analyze repository")
        }
        const first = data.skills?.[0]
        if (!first) {
          setSkillOutcome({
            tone: "success",
            title: "Skill saved",
            body: "Your skill was added to your profile.",
          })
        } else if (first.level_source === "model") {
          const lvl = (first.experience_level ?? "beginner").replace(/^\w/, (c) =>
            c.toUpperCase()
          )
          setSkillOutcome({
            tone: "success",
            title: "AI assessment complete",
            body: `Your repository was analyzed and this skill was saved as ${lvl}.`,
          })
        } else {
          const reason = first.fallback_reason
          const detail =
            reason === "invalid_github_repo"
              ? "The URL is not a valid github.com owner/repo path."
              : reason === "ai_error"
                ? "The AI service failed while assessing the repository."
                : "The AI did not return a clear level."
          setSkillOutcome({
            tone: "warning",
            title: "Saved with fallback level",
            body: `${detail} Level was set to beginner. Fix the URL or try again later.`,
          })
        }
      } else {
        const { error } = await supabase.from("student_skills").insert({
          student_id: studentId,
          skill_name: name,
          experience_level: "beginner",
          repo_url: null,
        })
        if (error) throw error
        setSkillOutcome({
          tone: "info",
          title: "Skill saved (no AI)",
          body:
            "No repository URL was provided, so we skipped AI analysis and saved this skill as beginner.",
        })
      }
      setNewSkillName("")
      setNewSkillRepo("")
      await refreshStudentSkills()
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Could not save skill. Check you are signed in and try again."
      setSkillFormError(msg)
    } finally {
      setSavingNewSkill(false)
      setAddSkillPhase(null)
    }
  }

  // --- Filters & derived flags ---
  const onboardingComplete =
    Boolean(student?.github_url) &&
    studentSkillsRows.length > 0
  const missingOnboardingFields = [
    ...(student?.github_url ? [] : ["GitHub account link"]),
    ...(studentSkillsRows.length > 0 ? [] : ["At least one skill + repository link"]),
  ]

  const joinedEnvironmentIdSet = useMemo(
    () => new Set(joinedEnvironmentIds),
    [joinedEnvironmentIds]
  )
  const joinedEnvironmentCards = useMemo(
    () => environmentCards.filter((env) => joinedEnvironmentIdSet.has(env.environment_id)),
    [environmentCards, joinedEnvironmentIdSet]
  )
  const joinedCompanies = useMemo(() => {
    const byId = new Map<string, any>()
    const companyLookup = new Map(
      availableCompanies.map((company: any) => [company.company_id, company])
    )
    joinedEnvironmentCards.forEach((env) => {
      if (byId.has(env.company_id)) return
      const company = companyLookup.get(env.company_id)
      byId.set(env.company_id, {
        company_id: env.company_id,
        name: company?.name ?? env.company_name ?? "Company",
        logo:
          company?.logo ??
          env.company_logo ??
          String(company?.name ?? env.company_name ?? "C").slice(0, 2).toUpperCase(),
        requiredSkills: company?.requiredSkills ?? [],
      })
    })
    return Array.from(byId.values())
  }, [joinedEnvironmentCards, availableCompanies])
  const directoryEnvironmentCards = useMemo(() => {
    const q = exploreQuery.trim().toLowerCase()
    return environmentCards.filter((env) => {
      if (joinedEnvironmentIdSet.has(env.environment_id)) return false
      if (!q) return true
      return (
        env.title.toLowerCase().includes(q) ||
        env.company_name.toLowerCase().includes(q) ||
        (env.description ?? "").toLowerCase().includes(q)
      )
    })
  }, [environmentCards, joinedEnvironmentIdSet, exploreQuery])

  // Loading State (student is always set via DB or static fallback once authorized)
  if (isAuthorized === null) return <div className="flex-1 bg-[#171a1a]" />
  if (isAuthorized === false) return null
  if (!student) return <div className="flex-1 bg-[#171a1a]" />
  return (
    <div className="flex-1 overflow-y-auto bg-[#171a1a]">
      <GlobalStyles />
      <div className="max-w-[1600px] mx-auto p-8">
          
          {/* Header Area */}
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/5">
            <div>
              <h1 className="text-xl font-medium text-white mb-1">
                {activeTab === "companies" && "Your environments"}
                {activeTab === "explore" && "Company Directory"}
                {activeTab === "profile" && "Account Settings"}
              </h1>
              <p className="text-xs text-zinc-500 mono">
                {activeTab === "companies" &&
                  `${joinedEnvironmentCards.length} ENVIRONMENT${joinedEnvironmentCards.length === 1 ? "" : "S"} · ${joinedCompanies.length} COMPAN${joinedCompanies.length === 1 ? "Y" : "IES"}`}
                {activeTab === "explore" && "AVAILABLE SIMULATIONS"}
                {activeTab === "profile" && `USER ID: ${studentId}`}
              </p>
            </div>
            
            {activeTab === "explore" && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <Input 
                  value={exploreQuery}
                  onChange={(e) => setExploreQuery(e.target.value)}
                  placeholder="Filter by name..." 
                  className="pl-9 bg-[#1c2020] border-white/5 text-xs w-64 h-8 rounded text-zinc-300 focus:border-white/20 placeholder:text-zinc-700"
                />
              </div>
            )}
          </div>

          {/* --- ONBOARDING GATE --- */}
          {!onboardingComplete ? (
            <div className="w-full max-w-3xl mx-auto mt-4">
              <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <p className="text-sm text-amber-300 font-medium mb-1">
                  Complete onboarding to unlock Virtual Environments
                </p>
                <ul className="list-disc list-inside text-xs text-amber-200/90 space-y-0.5">
                  {missingOnboardingFields.map((field) => (
                    <li key={field}>{field} is missing</li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-[11px] bg-amber-600 hover:bg-amber-500 text-white"
                    onClick={() => setActiveTab("companies")}
                  >
                    Fill onboarding now
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] border-amber-400/40 text-amber-200 hover:bg-amber-500/10"
                    onClick={() => setActiveTab("profile")}
                  >
                    Review profile data
                  </Button>
                </div>
              </div>
              <StudentOnboardingSurvey
                initialGithubUrl={student.github_url}
                initialAbout={student.About}
                onCompleted={async () => {
                  const { data: studentRow } = await supabase
                    .from("students")
                    .select("*")
                    .eq("student_id", studentId)
                    .single()
                  if (studentRow) setStudent(studentRow)
                  await refreshStudentSkills()
                  setActiveTab("companies")
                }}
              />
            </div>
          ) : null}

          {/* --- TAB: VIRTUAL COMPANIES (TABLE VIEW) --- */}
          {onboardingComplete && activeTab === "companies" && (
            <div className="w-full space-y-10">
              {joinedCompanies.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-white/5 rounded bg-white/[0.01]">
                  <Terminal className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm mb-4">You have not joined any company yet.</p>
                  <Button onClick={() => setActiveTab("explore")} variant="outline" className="text-xs h-8 bg-transparent border-zinc-700 text-zinc-300 hover:bg-white/5">
                    Go to Directory
                  </Button>
                </div>
              ) : null}

              {joinedCompanies.length > 0 && !loadingEnvironments && (
                <div>
                  <h2 className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Your companies</h2>
                  <div className="w-full overflow-hidden rounded border border-white/5">
                    <table className="w-full">
                      <thead className="bg-[#1c2020]">
                        <tr>
                          <th className="pl-6">Company</th>
                          <th>Stack</th>
                          <th className="text-right pr-6">Open</th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#171a1a]">
                        {joinedCompanies.map((company: any) => (
                          <tr
                            key={company.company_id}
                            className="group cursor-pointer"
                            onClick={() =>
                              router.push(
                                `/student/${studentId}/company/${company.company_id}/details?mode=project`
                              )
                            }
                          >
                            <td className="pl-6 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-zinc-900 border border-white/5 rounded flex items-center justify-center text-xs font-bold text-zinc-400">
                                  {company.logo}
                                </div>
                                <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                                  {company.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(company.requiredSkills) &&
                                  company.requiredSkills.slice(0, 3).map((tech: string) => (
                                    <span
                                      key={tech}
                                      className="text-[10px] bg-white/5 text-zinc-400 px-1.5 py-0.5 rounded mono border border-white/5"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                              </div>
                            </td>
                            <td className="text-right pr-6 py-3">
                              <span className="text-[11px] text-blue-400/90 font-medium uppercase tracking-wider inline-flex items-center gap-1 justify-end">
                                Workspace <ArrowRight className="w-3 h-3" />
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- TAB: EXPLORE (TABLE VIEW) --- */}
          {onboardingComplete && activeTab === "explore" && (
            <div className="w-full space-y-8">
              {loadingEnvironments ? (
                <div className="py-24 flex justify-center">
                  <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                </div>
              ) : directoryEnvironmentCards.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-white/5 rounded-lg bg-white/[0.01]">
                  <Layers className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm max-w-md mx-auto">
                    No unjoined environments available in directory right now.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {directoryEnvironmentCards.map((env) => (
                    <div
                      key={env.environment_id}
                      className="text-left rounded-xl border border-white/10 bg-[#1c2020] p-5 hover:border-white/20 hover:bg-[#1f2323] transition-all group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-[11px] font-bold text-zinc-400 shrink-0">
                            {env.company_logo}
                          </div>
                          <span className="text-[11px] text-zinc-500 truncate uppercase tracking-wide">
                            {env.company_name}
                          </span>
                        </div>
                        <StatusBadge status={env.status || "open"} />
                      </div>
                      <div className="flex items-start gap-2 mb-2">
                        <Layers className="w-4 h-4 text-emerald-500/80 shrink-0 mt-0.5" />
                        <h3 className="text-[15px] font-medium text-white group-hover:text-emerald-400/90 transition-colors leading-snug">
                          {env.title}
                        </h3>
                      </div>
                      {env.description ? (
                        <p className="text-[12px] text-zinc-500 line-clamp-3 leading-relaxed">{env.description}</p>
                      ) : (
                        <p className="text-[12px] text-zinc-600 italic">No description</p>
                      )}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/student/${studentId}/company/${env.company_id}/details?mode=project&projectId=${env.environment_id}`
                            )
                          }
                          className="text-[11px] text-blue-400/90 font-medium uppercase tracking-wider inline-flex items-center gap-1"
                        >
                          View details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <Button
                          onClick={() =>
                            handleJoinEnvironmentFromDirectory(
                              env.company_id,
                              env.environment_id
                            )
                          }
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[10px] bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10 uppercase tracking-wide"
                        >
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- TAB: PROFILE --- */}
          {activeTab === "profile" && (
            <div className="max-w-4xl space-y-8">
              <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1c2020] via-[#171a1a] to-[#141616] p-6 sm:p-8 shadow-xl shadow-black/20">
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 text-xl font-semibold text-white ring-1 ring-white/10">
                    {(student?.full_name ?? student?.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-1">Profile</p>
                      <h2 className="text-xl font-semibold text-white tracking-tight">{student?.full_name ?? student?.name ?? "Student"}</h2>
                      <p className="text-[11px] text-zinc-600 mt-1 font-mono truncate">{studentId}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
                        <Mail className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Email</p>
                          <p className="text-sm text-zinc-200 truncate">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
                        <Github className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">GitHub</p>
                          {student.github_url ? (
                            <a href={student.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 truncate max-w-full">
                              <span className="truncate">{student.github_url.replace(/^https?:\/\/(www\.)?github\.com\/?/, "")}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                            </a>
                          ) : (<p className="text-sm text-zinc-500">Not linked</p>)}
                        </div>
                      </div>
                      {student.resume_url && (
                        <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
                          <FileText className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Resume</p>
                            <a href={student.resume_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
                              View Resume <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* About section */}
                <div className="mt-6 pt-5 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">About</p>
                    {!editingAbout && (
                      <button onClick={() => { setEditingAbout(true); setAboutDraft(student?.About || "") }} className="text-[10px] text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1">
                        <Pen className="w-3 h-3" />{student?.About ? "Edit" : "Add bio"}
                      </button>
                    )}
                  </div>
                  {editingAbout ? (
                    <div className="space-y-2">
                      <textarea
                        value={aboutDraft}
                        onChange={(e) => setAboutDraft(e.target.value)}
                        rows={3}
                        placeholder="Write a short bio about yourself..."
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-white/20 resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingAbout(false)} className="text-[11px] text-zinc-500 hover:text-white px-3 py-1 rounded-lg hover:bg-white/5 transition">Cancel</button>
                        <button
                          disabled={savingAbout}
                          onClick={async () => {
                            setSavingAbout(true)
                            await supabase.from("students").update({ About: aboutDraft.trim() || null }).eq("student_id", studentId)
                            setStudent((prev: any) => ({ ...prev, About: aboutDraft.trim() || null }))
                            setEditingAbout(false)
                            setSavingAbout(false)
                          }}
                          className="text-[11px] text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg transition disabled:opacity-50 flex items-center gap-1"
                        >
                          {savingAbout && <Loader2 className="w-3 h-3 animate-spin" />}Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-sm leading-relaxed ${student?.About ? "text-zinc-300" : "text-zinc-600 italic"}`}>
                      {student?.About || "No bio added yet."}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#171a1a] overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-6 py-4 border-b border-white/5 bg-[#1c2020]/80">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-400/90" />
                    <h3 className="text-sm font-medium text-white">Skills & repositories</h3>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    {studentSkillsRows.length} on profile
                  </span>
                </div>

                <div className="p-6 space-y-8">
                  <form
                    onSubmit={handleAddSkill}
                    className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 sm:p-5 space-y-4"
                  >
                    <div className="flex items-center gap-2 text-white">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium">Add a skill</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      With a <strong className="text-zinc-400 font-medium">GitHub repo URL</strong>, we assess level from the code (same as onboarding). Leave the repo empty to add the skill as{" "}
                      <strong className="text-zinc-400 font-medium">beginner</strong> only.
                    </p>

                    {loadingStudentSkills && (
                      <div
                        role="status"
                        aria-live="polite"
                        className={
                          studentSkillsRows.length > 0
                            ? "rounded-xl border border-violet-500/35 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 px-4 py-4 flex gap-4 items-start"
                            : "rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 flex gap-3 items-start"
                        }
                      >
                        {studentSkillsRows.length > 0 ? (
                          <>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 border border-violet-400/30">
                              <Sparkles className="h-5 w-5 text-violet-200 animate-pulse" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-violet-100 flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-violet-300 shrink-0" />
                                Loading your profile skills
                              </p>
                              <p className="text-xs text-violet-200/75 mt-1.5 leading-relaxed">
                                Syncing saved skills from your account. Your list will update in a moment.
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Loader2 className="h-5 w-5 text-zinc-400 animate-spin shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-zinc-200">Loading skills</p>
                              <p className="text-xs text-zinc-500 mt-1">
                                Fetching your profile from the server…
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="skill-name" className="text-[11px] text-zinc-400">
                          Skill name
                        </Label>
                        <Input
                          id="skill-name"
                          list="profile-tech-suggestions"
                          disabled={savingNewSkill || loadingStudentSkills}
                          value={newSkillName}
                          onChange={(e) => {
                            setNewSkillName(e.target.value)
                            setSkillFormError(null)
                            setSkillOutcome(null)
                          }}
                          placeholder="e.g. React, Go, System design"
                          className="h-10 bg-[#111315] border-white/10 text-sm text-zinc-100 placeholder:text-zinc-600"
                        />
                        <datalist id="profile-tech-suggestions">
                          {TECH_STACK_OPTIONS.map((t) => (
                            <option key={t} value={t} />
                          ))}
                        </datalist>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="skill-repo" className="text-[11px] text-zinc-400">
                          GitHub repo URL <span className="text-zinc-600">(optional)</span>
                        </Label>
                        <Input
                          id="skill-repo"
                          type="url"
                          disabled={savingNewSkill || loadingStudentSkills}
                          value={newSkillRepo}
                          onChange={(e) => {
                            setNewSkillRepo(e.target.value)
                            setSkillFormError(null)
                            setSkillOutcome(null)
                          }}
                          placeholder="https://github.com/you/project"
                          className="h-10 bg-[#111315] border-white/10 text-sm text-zinc-100 placeholder:text-zinc-600"
                        />
                      </div>
                    </div>

                    {savingNewSkill && addSkillPhase === "ai" && (
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
                            AI is analyzing your repository
                          </p>
                          <p className="text-xs text-violet-200/75 mt-1.5 leading-relaxed">
                            Pulling your README and sample files from GitHub, then running the model to estimate experience level. This often takes 30–90 seconds.
                          </p>
                        </div>
                      </div>
                    )}

                    {savingNewSkill && addSkillPhase === "beginner" && (
                      <div
                        role="status"
                        aria-live="polite"
                        className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 flex gap-3 items-start"
                      >
                        <Loader2 className="h-5 w-5 text-zinc-400 animate-spin shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-zinc-200">Saving without AI</p>
                          <p className="text-xs text-zinc-500 mt-1">
                            No repo URL — your skill is stored as beginner. Add a GitHub repo next time if you want an AI-assessed level.
                          </p>
                        </div>
                      </div>
                    )}

                    {skillFormError && (
                      <p className="text-xs text-red-400/90">{skillFormError}</p>
                    )}

                    {skillOutcome && !savingNewSkill && (
                      <div
                        role="status"
                        className={
                          skillOutcome.tone === "success"
                            ? "rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 flex gap-3"
                            : skillOutcome.tone === "info"
                              ? "rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 flex gap-3"
                              : "rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 flex gap-3"
                        }
                      >
                        {skillOutcome.tone === "success" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : skillOutcome.tone === "info" ? (
                          <Info className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white">{skillOutcome.title}</p>
                          <p className="text-xs text-white/65 mt-1 leading-relaxed">{skillOutcome.body}</p>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={savingNewSkill || loadingStudentSkills}
                      className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                    >
                      {savingNewSkill ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                          {newSkillRepo.trim() ? "Analyzing repository…" : "Saving…"}
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 mr-2" />
                          Add skill
                        </>
                      )}
                    </Button>
                  </form>

                  {loadingStudentSkills && studentSkillsRows.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 opacity-60 pointer-events-none">
                      {studentSkillsRows.map((row) => (
                        <div
                          key={row.id ?? row.skill_name}
                          className="rounded-xl border border-white/10 bg-[#111315]/90 px-4 py-3.5"
                        >
                          <p className="text-sm font-medium text-white truncate">
                            {row.skill_name}
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1.5">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Refreshing…
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : loadingStudentSkills ? (
                    <div className="py-6" aria-hidden />
                  ) : studentSkillsRows.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-xl border border-white/5 bg-black/15">
                      <User className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
                      <p className="text-sm text-zinc-400 mb-1">No skills yet</p>
                      <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                        Use the form above or complete onboarding to build your skill list. Companies use this to match you to environments.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {studentSkillsRows.map((row) => {
                        const level = (row.experience_level || "beginner").toLowerCase()
                        const levelClass =
                          level === "advanced"
                            ? "bg-violet-500/15 text-violet-200 border-violet-500/25"
                            : level === "intermediate"
                              ? "bg-amber-500/15 text-amber-200 border-amber-500/25"
                              : "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
                        return (
                          <div
                            key={row.id ?? row.skill_name}
                            className="group rounded-xl border border-white/10 bg-[#111315]/90 px-4 py-3.5 hover:border-white/15 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {row.skill_name}
                                </p>
                                {row.repo_url ? (
                                  <a
                                    href={row.repo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 max-w-full"
                                  >
                                    <span className="truncate">{row.repo_url}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                                  </a>
                                ) : (
                                  <p className="mt-2 text-[11px] text-zinc-600">No repo linked</p>
                                )}
                              </div>
                              <span
                                className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md border ${levelClass}`}
                              >
                                {row.experience_level || "beginner"}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Experience Section */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#171a1a] overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-6 py-4 border-b border-white/5 bg-[#1c2020]/80">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-violet-400/90" />
                    <h3 className="text-sm font-medium text-white">Experience</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-500">{experienceRows.length} entries</span>
                    <button
                      onClick={() => setShowAddExperience(!showAddExperience)}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3 h-3" />{showAddExperience ? "Cancel" : "Add"}
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Add experience form */}
                  {showAddExperience && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault()
                        if (!expForm.company_name.trim() || !expForm.role.trim()) return
                        setSavingExperience(true)
                        const { data: newExp } = await supabase.from("experience").insert({
                          student_id: studentId,
                          company_name: expForm.company_name.trim(),
                          role: expForm.role.trim(),
                          exp_years: expForm.exp_years.trim() || null,
                          technologies_used: expForm.technologies_used ? expForm.technologies_used.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
                          description: expForm.description.trim() || null,
                        }).select("*").single()
                        if (newExp) setExperienceRows((prev) => [newExp, ...prev])
                        setExpForm({ company_name: "", role: "", exp_years: "", technologies_used: "", description: "" })
                        setShowAddExperience(false)
                        setSavingExperience(false)
                      }}
                      className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 sm:p-5 space-y-3"
                    >
                      <div className="flex items-center gap-2 text-white mb-1">
                        <Plus className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-medium">Add experience</span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Company *</Label>
                          <Input value={expForm.company_name} onChange={(e) => setExpForm(p => ({...p, company_name: e.target.value}))} placeholder="e.g. Google" className="h-8 bg-black/30 border-white/10 text-sm text-zinc-200 placeholder:text-zinc-700" />
                        </div>
                        <div>
                          <Label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Role *</Label>
                          <Input value={expForm.role} onChange={(e) => setExpForm(p => ({...p, role: e.target.value}))} placeholder="e.g. Frontend Intern" className="h-8 bg-black/30 border-white/10 text-sm text-zinc-200 placeholder:text-zinc-700" />
                        </div>
                        <div>
                          <Label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Duration</Label>
                          <Input value={expForm.exp_years} onChange={(e) => setExpForm(p => ({...p, exp_years: e.target.value}))} placeholder="e.g. 6 months" className="h-8 bg-black/30 border-white/10 text-sm text-zinc-200 placeholder:text-zinc-700" />
                        </div>
                        <div>
                          <Label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Tech Stack</Label>
                          <Input value={expForm.technologies_used} onChange={(e) => setExpForm(p => ({...p, technologies_used: e.target.value}))} placeholder="React, Node.js, Python" className="h-8 bg-black/30 border-white/10 text-sm text-zinc-200 placeholder:text-zinc-700" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Description</Label>
                        <textarea
                          value={expForm.description}
                          onChange={(e) => setExpForm(p => ({...p, description: e.target.value}))}
                          rows={2}
                          placeholder="What did you work on?"
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-white/20 resize-none"
                        />
                      </div>
                      <Button type="submit" disabled={savingExperience || !expForm.company_name.trim() || !expForm.role.trim()} className="h-8 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium">
                        {savingExperience ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Saving…</> : <><Plus className="w-3.5 h-3.5 mr-2" />Add experience</>}
                      </Button>
                    </form>
                  )}

                  {/* Experience list */}
                  {loadingExperience ? (
                    <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 text-zinc-600 animate-spin" /></div>
                  ) : experienceRows.length === 0 ? (
                    <div className="text-center py-10 px-4 rounded-xl border border-white/5 bg-black/15">
                      <Briefcase className="w-8 h-8 mx-auto text-zinc-700 mb-2" />
                      <p className="text-sm text-zinc-400 mb-1">No experience added</p>
                      <p className="text-xs text-zinc-600">Add your internships and work experience to boost your profile.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {experienceRows.map((exp: any) => (
                        <div key={exp.experience_id} className="group rounded-xl border border-white/10 bg-[#111315]/90 px-5 py-4 hover:border-white/15 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-medium text-white">{exp.role}</p>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{exp.company_name}</span>
                                {exp.exp_years && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exp.exp_years}</span>}
                              </div>
                              {exp.description && (
                                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{exp.description}</p>
                              )}
                              {exp.technologies_used?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2.5">
                                  {exp.technologies_used.map((tech: string) => (
                                    <span key={tech} className="text-[9px] px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.03] text-zinc-400 font-medium">{tech}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={async () => {
                                await supabase.from("experience").delete().eq("experience_id", exp.experience_id)
                                setExperienceRows((prev) => prev.filter((e: any) => e.experience_id !== exp.experience_id))
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400 p-1"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
  )
}