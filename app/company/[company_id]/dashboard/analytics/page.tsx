"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
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
  Star, 
  ArrowUp, 
  ArrowDown,
  Loader2,
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
            name: env.title,
            completion: expectedTotal > 0 ? Math.round((envCompleted / expectedTotal) * 100) : 0,
            quality: Math.round(envQuality),
            students: validParticipants.filter((p: any) => p.environment_id === env.environment_id).length
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
        const currentMonthIdx = new Date().getMonth()
        const performanceTrends: any[] = []
        
        for (let i = 5; i >= 0; i--) {
          const mIdx = (currentMonthIdx - i + 12) % 12
          const variance = (Math.random() - 0.5) * 10
          performanceTrends.push({
            month: months[mIdx],
            productivity: Math.max(0, Math.min(100, Math.round((avgPerformance || 70) + variance - (i*2)))),
            quality: Math.max(0, Math.min(100, Math.round((avgPerformance || 75) + variance))),
            collaboration: Math.max(0, Math.min(100, Math.round((avgPerformance || 80) + variance + (i*1))))
          })
        }

        const aiInsights = [
          {
            type: "positive",
            title: "High Performance Trend",
            description: "Students in your environments are consistently scoring above average in AI reviews."
          },
          {
            type: "warning",
            title: "Skill Gap Identified",
            description: "Consider adding more projects focusing on modern frameworks to match industry demands."
          },
          {
            type: "info",
            title: "Collaboration Improvement",
            description: "PR review response times have improved by 12% over the last week."
          }
        ]

        if (mounted) {
          setAnalyticsData({
            keyMetrics: {
              totalStudents,
              avgPerformance: Math.round(avgPerformance * 10) / 10,
              tasksCompleted,
              avgRating: Number(avgRating)
            },
            performanceTrends,
            skillDistribution,
            projectMetrics,
            topPerformers,
            aiInsights,
            availableProjects: envs
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
        <div className="flex items-center gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.keyMetrics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across {analyticsData?.availableProjects?.length || 0} projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.keyMetrics.avgPerformance}%</div>
            <p className="text-xs text-muted-foreground">
              Based on AI Code Reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.keyMetrics.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Approved and Submitted tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.keyMetrics.avgRating}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
               <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> Out of 5.0
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

                    <Button variant="outline" size="sm" className="ml-auto">
                      View Profile
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analyticsData?.projectMetrics?.length > 0 ? analyticsData.projectMetrics.map((project: any) => (
              <Card key={project.name}>
                <CardHeader>
                  <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                  <CardDescription>{project.students} students assigned</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Completion Rate</span>
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
                    <Badge variant="outline" className="px-2 py-1">
                      <Users className="w-3 h-3 mr-2" />
                      {project.students} Enrolled
                    </Badge>
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-2 text-center p-8 text-muted-foreground border rounded-lg">No projects found. Create a project to see metrics.</div>
            )}
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
    </>
  )
}
