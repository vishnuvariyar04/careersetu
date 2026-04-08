"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { 
  Users, 
  TrendingUp, 
  Award, 
  Target, 
  Brain, 
  Code, 
  MessageSquare, 
  Star, 
  ArrowUp, 
  ArrowDown,
  BarChart3,
  BookOpen,
  FolderKanban,
  Settings,
  GraduationCap,
  LogOut,
  Loader2,
} from "lucide-react"
import LearningWorkflowComponent from "@/components/learning-workflow"
import { CreateProjectPanel } from "@/components/company/create-project-panel"
import performanceData from "@/data/performance_data.json"
import skillDistribution from "@/data/skill_distribution.json"
import projectMetrics from "@/data/project_metrics.json"
import radarData from "@/data/radar_data.json"
import studentsData from "@/data/students.json"
import companyStudentStats from "@/data/company_student_stats.json"
import { signOut } from "@/lib/auth-helpers"
import { supabase } from "@/lib/supabase"
import { Pencil } from "lucide-react"

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

interface CompanyRow {
  name?: string | null
  industry?: string | null
  mission?: string | null
  vision?: string | null
  employee_count?: number | null
  evaluation_metrics?: string[] | null
  onboarding_advanced?: { roles?: { name: string; skills?: string[] }[] } | null
}

