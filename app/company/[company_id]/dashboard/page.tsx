"use client"

import { useState } from "react"
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
  Home,
  GraduationCap
} from "lucide-react"
import LearningWorkflowComponent from "@/components/learning-workflow"
import ProjectBuilderComponent from "@/components/project-creation"

const performanceData = [
  { month: "Jan", productivity: 85, quality: 92, collaboration: 78 },
  { month: "Feb", productivity: 88, quality: 89, collaboration: 82 },
  { month: "Mar", productivity: 92, quality: 94, collaboration: 85 },
  { month: "Apr", productivity: 89, quality: 91, collaboration: 88 },
  { month: "May", productivity: 95, quality: 96, collaboration: 92 },
  { month: "Jun", productivity: 98, quality: 95, collaboration: 94 },
]

const skillDistribution = [
  { name: "Frontend", value: 35, color: "#10b981" },
  { name: "Backend", value: 28, color: "#3b82f6" },
  { name: "Full Stack", value: 22, color: "#8b5cf6" },
  { name: "DevOps", value: 10, color: "#f59e0b" },
  { name: "Design", value: 5, color: "#ef4444" },
]

const topStudents = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "SC",
    role: "Frontend Developer",
    score: 98,
    tasksCompleted: 24,
    rating: 4.9,
    trend: "up",
    skills: ["React", "TypeScript", "UI/UX"],
  },
  {
    id: 2,
    name: "Alex Rodriguez",
    avatar: "AR",
    role: "Full Stack Developer",
    score: 95,
    tasksCompleted: 22,
    rating: 4.8,
    trend: "up",
    skills: ["Next.js", "Node.js", "PostgreSQL"],
  },
  {
    id: 3,
    name: "Emma Wilson",
    avatar: "EW",
    role: "Backend Developer",
    score: 93,
    tasksCompleted: 20,
    rating: 4.7,
    trend: "stable",
    skills: ["Python", "Django", "MongoDB"],
  },
  {
    id: 4,
    name: "Mike Johnson",
    avatar: "MJ",
    role: "UI/UX Designer",
    score: 91,
    tasksCompleted: 18,
    rating: 4.6,
    trend: "up",
    skills: ["Figma", "Design Systems", "Prototyping"],
  },
  {
    id: 5,
    name: "David Kim",
    avatar: "DK",
    role: "DevOps Engineer",
    score: 89,
    tasksCompleted: 16,
    rating: 4.5,
    trend: "down",
    skills: ["Docker", "AWS", "CI/CD"],
  },
]

const projectMetrics = [
  { name: "E-commerce Platform", students: 12, completion: 75, quality: 92 },
  { name: "Analytics Dashboard", students: 8, completion: 60, quality: 88 },
  { name: "Social Media App", students: 15, completion: 45, quality: 85 },
  { name: "Task Management Tool", students: 6, completion: 90, quality: 94 },
]

const radarData = [
  { skill: "Technical Skills", A: 95, B: 88, fullMark: 100 },
  { skill: "Problem Solving", A: 92, B: 85, fullMark: 100 },
  { skill: "Collaboration", A: 88, B: 92, fullMark: 100 },
  { skill: "Communication", A: 85, B: 90, fullMark: 100 },
  { skill: "Learning Speed", A: 90, B: 87, fullMark: 100 },
  { skill: "Code Quality", A: 94, B: 89, fullMark: 100 },
]

export default function SupervisorDashboard() {
  const [timeRange, setTimeRange] = useState("6m")
  const [selectedProject, setSelectedProject] = useState("all")
  const [activeNav, setActiveNav] = useState("analytics")

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    // { id: "learning", label: "Learning", icon: BookOpen },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "students", label: "Students", icon: GraduationCap },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  // Render content based on active navigation
  const renderContent = () => {
    switch(activeNav) {
      case "home":
        return (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Home Component</CardTitle>
                <CardDescription>This is the Home section placeholder</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Replace this with your Home component later</p>
              </CardContent>
            </Card>
          </div>
        )
      
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
        return (
          // <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          //   <Card className="w-full max-w-2xl">
          //     <CardHeader>
          //       <CardTitle className="text-2xl">Projects Component</CardTitle>
          //       <CardDescription>This is the Projects section placeholder</CardDescription>
          //     </CardHeader>
          //     <CardContent>
          //       <p className="text-muted-foreground">Replace this with your Projects component later</p>
          //     </CardContent>
          //   </Card>
          // </div>
          <ProjectBuilderComponent />
        )
      
      case "students":
        return (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Students Component</CardTitle>
                <CardDescription>This is the Students section placeholder</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Replace this with your Students component later</p>
              </CardContent>
            </Card>
          </div>
        )
      
      case "settings":
        return (
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Settings Component</CardTitle>
                <CardDescription>This is the Settings section placeholder</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Replace this with your Settings component later</p>
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
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                      {topStudents.map((student, index) => (
                        <div key={student.id} className="flex items-center gap-4 p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                            <Avatar className="w-12 h-12">
                              <AvatarFallback>{student.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{student.name}</h3>
                              <p className="text-sm text-muted-foreground">{student.role}</p>
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

        <Avatar className="w-10 h-10">
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
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