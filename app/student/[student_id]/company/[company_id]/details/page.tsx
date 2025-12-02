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
  ChevronLeft,
  Send, 
  Bot, 
  GraduationCap,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  AlignLeft,
  Video,
  Github, // <--- ADD THIS
  X      , // <--- ADD THIS
  Check,       // <--- ADD THIS
  ExternalLink // <--- ADD THIS
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useEffect, useMemo, useState, useRef } from "react"
import { useStudentAuth } from "@/hooks/use-student-auth"
const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    
    body {
      font-family: 'Space Grotesk', sans-serif;
      background-color: #0b0f14; 
      color: white;
      overflow-x: hidden;
    }
    
    html {
      scroll-behavior: smooth;
    }
  `}</style>
)
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


// Mock PR Data with Detailed Analysis
const MOCK_PRS = [
  { 
    id: "pr-102", 
    title: "feat: Setup project structure", 
    status: "approved", 
    verdict: "Excellent structure. Merged.", 
    timestamp: "2 days ago",
    author: "You",
    // New Detailed Analysis Data
    score: 98,
    analysis: {
      summary: "Great job setting up the folder structure. The separation of concerns between /components and /lib is clear.",
      security: { status: "safe", issues: [] },
      quality: { status: "good", issues: [] },
      checklist: [
        { label: "Folder Structure", status: "pass", comment: "Follows Next.js 14 conventions" },
        { label: "Dependencies", status: "pass", comment: "No unused packages found" },
        { label: "Types", status: "pass", comment: "Strict mode enabled" }
      ]
    }
  },
  { 
    id: "pr-105", 
    title: "fix: Tailwind config typo", 
    status: "rejected", 
    verdict: "Security Risk & Style Violation.", 
    timestamp: "5 hours ago",
    author: "You",
    score: 45,
    analysis: {
      summary: "This PR introduces a hardcoded secret in the config and ignores the design system variables.",
      security: { 
        status: "critical", 
        issues: ["Hardcoded API Key found in tailwind.config.ts line 14"] 
      },
      quality: { 
        status: "poor", 
        issues: ["Used hex codes (#123456) instead of CSS variables (var(--primary))"] 
      },
      checklist: [
        { label: "Secrets Scan", status: "fail", comment: "API Key exposed in git history" },
        { label: "Linting", status: "warn", comment: "Prettier config ignored" },
        { label: "Best Practices", status: "fail", comment: "Hardcoding values" }
      ]
    }
  },
  { 
    id: "pr-109", 
    title: "feat: Authentication middleware", 
    status: "pending", 
    verdict: "Running automated tests...", 
    timestamp: "Just now",
    author: "You",
    score: 0,
    analysis: null // Pending analysis
  }
]



// Mock e-commerce project (will be replaced with real data from database)
const MOCK_ECOMMERCE_PROJECT = {
  project_id: "ecommerce-project",
  name: "E-Commerce Platform",
  description: "Build a full-stack e-commerce application with React and Express",
  status: "active",
  tech_stack: ["React", "Node.js", "MongoDB", "Express", "Tailwind CSS"]
}

type Mode = "learning" | "project"
type AgentType = "teacher" | "pm"


// ... imports

// ADD THIS INTERFACE
interface PrReviewData {
  id: string
  title: string
  status: 'approved' | 'rejected' | 'pending' | string
  verdict: string
  timestamp: string
  author: string
  score: number
  summary: string
  issues: string[] // We will parse the JSON string here
  pr_url: string
  pr_number: number
}

// ... existing interfaces

interface TaskTopic {
  id: string
  title: string
  content: string
  resourceId?: string
}

interface TaskLearningResource {
  id: string
  question: string
  createdAt: string
}

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
  // ADDED: Navigation hooks for URL persistence
  const searchParams = useSearchParams()
  const pathname = usePathname()

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
      content: "Whereas recognition of the inherent dignity",
      sender: "agent",
      agentType: "teacher",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [expandedProjectTopics, setExpandedProjectTopics] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [taskTopics, setTaskTopics] = useState<Record<string, TaskTopic[]>>({})
  const [taskResources, setTaskResources] = useState<Record<string, TaskLearningResource[]>>({})
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [activeResourceId, setActiveResourceId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [placeholderText, setPlaceholderText] = useState("")
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamStatus, setStreamStatus] = useState<string | null>(null)
  const [currentStreamingTopicId, setCurrentStreamingTopicId] = useState<string | null>(null)
  const [syllabus, setSyllabus] = useState<any[]>([])
  
  // Real tasks state
  const [projectTasks, setProjectTasks] = useState<any[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [studentRole, setStudentRole] = useState<"frontend" | "backend" | "fullstack">("fullstack")
  const [hasAssignedTask, setHasAssignedTask] = useState(false)
  const [isStartingProject, setIsStartingProject] = useState(false)

  // ADDED: Helper to update URL without refreshing
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        current.delete(key)
      } else {
        current.set(key, value)
      }
    })

    const search = current.toString()
    const query = search ? `?${search}` : ""
    
    // Replace URL without refreshing, keeping history clean
    router.replace(`${pathname}${query}`, { scroll: false })
  }

 
// Fetch the content (topics) for a specific learning resource from chat_history
const fetchResourceTopics = async (resourceId: string, taskId: string) => {
  // 1. Check if we already have topics loaded for this resource to save network calls
  const existingTopics = taskTopics[taskId]?.filter(t => t.resourceId === resourceId)
  if (existingTopics && existingTopics.length > 0) {
    setSelectedTopicId(existingTopics[0].id)
    return
  }

  try {
    // 2. Fetch from 'chat_history' table
    const { data, error } = await supabase
      .from('chat-history')
      .select('*')
      .eq('resource_id', resourceId)
      .eq('message_type', 'ai') // Only get the AI explanations
      .order('created_at', { ascending: true })

    if (error) throw error

    if (data && data.length > 0) {
      // 3. Transform to UI format
      // Note: If your chat_history doesn't have a 'title' column, 
      // we generate a generic one based on the index.
    // 3. Transform to UI format
    const loadedTopics: TaskTopic[] = data.map((row: any, index: number) => {
      const fullText = row.content || ""
      
      // Find the separation between the Title and the Body (defined by \n\n)
      const splitIndex = fullText.indexOf("\n\n")
      
      let title = `Explanation Part ${index + 1}`
      let body = fullText

      if (splitIndex !== -1) {
        // Extract everything before the first \n\n as the Title
        title = fullText.substring(0, splitIndex).trim()
        
        // Extract everything after the first \n\n as the Content
        body = fullText.substring(splitIndex + 2).trim()
      } else {
         // Fallback: if no \n\n, try splitting by a single newline
         const singleIndex = fullText.indexOf("\n")
         if (singleIndex !== -1) {
            title = fullText.substring(0, singleIndex).trim()
            body = fullText.substring(singleIndex + 1).trim()
         }
      }

      // specific clean up: remove markdown heading syntax (e.g., "# Title") from the list view title
      title = title.replace(/^#+\s*/, "")

      return {
        id: row.id,
        title: title, 
        content: body,
        resourceId: row.resource_id
      }
    })

      // 4. Update state (merge with existing topics for this task)
      setTaskTopics(prev => { 
        const currentTaskTopics = prev[taskId] || []
        const otherTopics = currentTaskTopics.filter(t => t.resourceId !== resourceId)
        
        return {
          ...prev,
          [taskId]: [...otherTopics, ...loadedTopics]
        }
      })

      // 5. Automatically open the first topic
      setSelectedTopicId(loadedTopics[0].id)
      console.log("Selected topic ID:", loadedTopics[0].id) 
      console.log("Loaded topics:", loadedTopics)
    }
  } catch (error) {
    console.error("Error fetching topics:", error)
  }
}

// ... existing state ...
  const [selectedPrId, setSelectedPrId] = useState<string | null>(null)
  
  // NEW: State for real PR data
  const [realPrs, setRealPrs] = useState<PrReviewData[]>([])
  const [isLoadingPrs, setIsLoadingPrs] = useState(false)


  // ... existing fetchProjectResources function ...

  // ADD THIS FUNCTION
  const fetchPrReviews = async () => {
    if (!studentId) return
    
    setIsLoadingPrs(true)
    try {
      // ensure we have a task context
      if (!activeTaskId) {
        setIsLoadingPrs(false)
        return
      }

      const { data, error } = await supabase
        .from('pr_reviews')
        .select('*')
        .eq('student_id', studentId)
        .eq('task_id', activeTaskId)
        .order('created_at', { ascending: false })
      console.log("Fetched PR review data:", data, studentId, activeTaskId)
      if (error) throw error

      if (data) {
        const formattedPrs: PrReviewData[] = data.map((row: any) => {
          // Parse the ai_issues string into an array
          let parsedIssues: string[] = []
          try {
            parsedIssues = row.ai_issues ? JSON.parse(row.ai_issues) : []
          } catch (e) {
            console.error("Failed to parse issues", e)
            parsedIssues = []
          }

          // Format timestamp to "2 days ago" style or just date
          const date = new Date(row.created_at)
          const timeString = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

          return {
            id: row.id,
            title: row.pr_title,
            status: row.ai_verdict?.toLowerCase() || 'pending',
            verdict: row.ai_verdict, // Keep raw verdict for display if needed
            timestamp: timeString,
            author: "You", // Hardcoded based on current user
            score: row.ai_score,
            summary: row.ai_summary,
            issues: row.ai_issues,
            pr_url: row.pr_url,
            pr_number: row.pr_number
          }
        })
        setRealPrs(formattedPrs)
        console.log(formattedPrs)
      }
    } catch (error) {
      console.error("Error fetching PR reviews:", error)
    } finally {
      setIsLoadingPrs(false)
    }
  }

  // ADD TO USE EFFECT
  useEffect(() => {
    if (mode === 'project') {
      setRealPrs([])
       // ... existing calls
       fetchPrReviews() // <--- Add this call
    }
  }, [mode, selectedProject,activeTaskId])
  // Update URL Params Helper (No changes needed, just use it for prId)
  
  // Update the Sync Effect (Add prId handling)
  useEffect(() => {
    // ... existing ...
    const urlPrId = searchParams.get('prId')

    // ... existing checks ...

    if (urlPrId) {
      setSelectedPrId(urlPrId)
    } else {
      setSelectedPrId(null) // Clear if not in URL
    }
  }, [searchParams])

  // Fetch existing learning resources for the current project
  const fetchProjectResources = async () => {
    // Safety check
    if (!studentId || !selectedProject) return

    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .eq('student_id', studentId)
        .eq('project_id', selectedProject) // Filter by current project
        .order('created_at', { ascending: true })

      if (error) throw error

      if (data) {
        // Group the fetched rows by task_id to fit your state structure
        const resourcesByTask: Record<string, TaskLearningResource[]> = {}

        data.forEach((row: any) => {
          const taskId = row.task_id
          if (!resourcesByTask[taskId]) {
            resourcesByTask[taskId] = []
          }
          
          resourcesByTask[taskId].push({
            id: row.id,
            question: row.title, // Map DB 'title' column to UI 'question'
            createdAt: row.created_at
          })
        })

        // Merge with existing state
        setTaskResources(prev => ({
          ...prev,
          ...resourcesByTask
        }))
      }
    } catch (error) {
      console.error("Error fetching project resources:", error)
    }
  }

  // ADDED: Sync state from URL on load/update
  useEffect(() => {
    const urlMode = searchParams.get('mode') as Mode
    const urlProjectId = searchParams.get('projectId')
    const urlTaskId = searchParams.get('taskId')
    const urlResourceId = searchParams.get('resourceId')

    if (urlMode && (urlMode === 'learning' || urlMode === 'project')) {
      setMode(urlMode)
    }
    
    if (urlProjectId) {
      setSelectedProject(urlProjectId)
    }

    if (urlTaskId) {
      setActiveTaskId(urlTaskId)
    }

    if (urlResourceId) {
      setActiveResourceId(urlResourceId)
      if (urlTaskId) fetchResourceTopics(urlResourceId, urlTaskId)
    }
  }, [searchParams])

  const toggleProjectTopic = (topicId: string) => {
    const next = new Set(expandedProjectTopics)
    if (next.has(topicId)) {
      next.delete(topicId)
    } else {
      next.add(topicId)
    }
    setExpandedProjectTopics(next)
  }

  const handleTopicClick = (topicId: string) => {
    setSelectedTopicId(topicId)
  }

  const handleBackToTopics = () => {
    setSelectedTopicId(null)
  }

  // Typing animation for placeholder
  useEffect(() => {
    const placeholders = [
      "Teach me login authentication...",
      "Explain Google OAuth integration...",
      "How do I set up JWT tokens?",
      "What is session management?",
      "Show me password hashing best practices...",
      "Explain API authentication flow...",
      "How to implement 2FA?",
      "What are refresh tokens?"
    ]

    let currentText = ""
    let currentIndex = 0
    let isDeleting = false
    let charIndex = 0

    const typeSpeed = 80
    const deleteSpeed = 50
    const pauseTime = 2000

    const type = () => {
      const currentPlaceholder = placeholders[currentIndex]

      if (!isDeleting) {
        // Typing
        currentText = currentPlaceholder.substring(0, charIndex + 1)
        charIndex++

        if (charIndex === currentPlaceholder.length) {
          // Finished typing, pause then start deleting
          setTimeout(() => {
            isDeleting = true
            type()
          }, pauseTime)
          setPlaceholderText(currentText)
          return
        }
      } else {
        // Deleting
        currentText = currentPlaceholder.substring(0, charIndex - 1)
        charIndex--

        if (charIndex === 0) {
          // Finished deleting, move to next placeholder
          isDeleting = false
          currentIndex = (currentIndex + 1) % placeholders.length
          setTimeout(type, 500)
          setPlaceholderText(currentText)
          return
        }
      }

      setPlaceholderText(currentText)
      setTimeout(type, isDeleting ? deleteSpeed : typeSpeed)
    }

    const timer = setTimeout(type, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Reset selected topic, resource, and question when task changes
  // MODIFIED: Controlled via URL now mostly, but kept for internal consistency
  useEffect(() => {
    // Only clear if not driven by URL to avoid clearing on load
    if (!searchParams.get('resourceId')) {
       setSelectedTopicId(null)
       setActiveResourceId(null)
       setCurrentQuestion(null)
    }
  }, [activeTaskId])

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
    setHoveredSidebarItem(null)
    // ADDED: Update URL
    updateUrlParams({ mode: newMode })
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
    setActiveTaskId(null)
    // ADDED: Update URL - Set Project, Clear Task and Resource
    updateUrlParams({ 
      projectId: projectId, 
      taskId: null, 
      resourceId: null 
    })
  }

  const handleJoinProject = (projectId: string) => {
    const newJoined = new Set(joinedProjectIds)
    newJoined.add(projectId)
    setJoinedProjectIds(newJoined)
  }

  // --- UPDATED: Insert DB -> Update URL -> Stream ---
  const handleProjectQuestion = async () => {
    if (!inputMessage.trim() || mode !== "project") return
    if (!activeTask || !currentSelectedProject) return

    const question = inputMessage.trim()
    setCurrentQuestion(question)
    // Clear input immediately for better UX
    setInputMessage("")
    setSyllabus([])

    try {
      // 1. Insert into Supabase FIRST
      const { data: savedResource, error: dbError } = await supabase
        .from('learning_resources')
        .insert({
          student_id: studentId,
          project_id: currentSelectedProject.project_id,
          task_id: activeTask.task_id,
          company_id: companyId,
          title: question,
          metadata: { streamed: true }
        })
        .select()
        .single()

      if (dbError) throw dbError
      if (!savedResource) throw new Error("Failed to create learning resource record")

      const resourceId = savedResource.id
      const sessionTopicId = `session-${Date.now()}`

      // 2. Update Local State
      setTaskResources(prev => {
        const existing = prev[activeTask.task_id] ?? []
        const newResource: TaskLearningResource = {
          id: resourceId,
          question,
          createdAt: savedResource.created_at || new Date().toISOString(),
        }
        return {
          ...prev,
          [activeTask.task_id]: [...existing, newResource],
        }
      })

      // Set active
      setActiveResourceId(resourceId)
      setCurrentStreamingTopicId(sessionTopicId)
      setSelectedTopicId(null)

      // 3. Update URL with the new resource ID
      updateUrlParams({ resourceId: resourceId })

      // 4. Start Streaming
      setIsStreaming(true)
      setStreamStatus("Starting...")

      // Prepare request payload including the REAL resource_id
      const requestPayload = {
        user_id: params.student_id,
        role: studentRole,
        task_id: activeTask.task_id,
        task_name: activeTask.title,
        question: question,
        resource_id: resourceId 
      }

      const response = await fetch("https://teacher-backend-toz0.onrender.com/project/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      if (!response.body) {
        throw new Error("Streaming not supported in this browser")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let currentTopicContent = ""
      let currentTopicId: string | null = null
      let currentTopicIndex = 0

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        // console.log("📦 Received chunk:", buffer.substring(0, 100))

        // Process line by line
        let newlineIndex
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim()
          buffer = buffer.slice(newlineIndex + 1)

          if (!line || line === "") continue
          if (line.startsWith(":")) continue

          let jsonStr = line
          if (line.startsWith("data:")) {
            jsonStr = line.replace(/^data:\s*/, "").trim()
          }

          if (!jsonStr) continue

          try {
            const msg = JSON.parse(jsonStr)
            const { type } = msg
            
            if (type === "start") {
              setStreamStatus("Starting...")
            } else if (type === "log") {
              const logData = msg.data || {}
              const logText = logData.message || msg.message || "Processing..."
              setStreamStatus(logText)
              
              if (logText.includes("Teacher:")) {
                // Finalize previous
                if (currentTopicId && currentTopicContent) {
                  const finalizedContent = currentTopicContent
                  const finalizedId = currentTopicId
                  setTaskTopics(prev => {
                    const existing = prev[activeTask.task_id] ?? []
                    return {
                      ...prev,
                      [activeTask.task_id]: existing.map(t =>
                        t.id === finalizedId ? { ...t, content: finalizedContent } : t
                      ),
                    }
                  })
                }
                
                const topicMatch = logText.match(/Teacher:\s*(.+)/)
                const topicName = topicMatch ? topicMatch[1].trim() : `Topic ${currentTopicIndex + 1}`
                
                currentTopicId = `${sessionTopicId}-topic-${currentTopicIndex}`
                currentTopicContent = ""
                currentTopicIndex++
                
                const newTopic: TaskTopic = {
                  id: currentTopicId,
                  title: topicName,
                  content: "",
                  resourceId,
                }
                
                setTaskTopics(prev => {
                  const existing = prev[activeTask.task_id] ?? []
                  return {
                    ...prev,
                    [activeTask.task_id]: [...existing, newTopic]
                  }
                })
                
                setSelectedTopicId(currentTopicId)
                setStreamStatus("AI is teaching...")
              } else if (logText.includes("Planner:")) {
                setStreamStatus("Planning syllabus...")
              } else if (logText.includes("Retriever:")) {
                setStreamStatus("Retrieving documents...")
              }
            } else if (type === "retrieval_done") {
              const retrievalData = msg.data || {}
              const docLength = retrievalData.doc_length || 0
              setStreamStatus(`Retrieved ${docLength} characters`)
            } else if (type === "syllabus_ready") {
              const syllabusData = msg.data || {}
              const receivedSyllabus = syllabusData.syllabus || []
              setSyllabus(receivedSyllabus)
              setStreamStatus(`Syllabus ready`)
            } else if (type === "token") {
              const token = msg.data || ""
              currentTopicContent += token
              
              if (currentTopicId) {
                setTaskTopics(prev => {
                  const existing = prev[activeTask.task_id] ?? []
                  return {
                    ...prev,
                    [activeTask.task_id]: existing.map(t =>
                      t.id === currentTopicId ? { ...t, content: currentTopicContent } : t
                    ),
                  }
                })
              }
            } else if (type === "lesson_complete") {
              const lessonData = msg.data || {}
              const finalMarkdown = lessonData.content_markdown || ""
              
              if (finalMarkdown && currentTopicId) {
                const completedTopicId = currentTopicId
                setTaskTopics(prev => {
                  const existing = prev[activeTask.task_id] ?? []
                  return {
                    ...prev,
                    [activeTask.task_id]: existing.map(t =>
                      t.id === completedTopicId ? { ...t, content: finalMarkdown } : t
                    ),
                  }
                })
                currentTopicContent = finalMarkdown
              }
              setStreamStatus("Lesson complete")
            } else if (type === "end") {
              if (currentTopicId && currentTopicContent) {
                const finalizedContent = currentTopicContent
                const finalizedId = currentTopicId
                setTaskTopics(prev => {
                  const existing = prev[activeTask.task_id] ?? []
                  return {
                    ...prev,
                    [activeTask.task_id]: existing.map(t =>
                      t.id === finalizedId ? { ...t, content: finalizedContent } : t
                    ),
                  }
                })
              }
              setStreamStatus("Complete")
              setCurrentStreamingTopicId(null)
            } else if (type === "error") {
              const errorData = msg.data || {}
              const errorMsg = errorData.message || msg.message || "An error occurred"
              setStreamStatus(`Error: ${errorMsg}`)
            }
          } catch (e) {
            console.error("Error parsing message:", e)
          }
        }
      }
      setIsStreaming(false)
      setStreamStatus(null)
      setCurrentStreamingTopicId(null)
    } catch (error) {
      console.error("Error generating learning resource:", error)
      setIsStreaming(false)
      setStreamStatus(null)
      setCurrentStreamingTopicId(null)
      alert("Failed to generate learning content. Please try again.")
    }
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

 // UPDATED: Fetch tasks + Auto-Advance logic if all tasks are completed
  const fetchProjectTasks = async () => {
    if (!studentId) return

    setLoadingTasks(true)
    try {
      // 1. Fetch current assigned tasks
      const { data: existingData, error } = await supabase
        .from('tasks-duo-1')
        .select('*')
        .eq('assigned-to', studentId)
        .order('task_order', { ascending: true })

      if (error) throw error
      
      let currentTasks = (existingData || []).map((row: any) => ({
        task_id: row.task_id,                  
        title: row.task,                  
        description: row['task-description'], 
        status: row.status,
        role: row.role,
        assignee: row['assigned-to'],     
        task_order: row.task_order               
      }))

      // ---------------------------------------------------------
      // AUTO-ADVANCE LOGIC: Check if we need to fetch the next task
      // ---------------------------------------------------------
      const hasInProgress = currentTasks.some(t => t.status === 'in_progress')
      const hasTasks = currentTasks.length > 0

      // If user has tasks, but NONE are in_progress, fetch the next one
      if (hasTasks && !hasInProgress) {
        console.log("All tasks completed. Attempting to fetch next task...")
        
        // Get the highest order currently assigned
        const lastTask = currentTasks[currentTasks.length - 1]
        const lastOrder = lastTask.task_order

        // Determine role filter
        let roleFilter: string[] = []
        if (studentRole === "fullstack") {
          roleFilter = ["frontend", "backend"]
        } else {
          roleFilter = [studentRole]
        }

        // Fetch NEXT task from master table
        const { data: nextMasterTask, error: nextError } = await supabase
          .from('tasks')
          .select('*')
          .in('role', roleFilter)
          .gt('task_order', lastOrder) // STRICTLY GREATER THAN last order
          .order('task_order', { ascending: true })
          .limit(1)
          .single()

        if (!nextError && nextMasterTask) {
          // Insert the new task into tasks-duo-1
          const { data: newAssignedTask, error: insertError } = await supabase
            .from('tasks-duo-1')
            .insert({
              'task_id': nextMasterTask.task_id,
              'task': nextMasterTask.title,
              'task-description': nextMasterTask.description,
              'role': nextMasterTask.role,
              'assigned-to': studentId,
              'status': 'in_progress', // Set as active
              'task_order': nextMasterTask.task_order,
              'created_at': new Date().toISOString()
            })
            .select()
            .single()

          if (!insertError && newAssignedTask) {
            // Add the new task to our local list immediately
            const mappedNewTask = {
              task_id: newAssignedTask.task_id,
              title: newAssignedTask.task,
              description: newAssignedTask['task-description'],
              status: newAssignedTask.status,
              role: newAssignedTask.role,
              assignee: newAssignedTask['assigned-to'],
              task_order: newAssignedTask.task_order
            }
            // Append to list
            currentTasks = [...currentTasks, mappedNewTask]
            
            // Force set this new task as active
            setActiveTaskId(mappedNewTask.task_id)
            updateUrlParams({ taskId: mappedNewTask.task_id })
          }
        }
      }
      // ---------------------------------------------------------
      // END AUTO-ADVANCE LOGIC
      // ---------------------------------------------------------

      setProjectTasks(currentTasks)
      setHasAssignedTask(currentTasks.length > 0)
      
      // Standard Auto-Select Logic (If we didn't just auto-advance)
      const currentUrlTaskId = searchParams.get('taskId')
      
      // If we have active tasks, no specific task selected, and we didn't just auto-advance above
      // (If we auto-advanced, activeTaskId is already set, so this block won't overwrite it)
      if (currentTasks.length > 0 && !activeTaskId && !currentUrlTaskId) {
        // Prefer the first 'in_progress' task, otherwise the last available task
        const defaultTask = currentTasks.find(t => t.status === 'in_progress') || currentTasks[currentTasks.length - 1]
        
        setActiveTaskId(defaultTask.task_id)
        updateUrlParams({ taskId: defaultTask.task_id })
      }
      
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoadingTasks(false)
    }
  }

  // Fetch student role from team member
  const fetchStudentRole = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('student_id', studentId)
        .eq('company_id', companyId)
        .single()

      if (error) throw error
      
      if (data) {
        setStudentRole(data.role as "frontend" | "backend" | "fullstack")
      }
    } catch (error) {
      console.error('Error fetching student role:', error)
    }
  }

  

// =========================================================
  // PASTE THIS TO REPLACE THE PREVIOUS LOGIC BLOCK
  // =========================================================

  // NEW: State for Onboarding Wizard
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false)
  const [githubUsername, setGithubUsername] = useState("")
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false)
  
  // NEW: Track the step (Input -> Success) and store API data
  const [onboardingStep, setOnboardingStep] = useState<'input' | 'success'>('input')
  const [onboardingData, setOnboardingData] = useState<any>(null)

  // 1. Open Modal
  const handleStartProjectClick = () => {
    setOnboardingStep('input') // Reset to input
    setGithubUsername('')      // Clear previous input
    setIsOnboardingModalOpen(true)
  }

  // 2. Submit to API -> Show Success Screen
  const submitGithubOnboarding = async () => {
    if (!githubUsername.trim()) {
      alert("Please enter your GitHub username")
      return
    }

    setIsOnboardingLoading(true)

    try {
      const payload = {
        student_id: studentId,
        project_name: currentSelectedProject?.name || "unknown-project",
        github_username: githubUsername
      }

      const response = await fetch("https://ocellar-inclusively-delsie.ngrok-free.dev/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Onboarding API request failed")

      const data = await response.json()
      
      // SUCCESS: Save data and switch to success view
      console.log("Onboarding Success:", data)
      setOnboardingData(data)
      setOnboardingStep('success') 

    } catch (error) {
      console.error("Onboarding Error:", error)
      alert("Failed to onboard. Please check the username and try again.")
    } finally {
      setIsOnboardingLoading(false)
    }
  }

  // 3. User clicks "Continue" on Success Screen -> Start DB Setup
  const handleFinalContinue = async () => {
    setIsOnboardingModalOpen(false) // Close modal
    await continueProjectSetup()    // Run original setup logic
  }

  // 4. The Original Database Logic
  const continueProjectSetup = async () => {
    if (isStartingProject) return
    setIsStartingProject(true)
    
    try {
      let roleFilter: string[] = studentRole === "fullstack" ? ["frontend", "backend"] : [studentRole]

      const { data: templates, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .in('role', roleFilter)
        .order('task_order', { ascending: true })
        .limit(1)

      if (fetchError) throw fetchError
      if (!templates || templates.length === 0) {
        alert('No available tasks found for your role.')
        return
      }
      const firstTemplate = templates[0]

      const { data: newTask, error: insertError } = await supabase
        .from('tasks-duo-1')
        .insert({
          'task_id': firstTemplate.task_id,
          'task': firstTemplate.title,
          'task-description': firstTemplate.description,
          'role': firstTemplate.role,
          'assigned-to': studentId,
          'status': 'in_progress',
          'task_order': firstTemplate.task_order,
          'created_at': new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError

      await fetchProjectTasks()
      
      if (newTask) {
        setActiveTaskId(newTask.task_id)
        setHasAssignedTask(true)
        updateUrlParams({ taskId: newTask.task_id })
      }
    } catch (error) {
      console.error('Error starting project:', error)
      alert('Failed to start project. Please try again.')
    } finally {
      setIsStartingProject(false)
    }
  }

  // Fetch student role on mount
  useEffect(() => {
    if (studentId && companyId) {
      fetchStudentRole()
    }
  }, [studentId, companyId])

// Fetch tasks AND resources when project mode is selected or project changes
useEffect(() => {
  if (mode === "project") {
    fetchProjectTasks()
    // Add this line:
    if (selectedProject) {
      fetchProjectResources()
    }
  }
}, [mode, selectedProject]) // Add selectedProject to dependencies

  // Show loading while checking authorization or loading data
  if (isAuthorized === null || !company || !student) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#181a1a]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-xs">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authorized, don't render anything (redirect is in progress)
  if (isAuthorized === false) {
    return null
  }

  const currentSelectedModule = MOCK_LEARNING_MODULES.find(m => m.id === selectedModule)
  // Use real project from database if available, otherwise use mock
  const currentSelectedProject = projects.find(p => p.project_id === selectedProject) || 
    (selectedProject === MOCK_ECOMMERCE_PROJECT.project_id ? MOCK_ECOMMERCE_PROJECT : null)

  // Active task from real database tasks
  const activeTask =
    mode === "project" && projectTasks.length > 0
      ? (activeTaskId
          ? projectTasks.find(t => t.task_id === activeTaskId) || null
          : null)
      : null

  const activeTaskTopics: TaskTopic[] =
    activeTask && mode === "project"
      ? (taskTopics[activeTask.task_id] ?? []).filter(topic =>
          activeResourceId ? topic.resourceId === activeResourceId : true
        )
      : []

  // Filter learning messages for the right panel
  const learningQA = messages.filter(m => selectedAgent === "teacher")

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#181a1a]" >
      <GlobalStyles />
      {/* Main three-panel layout */}
      <div className="h-full flex">
        
        {/* LEFT SIDEBAR - Hoverable Icons */}
        <div className="relative flex">
          {/* Icon Bar */}
          <div className="w-14 bg-[#1f2121] border-r border-white/5 flex flex-col items-center py-4 gap-3 z-20">
            {/* Company Logo/Name */}
            <div className="mb-2 text-center">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-xs">
                {company?.name?.charAt(0) || "C"}
              </div>
            </div>

            {/* Learn Icon */}
            <button
              onMouseEnter={() => setHoveredSidebarItem("learn")}
              onClick={() => handleModeChange("learning")}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                mode === "learning" 
                  ? "bg-white/20 text-white" 
                  : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Projects Icon */}
            <button
              onMouseEnter={() => setHoveredSidebarItem("projects")}
              onClick={() => handleModeChange("project")}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                mode === "project" 
                  ? "bg-white/20 text-white" 
                  : "bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
            </button>
          </div>

          {/* Slide-out Panel */}
          <AnimatePresence>
            {hoveredSidebarItem && (
              <motion.div
                initial={{ x: -240, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -240, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onMouseLeave={() => setHoveredSidebarItem(null)}
                className="absolute left-14 top-0 h-full w-60 bg-[#1f2121]/98 backdrop-blur-xl border-r border-white/10 shadow-xl z-10"
              >
                <ScrollArea className="h-full">
                  <div className="p-3">
                    {hoveredSidebarItem === "learn" && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-white" />
                          <h2 className="text-[15px] font-semibold text-white">Learning Modules</h2>
                        </div>

                        {/* Group by skill */}
                        {["React", "Express"].map(skill => {
                          const skillModules = MOCK_LEARNING_MODULES.filter(m => m.skill === skill)
                          return (
                            <div key={skill} className="space-y-1">
                              <div className="flex items-center gap-1 px-1 py-0.5">
                                <Badge variant="outline" className="text-[11px] font-medium border-white/20 text-white bg-white/5">
                                  #{skill.toLowerCase()}
                                </Badge>
                              </div>
                              {skillModules.map(module => (
                                <div key={module.id} className="border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all">
                                  <button
                                    onClick={() => toggleModuleExpansion(module.id)}
                                    className="w-full px-2.5 py-2.5 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      {expandedModules.has(module.id) ? (
                                        <ChevronDown className="w-4 h-4 text-white" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-white" />
                                      )}
                                      <div className="text-left">
                                        <p className="font-medium text-[13px] text-white">{module.title}</p>
                                        <p className="text-[11px] text-white/60">{module.estimatedTime}</p>
                                      </div>
                                    </div>
                                    <div className="text-[13px] font-semibold text-white">{module.progress}%</div>
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
                                        <div className="px-2.5 py-2 bg-black/30 border-t border-white/5 space-y-1">
                                          <p className="text-[11px] text-white/60 mb-1.5">{module.description}</p>
                                          {module.topics.map(topic => (
                                            <div key={topic.id} className="flex items-center gap-1.5 text-[11px]">
                                              {topic.completed ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                              ) : (
                                                <div className="w-3.5 h-3.5 rounded-full border border-white/30" />
                                              )}
                                              <span className={topic.completed ? "text-white/50" : "text-white font-medium"}>
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
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-2">
                          <FolderKanban className="w-4 h-4 text-white" />
                          <h2 className="text-[15px] font-semibold text-white">Projects</h2>
                        </div>

                        {/* Show real projects or mock e-commerce project */}
                        {(projects.length > 0 ? projects : [MOCK_ECOMMERCE_PROJECT]).map(project => (
                          <button
                            key={project.project_id}
                            onClick={() => handleProjectClick(project.project_id)}
                            className={`w-full text-left border rounded-lg p-2.5 transition-all ${
                              selectedProject === project.project_id
                                ? "border-white/20 bg-white/10"
                                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-medium text-[13px] text-white">{project.name}</h3>
                              <Badge variant="secondary" className="text-[10px] bg-white/10 text-white border-white/20 capitalize">
                                {project.status || 'active'}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-white/60 mb-1.5">{project.description || 'No description'}</p>
                            {project.tech_stack && project.tech_stack.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {project.tech_stack.map((tech: string) => (
                                  <Badge key={tech} variant="outline" className="text-[10px] border-white/20 text-white bg-white/5">
                                    #{tech.toLowerCase()}
                                  </Badge>
                                ))}
                              </div>
                            )}
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

        {/* CENTER - Chat / Project Interface */}
        <div className="flex-1 flex flex-col min-w-0 p-3 relative">
          {mode === "learning" ? (
            // <div className="h-full bg-[#1f2121]/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 flex flex-col overflow-hidden">
            //   {/* Chat Header with Agent Toggle */}
            //   <div className="px-4 py-2.5 border-b border-white/10 bg-black/20">
            //     <div className="flex items-center justify-between mb-2">
            //       <h1 className="text-[15px] font-semibold text-white">{company?.name}</h1>
            //       <Badge variant="outline" className="text-[12px] border-white/20 text-white bg-white/5">
            //         #learning
            //       </Badge>
            //     </div>
                
            //     {/* Agent Selector */}
            //     <div className="flex gap-1.5">
            //       <button
            //         onClick={() => setSelectedAgent("teacher")}
            //         className={`flex-1 px-3 py-2 rounded-lg font-medium text-[13px] transition-all ${
            //           selectedAgent === "teacher"
            //             ? "bg-white/20 text-white"
            //             : "bg-white/5 text-white hover:bg-white/10"
            //         }`}
            //       >
            //         <div className="flex items-center justify-center gap-1.5">
            //           <GraduationCap className="w-4 h-4" />
            //           <span>Teacher</span>
            //         </div>
            //       </button>
            //       <button
            //         onClick={() => setSelectedAgent("pm")}
            //         className={`flex-1 px-3 py-2 rounded-lg font-medium text-[13px] transition-all ${
            //           selectedAgent === "pm"
            //             ? "bg-white/20 text-white"
            //             : "bg-white/5 text-white hover:bg-white/10"
            //         }`}
            //       >
            //         <div className="flex items-center justify-center gap-1.5">
            //           <Bot className="w-4 h-4" />
            //           <span>PM</span>
            //         </div>
            //       </button>
            //     </div>
            //   </div>

            //   {/* Messages Area */}
            //   <ScrollArea className="flex-1 px-4 py-3">
            //     <div className="space-y-2.5">
            //       {messages.map(message => (
            //         <div
            //           key={message.id}
            //           className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            //         >
            //           {message.sender === "agent" && (
            //             <Avatar className="h-7 w-7 mr-2">
            //               <AvatarFallback className="bg-white/10 text-white border border-white/20">
            //                 {message.agentType === "teacher" ? <GraduationCap className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            //               </AvatarFallback>
            //             </Avatar>
            //           )}
            //           <div
            //             className={`max-w-[70%] rounded-lg px-3.5 py-2.5 ${
            //               message.sender === "user"
            //                 ? "bg-white/20 text-white"
            //                 : "bg-white/5 text-white border border-white/10"
            //             }`}
            //           >
            //             <p className="text-[13px] leading-relaxed">{message.content}</p>
            //             <p className={`text-[10px] mt-1 ${message.sender === "user" ? "text-white/70" : "text-white/50"}`}>
            //               {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            //             </p>
            //           </div>
            //           {message.sender === "user" && (
            //             <Avatar className="h-7 w-7 ml-2">
            //               <AvatarFallback className="bg-white/10 text-white border border-white/20">
            //                 {student?.name?.charAt(0) || "U"}
            //               </AvatarFallback>
            //             </Avatar>
            //           )}
            //         </div>
            //       ))}
            //       <div ref={messagesEndRef} />
            //     </div>
            //   </ScrollArea>

            //   {/* Input Area */}
            //   <div className="px-4 py-2.5 border-t border-white/10 bg-black/20">
            //     <div className="flex gap-2">
            //       <input
            //         type="text"
            //         value={inputMessage}
            //         onChange={(e) => setInputMessage(e.target.value)}
            //         onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            //         placeholder={`Ask ${selectedAgent === "teacher" ? "Teacher" : "PM"}...`}
            //         className="flex px-3.5 py-2 rounded-lg border border-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 bg-white/5 text-white text-[13px] placeholder:text-white/50 transition-all"
            //       />
            //       <button
            //         onClick={handleSendMessage}
            //         className="px-4 py-2.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            //         disabled={!inputMessage.trim()}
            //       >
            //         <Send className="w-4 h-4 " />
            //       </button>
            //     </div>
            //   </div>
            // </div>
            <div>Comming soon</div>
          ) : (
            <>
              {/* Show onboarding if no assigned task */}
              {!hasAssignedTask && !loadingTasks ? (
                <div className="flex-1 flex items-center justify-center px-6">
                  <div className="max-w-2xl w-full text-center space-y-6">
                    {/* Icon */}
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                        <FolderKanban className="w-10 h-10 text-white/70" />
                      </div>
                    </div>

                    {/* Heading */}
                    <div className="space-y-3">
                      <h1 className="text-[32px] font-bold text-white leading-tight">
                        {currentSelectedProject?.name || "Welcome to Your Project"}
                      </h1>
                      <p className="text-[16px] text-white/70 leading-relaxed max-w-xl mx-auto">
                        {currentSelectedProject?.description || 
                          "Get started by taking on your first task. We'll guide you through each step with personalized learning resources."}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4">
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mx-auto">
                          <Target className="w-6 h-6 text-white/60" />
                        </div>
                        <p className="text-[13px] text-white/60">Task-based Learning</p>
                      </div>
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mx-auto">
                          <GraduationCap className="w-6 h-6 text-white/60" />
                        </div>
                        <p className="text-[13px] text-white/60">AI-Powered Guides</p>
                      </div>
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mx-auto">
                          <Sparkles className="w-6 h-6 text-white/60" />
                        </div>
                        <p className="text-[13px] text-white/60">Hands-on Practice</p>
                      </div>
                    </div>

                    {/* Start Button */}
                    <div className="pt-6">
                      <Button
                        onClick={handleStartProjectClick}
                        disabled={isStartingProject}
                        className="h-12 px-8 text-[15px] bg-white/20 hover:bg-white/30 text-white border border-white/20 hover:border-white/30 transition-all"
                      >
                        {isStartingProject ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                            Starting...
                          </>
                        ) : (
                          <>
                            Start Project
                            <ChevronRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Role Badge */}
                    <div className="pt-4 border-t border-white/10 max-w-xs mx-auto">
                      <p className="text-[12px] text-white/50 mb-2">Your assigned role:</p>
                      <Badge variant="outline" className="text-[13px] border-white/20 text-white bg-white/10 capitalize px-4 py-1.5">
                        {studentRole}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <>
              {/* Project mode header – shows the selected task as the "main topic" */}
              <div className="px-6 pb-1 border-b border-white/10">
                <div className="max-w-3xl">
                  <div className="flex">
                    <p className="text-[17px] font-medium text-white">
                      {activeTask
                        ? activeTask.title
                        : "Select a task on the right to start learning"}
                    </p>
                  </div>
                </div>
              </div>

                  {/* Task‑specific learning rendered directly on the background */}
                  <ScrollArea className="flex-1 px-6 py-3">
  
  {/* 1. BACK BUTTON: Only show if we are looking at a specific resource */}
  {activeTask && activeResourceId && (
    <div className="max-w-4xl mx-auto mb-3 pt-1">
      <button
        onClick={() => {
          // Clear local state
          setActiveResourceId(null)
          setSelectedTopicId(null)
          // Update URL to remove resourceId
          updateUrlParams({ resourceId: null })
        }}
        className="inline-flex items-center gap-1 text-[13px] text-white/50 hover:text-white transition-colors hover:bg-white/5 px-2 py-1.5 rounded-md -ml-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Resources
      </button>
    </div>
  )}

  {/* 2. TOPIC SLIDER: Only show if inside a resource AND it has topics */}
 {/* Minimalist Topic Slider - Styled Scrollbar */}
{activeTask && activeResourceId && activeTaskTopics.length > 0 && (
  <>
    {/* Custom Thin Scrollbar Styles */}
    <style jsx global>{`
      .custom-scrollbar {
        scrollbar-width: thin; /* Firefox */
        scrollbar-color: rgba(255, 255, 255, 0.2) transparent; /* Firefox */
      }
      .custom-scrollbar::-webkit-scrollbar {
        height: 6px; /* Height for horizontal scrollbar */
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 20px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(255, 255, 255, 0.4);
      }
    `}</style>

    <div className="max-w-4xl mx-auto mb-8 sticky top-0 z-10 bg-[#181a1a]/95 backdrop-blur-md py-3 -mt-3 border-b border-white/5">
      {/* Added 'custom-scrollbar' class and 'pb-2' for spacing */}
      <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 px-1">
        {activeTaskTopics.map((topic, index) => {
          const isSelected = selectedTopicId === topic.id
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={`
                group flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border
                ${isSelected
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-transparent text-white/40 hover:text-white/80 hover:bg-white/5"
                }
              `}
            >
              {/* Number Pill */}
              <span className={`
                flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold
                ${isSelected
                  ? "bg-emerald-400 text-[#181a1a]"
                  : "bg-white/10 text-white/60"
                }
              `}>
                {index + 1}
              </span>

              <span className="whitespace-nowrap">
                {topic.title}
              </span>
            </button>
          )
        })}

        {/* Minimal Streaming Indicator */}
        {isStreaming && (
          <div className="flex-shrink-0 pl-2 pr-4 py-1.5 text-emerald-400 text-[12px] font-medium flex items-center gap-2 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Generating...
          </div>
        )}
      </div>
    </div>
  </>
)}

  {/* 3. MAIN CONTENT AREA */}
  {selectedTopicId && activeTask ? (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* ... (Keep your existing markdown rendering logic here) ... */}
      {(() => {
                      const selectedTopic = activeTaskTopics.find(t => t.id === selectedTopicId)
                      if (!selectedTopic) return null

                      // --- 1. HELPER: Parse Inline Markdown (**bold**, `code`) ---
                      const renderFormattedText = (text: string) => {
                        // Split by bold (**) or inline code (`)
                        const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
                        return parts.map((part, index) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>
                          }
                          if (part.startsWith("`") && part.endsWith("`")) {
                            return <code key={index} className="bg-white/10 text-emerald-300 px-1.5 py-0.5 rounded text-[12px] font-mono border border-white/5">{part.slice(1, -1)}</code>
                          }
                          return part
                        })
                      }

                      // --- 2. HELPER: Syntax Highlighting for Code Blocks ---
                      const renderHighlightedCode = (language: string | undefined, code: string) => {
                        const lang = (language || "").toLowerCase()
                        
                        // Basic keyword sets
                        const jsKeywords = /\b(const|let|var|import|from|export|default|return|if|else|async|await|function|class|new|try|catch|throw|for|while|do|switch|case|break|continue|this|super|extends|true|false|null|undefined)\b/g
                        const bashKeywords = /\b(npm|npx|yarn|pnpm|git|cd|ls|mkdir|rm|cp|mv|echo|cat|grep|sudo|docker|node|bun)\b/g
                        const typeKeywords = /\b(string|number|boolean|any|void|Promise|React|FC|useState|useEffect)\b/g

                        let regex = null
                        let keywordColor = "text-emerald-400"

                        if (lang.includes("js") || lang.includes("ts") || lang.includes("react")) {
                          regex = jsKeywords
                        } else if (lang.includes("bash") || lang.includes("sh") || lang.includes("shell")) {
                          regex = bashKeywords
                          keywordColor = "text-pink-400" // Different color for commands
                        }

                        return code.split("\n").map((line, lineIdx) => {
                          if (!regex) return <div key={lineIdx} className="opacity-90">{line || " "}</div>

                          const segments: any[] = []
                          let lastIndex = 0
                          
                          // Run regex against line
                          line.replace(regex, (match, _p1, offset) => {
                             if (offset > lastIndex) {
                               segments.push({ type: "text", value: line.slice(lastIndex, offset) })
                             }
                             segments.push({ type: "keyword", value: match })
                             lastIndex = offset + match.length
                             return match
                          })
                          
                          if (lastIndex < line.length) {
                             segments.push({ type: "text", value: line.slice(lastIndex) })
                          }
                          
                          // Highlight types in TS/JS if not already matched
                          const finalSegments = segments.flatMap(seg => {
                             if (seg.type === "text" && (lang.includes("ts") || lang.includes("js"))) {
                                // Simple sub-pass for types
                                return seg.value.split(typeKeywords).map((part: string, i: number) => {
                                   if (typeKeywords.test(part)) return { type: "type", value: part }
                                   return { type: "text", value: part }
                                })
                             }
                             return [seg]
                          })

                          return (
                            <div key={lineIdx} className="min-h-[1.2em]">
                              {finalSegments.map((seg, idx) => {
                                if (seg.type === "keyword") return <span key={idx} className={`${keywordColor} font-semibold`}>{seg.value}</span>
                                if (seg.type === "type") return <span key={idx} className="text-yellow-200">{seg.value}</span>
                                return <span key={idx} className="text-blue-100/80">{seg.value}</span>
                              })}
                            </div>
                          )
                        })
                      }

                      // --- 3. PARSER: Split Markdown into Block Segments ---
                      type Segment = { type: "text" | "code" | "heading"; language?: string; content: string; level?: number }
                      const segments: Segment[] = []
                      const lines = (selectedTopic.content || "").split("\n")
                      let inCode = false
                      let codeLang = ""
                      let codeLines: string[] = []
                      let textLines: string[] = []

                      const pushText = () => {
                        if (textLines.length) {
                          segments.push({ type: "text", content: textLines.join("\n").trim() })
                          textLines = []
                        }
                      }

                      const pushCode = () => {
                         segments.push({ type: "code", language: codeLang, content: codeLines.join("\n") })
                         codeLines = []
                         codeLang = ""
                      }

                      for (const line of lines) {
                        const fenceMatch = line.trim().match(/^```(\w+)?$/)
                        if (fenceMatch) {
                          if (!inCode) {
                            pushText()
                            inCode = true
                            codeLang = fenceMatch[1] || ""
                          } else {
                            inCode = false
                            pushCode()
                          }
                          continue
                        }

                        if (inCode) {
                          codeLines.push(line)
                        } else {
                          const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
                          if (headingMatch) {
                            pushText()
                            segments.push({ type: "heading", level: headingMatch[1].length, content: headingMatch[2].trim() })
                          } else {
                            textLines.push(line)
                          }
                        }
                      }
                      if (inCode) pushCode()
                      else pushText()

                      // --- 4. RENDERER ---
                      return (
                        <article className="space-y-6 pb-20">
                          <h1 className="text-[32px] font-bold text-white leading-tight mb-6 border-b border-white/10 pb-4">
                            {selectedTopic.title}
                          </h1>

                          {segments.map((seg, idx) => {
                            // --- CODE BLOCK RENDER ---
                            if (seg.type === "code") {
                              const lang = (seg.language || "text").toLowerCase()
                              return (
                                <div key={idx} className="my-5 rounded-xl border border-white/10 bg-[#0F0F0F] overflow-hidden shadow-2xl">
                                  {/* Mac-style Window Header */}
                                  <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                                    <div className="flex gap-1.5">
                                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                                    </div>
                                    <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
                                      {lang || "TERMINAL"}
                                    </span>
                                    <button 
                                      onClick={() => navigator.clipboard.writeText(seg.content)}
                                      className="text-[10px] text-white/40 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-all"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                  {/* Code Content */}
                                  <div className="p-4 overflow-x-auto">
                                    <pre className="font-mono text-[13px] leading-6">
                                      {renderHighlightedCode(seg.language, seg.content)}
                                    </pre>
                                  </div>
                                </div>
                              )
                            }

                            // --- HEADING RENDER ---
                            if (seg.type === "heading") {
                              const level = seg.level || 1
                              const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements
                              
                              // Tailwind classes for different levels
                              const sizes: any = {
                                1: "text-2xl font-bold text-white mt-8 mb-4",
                                2: "text-xl font-bold text-white mt-6 mb-3",
                                3: "text-lg font-semibold text-emerald-400 mt-5 mb-2", // Subheadings pop with color
                                4: "text-base font-semibold text-white/90 mt-4 mb-2"
                              }
                              
                              return (
                                <HeadingTag key={idx} className={sizes[level] || sizes[4]}>
                                  {seg.content}
                                </HeadingTag>
                              )
                            }

                            // --- TEXT RENDER ---
                            if (!seg.content) return null
                            return (
                              <p key={idx} className="text-[15px] leading-7 text-white/80 whitespace-pre-line mb-4">
                                {renderFormattedText(seg.content)}
                              </p>
                            )
                          })}
                        </article>
                      )
                    })()}
    </div>
  ) : (
    /* 4. TASK OVERVIEW (List of Resources) - Shown when no topic is selected */
    <div className="max-w-6xl mx-auto pb-24 px-6 font-sans antialiased selection:bg-emerald-500/30">
    
    {/* STATE 1: PR DETAIL VIEW (Active when a PR is clicked) */}
    {activeTask && selectedPrId ? (
     <div className="animate-in fade-in slide-in-from-right-4 duration-300 pt-6">
        {(() => {
          // CHANGE: Look up in realPrs instead of MOCK_PRS
          const pr = realPrs.find(p => p.id === selectedPrId)
          
          if (!pr) return <div className="text-zinc-500 font-mono text-sm">Loading or PR Not Found...</div>

          return (
            <div className="max-w-4xl mx-auto">
              {/* 1. Navigation Breadcrumb */}
              <nav className="flex items-center gap-3 text-xs text-zinc-500 mb-8 font-mono">
                <button 
                  onClick={() => updateUrlParams({ prId: null })}
                  className="hover:text-zinc-300 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-3 h-3" />
                  DASHBOARD
                </button>
                <span className="text-zinc-800">/</span>
                <span>PR-{pr.pr_number}</span>
              </nav>

              {/* 2. Title & Primary Meta */}
              <header className="mb-10 pb-8 border-b border-zinc-800/50">
                <div className="flex justify-between items-start gap-6">
                  <div>
                    {/* METALLIC SHINE TITLE */}
                    <h1 className="text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 leading-tight tracking-tight mb-3 drop-shadow-sm">
                      {pr.title}
                    </h1>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400">
                          {pr.author.charAt(0)}
                        </div>
                        {pr.author}
                      </span>
                      <span>•</span>
                      <span>{pr.timestamp}</span>
                      <span>•</span>
                      {/* NEW: Link to Repo */}
                      <a href={pr.pr_url} target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                         View on GitHub <ChevronRight className="w-3 h-3"/>
                      </a>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium uppercase tracking-wider shadow-sm
                    ${pr.status === 'approved' ? 'border-emerald-900/30 bg-emerald-500/5 text-emerald-500' : ''}
                    ${pr.status === 'rejected' ? 'border-rose-900/30 bg-rose-500/5 text-rose-500' : ''}
                    ${pr.status === 'pending' ? 'border-amber-900/30 bg-amber-500/5 text-amber-500' : ''}
                  `}>
                    <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_6px_currentColor] ${
                      pr.status === 'approved' ? 'bg-emerald-500' : pr.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                    }`} />
                    {pr.status}
                  </div>
                </div>
              </header>

              {/* 3. Analysis Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  
                  {/* Left: Main Analysis (2/3) */}
                  <div className="lg:col-span-2 space-y-10">
                    
                    {/* AI Summary */}
                    <section>
                      <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Analysis Summary
                      </h3>
                      <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-lg p-5">
                        <p className="text-[14px] leading-7 text-zinc-300 font-light">
                          {pr.summary}
                        </p>
                      </div>
                    </section>

                    {/* Consolidated Issues List (Since DB gives a single list) */}
                    <section>
                      <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">Key Improvements & Issues</h3>
                      <div className="border border-zinc-800/50 rounded-lg bg-zinc-900/10 overflow-hidden">
                        {pr.issues && pr.issues.length > 0 ? (
                            <ul className="divide-y divide-zinc-800/50">
                            {pr.issues.map((issue, idx) => (
                                <li key={idx} className="p-4 flex items-start gap-4 group hover:bg-zinc-900/30 transition-colors">
                                <div className="mt-1 flex-shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 group-hover:bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]"></div>
                                </div>
                                <p className="text-sm text-zinc-400 group-hover:text-zinc-200 leading-relaxed font-light">
                                    {issue}
                                </p>
                                </li>
                            ))}
                            </ul>
                        ) : (
                            <div className="p-8 text-center text-zinc-600 text-sm italic">
                                No critical issues found. Great job!
                            </div>
                        )}
                      </div>
                    </section>
                  </div>

                  {/* Right: Metrics Sidebar (1/3) */}
                  <div className="space-y-8">
                    
                    {/* Score Card */}
                    <div className="border border-zinc-800/60 rounded-lg p-5 bg-zinc-900/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 blur-[40px] rounded-full pointer-events-none"></div>
                      <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Quality Score</div>
                      <div className="flex items-baseline gap-1 relative z-10">
                        <span className={`text-4xl font-medium tracking-tighter bg-clip-text text-transparent bg-gradient-to-b ${pr.score > 80 ? 'from-emerald-300 to-emerald-600' : 'from-rose-300 to-rose-600'}`}>
                          {pr.score}
                        </span>
                        <span className="text-sm text-zinc-600">/100</span>
                      </div>
                    </div>

                    {/* Quick Stats / Info */}
                     <div className="border border-zinc-800/40 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between text-xs">
                           <span className="text-zinc-500">PR Number</span>
                           <span className="text-zinc-300 font-mono">#{pr.pr_number}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-zinc-500">Issues Found</span>
                           <span className="text-zinc-300 font-mono">{pr.issues.length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-zinc-500">Review Status</span>
                           <span className="text-zinc-300 capitalize">{pr.status}</span>
                        </div>
                     </div>

                  </div>
              </div>
            </div>
          )
        })()}
      </div>
    ) : (
      
      /* STATE 2: TASK DASHBOARD (Utility Layout with Metallic Touches) */
      <>
        {!activeTask && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-600">
            <p className="text-sm font-light">Select a task to view details</p>
          </div>
        )}

        {activeTask && currentSelectedProject && (
          <div className="space-y-12 animate-in fade-in duration-500 pt-8">
            
            {/* Header */}
            <header className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-6">
                <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                  <span className="px-2 py-1 bg-zinc-900 rounded border border-zinc-800 text-zinc-400">
                    {currentSelectedProject.name.toUpperCase()}
                  </span>
                  <span className="text-zinc-700">/</span>
                  <span>TASK-{activeTask.task_order}</span>
                </div>
                
                <span className={`text-[10px] uppercase tracking-widest font-medium px-2 py-1 rounded
                   ${activeTask.status === 'completed' ? 'text-emerald-500' : 'text-zinc-500'}
                `}>
                   {activeTask.status.replace('_', ' ')}
                </span>
              </div>

              <div className="max-w-3xl">
                {/* METALLIC SHINE TITLE */}
                <h1 className="text-4xl font-medium text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 tracking-tight mb-4 leading-tight drop-shadow-sm">
                  {activeTask.title}
                </h1>
                <p className="text-zinc-400 text-base font-light leading-relaxed">
                  {activeTask.description}
                </p>
              </div>
            </header>

            {/* Dashboard Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-zinc-800/30 pt-10">
              
              {/* LEFT: RESOURCES LIST */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Learning Modules</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {taskResources[activeTask.task_id]?.length > 0 ? (
                    taskResources[activeTask.task_id].map((res) => {
                      // Check if this specific resource is currently streaming
                      const isThisStreaming = isStreaming && activeResourceId === res.id

                      return (
                        <button
                          key={res.id}
                          onClick={() => {
                            setActiveResourceId(res.id)
                            updateUrlParams({ resourceId: res.id })
                            fetchResourceTopics(res.id, activeTask.task_id)
                          }}
                          className={`group hover:cursor-pointer flex items-center justify-between p-4 rounded-xl border text-left relative overflow-hidden transition-all
                            ${isThisStreaming 
                              ? "bg-emerald-950/10 border-emerald-500/20 ring-1 ring-emerald-500/20" 
                              : "bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50"
                            }
                          `}
                        >
                          {/* Subtle Shine on Hover (Only if not streaming) */}
                          {!isThisStreaming && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                          )}

                          <div className="flex items-center gap-4 relative z-10">
                             {/* Icon Box */}
                             <div className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors shadow-sm
                                ${isThisStreaming
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                  : "bg-zinc-900 border-zinc-800 text-zinc-500 group-hover:text-zinc-300 group-hover:border-zinc-600"
                                }
                             `}>
                                {isThisStreaming ? (
                                  <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                ) : (
                                  <BookOpen className="w-4 h-4" />
                                )}
                             </div>

                             {/* Text Content */}
                             <div>
                                <h4 className={`text-sm font-medium transition-colors
                                   ${isThisStreaming ? "text-emerald-100" : "text-zinc-300 group-hover:text-white"}
                                `}>
                                  {res.question}
                                </h4>
                                
                                {/* LOGIC: Show Stream Status OR Static Date */}
                                {isThisStreaming ? (
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-mono text-emerald-400 animate-pulse tracking-wide uppercase">
                                      {streamStatus || "INITIALIZING..."}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-600 font-mono">
                                    <span className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[9px] uppercase text-zinc-500">
                                      AI Generated
                                    </span>
                                    <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                                  </div>
                                )}
                             </div>
                          </div>

                          {/* Arrow Icon (Hidden if streaming) */}
                          {!isThisStreaming && (
                            <div className="relative z-10 p-2 rounded-full group-hover:bg-white/5 transition-colors">
                               <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                            </div>
                          )}
                        </button>
                      )
                    })
                  ) : (
                    <div className="py-12 border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center">
                      <p className="text-sm text-zinc-500">No resources yet.</p>
                      <p className="text-xs text-zinc-600 mt-1">Ask a question to generate content.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: STATUS TIMELINE */}
              <div className="lg:col-span-4 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Submission History</h3>
                  <button className="text-[10px] text-zinc-500 hover:text-zinc-300 border-b border-zinc-800 hover:border-zinc-500 transition-all pb-0.5">
                    NEW REQUEST
                  </button>
                </div>

                <div className="relative pl-2 space-y-0">
                   {/* Continuous Line */}
                   <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-800"></div>
{realPrs.map((pr, idx) => (
      <div key={pr.id} className="relative pl-8 py-3 group">
         {/* Timeline Dot */}
         <div className={`absolute left-[3px] top-5 w-[5px] h-[5px] rounded-full  z-10 
            ${pr.status === 'accepted' ? 'bg-emerald-500' : ''}
            ${pr.status === 'rejected' ? 'bg-rose-500' : ''}
            ${pr.status === 'pending' ? 'bg-zinc-600' : ''}
         `}></div>
         
         <button 
            onClick={() => updateUrlParams({ prId: pr.id })}
            className="block w-full text-left hover:cursor-pointer p-3 rounded-md hover:bg-zinc-900/50 transition-colors"
         >
            <div className="flex items-center justify-between mb-1">
               <span className="text-xs text-zinc-300 group-hover:text-white font-medium transition-colors truncate max-w-[150px]">
                  {pr.title}
               </span>
               <span className="text-[9px] text-zinc-600 font-mono flex-shrink-0">{pr.timestamp}</span>
            </div>
            <div className="flex items-center gap-2">
               <span className={`text-[9px] uppercase tracking-wider font-medium
                  ${pr.status === 'accepted' ? 'text-emerald-500' : ''}
                  ${pr.status === 'rejected' ? 'text-rose-500' : ''}
                  ${pr.status === 'pending' ? 'text-zinc-500' : ''}
               `}>
                  {pr.status}
               </span>
               {idx === 0 && <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 rounded">LATEST</span>}
            </div>
         </button>
      </div>
   ))}
   {realPrs.length === 0 && !isLoadingPrs && (
      <div className="pl-8 text-xs text-zinc-600 italic">No PRs submitted yet.</div>
   )}
                </div>
              </div>

            </div>
          </div>
        )}
      </>
    )}
  </div>
  )}