export default function SupervisorDashboard() {
  const params = useParams<{ company_id: string }>()
  const companyId = params?.company_id
  const [timeRange, setTimeRange] = useState("6m")
  const [selectedProject, setSelectedProject] = useState("all")
  const [activeNav, setActiveNav] = useState("analytics")
  const [company, setCompany] = useState<CompanyRow | null>(null)
  const [companyLoading, setCompanyLoading] = useState(false)
  const [gateChecking, setGateChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!companyId) return
    let cancelled = false

    const runGuard = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession()
        const session = authData.session
        if (!session) {
          if (!cancelled) router.push(`/auth?redirect=${encodeURIComponent(`/company/${companyId}/dashboard`)}`)
          return
        }

        const role = session.user.user_metadata?.role
        if (role !== "company" || session.user.id !== companyId) {
          if (!cancelled) router.push("/auth")
          return
        }

        const { data: row } = await supabase
          .from("companies")
          .select("industry, mission, vision, employee_count, evaluation_metrics, policies, onboarding_advanced")
          .eq("company_id", companyId)
          .single()

        const hasOnboardingData = Boolean(
          row?.industry ||
            row?.mission ||
            row?.vision ||
            row?.employee_count ||
            (Array.isArray(row?.evaluation_metrics) && row.evaluation_metrics.length > 0) ||
            row?.policies ||
            ((row?.onboarding_advanced as any)?.roles?.length ?? 0) > 0
        )

        if (!hasOnboardingData) {
          if (!cancelled) router.push(`/company/${companyId}/onboarding`)
          return
        }
      } catch {
        if (!cancelled) router.push(`/company/${companyId}/onboarding`)
        return
      } finally {
        if (!cancelled) setGateChecking(false)
      }
    }

    void runGuard()
    return () => {
      cancelled = true
    }
  }, [companyId, router])

  useEffect(() => {
    if (!companyId || activeNav !== "settings") return
    setCompanyLoading(true)
    const run = async () => {
      try {
        const { data } = await supabase
          .from("companies")
          .select("name, industry, mission, vision, employee_count, evaluation_metrics, onboarding_advanced")
          .eq("company_id", companyId)
          .single()
        setCompany(data as CompanyRow | null)
      } catch {
        setCompany(null)
      } finally {
        setCompanyLoading(false)
      }
    }
    run()
  }, [companyId, activeNav])

  const topStudentsWithStats = useMemo(() => {
    const statsByStudentId = (companyStudentStats as { student_id: string; tasks_completed: number; score: number; rating: number; trend: string }[]).reduce(
      (acc, s) => {
        acc[s.student_id] = s
        return acc
      },
      {} as Record<string, { tasks_completed: number; score: number; rating: number; trend: string }>
    )
    return (studentsData as { student_id: string; full_name: string; email: string; skills: string[] }[])
      .map((student) => {
        const stats = statsByStudentId[student.student_id]
        return {
          student_id: student.student_id,
          name: student.full_name,
          avatar: getInitials(student.full_name),
          score: stats?.score ?? 0,
          tasksCompleted: stats?.tasks_completed ?? 0,
          rating: stats?.rating ?? 0,
          trend: (stats?.trend ?? "stable") as "up" | "down" | "stable",
          skills: Array.isArray(student.skills) ? student.skills : [],
        }
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
  }, [])

  const navItems = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    // { id: "learning", label: "Learning", icon: BookOpen },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "students", label: "Students", icon: GraduationCap },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (e) {
      console.error("Error signing out", e)
    } finally {
      router.push("/auth/login")
    }
  }

  // Render content based on active navigation
  const renderContent = () => {
    switch(activeNav) {
      // case "learning":
      //   return (
      //     // <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      //     //   <Card className="w-full max-w-2xl">
      //     //     <CardHeader>
      //     //       <CardTitle className="text-2xl">Learning Workflow Component</CardTitle>
      //     //       <CardDescription>This is the Learning Workflow section placeholder</CardDescription>
      //     //     </CardHeader>
      //     //     <CardContent>
      //     //       <p className="text-muted-foreground">Replace this with your Learning Workflow component later</p>
      //     //     </CardContent>
      //     //   </Card>
      //     // </div>
      //     // <LearningWorkflowComponent />

      //   )
      
      case "projects":
        return companyId ? (
          <CreateProjectPanel companyId={companyId} />
        ) : (
          <div className="p-6 text-muted-foreground">Missing company id.</div>
        )
      
      case "students":
        return (
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Students</h1>
              <p className="text-muted-foreground">Students enrolled or associated with your company</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(studentsData as { student_id: string; full_name: string; email: string; skills: string[]; experience_level: string; github_url: string | null; resume_url: string | null }[]).map((student) => (
                <Card key={student.student_id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm">{getInitials(student.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base truncate">{student.full_name}</CardTitle>
                        <CardDescription className="text-xs truncate">{student.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Experience: </span>
                      <Badge variant="secondary" className="capitalize">{student.experience_level}</Badge>
                    </div>
                    {Array.isArray(student.skills) && student.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {student.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                        {student.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">+{student.skills.length - 4}</Badge>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      {student.github_url && (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={student.github_url} target="_blank" rel="noopener noreferrer">GitHub</a>
                        </Button>
                      )}
                      {student.resume_url && (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={student.resume_url} target="_blank" rel="noopener noreferrer">Resume</a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      
      case "settings":
        return (
          <div className="w-full min-h-[calc(100vh-6rem)] flex flex-col space-y-6">
            <div className="flex items-center justify-between rounded-2xl border bg-card p-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your company profile and onboarding details</p>
              </div>
              {companyId && (
                <Button
                  onClick={() => router.push(`/company/${companyId}/onboarding`)}
                  className="gap-2 rounded-full"
                >
                  <Pencil className="w-4 h-4" />
                  Edit onboarding details
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Profile Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  {companyLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : (
                    <>
                      {(() => {
                        const checkpoints = [
                          Boolean(company?.name),
                          Boolean(company?.industry),
                          Boolean(company?.mission),
                          Boolean(company?.vision),
                          Boolean(company?.employee_count),
                          Boolean(company?.evaluation_metrics?.length),
                          Boolean((company?.onboarding_advanced as any)?.roles?.length),
                        ]
                        const completed = checkpoints.filter(Boolean).length
                        const pct = Math.round((completed / checkpoints.length) * 100)
                        return (
                          <div className="space-y-3">
                            <p className="text-3xl font-bold">{pct}%</p>
                            <Progress value={pct} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              {completed}/{checkpoints.length} onboarding sections configured
                            </p>
                          </div>
                        )
                      })()}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Quick Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm font-medium mt-1">{company?.name || "—"}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Industry</p>
                    <p className="text-sm font-medium mt-1">{company?.industry || "—"}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Employees</p>
                    <p className="text-sm font-medium mt-1">{company?.employee_count ?? "—"}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Roles Configured</p>
                    <p className="text-sm font-medium mt-1">{(company?.onboarding_advanced as any)?.roles?.length ?? 0}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl">Onboarding Details</CardTitle>
                <CardDescription>Company information configured during onboarding</CardDescription>
              </CardHeader>
              <CardContent>
                {companyLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : company && (company.name || company.industry || company.mission) ? (
                  <dl className="space-y-5 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <dt className="text-muted-foreground">Company Name</dt>
                      <dd className="font-medium sm:col-span-2">{company.name || "—"}</dd>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <dt className="text-muted-foreground">Industry</dt>
                      <dd className="font-medium sm:col-span-2">{company.industry || "—"}</dd>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <dt className="text-muted-foreground">Employees</dt>
                      <dd className="font-medium sm:col-span-2">{company.employee_count ?? "—"}</dd>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <dt className="text-muted-foreground">Mission</dt>
                      <dd className="font-medium sm:col-span-2 leading-relaxed">{company.mission || "—"}</dd>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <dt className="text-muted-foreground">Vision</dt>
                      <dd className="font-medium sm:col-span-2 leading-relaxed">{company.vision || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground mb-1">Tech stack</dt>
                      <dd className="text-muted-foreground text-sm">
                        Set per project in <span className="font-medium text-foreground">Projects</span> when you create or edit a virtual environment.
                      </dd>
                    </div>
                    {company.evaluation_metrics && company.evaluation_metrics.length > 0 && (
                      <div>
                        <dt className="text-muted-foreground mb-1">Evaluation Metrics</dt>
                        <dd className="flex flex-wrap gap-1">
                          {company.evaluation_metrics.map((m) => (
                            <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                          ))}
                        </dd>
                      </div>
                    )}
                    {company.onboarding_advanced?.roles && company.onboarding_advanced.roles.length > 0 && (
                      <div>
                        <dt className="text-muted-foreground mb-1">Roles</dt>
                        <dd className="flex flex-wrap gap-1">
                          {company.onboarding_advanced.roles.map((r) => (
                            <Badge key={r.name} variant="outline" className="text-xs">{r.name}</Badge>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <p className="text-muted-foreground">No onboarding details yet. Complete onboarding to configure your company.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )
      
      case "analytics":
      default:
        return (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Monitor student performance and company productivity</p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="ecommerce">E-commerce Platform</SelectItem>
                    <SelectItem value="analytics">Analytics Dashboard</SelectItem>
                    <SelectItem value="social">Social Media App</SelectItem>
                    <SelectItem value="task">Task Management Tool</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 Month</SelectItem>
                    <SelectItem value="3m">3 Months</SelectItem>
                    <SelectItem value="6m">6 Months</SelectItem>
                    <SelectItem value="1y">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      +12%
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">92.5%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      +5.2%
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      +18%
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.7</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500 flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      +0.3
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Trends</CardTitle>
                      <CardDescription>Student performance metrics over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="productivity" stroke="#10b981" strokeWidth={2} />
                          <Line type="monotone" dataKey="quality" stroke="#3b82f6" strokeWidth={2} />
                          <Line type="monotone" dataKey="collaboration" stroke="#8b5cf6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Skill Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Skill Distribution</CardTitle>
                      <CardDescription>Student specializations across the company</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={skillDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(props) => {
                              // props is PieLabelRenderProps; percent may be undefined
                              const name = (props as any).name as string | undefined
                              const percent = (props as any).percent as number | undefined
                              if (!name || percent == null) return ""
                              return `${name} ${(percent * 100).toFixed(0)}%`
                            }}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {skillDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Project Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Progress</CardTitle>
                    <CardDescription>Current status of all active projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={projectMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="completion" fill="#10b981" />
                        <Bar dataKey="quality" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="students" className="space-y-6">
                {/* Top Performers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Top Performers
                    </CardTitle>
                    <CardDescription>Students ranked by overall performance score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topStudentsWithStats.map((student, index) => (
                        <div key={student.student_id} className="flex items-center gap-4 p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                            <Avatar className="w-12 h-12">
                              <AvatarFallback>{student.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{student.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {student.skills.length > 0 ? student.skills.slice(0, 2).join(", ") : "—"}
                              </p>
                            </div>
                          </div>

                          <div className="flex-1 grid grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm font-medium">Score</p>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">{student.score}</span>
                                {student.trend === "up" && <ArrowUp className="w-4 h-4 text-green-500" />}
                                {student.trend === "down" && <ArrowDown className="w-4 h-4 text-red-500" />}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Tasks</p>
                              <p className="text-lg font-bold">{student.tasksCompleted}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Rating</p>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-primary text-primary" />
                                <span className="text-lg font-bold">{student.rating}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Skills</p>
                              <div className="flex gap-1">
                                {student.skills.slice(0, 2).map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {student.skills.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{student.skills.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projectMetrics.map((project) => (
                    <Card key={project.name}>
                      <CardHeader>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription>{project.students} students assigned</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Completion</span>
                            <span className="text-sm text-muted-foreground">{project.completion}%</span>
                          </div>
                          <Progress value={project.completion} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Quality Score</span>
                            <span className="text-sm text-muted-foreground">{project.quality}%</span>
                          </div>
                          <Progress value={project.quality} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <Badge variant="outline">
                            <Users className="w-3 h-3 mr-1" />
                            {project.students} students
                          </Badge>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Skill Comparison Radar */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Skill Comparison</CardTitle>
                      <CardDescription>Top performers vs average students</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="skill" />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          <Radar name="Top Performers" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                          <Radar name="Average" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* AI Insights */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        AI Insights
                      </CardTitle>
                      <CardDescription>Automated analysis and recommendations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                          <div>
                            <p className="text-sm font-medium">High Performance Trend</p>
                            <p className="text-xs text-muted-foreground">
                              Frontend developers are showing 15% higher productivity this month
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                          <div>
                            <p className="text-sm font-medium">Skill Gap Identified</p>
                            <p className="text-xs text-muted-foreground">
                              Consider adding more DevOps training for backend developers
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          <div>
                            <p className="text-sm font-medium">Collaboration Improvement</p>
                            <p className="text-xs text-muted-foreground">
                              Teams using AI PM Agent show 23% better coordination
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                          <div>
                            <p className="text-sm font-medium">Learning Acceleration</p>
                            <p className="text-xs text-muted-foreground">
                              Students using Learning Agent complete tasks 30% faster
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full" size="sm">
                        View Detailed Report
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>AI-powered suggestions to improve company performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Code className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-sm">Technical Skills</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Introduce advanced React patterns workshop for frontend developers
                        </p>
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          Schedule Workshop
                        </Button>
                      </div>
                      <div className="p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-sm">Communication</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Set up weekly cross-team standup meetings to improve collaboration
                        </p>
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          Create Schedule
                        </Button>
                      </div>
                      <div className="p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-sm">Goal Setting</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Implement OKRs to align individual goals with company objectives
                        </p>
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          Setup OKRs
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )
    }
  }

  if (gateChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking company onboarding...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex overflow-y-hidden">
      {/* Left Sidebar */}
      <aside className="w-18 border-r bg-card flex flex-col items-center py-6 gap-6 fixed h-screen">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mb-4">
          <span className="text-primary-foreground font-bold text-lg">S</span>
        </div>
        
        <nav className="flex flex-1 flex-col items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              title={item.label}
              className={`
                flex h-15 w-15 flex-col items-center justify-center gap-1 rounded-lg 
                transition-colors duration-200 ease-in-out
                ${
                  activeNav === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }
              `}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

        <div className="flex flex-col items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback>CO</AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-16 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}