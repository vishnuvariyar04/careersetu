"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  BookOpen, 
  FolderKanban, 
  ChevronDown, 
  ChevronRight, 
  Send, 
  Bot, 
  GraduationCap,
  CheckCircle2,
  Clock,
  Target,
  Sparkles
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useEffect, useMemo, useState, useRef } from "react"
import { useStudentAuth } from "@/hooks/use-student-auth"

// Mock data for learning modules
const MOCK_LEARNING_MODULES = [
  {
    id: "react-basics",
    title: "React Fundamentals",
    skill: "React",
    description: "Learn the core concepts of React including components, props, and state",
    estimatedTime: "4 hours",
    progress: 65,
    topics: [
      { id: "1", title: "Components & JSX", completed: true },
      { id: "2", title: "Props & State", completed: true },
      { id: "3", title: "Hooks", completed: false },
      { id: "4", title: "Context API", completed: false }
    ]
  },
  {
    id: "react-advanced",
    title: "Advanced React Patterns",
    skill: "React",
    description: "Master advanced patterns like custom hooks, performance optimization, and more",
    estimatedTime: "6 hours",
    progress: 20,
    topics: [
      { id: "1", title: "Custom Hooks", completed: true },
      { id: "2", title: "Performance", completed: false },
      { id: "3", title: "Suspense & Lazy", completed: false }
    ]
  },
  {
    id: "express-basics",
    title: "Express.js Fundamentals",
    skill: "Express",
    description: "Build RESTful APIs with Express.js and Node.js",
    estimatedTime: "5 hours",
    progress: 40,
    topics: [
      { id: "1", title: "Routing", completed: true },
      { id: "2", title: "Middleware", completed: true },
      { id: "3", title: "Error Handling", completed: false },
      { id: "4", title: "Authentication", completed: false }
    ]
  },
  {
    id: "express-advanced",
    title: "Express.js Best Practices",
    skill: "Express",
    description: "Learn production-ready patterns and security best practices",
    estimatedTime: "4 hours",
    progress: 0,
    topics: [
      { id: "1", title: "Security", completed: false },
      { id: "2", title: "Testing", completed: false },
      { id: "3", title: "Deployment", completed: false }
    ]
  }
]

// Mock data for projects
const MOCK_PROJECTS = [
  {
    id: "proj-1",
    title: "E-Commerce Platform",
    description: "Build a full-stack e-commerce application with React and Express",
    status: "active",
    tasks: [
      { id: "t1", title: "Setup project structure", completed: true },
      { id: "t2", title: "Implement user authentication", completed: true },
      { id: "t3", title: "Create product catalog", completed: false },
      { id: "t4", title: "Build shopping cart", completed: false },
      { id: "t5", title: "Payment integration", completed: false }
    ],
    requiredSkills: ["React", "Express", "MongoDB"],
    progress: 40
  },
  {
    id: "proj-2",
    title: "Real-time Chat Application",
    description: "Create a real-time messaging app using WebSockets",
    status: "active",
    tasks: [
      { id: "t1", title: "Setup WebSocket server", completed: false },
      { id: "t2", title: "Build chat interface", completed: false },
      { id: "t3", title: "Implement message history", completed: false },
      { id: "t4", title: "Add user presence", completed: false }
    ],
    requiredSkills: ["React", "Express", "Socket.io"],
    progress: 0
  }
]

type Mode = "learning" | "project"
type AgentType = "teacher" | "pm"

interface Message {
  id: string
  content: string
  sender: "user" | "agent"
  agentType?: AgentType
  timestamp: Date
}