</ScrollArea>
                  {/* Floating semi-oval input bar at the bottom: in project mode this "asks AI" for a new topic */}
                  {/* Hide input bar when viewing a full topic or during onboarding */}
                  {!selectedTopicId && hasAssignedTask && activeTask && (
                <div className="pointer-events-none absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="pointer-events-auto w-full max-w-3xl bg-white/5 border border-white/10 rounded-full px-5 py-2 flex items-center gap-3 shadow-[0_18px_40px_rgba(0,0,0,0.7)] backdrop-blur-md">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleProjectQuestion()}
                      placeholder={placeholderText || "Ask about this task..."}
                      className="flex-1 bg-transparent text-[14px]  text-white placeholder:text-white/50 focus:outline-none"
                    />
                    <button
                      onClick={handleProjectQuestion}
                      className="rounded-full bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[13px] flex items-center gap-1.5"
                      disabled={!inputMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* RIGHT PANEL - Context Panel */}
        <div className="w-64 p-3 pl-0">
          <div className="h-full bg-[#1f2121]/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 border-b border-white/10 bg-black/20">
              <h2 className="text-[15px] font-medium text-white">
                {mode === "learning" ? "Learning Progress" : "Project Details"}
              </h2>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2.5">
                {mode === "learning" && (
                  // <>
                  //   {/* Progress Bar */}
                  //   {currentSelectedModule && (
                  //     <div className="space-y-2 bg-white/5 rounded-lg p-2.5 border border-white/10">
                  //       <div className="flex items-center justify-between">
                  //         <span className="text-[14px] font-medium text-white">{currentSelectedModule.title}</span>
                  //         <span className="text-[14px] font-bold text-white">{currentSelectedModule.progress}%</span>
                  //       </div>
                  //       <Progress value={currentSelectedModule.progress} className="h-1.5 bg-white/13" />
                  //       <div className="flex items-center gap-1 text-[12px] text-white/50">
                  //         <Clock className="w-3 h-3" />
                  //         <span>{currentSelectedModule.estimatedTime}</span>
                  //       </div>
                  //     </div>
                  //   )}

                  //   {/* Learning Q&A Timeline */}
                  //   <div className="space-y-1.5">
                  //     <div className="flex items-center gap-1.5">
                  //       <Sparkles className="w-4 h-4 text-white" />
                  //       <h3 className="text-[14px] font-medium text-white">Learning Notes</h3>
                  //     </div>
                      
                  //     {learningQA.length > 0 ? (
                  //       <div className="space-y-1.5">
                  //         {learningQA.slice(-5).map(msg => (
                  //           <div key={msg.id} className="p-2.5 bg-white/5 rounded-lg border border-white/13 hover:bg-white/10 transition-colors">
                  //             <p className="text-[12px] font-medium text-white mb-1">{msg.content.slice(0, 80)}...</p>
                  //             <div className="flex items-center gap-1 mt-1">
                  //               <Badge variant="outline" className="text-[10px] border-white/20 text-white bg-white/5">#learning</Badge>
                  //               <span className="text-[10px] text-white/50">
                  //                 {msg.timestamp.toLocaleDateString()}
                  //               </span>
                  //             </div>
                  //           </div>
                  //         ))}
                  //       </div>
                  //     ) : (
                  //       <p className="text-[12px] text-white/50 italic">Start chatting to see notes</p>
                  //     )}
                  //   </div>

                  //   {/* Skills Coverage */}
                  //   <div className="space-y-1.5 pt-2 border-t border-white/10">
                  //     <div className="flex items-center gap-1.5">
                  //       <Target className="w-4 h-4 text-white" />
                  //       <h3 className="text-[14px] font-medium text-white">Skills Coverage</h3>
                  //     </div>
                  //     <div className="space-y-1">
                  //       <div className="flex justify-between text-[12px]">
                  //         <span className="text-white/60">Overall Progress</span>
                  //         <span className="font-bold text-white">{skillCoveragePercent}%</span>
                  //       </div>
                  //       <Progress value={skillCoveragePercent} className="h-1.5 bg-white/10" />
                  //     </div>
                  //   </div>
                  // </>
                  <div>Comming soon</div>
                )}

                {mode === "project" && selectedProject && (
                  <>
                    {loadingTasks ? (
                      <div className="text-center py-8">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-[12px] text-white/50">Loading tasks...</p>
                      </div>
                    ) : (
                      <>
                        {/* Project Info */}
                        {currentSelectedProject && (
                          <div className="space-y-2 bg-white/5 rounded-lg p-2.5 border border-white/10">
                            <h3 className="text-[14px] font-semibold text-white">{currentSelectedProject.name}</h3>
                            <p className="text-[12px] text-white/60 leading-relaxed">{currentSelectedProject.description || 'No description'}</p>
                            
                            {currentSelectedProject.tech_stack && currentSelectedProject.tech_stack.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {currentSelectedProject.tech_stack.map((tech: string) => (
                                  <Badge key={tech} variant="outline" className="text-[10px] border-white/20 text-white bg-white/5">
                                    #{tech.toLowerCase()}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Student Role Badge */}
                        <div className="pt-2 border-t border-white/10">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-white/60">Your Role:</span>
                            <Badge variant="outline" className="text-[11px] border-white/20 text-white bg-white/10 capitalize">
                              {studentRole}
                            </Badge>
                          </div>
                        </div>

                        {/* Tasks Checklist */}
                        <div className="space-y-1.5 pt-2 border-t border-white/10">
                          <h3 className="text-[14px] font-medium text-white">Your Tasks</h3>
                          {projectTasks.length === 0 ? (
                            <p className="text-[12px] text-white/50 py-2">No tasks available</p>
                          ) : (
                            <div className="space-y-1">
                              {projectTasks
                                .filter(task => task.assignee === studentId)
                                .map(task => {
                                  const isActive = activeTask && activeTask.task_id === task.task_id
                                  const isCompleted = task.status === 'completed'
                                  return (
                                   <button
                                      key={task.task_id}
                                      onClick={() => {
                                        // 1. Set the new active task
                                        setActiveTaskId(task.task_id)
                                        
                                        // 2. Clear conflicting views
                                        setSelectedPrId(null)
                                        setActiveResourceId(null)
                                        setSelectedTopicId(null)
                                        
                                        // 3. Update URL
                                        updateUrlParams({ 
                                          taskId: task.task_id, 
                                          prId: null, 
                                          resourceId: null 
                                        })
                                      }}
                                      className={`w-full flex items-start gap-1.5 p-1 rounded-md text-left transition-colors ${
                                        isActive ? "bg-white/10 border border-white/30" : "hover:bg-white/5"
                                      }`}
                                    >
                                      {isCompleted ? (
                                        <CheckCircle2 className="w-3 h-3 text-white flex-shrink-0 mt-0.5" />
                                      ) : (
                                        <div className="w-3 h-3 rounded-full border border-white/30 flex-shrink-0 mt-0.5" />
                                      )}
                                      <div className="flex-1">
                                        <span
                                          className={`text-[13px] block ${
                                            isCompleted ? "text-white/50 line-through" : "text-white font-medium"
                                          }`}
                                        >
                                          {task.title}
                                        </span>
                                        <Badge variant="outline" className="text-[9px] border-white/20 text-white/50 bg-white/5 mt-1 capitalize">
                                          {task.role}
                                        </Badge>
                                      </div>
                                    </button>
                                  )
                                })}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}

                {mode === "project" && !currentSelectedProject && (
                  <div className="text-center py-8">
                    <FolderKanban className="w-8 h-8 mx-auto mb-2 text-white/30" />
                    <p className="text-[13px] text-white/50">Select a project</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* UPDATED MODAL CODE */}
      <AnimatePresence>
        {isOnboardingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#181a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            >
              
              {/* --- VIEW 1: INPUT FORM --- */}
              {onboardingStep === 'input' && (
                <>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                      <Github className="w-5 h-5 text-white" />
                      <h3 className="text-lg font-semibold text-white">GitHub Setup</h3>
                    </div>
                    <button 
                      onClick={() => setIsOnboardingModalOpen(false)}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <p className="text-sm text-white/70 leading-relaxed">
                        To start the <strong className="text-white">{currentSelectedProject?.name}</strong> project, we need to connect your GitHub account.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        GitHub Username
                      </label>
                      <div className="relative">
                        <Github className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                        <input
                          type="text"
                          value={githubUsername}
                          onChange={(e) => setGithubUsername(e.target.value)}
                          placeholder="e.g. harshsawant2505"
                          className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                      <p className="text-xs text-emerald-200/80">
                        We will create a repository for you and setup the webhooks automatically.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5">
                    <Button
                      variant="ghost"
                      onClick={() => setIsOnboardingModalOpen(false)}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submitGithubOnboarding}
                      disabled={isOnboardingLoading || !githubUsername}
                      className="bg-white text-black hover:bg-white/90"
                    >
                      {isOnboardingLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2"></div>
                          Connecting...
                        </>
                      ) : (
                        "Connect & Start"
                      )}
                    </Button>
                  </div>
                </>
              )}

              {/* --- VIEW 2: SUCCESS WIZARD --- */}
              {onboardingStep === 'success' && onboardingData && (
                <>
                  <div className="p-8 flex flex-col items-center text-center space-y-6">
                    {/* Success Animation Circle */}
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2 ring-1 ring-emerald-500/50">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center animate-in zoom-in duration-300">
                        <Check className="w-6 h-6 text-[#181a1a] stroke-[3]" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white">
                        Onboarding Successful!
                      </h3>
                      <p className="text-sm text-white/60 max-w-[260px] mx-auto">
                        Your environment has been set up and is ready for development.
                      </p>
                    </div>

                    {/* Data Card */}
                    <div className="w-full bg-black/40 border border-white/10 rounded-xl p-4 space-y-3 text-left">
                      
                      {/* Repo Info */}
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
                          Repository Created
                        </label>
                        <a 
                          href={onboardingData.repo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 hover:underline mt-1 group"
                        >
                          <span className="text-sm font-mono truncate">
                            {onboardingData.repo_full_name}
                          </span>
                          <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                        </a>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-[11px] text-white/50">Webhook Status</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-medium text-emerald-500">
                            {onboardingData.webhook_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-white/10 bg-white/5">
                    <Button
                      onClick={handleFinalContinue}
                      className="w-full bg-white text-black hover:bg-white/90 h-11 text-[15px] font-medium"
                    >
                      Continue to Project <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}