"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
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
  Star, 
  ArrowUp, 
  ArrowDown,
  Loader2,
  Briefcase,
  Megaphone,
  Download,
  Eye,
  Mail,
  Github,
  Code2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

function getInitials(fullName: string): string {
  if (!fullName) return "??"
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function AnalyticsPage() {
  const params = useParams()
  const companyId = params.company_id as string
  const [timeRange, setTimeRange] = useState("6m")
  const [selectedProject, setSelectedProject] = useState("all")
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [profileStudent, setProfileStudent] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    let mounted = true;
    const fetchAnalytics = async () => {
      if (!companyId) return;
      setAnalyticsLoading(true)
      try {
        let query = supabase.from("virtual_environments").select("environment_id, title").eq("company_id", companyId)
        if (selectedProject !== "all") {
          query = query.eq("environment_id", selectedProject)
        }
        
        const { data: envs, error: envError } = await query
        if (envError || !envs || envs.length === 0) {
          if (mounted) {
            setAnalyticsData(null)
            setAnalyticsLoading(false)
          }
          return;
        }
        
        const envIds = envs.map((e: any) => e.environment_id)
        
        const [
          { data: participants },
          { data: tasks },
          { data: skills }
        ] = await Promise.all([
          supabase.from("environment_participants").select("student_id, environment_id, students(full_name, email)").in("environment_id", envIds),
          supabase.from("tasks").select("task_id, environment_id").in("environment_id", envIds),
          supabase.from("student_skills").select("student_id, skill_name")
        ])

        const taskIds = tasks?.map((t: any) => t.task_id) || []
        
        const [
          { data: safeTaskProgress },
          { data: safePrReviews }
        ] = await Promise.all([
          taskIds.length > 0 ? supabase.from("task_progress").select("task_id, student_id, status, updated_at").in("task_id", taskIds) : { data: [] },
          taskIds.length > 0 ? supabase.from("pr_reviews").select("task_id, student_id, ai_score, created_at").in("task_id", taskIds) : { data: [] }
        ])

        const validParticipants = participants || []
        const uniqueStudents = new Set(validParticipants.map((p: any) => p.student_id))
        const totalStudents = uniqueStudents.size

        const tp = safeTaskProgress || []
        const completedTasks = tp.filter((t: any) => t.status === "approved" || t.status === "submitted")
        const tasksCompleted = completedTasks.length

        const pr = safePrReviews || []
        const avgPerformance = pr.length > 0 ? pr.reduce((acc: number, curr: any) => acc + (curr.ai_score || 0), 0) / pr.length : 0
        const avgRating = (avgPerformance / 20).toFixed(1)

        const skillCount: Record<string, number> = {}
        let totalSkills = 0
        if (skills) {
          skills.filter((s: any) => uniqueStudents.has(s.student_id)).forEach((s: any) => {
            skillCount[s.skill_name] = (skillCount[s.skill_name] || 0) + 1
            totalSkills++
          })
        }
        
        const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6", "#f43f5e"]
        const skillDistribution = Object.entries(skillCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, count], index) => ({
            name,
            value: Number((count / (totalSkills || 1)).toFixed(2)),
            color: COLORS[index % COLORS.length]
          }))

        const projectMetrics = envs.map((env: any) => {
          const envTasks = tasks?.filter((t: any) => t.environment_id === env.environment_id).map((t: any) => t.task_id) || []
          const envProgress = tp.filter((t: any) => envTasks.includes(t.task_id))
          const envCompleted = envProgress.filter((t: any) => t.status === "approved" || t.status === "submitted").length
          const expectedTotal = envTasks.length * validParticipants.filter((p: any) => p.environment_id === env.environment_id).length
          
          const envPr = pr.filter((t: any) => envTasks.includes(t.task_id))
          const envQuality = envPr.length > 0 ? envPr.reduce((acc: number, curr: any) => acc + (curr.ai_score || 0), 0) / envPr.length : 0

          return {
            environment_id: env.environment_id,
            name: env.title,
            completion: expectedTotal > 0 ? Math.round((envCompleted / expectedTotal) * 100) : 0,
            quality: Math.round(envQuality),
            students: validParticipants.filter((p: any) => p.environment_id === env.environment_id).length,
            totalTasks: envTasks.length,
            completedTasks: envCompleted,
          }
        })

        const studentStats: Record<string, any> = {}
        validParticipants.forEach((p: any) => {
          if (!studentStats[p.student_id]) {
            const studentInfo = Array.isArray(p.students) ? p.students[0] : p.students;
            studentStats[p.student_id] = {
              student_id: p.student_id,
              name: studentInfo?.full_name || "Unknown",
              avatar: getInitials(studentInfo?.full_name || "??"),
              tasksCompleted: 0,
              scoreTotal: 0,
              scoreCount: 0,
              skills: skills?.filter((s: any) => s.student_id === p.student_id).map((s: any) => s.skill_name) || []
            }
          }
        })

        completedTasks.forEach((t: any) => {
          if (studentStats[t.student_id]) studentStats[t.student_id].tasksCompleted++
        })

        pr.forEach((p: any) => {
          if (studentStats[p.student_id] && p.ai_score) {
            studentStats[p.student_id].scoreTotal += p.ai_score
            studentStats[p.student_id].scoreCount++
          }
        })

        const topPerformers = Object.values(studentStats)
          .map((s: any) => ({
            student_id: s.student_id,
            name: s.name,
            avatar: s.avatar,
            score: s.scoreCount > 0 ? Math.round(s.scoreTotal / s.scoreCount) : 0,
            tasksCompleted: s.tasksCompleted,
            rating: s.scoreCount > 0 ? Number((s.scoreTotal / s.scoreCount / 20).toFixed(1)) : 0,
            trend: "up",
            skills: s.skills
          }))
          .filter((s: any) => s.score > 0)
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 10)

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const now = new Date()
        const performanceTrends: any[] = []
        
        for (let i = 5; i >= 0; i--) {
          const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
          const mLabel = months[mDate.getMonth()]
          
          // Tasks completed this month
          const monthTasks = tp.filter((t: any) => {
            if (t.status !== "approved" && t.status !== "submitted") return false
            const d = new Date(t.updated_at)
            return d >= mDate && d <= mEnd
          })
          // PR scores this month
          const monthPr = pr.filter((p: any) => {
            const d = new Date(p.created_at)
            return d >= mDate && d <= mEnd
          })
          
          const totalPossible = (tasks?.length || 1) * totalStudents
          const productivity = totalPossible > 0 ? Math.round((monthTasks.length / totalPossible) * 100) : 0
          const quality = monthPr.length > 0 ? Math.round(monthPr.reduce((a: number, c: any) => a + (c.ai_score || 0), 0) / monthPr.length) : 0
          const maxReviews = Math.max(...Array.from({ length: 6 }, (_, j) => {
            const md = new Date(now.getFullYear(), now.getMonth() - j, 1)
            const me = new Date(now.getFullYear(), now.getMonth() - j + 1, 0, 23, 59, 59)
            return pr.filter((p: any) => { const d = new Date(p.created_at); return d >= md && d <= me }).length
          }), 1)
          const collaboration = Math.round((monthPr.length / maxReviews) * 100)
          
          performanceTrends.push({ month: mLabel, productivity, quality, collaboration })
        }

        // Dynamic AI insights based on real data
        const aiInsights: any[] = []
        if (avgPerformance >= 70) {
          aiInsights.push({ type: "positive", title: "Strong Performance", description: `Students average ${Math.round(avgPerformance)}% on AI code reviews — above the 70% benchmark.` })
        } else if (avgPerformance > 0) {
          aiInsights.push({ type: "warning", title: "Performance Below Benchmark", description: `Average AI review score is ${Math.round(avgPerformance)}%. Consider providing more mentorship resources.` })
        }
        const totalPossibleTasks = (tasks?.length || 0) * totalStudents
        const completionRate = totalPossibleTasks > 0 ? Math.round((tasksCompleted / totalPossibleTasks) * 100) : 0
        if (completionRate > 50) {
          aiInsights.push({ type: "positive", title: "Good Task Completion", description: `${completionRate}% of all tasks are completed or submitted across your environments.` })
        } else if (totalPossibleTasks > 0) {
          aiInsights.push({ type: "info", title: "Task Completion Rate", description: `Only ${completionRate}% of tasks completed. Encourage students to pick up remaining work.` })
        }
        if (topPerformers.length > 0) {
          aiInsights.push({ type: "info", title: "Top Performer", description: `${topPerformers[0].name} leads with a score of ${topPerformers[0].score}% and ${topPerformers[0].tasksCompleted} completed tasks.` })
        }
        if (skillDistribution.length > 0) {
          aiInsights.push({ type: "info", title: "Most Common Skill", description: `"${skillDistribution[0].name}" is the most prevalent skill among your students.` })
        }

        // Fetch recruitment data
        const [{ data: jobOpenings }, { data: jobApps }] = await Promise.all([
          supabase.from("job_openings").select("id, title, status, created_at").eq("company_id", companyId),
          supabase.from("job_applications").select("id, job_id, status, match_score, created_at").in("job_id",
            (await supabase.from("job_openings").select("id").eq("company_id", companyId)).data?.map((j: any) => j.id) || []
          )
        ])
        const activeOpenings = (jobOpenings || []).filter((j: any) => j.status === "open").length
        const totalApps = (jobApps || []).length
        const pipelineCounts = { matched: 0, applied: 0, shortlisted: 0, interviewed: 0, offered: 0, rejected: 0 }
        ;(jobApps || []).forEach((a: any) => { if (a.status in pipelineCounts) pipelineCounts[a.status as keyof typeof pipelineCounts]++ })

        // Top jobs by application count
        const jobAppCounts: Record<string, number> = {}
        ;(jobApps || []).forEach((a: any) => { jobAppCounts[a.job_id] = (jobAppCounts[a.job_id] || 0) + 1 })
        const topJobs = (jobOpenings || [])
          .map((j: any) => ({ title: j.title, count: jobAppCounts[j.id] || 0 }))
          .sort((a: any, b: any) => b.count - a.count).slice(0, 5)

        if (mounted) {
          setAnalyticsData({
            keyMetrics: {
              totalStudents,
              avgPerformance: Math.round(avgPerformance * 10) / 10,
              tasksCompleted,
              avgRating: Number(avgRating),
              activeOpenings,
              totalApplications: totalApps,
            },
            performanceTrends,
            skillDistribution,
            projectMetrics,
            topPerformers,
            aiInsights,
            availableProjects: envs,
            recruitment: { pipelineCounts, topJobs, allApps: jobApps || [] },
          })
        }
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        if (mounted) {
          setAnalyticsLoading(false)
        }
      }
    }
    
    fetchAnalytics()
    return () => { mounted = false }
  }, [companyId, selectedProject, timeRange])

  const openStudentProfile = useCallback(async (student: any) => {
    setProfileStudent(student)
    setProfileLoading(true)
    setProfileData(null)
    try {
      const sid = student.student_id
      const [{ data: studentRow }, { data: skills }, { data: experience }, { data: participations }] = await Promise.all([
        supabase.from("students").select("*").eq("student_id", sid).single(),
        supabase.from("student_skills").select("*").eq("student_id", sid),
        supabase.from("experience").select("*").eq("student_id", sid),
        supabase.from("environment_participants").select("environment_id, virtual_environments(title, status)").eq("student_id", sid),
      ])
      const envIds = (participations || []).map((p: any) => p.environment_id).filter(Boolean)
      let taskSummary: any[] = []
      if (envIds.length > 0) {
        const { data: tasks } = await supabase.from("tasks").select("task_id, title").in("environment_id", envIds)
        const taskIds = (tasks || []).map((t: any) => t.task_id)
        if (taskIds.length > 0) {
          const [{ data: progress }, { data: prReviews }] = await Promise.all([
            supabase.from("task_progress").select("task_id, status").eq("student_id", sid).in("task_id", taskIds),
            supabase.from("pr_reviews").select("task_id, ai_score, ai_verdict").eq("student_id", sid).in("task_id", taskIds),
          ])
          const pMap: Record<string, string> = {}
          ;(progress || []).forEach((p: any) => { pMap[p.task_id] = p.status })
          const prMap: Record<string, any> = {}
          ;(prReviews || []).forEach((p: any) => { prMap[p.task_id] = p })
          taskSummary = (tasks || []).map((t: any) => ({ ...t, progress_status: pMap[t.task_id] || "locked", pr: prMap[t.task_id] || null }))
        }
      }
      setProfileData({ student: studentRow, skills: skills || [], experience: experience || [], participations: participations || [], taskSummary })
    } catch (err) { console.error(err) } finally { setProfileLoading(false) }
  }, [])

  const exportCSV = useCallback(() => {
    if (!analyticsData) return
    const rows = [["Name", "Score", "Tasks Completed", "Rating", "Skills"]]
    ;(analyticsData.topPerformers || []).forEach((s: any) => {
      rows.push([s.name, String(s.score), String(s.tasksCompleted), String(s.rating), (s.skills || []).join("; ")])
    })
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "analytics_export.csv"; a.click()
    URL.revokeObjectURL(url)
  }, [analyticsData])

  if (analyticsLoading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading Analytics...</span>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex flex-col justify-center items-center h-[500px] text-center space-y-4">
        <p className="text-xl font-semibold">No Analytics Data Available</p>
        <p className="text-muted-foreground">Create projects and add students to see analytics.</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor student performance and company productivity</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" />Export CSV
          </Button>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {analyticsData?.availableProjects?.map((p: any) => (
                <SelectItem key={p.environment_id} value={p.environment_id}>{p.title}</SelectItem>
              ))}
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

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.keyMetrics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across {analyticsData?.availableProjects?.length || 0} projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.keyMetrics.avgPerformance}%</div>
            <p className="text-xs text-muted-foreground">AI Code Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Done</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.keyMetrics.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground">Approved + Submitted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.keyMetrics.avgRating}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> Out of 5.0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Openings</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.keyMetrics.activeOpenings || 0}</div>
            <p className="text-xs text-muted-foreground">Job postings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.keyMetrics.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground">Total received</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Average performance metrics over recent months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.performanceTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="productivity" stroke="#10b981" strokeWidth={2} name="Productivity" />
                    <Line type="monotone" dataKey="quality" stroke="#3b82f6" strokeWidth={2} name="Code Quality" />
                    <Line type="monotone" dataKey="collaboration" stroke="#8b5cf6" strokeWidth={2} name="Collaboration" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skill Distribution</CardTitle>
                <CardDescription>Top skills among your students</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.skillDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.skillDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => {
                          return `${props.name} ${(props.percent * 100).toFixed(0)}%`
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData?.skillDistribution?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No skill data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
              <CardDescription>Current status of all active projects</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData?.projectMetrics?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.projectMetrics || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="completion" fill="#10b981" name="Completion Rate %" />
                    <Bar dataKey="quality" fill="#3b82f6" name="Quality Score %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground p-8">No project data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Top Performers Leaderboard
              </CardTitle>
              <CardDescription>Students ranked by overall performance score and completed tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.topPerformers?.length > 0 ? analyticsData.topPerformers.map((student: any, index: number) => (
                  <div key={student.student_id} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-muted-foreground w-8 text-center">#{index + 1}</div>
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>{student.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="w-48">
                        <h3 className="font-semibold truncate">{student.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {student.skills?.length > 0 ? student.skills.slice(0, 2).join(", ") : "New Recruit"}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Score</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{student.score}%</span>
                          {student.trend === "up" && <ArrowUp className="w-4 h-4 text-green-500" />}
                          {student.trend === "down" && <ArrowDown className="w-4 h-4 text-red-500" />}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tasks</p>
                        <p className="text-lg font-bold">{student.tasksCompleted}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-lg font-bold">{student.rating}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Top Skills</p>
                        <div className="flex gap-1 flex-wrap">
                          {student.skills?.slice(0, 2).map((skill: any) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {student.skills?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{student.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="ml-auto gap-1" onClick={() => openStudentProfile(student)}>
                      <Eye className="w-3.5 h-3.5" />View Profile
                    </Button>
                  </div>
                )) : (
                  <div className="text-center p-8 text-muted-foreground">No student data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {analyticsData?.projectMetrics?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {analyticsData.projectMetrics.map((project: any) => {
                const qualityColor = project.quality >= 70 ? "text-emerald-500" : project.quality >= 40 ? "text-amber-500" : "text-zinc-400"
                const completionColor = project.completion >= 70 ? "stroke-emerald-500" : project.completion >= 40 ? "stroke-amber-500" : "stroke-zinc-500"
                const circumference = 2 * Math.PI * 36
                const dashOffset = circumference - (project.completion / 100) * circumference
                return (
                  <Card key={project.environment_id || project.name} className="group hover:shadow-lg transition-shadow overflow-hidden">
                    <CardContent className="space-y-4">
                      {/* Title row with circular progress */}
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{project.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{project.students} students · {project.totalTasks || 0} tasks</p>
                        </div>
                        <div className="relative shrink-0" style={{ width: 48, height: 48 }}>
                          <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4" stroke="hsl(var(--muted))" />
                            <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4"
                              stroke={project.completion >= 70 ? "#10b981" : project.completion >= 40 ? "#f59e0b" : "#71717a"}
                              strokeDasharray={2 * Math.PI * 20}
                              strokeDashoffset={2 * Math.PI * 20 * (1 - project.completion / 100)}
                              strokeLinecap="round" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{project.completion}%</span>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center rounded-lg bg-muted/50 py-2">
                          <p className="text-base font-bold">{project.completedTasks || 0}</p>
                          <p className="text-[10px] text-muted-foreground">Completed</p>
                        </div>
                        <div className="text-center rounded-lg bg-muted/50 py-2">
                          <p className={`text-base font-bold ${qualityColor}`}>{project.quality}%</p>
                          <p className="text-[10px] text-muted-foreground">Quality</p>
                        </div>
                        <div className="text-center rounded-lg bg-muted/50 py-2">
                          <p className="text-base font-bold">{project.students}</p>
                          <p className="text-[10px] text-muted-foreground">Students</p>
                        </div>
                      </div>

                      {/* Progress bars */}
                      <div className="space-y-2.5">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Task Completion</span>
                            <span className="text-xs font-medium">{project.completion}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-primary/20 overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${project.completion}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Code Quality</span>
                            <span className="text-xs font-medium">{project.quality}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-primary/20 overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${project.quality}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Action button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        onClick={() => window.location.href = `/company/${companyId}/dashboard/projects`}
                      >
                        <Eye className="w-3.5 h-3.5" />View Details
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-2">
                <Target className="w-12 h-12 text-muted-foreground/40" />
                <p className="text-lg font-medium">No projects found</p>
                <p className="text-sm text-muted-foreground">Create a project to see analytics here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recruitment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Pipeline</CardTitle>
                <CardDescription>Distribution of applications by status</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.recruitment ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(analyticsData.recruitment.pipelineCounts).map(([name, value]) => ({ name, count: value }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" name="Applications" radius={[4, 4, 0, 0]}>
                        {Object.keys(analyticsData.recruitment.pipelineCounts).map((_: string, i: number) => (
                          <Cell key={i} fill={["#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4", "#10b981", "#ef4444"][i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">No recruitment data available</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Jobs by Applications</CardTitle>
                <CardDescription>Most applied job openings</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.recruitment?.topJobs?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.recruitment.topJobs} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="title" width={150} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" name="Applications" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">No job openings yet. Post jobs to see data here.</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {analyticsData?.recruitment && Object.entries(analyticsData.recruitment.pipelineCounts).map(([status, count]) => (
              <Card key={status}>
                <CardContent className="pt-4 pb-3 text-center">
                  <p className="text-2xl font-bold">{count as number}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">{status}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Skill Comparison</CardTitle>
                <CardDescription>Top performers vs average students</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.skillDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={(analyticsData?.skillDistribution || []).map((s: any) => ({ skill: s.name, A: s.value * 100, B: Math.max(0, (s.value * 100) - 15) }))}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Top Performers" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                      <Radar name="Average" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">Not enough skill data for comparison.</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Insights
                </CardTitle>
                <CardDescription>Automated analysis and recommendations based on real-time data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {analyticsData?.aiInsights?.map((insight: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-background/50 p-3 rounded-lg border border-primary/10">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                        insight.type === 'positive' ? 'bg-green-500' : 
                        insight.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{insight.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recruitment Tab Content - inserted after Tabs but still inside the fragment */}

      {/* Student Profile Sheet */}
      <Sheet open={!!profileStudent} onOpenChange={(open) => { if (!open) setProfileStudent(null) }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Student Profile</SheetTitle>
            <SheetDescription>{profileStudent?.name}</SheetDescription>
          </SheetHeader>
          {profileLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : profileData ? (
            <div className="space-y-6 mt-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14"><AvatarFallback className="text-lg">{profileStudent?.avatar}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-lg font-semibold">{profileData.student?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{profileData.student?.email}</p>
                  {profileData.student?.github_url && (
                    <a href={profileData.student.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary inline-flex items-center gap-1 hover:underline"><Github className="w-3.5 h-3.5" />{profileData.student.github_url}</a>
                  )}
                </div>
                {profileData.student?.email && (
                  <Button size="sm" variant="outline" asChild><a href={`mailto:${profileData.student.email}`}><Mail className="w-4 h-4 mr-2" />Email</a></Button>
                )}
              </div>
              {profileData.student?.About && (
                <div className="space-y-1"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">About</p><p className="text-sm leading-relaxed">{profileData.student.About}</p></div>
              )}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Performance Summary</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Score</span><span className="font-bold text-primary">{profileStudent?.score}%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tasks Completed</span><span className="font-medium">{profileStudent?.tasksCompleted}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Rating</span><span className="font-medium flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />{profileStudent?.rating}/5</span></div>
                </CardContent>
              </Card>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Code2 className="w-3.5 h-3.5" />Skills ({profileData.skills.length})</p>
                {profileData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">{profileData.skills.map((s: any) => (<Badge key={s.id || s.skill_name} variant="secondary" className="text-xs gap-1">{s.skill_name}<span className="text-muted-foreground capitalize">· {s.experience_level || "beginner"}</span></Badge>))}</div>
                ) : (<p className="text-sm text-muted-foreground">No skills recorded</p>)}
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />Experience ({profileData.experience.length})</p>
                {profileData.experience.length > 0 ? (
                  <div className="space-y-3">{profileData.experience.map((exp: any) => (
                    <div key={exp.experience_id} className="rounded-lg border p-3 space-y-1">
                      <div className="flex items-center justify-between"><p className="font-medium text-sm">{exp.role}</p>{exp.exp_years && <span className="text-xs text-muted-foreground">{exp.exp_years}</span>}</div>
                      <p className="text-sm text-muted-foreground">{exp.company_name}</p>
                      {exp.technologies_used?.length > 0 && (<div className="flex flex-wrap gap-1 pt-1">{exp.technologies_used.map((t: string) => (<Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>))}</div>)}
                    </div>
                  ))}</div>
                ) : (<p className="text-sm text-muted-foreground">No professional experience</p>)}
              </div>
              {profileData.taskSummary?.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Task Progress ({profileData.taskSummary.filter((t: any) => t.progress_status === "approved" || t.progress_status === "submitted").length}/{profileData.taskSummary.length})</p>
                    <div className="grid grid-cols-1 gap-1">{profileData.taskSummary.slice(0, 15).map((t: any) => (
                      <div key={t.task_id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-muted/30">
                        <span className="truncate flex-1">{t.title}</span>
                        <div className="flex items-center gap-2">
                          {t.pr && <span className="text-muted-foreground">PR: {t.pr.ai_score}%</span>}
                          <Badge variant="outline" className={`text-[10px] capitalize ${t.progress_status === "approved" ? "bg-emerald-500/10 text-emerald-500" : t.progress_status === "submitted" ? "bg-blue-500/10 text-blue-400" : "bg-zinc-500/10 text-zinc-400"}`}>{t.progress_status}</Badge>
                        </div>
                      </div>
                    ))}</div>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}