export default function CompanyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.student_id as string
  const companyId = params.company_id as string

  const [company, setCompany] = useState<any>()
  const [student, setStudent] = useState<any>()
  const [isJoined, setIsJoined] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [team_id, setTeamId] = useState<string>("")
  
  // Security check: Verify the logged-in user matches the student_id in URL
  const isAuthorized = useStudentAuth(studentId)

  // New state for redesigned UI
  const [mode, setMode] = useState<Mode>("learning")
  const [selectedAgent, setSelectedAgent] = useState<AgentType>("teacher")
  const [hoveredSidebarItem, setHoveredSidebarItem] = useState<"learn" | "projects" | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [joinedProjectIds, setJoinedProjectIds] = useState<Set<string>>(new Set())
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your learning assistant. How can I help you today?",
      sender: "agent",
      agentType: "teacher",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only fetch data if user is authorized
    if (isAuthorized !== true) {
      return
    }

    const fetchData = async () => {
      // Fetch company data
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("company_id", companyId)
        .single()
      if (companyError) {
        console.error("Error fetching company:", companyError)
        return
      }
      setCompany(companyData)

      // Fetch projects for the company
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("company_id", companyId)
      if (projectsError) {
        console.error("Error fetching projects:", projectsError)
        return
      }

      console.log("Projects: ", projectsData)
      setProjects(projectsData || [])

      // Fetch the current student's data (skills included)
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*, companies_joined, projects, skills")
        .eq("student_id", studentId)
        .single()
      if (studentError) {
        console.error("Error fetching student:", studentError)
        return
      }
      setStudent(studentData)

      const joinedCompanies = studentData?.companies_joined || []
      setIsJoined(joinedCompanies.includes(companyId))

      // Fetch team ID
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('student_id', studentId)
        .single()
      if (!teamError && teamData) {
        setTeamId(teamData.team_id)
      }
    }
    fetchData()
  }, [companyId, studentId, isAuthorized])

  // Skills Derivations
  const companyRequiredSkills: string[] = useMemo(() => {
    const set = new Set<string>()
    projects.forEach((p: any) => {
      if (p && Array.isArray(p.required_skills)) {
        p.required_skills.forEach((s: string) => {
          if (s) set.add(s)
        })
      }
    })
    return Array.from(set)
  }, [projects])

  const studentSkills: string[] = useMemo(() => {
    const raw = (student?.skills || []) as any
    return Array.isArray(raw) ? raw.filter(Boolean) : []
  }, [student])

  const skillCoveragePercent = useMemo(() => {
    if (companyRequiredSkills.length === 0) return 0
    const covered = companyRequiredSkills.filter((s) => studentSkills.includes(s)).length
    return Math.round((covered / companyRequiredSkills.length) * 100)
  }, [companyRequiredSkills, studentSkills])

  // Hash-based mode persistence
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash === "learning" || hash === "project") {
      setMode(hash)
    }
  }, [])

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    window.location.hash = newMode
    setHoveredSidebarItem(null)
  }

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
    setSelectedModule(moduleId)
  }

  const handleProjectClick = (projectId: string) => {
    setSelectedProject(projectId)
  }

  const handleJoinProject = (projectId: string) => {
    const newJoined = new Set(joinedProjectIds)
    newJoined.add(projectId)
    setJoinedProjectIds(newJoined)
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: selectedAgent === "teacher" 
          ? "That's a great question! Let me help you understand this concept better..."
          : "I'll help you with that task. Let me break it down into smaller steps...",
        sender: "agent",
        agentType: selectedAgent,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, agentMessage])
    }, 1000)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Show loading while checking authorization or loading data
  if (isAuthorized === null || !company || !student) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authorized, don't render anything (redirect is in progress)
  if (isAuthorized === false) {
    return null
  }

  const currentSelectedModule = MOCK_LEARNING_MODULES.find(m => m.id === selectedModule)
  const currentSelectedProject = MOCK_PROJECTS.find(p => p.id === selectedProject)

  // Filter learning messages for the right panel
  const learningQA = messages.filter(m => selectedAgent === "teacher")

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0a0a] font-['Inter',system-ui,sans-serif] antialiased">
      {/* Main three-panel layout */}
      <div className="h-full flex">
        
        {/* LEFT SIDEBAR - Hoverable Icons */}
        <div className="relative flex">
          {/* Icon Bar */}
          <div className="w-20 bg-[#121212] border-r border-white/5 flex flex-col items-center py-8 gap-6 z-20">
            {/* Company Logo/Name */}
            <div className="mb-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-emerald-500/20">
                {company?.name?.charAt(0) || "C"}
              </div>
            </div>

            {/* Learn Icon */}
            <button
              onMouseEnter={() => setHoveredSidebarItem("learn")}
              onClick={() => handleModeChange("learning")}
              className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                mode === "learning" 
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 scale-110" 
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:scale-105"
              }`}
            >
              <BookOpen className="w-6 h-6" />
            </button>

            {/* Projects Icon */}
            <button
              onMouseEnter={() => setHoveredSidebarItem("projects")}
              onClick={() => handleModeChange("project")}
              className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                mode === "project" 
                  ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-violet-500/30 scale-110" 
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:scale-105"
              }`}
            >
              <FolderKanban className="w-6 h-6" />
            </button>
          </div>

          {/* Slide-out Panel */}
          <AnimatePresence>
            {hoveredSidebarItem && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onMouseLeave={() => setHoveredSidebarItem(null)}
                className="absolute left-20 top-0 h-full w-80 bg-[#161616]/98 backdrop-blur-xl border-r border-white/10 shadow-2xl z-10"
              >
                <ScrollArea className="h-full">
                  <div className="p-6">
                    {hoveredSidebarItem === "learn" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-6">
                          <BookOpen className="w-5 h-5 text-emerald-400" />
                          <h2 className="text-lg font-semibold text-white tracking-tight">Learning Modules</h2>
                        </div>

                        {/* Group by skill */}
                        {["React", "Express"].map(skill => {
                          const skillModules = MOCK_LEARNING_MODULES.filter(m => m.skill === skill)
                          return (
                            <div key={skill} className="space-y-2">
                              <div className="flex items-center gap-2 px-2 py-1">
                                <Badge variant="outline" className="text-xs font-medium border-white/20 text-gray-400 bg-white/5">
                                  #{skill.toLowerCase()}
                                </Badge>
                              </div>
                              {skillModules.map(module => (
                                <div key={module.id} className="border border-white/10 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
                                  <button
                                    onClick={() => toggleModuleExpansion(module.id)}
                                    className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      {expandedModules.has(module.id) ? (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                      )}
                                      <div className="text-left">
                                        <p className="font-medium text-sm text-white">{module.title}</p>
                                        <p className="text-xs text-gray-500">{module.estimatedTime}</p>
                                      </div>
                                    </div>
                                    <div className="text-xs font-semibold text-emerald-400">{module.progress}%</div>
                                  </button>
                                  
                                  <AnimatePresence>
                                    {expandedModules.has(module.id) && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="px-4 py-3 bg-black/30 border-t border-white/5 space-y-2">
                                          <p className="text-xs text-gray-400 mb-3">{module.description}</p>
                                          {module.topics.map(topic => (
                                            <div key={topic.id} className="flex items-center gap-2 text-xs">
                                              {topic.completed ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                              ) : (
                                                <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
                                              )}
                                              <span className={topic.completed ? "text-gray-500" : "text-gray-300 font-medium"}>
                                                {topic.title}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {hoveredSidebarItem === "projects" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-6">
                          <FolderKanban className="w-5 h-5 text-violet-400" />
                          <h2 className="text-lg font-semibold text-white tracking-tight">Projects</h2>
                        </div>

                        {MOCK_PROJECTS.map(project => (
                          <button
                            key={project.id}
                            onClick={() => handleProjectClick(project.id)}
                            className={`w-full text-left border rounded-xl p-4 transition-all duration-300 ${
                              selectedProject === project.id
                                ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                                : "border-white/10 bg-white/5 hover:border-violet-500/30 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-sm text-white">{project.title}</h3>
                              <Badge variant="secondary" className="text-xs bg-white/10 text-gray-300 border-white/20">{project.status}</Badge>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">{project.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {project.requiredSkills.map(skill => (
                                <Badge key={skill} variant="outline" className="text-xs border-white/20 text-gray-400 bg-white/5">
                                  #{skill.toLowerCase()}
                                </Badge>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CENTER - Chat Interface */}
        <div className="flex-1 flex flex-col min-w-0 p-6">
          <div className="h-full bg-[#161616]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
            {/* Chat Header with Agent Toggle */}
            <div className="px-6 py-4 border-b border-white/10 bg-black/20">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-semibold text-white tracking-tight">{company?.name}</h1>
                <Badge variant="outline" className="text-xs border-white/20 text-gray-400 bg-white/5">
                  {mode === "learning" ? "#learning" : "#project"}
                </Badge>
              </div>
              
              {/* Agent Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedAgent("teacher")}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                    selectedAgent === "teacher"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Teacher Agent</span>
                  </div>
                </button>
                <button
                  onClick={() => setSelectedAgent("pm")}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                    selectedAgent === "pm"
                      ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span>PM Agent</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.sender === "agent" && (
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className={message.agentType === "teacher" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-violet-500/20 text-violet-400 border border-violet-500/30"}>
                          {message.agentType === "teacher" ? <GraduationCap className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-white/5 text-gray-200 border border-white/10"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1.5 ${message.sender === "user" ? "text-emerald-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.sender === "user" && (
                      <Avatar className="h-8 w-8 ml-2">
                        <AvatarFallback className="bg-white/10 text-gray-300 border border-white/20">
                          {student?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-white/10 bg-black/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={`Ask ${selectedAgent === "teacher" ? "Teacher" : "PM"} Agent...`}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 bg-white/5 text-white placeholder:text-gray-500 transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputMessage.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Context Panel */}
        <div className="w-96 p-6 pl-0">
          <div className="h-full bg-[#161616]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 bg-black/20">
              <h2 className="text-lg font-semibold text-white tracking-tight">
                {mode === "learning" ? "Learning Progress" : "Project Details"}
              </h2>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {mode === "learning" && (
                  <>
                    {/* Progress Bar */}
                    {currentSelectedModule && (
                      <div className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-300">{currentSelectedModule.title}</span>
                          <span className="text-sm font-bold text-emerald-400">{currentSelectedModule.progress}%</span>
                        </div>
                        <Progress value={currentSelectedModule.progress} className="h-2 bg-white/10" />
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{currentSelectedModule.estimatedTime} estimated</span>
                        </div>
                      </div>
                    )}

                    {/* Learning Q&A Timeline */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <h3 className="text-sm font-medium text-white">Learning Notes</h3>
                      </div>
                      
                      {learningQA.length > 0 ? (
                        <div className="space-y-3">
                          {learningQA.slice(-5).map(msg => (
                            <div key={msg.id} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                              <p className="text-xs font-medium text-gray-300 mb-1">{msg.content.slice(0, 100)}...</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs border-white/20 text-gray-400 bg-white/5">#learning</Badge>
                                <span className="text-xs text-gray-500">
                                  {msg.timestamp.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">Start chatting to see your learning notes here</p>
                      )}
                    </div>

                    {/* Skills Coverage */}
                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-medium text-white">Skills Coverage</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Overall Progress</span>
                          <span className="font-bold text-emerald-400">{skillCoveragePercent}%</span>
                        </div>
                        <Progress value={skillCoveragePercent} className="h-2 bg-white/10" />
                      </div>
                    </div>
                  </>
                )}

                {mode === "project" && currentSelectedProject && (
                  <>
                    {/* Project Info */}
                    <div className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/10">
                      <h3 className="text-lg font-semibold text-white">{currentSelectedProject.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{currentSelectedProject.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {currentSelectedProject.requiredSkills.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs border-white/20 text-gray-400 bg-white/5">
                            #{skill.toLowerCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Project Progress */}
                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">Project Progress</span>
                        <span className="text-sm font-bold text-violet-400">{currentSelectedProject.progress}%</span>
                      </div>
                      <Progress value={currentSelectedProject.progress} className="h-2 bg-white/10" />
                    </div>

                    {/* Tasks Checklist */}
                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <h3 className="text-sm font-medium text-white">Tasks</h3>
                      <div className="space-y-2">
                        {currentSelectedProject.tasks.map(task => (
                          <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm ${task.completed ? "text-gray-500 line-through" : "text-gray-300 font-medium"}`}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Join Project Button */}
                    <div className="pt-4 border-t border-white/10">
                      {joinedProjectIds.has(currentSelectedProject.id) ? (
                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30" disabled>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Joined Project
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                          onClick={() => handleJoinProject(currentSelectedProject.id)}
                        >
                          Join Project
                        </Button>
                      )}
                    </div>
                  </>
                )}

                {mode === "project" && !currentSelectedProject && (
                  <div className="text-center py-12">
                    <FolderKanban className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-sm text-gray-500">Select a project to view details</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}
