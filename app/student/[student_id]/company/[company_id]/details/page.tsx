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
  Github,
  X,
  Check,
  ExternalLink,
  Columns,
  Lock,
  Unlock,
  MessageSquare,
  Plus,
  Loader2
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useEffect, useMemo, useState, useRef, useCallback } from "react"
import { useStudentAuth } from "@/hooks/use-student-auth"
import staticCompaniesForStudents from "@/data/static_companies_for_students.json"
import staticStudentProfile from "@/data/static_student_profile.json"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { PmAgentChat } from "@/components/student/PmAgentChat"
import { useSidebarContext } from "@/components/student/sidebar-context"
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



// Static projects (used when DB returns empty)
const STATIC_PROJECTS = [
  {
    project_id: "ecommerce-project",
    name: "E-Commerce Platform",
    description: "Build a full-stack e-commerce application with React and Express",
    status: "active",
    tech_stack: ["React", "Node.js", "MongoDB", "Express", "Tailwind CSS"]
  },
  {
    project_id: "analytics-dashboard",
    name: "Analytics Dashboard",
    description: "Real-time analytics dashboard with charts and data visualization",
    status: "active",
    tech_stack: ["React", "TypeScript", "D3.js", "PostgreSQL"]
  },
  {
    project_id: "auth-service",
    name: "Auth & API Service",
    description: "JWT-based authentication with REST API",
    status: "active",
    tech_stack: ["Node.js", "Express", "PostgreSQL", "JWT"]
  }
]

// Static tasks per project (status: todo | in_progress | completed)
const STATIC_PROJECT_TASKS: Record<string, Array<{ task_id: string; title: string; status: string; role: string }>> = {
  "ecommerce-project": [
    { task_id: "eco-1", title: "Setup project structure & dependencies", status: "completed", role: "frontend" },
    { task_id: "eco-2", title: "Implement user authentication (JWT)", status: "completed", role: "backend" },
    { task_id: "eco-3", title: "Build product listing & search", status: "in_progress", role: "frontend" },
    { task_id: "eco-4", title: "Shopping cart & checkout flow", status: "todo", role: "frontend" },
    { task_id: "eco-5", title: "Payment integration (Stripe)", status: "todo", role: "backend" },
    { task_id: "eco-6", title: "Order management API", status: "todo", role: "backend" }
  ],
  "analytics-dashboard": [
    { task_id: "ana-1", title: "Setup React + TypeScript project", status: "completed", role: "frontend" },
    { task_id: "ana-2", title: "Design database schema for analytics", status: "in_progress", role: "backend" },
    { task_id: "ana-3", title: "Implement chart components (D3.js)", status: "todo", role: "frontend" },
    { task_id: "ana-4", title: "Real-time data polling API", status: "todo", role: "backend" }
  ],
  "auth-service": [
    { task_id: "auth-1", title: "User registration & login endpoints", status: "completed", role: "backend" },
    { task_id: "auth-2", title: "JWT token refresh flow", status: "in_progress", role: "backend" },
    { task_id: "auth-3", title: "Password reset & email verification", status: "todo", role: "backend" }
  ]
}

const MOCK_ECOMMERCE_PROJECT = STATIC_PROJECTS[0]

/** virtual_environments.environment_id is a UUID */
function isVirtualEnvironmentProjectId(id: string | null): boolean {
  if (!id) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

type TaskStatus = "locked" | "unlocked" | "in_progress" | "submitted" | "approved"

function resolveTaskStatus(
  progress: string | undefined,
  index: number,
  prevStatus: TaskStatus | undefined
): TaskStatus {
  if (progress === "approved") return "approved"
  if (progress === "submitted") return "submitted"
  if (progress === "in_progress") return "in_progress"
  if (progress === "unlocked") return "unlocked"
  if (progress === "locked") return "locked"
  // No progress row — derive from position
  if (index === 0) return "unlocked"
  if (prevStatus === "approved") return "unlocked"
  return "locked"
}

type Mode = "project" | "task_details" | "learn"
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
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const studentId = params.student_id as string
  const companyId = params.company_id as string

  const { setStudent: setSidebarStudent, setWorkspace } = useSidebarContext()

  const [company, setCompany] = useState<any>()
  const [student, setStudent] = useState<any>()
  const [isJoined, setIsJoined] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [team_id, setTeamId] = useState<string>("")
  
  // Security check: Verify the logged-in user matches the student_id in URL
  const isAuthorized = useStudentAuth(studentId)

  // New state for redesigned UI
  const [mode, setMode] = useState<Mode>("project")
  const [selectedAgent, setSelectedAgent] = useState<AgentType>("teacher")
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
  const [joinedEnvironmentIds, setJoinedEnvironmentIds] = useState<string[]>([])
  const [previewTasks, setPreviewTasks] = useState<
    Array<{ task_id: string; title: string; task_order: number }>
  >([])
  const [loadingPreviewTasks, setLoadingPreviewTasks] = useState(false)
  const [isJoiningEnvironment, setIsJoiningEnvironment] = useState(false)

  // Manual review trigger state
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewPrNumber, setReviewPrNumber] = useState("")
  const [isReviewLoading, setIsReviewLoading] = useState(false)
  const [environmentRepoUrl, setEnvironmentRepoUrl] = useState("")
  const [repoInputUrl, setRepoInputUrl] = useState("")
  const [isRepoLoading, setIsRepoLoading] = useState(false)
  const [isSavingRepo, setIsSavingRepo] = useState(false)

  const parseRepoNameFromUrl = (rawUrl: string): string | null => {
    const value = rawUrl.trim()
    if (!value) return null
    const directMatch = value.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/)
    if (directMatch) return `${directMatch[1]}/${directMatch[2]}`
    try {
      const parsed = new URL(value)
      const parts = parsed.pathname.split("/").filter(Boolean)
      if (parts.length < 2) return null
      const owner = parts[0]
      const repo = parts[1].replace(/\.git$/, "")
      return owner && repo ? `${owner}/${repo}` : null
    } catch {
      return null
    }
  }

  const buildPrUrl = (repoName: string, prNumber: string) =>
    `https://github.com/${repoName}/pull/${prNumber}`

  // ADDED: Helper to update URL without refreshing
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    const touchesWorkspaceContext =
      "taskId" in updates ||
      "resourceId" in updates ||
      "prId" in updates ||
      updates.mode === "project" ||
      updates.mode === "task_details" ||
      updates.mode === "learn"

    // Keep environment context stable during task/mode navigation.
    if (touchesWorkspaceContext && selectedProject && !("projectId" in updates)) {
      current.set("projectId", selectedProject)
    }
    if (touchesWorkspaceContext && mode && !("mode" in updates)) {
      current.set("mode", mode)
    }
    
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
            verdict: row.ai_verdict,
            timestamp: timeString,
            author: "You",
            score: row.ai_score,
            summary: row.ai_summary,
            issues: parsedIssues,
            pr_url: row.pr_url,
            pr_number: row.pr_number
          }
        })
        setRealPrs(formattedPrs)
      }
    } catch (error) {
      console.error("Error fetching PR reviews:", error)
    } finally {
      setIsLoadingPrs(false)
    }
  }

  // ADD TO USE EFFECT
  useEffect(() => {
    if (mode !== "project" && mode !== "task_details") return
    setRealPrs([])
    fetchPrReviews()
  }, [mode, selectedProject, activeTaskId])
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

    if (urlMode && (urlMode === "project" || urlMode === "task_details" || urlMode === "learn")) {
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

  // When real projects load from DB, drop invalid projectId from URL (do not auto-open an environment)
  useEffect(() => {
    if (projects.length === 0) return
    if (!selectedProject) return
    const valid = projects.some((p) => p.project_id === selectedProject)
    if (!valid) {
      setSelectedProject(null)
      updateUrlParams({ projectId: null, taskId: null, resourceId: null })
    }
  }, [projects, selectedProject])

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
      // Fetch company data (fallback to static if not in DB)
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("company_id", companyId)
        .single()
      let staticCompanyFallback: any = null
      if (!companyError && companyData) {
        setCompany(companyData)
      } else {
        staticCompanyFallback = (staticCompaniesForStudents as any[]).find((c) => c.company_id === companyId)
        setCompany(staticCompanyFallback ?? { company_id: companyId, name: "Company", description: "", industry: "" })
      }

      // Real projects: virtual_environments for this company (not legacy "projects" table)
      const { data: veData, error: veError } = await supabase
        .from("virtual_environments")
        .select("environment_id, title, description, status, created_at, tech_stack")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
      if (!veError && veData?.length) {
        setProjects(
          veData.map((row: any) => ({
            project_id: row.environment_id,
            name: row.title,
            description: row.description ?? "",
            status: row.status ?? "open",
            tech_stack: Array.isArray(row.tech_stack) ? row.tech_stack : [],
          }))
        )
      } else {
        setProjects([])
      }

      // Fetch student (fallback to static if not in DB)
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("student_id", studentId)
        .single()
      if (!studentError && studentData) {
        setStudent(studentData)
        const joinedCompanies = studentData?.companies_joined || []
        setIsJoined(joinedCompanies.includes(companyId))

        // Optional guard: if student has not completed onboarding, send them back to their dashboard
        const { data: skillRows } = await supabase
          .from("student_skills")
          .select("id")
          .eq("student_id", studentId)
          .limit(1)
        const hasSkills = Array.isArray(skillRows) && skillRows.length > 0
        if (!studentData.github_url || !hasSkills) {
          // Let dashboard handle the onboarding survey UX
          router.push(`/student/${studentId}/dashboard`)
          return
        }
      } else {
        setStudent({ ...staticStudentProfile, student_id: studentId })
        setIsJoined((staticStudentProfile as any).companies_joined?.includes(companyId) ?? false)
      }

      // Fetch team ID (optional)
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('student_id', studentId)
        .single()
      if (!teamError && teamData) {
        setTeamId(teamData.team_id)
      }

      const { data: participationRows } = await supabase
        .from("environment_participants")
        .select("environment_id")
        .eq("student_id", studentId)
      setJoinedEnvironmentIds(
        (participationRows || []).map((r: { environment_id: string }) => r.environment_id)
      )
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

  /** Environments shown in the picker: DB virtual_environments, or static demo when none */
  const environmentProjectsForPicker = useMemo(() => {
    return projects.length > 0 ? projects : STATIC_PROJECTS
  }, [projects])

  // Hash-based mode persistence
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash === "project" || hash === "task_details" || hash === "learn") {
      setMode(hash as Mode)
    }
  }, [])

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    // Update URL
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
    setSelectedPrId(null)
    setActiveResourceId(null)
    setSelectedTopicId(null)
    // ADDED: Update URL - Set Project, Clear Task and Resource
    updateUrlParams({
      projectId: projectId,
      taskId: null,
      resourceId: null,
      prId: null,
    })
  }

  const handleBackToEnvironments = () => {
    setSelectedProject(null)
    setActiveTaskId(null)
    setSelectedPrId(null)
    setActiveResourceId(null)
    setSelectedTopicId(null)
    setProjectTasks([])
    setPreviewTasks([])
    updateUrlParams({
      projectId: null,
      taskId: null,
      resourceId: null,
      prId: null,
    })
  }

  const handleJoinEnvironment = async () => {
    if (!selectedProject || !isVirtualEnvironmentProjectId(selectedProject)) return
    setIsJoiningEnvironment(true)
    try {
      const res = await fetch("/api/student/join-environment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environmentId: selectedProject, companyId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { error?: string }).error || "Join failed")
      setJoinedEnvironmentIds((prev) =>
        prev.includes(selectedProject) ? prev : [...prev, selectedProject]
      )
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : "Could not join environment")
    } finally {
      setIsJoiningEnvironment(false)
    }
  }

  const fetchEnvironmentRepo = async () => {
    if (!studentId || !selectedProject || !isVirtualEnvironmentProjectId(selectedProject)) {
      setEnvironmentRepoUrl("")
      return
    }
    setIsRepoLoading(true)
    try {
      const { data, error } = await supabase
        .from("github_repos")
        .select("id, repo_url, created_at")
        .eq("student_id", studentId)
        .eq("environment_id", selectedProject)
        .order("created_at", { ascending: false })
        .limit(1)
      if (error) throw error
      const repoUrl = data?.[0]?.repo_url || ""
      setEnvironmentRepoUrl(repoUrl)
      setRepoInputUrl(repoUrl)
    } catch (e) {
      console.error("fetchEnvironmentRepo", e)
      setEnvironmentRepoUrl("")
    } finally {
      setIsRepoLoading(false)
    }
  }

  const saveEnvironmentRepo = async () => {
    if (!studentId || !selectedProject) return
    const trimmedUrl = repoInputUrl.trim()
    if (!trimmedUrl) {
      alert("Please paste a GitHub repo URL to continue.")
      return
    }
    if (!parseRepoNameFromUrl(trimmedUrl)) {
      alert("Please enter a valid GitHub repository URL.")
      return
    }
    setIsSavingRepo(true)
    try {
      const { data, error } = await supabase
        .from("github_repos")
        .select("id")
        .eq("student_id", studentId)
        .eq("environment_id", selectedProject)
        .order("created_at", { ascending: false })
        .limit(1)
      if (error) throw error

      const existingId = data?.[0]?.id as string | undefined
      if (existingId) {
        const { error: updateErr } = await supabase
          .from("github_repos")
          .update({ repo_url: trimmedUrl })
          .eq("id", existingId)
        if (updateErr) throw updateErr
      } else {
        const { error: insertErr } = await supabase
          .from("github_repos")
          .insert({
            student_id: studentId,
            environment_id: selectedProject,
            repo_url: trimmedUrl,
          })
        if (insertErr) throw insertErr
      }
      setEnvironmentRepoUrl(trimmedUrl)
      setRepoInputUrl(trimmedUrl)
    } catch (e) {
      console.error("saveEnvironmentRepo", e)
      alert("Failed to save repository URL. Please try again.")
    } finally {
      setIsSavingRepo(false)
    }
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

  // --- Manual Review Trigger ---
  const handleManualReview = async () => {
    const repoName = parseRepoNameFromUrl(environmentRepoUrl)
    if (!repoName) {
      alert("Repository URL is missing for this environment. Please save it first.")
      return
    }
    if (!reviewPrNumber.trim()) return
    if (!activeTaskId) {
      alert("Please select a task before requesting review.")
      return
    }
    setIsReviewLoading(true)
    try {
      const prUrl = buildPrUrl(repoName, reviewPrNumber.trim())
      const { data: existingProgress, error: progressFetchErr } = await supabase
        .from("task_progress")
        .select("id")
        .eq("student_id", studentId)
        .eq("task_id", activeTaskId)
        .limit(1)
      if (progressFetchErr) throw progressFetchErr

      if (existingProgress && existingProgress.length > 0) {
        const { error: progressUpdateErr } = await supabase
          .from("task_progress")
          .update({ status: "submitted", submission_url: prUrl })
          .eq("id", existingProgress[0].id)
        if (progressUpdateErr) throw progressUpdateErr
      } else {
        const { error: progressInsertErr } = await supabase
          .from("task_progress")
          .insert({
            student_id: studentId,
            task_id: activeTaskId,
            status: "submitted",
            submission_url: prUrl,
          })
        if (progressInsertErr) throw progressInsertErr
      }

      const res = await fetch(
        `/api/agent/review?repo_name=${encodeURIComponent(repoName)}&pr_number=${encodeURIComponent(reviewPrNumber)}`,
        { method: "POST" }
      )

      const body = await res.json().catch(() => ({} as any))
      if (!res.ok) {
        const detail = (body as any)?.detail || (body as any)?.error || `Review error: ${res.status}`
        throw new Error(detail)
      }

      const maybeMessage =
        (body as any)?.message ||
        (body as any)?.detail ||
        (body as any)?.error ||
        ""
      const noReviewable =
        typeof maybeMessage === "string" &&
        maybeMessage.toLowerCase().includes("no reviewable tasks")

      if (noReviewable) {
        alert("Review did not run: no reviewable tasks found for this environment. Please ensure at least one task is in submitted/in_progress status before requesting review.")
        return
      }

      setShowReviewModal(false)
      setReviewPrNumber("")
      fetchPrReviews()
      fetchProjectTasks()

      const createdCount =
        Number((body as any)?.reviews_created ?? (body as any)?.created ?? 0) ||
        0
      if (createdCount === 0) {
        alert("Review request sent, but no new review record was created yet. Please refresh after a few seconds.")
      }
    } catch (e) {
      console.error("Manual review error:", e)
      alert(e instanceof Error ? e.message : "Failed to trigger review. Make sure the CodeReviewer agent is running.")
    } finally {
      setIsReviewLoading(false)
    }
  }

  /** Tasks from public.tasks for a virtual_environment (company-created projects). */
  const fetchVirtualEnvironmentTasks = async (environmentId: string) => {
    setLoadingTasks(true)
    setProjectTasks([])
    try {
      const { data: taskRows, error: tErr } = await supabase
        .from("tasks")
        .select("task_id, title, description, task_order")
        .eq("environment_id", environmentId)
        .order("task_order", { ascending: true })
      if (tErr) throw tErr

      const ids = (taskRows || []).map((r: any) => r.task_id)
      const progressByTask: Record<string, string> = {}
      if (ids.length > 0) {
        const { data: prog } = await supabase
          .from("task_progress")
          .select("task_id, status")
          .eq("student_id", studentId)
          .in("task_id", ids)
        for (const row of prog || []) {
          progressByTask[(row as any).task_id] = (row as any).status
        }
      }

      const mapped: any[] = []
      ;(taskRows || []).forEach((row: any, idx: number) => {
        const p = progressByTask[row.task_id]
        const prevStatus = idx > 0 ? mapped[idx - 1]?.status : undefined
        const status = resolveTaskStatus(p, idx, prevStatus)
        mapped.push({
          task_id: row.task_id,
          title: row.title,
          description: row.description || "",
          status,
          role: studentRole,
          assignee: studentId,
          task_order: row.task_order,
        })
      })

      setProjectTasks(mapped)
      setHasAssignedTask(mapped.length > 0)

      const currentUrlTaskId = searchParams.get("taskId")
      if (mapped.length > 0 && !activeTaskId && !currentUrlTaskId) {
        const defaultTask = mapped.find((t: any) => t.status === "in_progress") || mapped.find((t: any) => t.status === "unlocked") || mapped[0]
        setActiveTaskId(defaultTask.task_id)
        updateUrlParams({ taskId: defaultTask.task_id })
      }
    } catch (e) {
      console.error("fetchVirtualEnvironmentTasks", e)
      setProjectTasks([])
      setHasAssignedTask(false)
    } finally {
      setLoadingTasks(false)
    }
  }

  // Legacy tasks-duo-1 path OR virtual_environment tasks from public.tasks
  const fetchProjectTasks = async () => {
    if (!studentId) return

    if (!selectedProject) {
      setProjectTasks([])
      setHasAssignedTask(false)
      return
    }

    if (isVirtualEnvironmentProjectId(selectedProject)) {
      await fetchVirtualEnvironmentTasks(selectedProject)
      return
    }

    setLoadingTasks(true)
    try {
      const { data: existingData, error } = await supabase
        .from("tasks-duo-1")
        .select("*")
        .eq("assigned-to", studentId)
        .order("task_order", { ascending: true })

      if (error) throw error

      let currentTasks = (existingData || []).map((row: any) => ({
        task_id: row.task_id,
        title: row.task,
        description: row["task-description"],
        status: row.status,
        role: row.role,
        assignee: row["assigned-to"],
        task_order: row.task_order,
      }))

      const hasInProgress = currentTasks.some((t) => t.status === "in_progress")
      const hasTasks = currentTasks.length > 0

      if (hasTasks && !hasInProgress) {
        const lastTask = currentTasks[currentTasks.length - 1]
        const lastOrder = lastTask.task_order

        let roleFilter: string[] = []
        if (studentRole === "fullstack") {
          roleFilter = ["frontend", "backend"]
        } else {
          roleFilter = [studentRole]
        }

        const { data: nextMasterTask, error: nextError } = await supabase
          .from("tasks")
          .select("*")
          .in("role", roleFilter)
          .gt("task_order", lastOrder)
          .order("task_order", { ascending: true })
          .limit(1)
          .single()

        if (!nextError && nextMasterTask) {
          const { data: newAssignedTask, error: insertError } = await supabase
            .from("tasks-duo-1")
            .insert({
              task_id: nextMasterTask.task_id,
              task: nextMasterTask.title,
              "task-description": nextMasterTask.description,
              role: nextMasterTask.role,
              "assigned-to": studentId,
              status: "in_progress",
              task_order: nextMasterTask.task_order,
              created_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (!insertError && newAssignedTask) {
            const mappedNewTask = {
              task_id: newAssignedTask.task_id,
              title: newAssignedTask.task,
              description: newAssignedTask["task-description"],
              status: newAssignedTask.status,
              role: newAssignedTask.role,
              assignee: newAssignedTask["assigned-to"],
              task_order: newAssignedTask.task_order,
            }
            currentTasks = [...currentTasks, mappedNewTask]
            setActiveTaskId(mappedNewTask.task_id)
            updateUrlParams({ taskId: mappedNewTask.task_id })
          }
        }
      }

      setProjectTasks(currentTasks)
      setHasAssignedTask(currentTasks.length > 0)

      const currentUrlTaskId = searchParams.get("taskId")
      if (currentTasks.length > 0 && !activeTaskId && !currentUrlTaskId) {
        const defaultTask =
          currentTasks.find((t) => t.status === "in_progress") || currentTasks[currentTasks.length - 1]
        setActiveTaskId(defaultTask.task_id)
        updateUrlParams({ taskId: defaultTask.task_id })
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
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

  useEffect(() => {
    if (!selectedProject || !isVirtualEnvironmentProjectId(selectedProject)) {
      setPreviewTasks([])
      return
    }
    if (joinedEnvironmentIds.includes(selectedProject)) {
      setPreviewTasks([])
      return
    }
    let cancelled = false
    setLoadingPreviewTasks(true)
    void supabase
      .from("tasks")
      .select("task_id, title, task_order")
      .eq("environment_id", selectedProject)
      .order("task_order", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data)
          setPreviewTasks(
            data as Array<{ task_id: string; title: string; task_order: number }>
          )
        else setPreviewTasks([])
        setLoadingPreviewTasks(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedProject, joinedEnvironmentIds])

  useEffect(() => {
    void fetchEnvironmentRepo()
  }, [selectedProject, studentId])

  // Fetch tasks/resources for board + task details views after environment join checks.
  useEffect(() => {
    if (mode !== "project" && mode !== "task_details") return
    if (!selectedProject) return
    if (
      isVirtualEnvironmentProjectId(selectedProject) &&
      !joinedEnvironmentIds.includes(selectedProject)
    ) {
      return
    }
    if (isVirtualEnvironmentProjectId(selectedProject) && !environmentRepoUrl) {
      return
    }
    fetchProjectTasks()
    fetchProjectResources()
  }, [mode, selectedProject, joinedEnvironmentIds, environmentRepoUrl])

  // Derived UI state + sidebar sync — must run before any early return (Rules of Hooks)
  const isVirtualSelectedProject = Boolean(
    selectedProject && isVirtualEnvironmentProjectId(selectedProject)
  )
  const hasJoinedVirtualWorkspace =
    !selectedProject ||
    !isVirtualSelectedProject ||
    joinedEnvironmentIds.includes(selectedProject)

  const currentSelectedModule = MOCK_LEARNING_MODULES.find(m => m.id === selectedModule)
  const currentSelectedProject = projects.find(p => p.project_id === selectedProject) ||
    STATIC_PROJECTS.find(p => p.project_id === selectedProject) ||
    null

  const displayTasks =
    projectTasks.length > 0
      ? projectTasks
      : projects.length === 0 &&
          selectedProject &&
          STATIC_PROJECT_TASKS[selectedProject]
        ? STATIC_PROJECT_TASKS[selectedProject].map((t, idx) => ({
            task_id: t.task_id,
            title: t.title,
            status: t.status,
            role: t.role,
            assignee: studentId,
            task_order: idx + 1,
            description: t.title,
          }))
        : []

  const activeTask =
    displayTasks.length > 0
      ? (activeTaskId
          ? displayTasks.find(t => t.task_id === activeTaskId) || null
          : null)
      : null

  const activeTaskTopics: TaskTopic[] =
    activeTask
      ? (taskTopics[activeTask.task_id] ?? []).filter(topic =>
          activeResourceId ? topic.resourceId === activeResourceId : true
        )
      : []

  const learningQA = messages.filter(m => selectedAgent === "teacher")

  useEffect(() => {
    if (student) setSidebarStudent(student)
  }, [student, setSidebarStudent])

  const handleSidebarModeChange = useCallback((m: "project" | "task_details" | "learn") => {
    handleModeChange(m)
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSidebarTaskSelect = useCallback((taskId: string) => {
    // Selecting a task from sidebar should always land in Task Details mode.
    setMode("task_details")
    setActiveTaskId(taskId)
    setSelectedPrId(null)
    setActiveResourceId(null)
    setSelectedTopicId(null)
    updateUrlParams({ mode: "task_details", taskId, prId: null, resourceId: null })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSidebarBack = useCallback(() => {
    handleBackToEnvironments()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedProject && currentSelectedProject) {
      setWorkspace({
        company: company ? { name: company.name } : null,
        environment: {
          id: currentSelectedProject.project_id,
          name: currentSelectedProject.name,
          status: currentSelectedProject.status || "active",
        },
        tasks: displayTasks.map((t: any) => ({
          task_id: t.task_id,
          title: t.title,
          status: t.status,
        })),
        activeTaskId,
        mode,
        onModeChange: handleSidebarModeChange,
        onTaskSelect: handleSidebarTaskSelect,
        onBackToEnvironments: handleSidebarBack,
      })
    } else {
      setWorkspace(null)
    }
  }, [
    selectedProject, currentSelectedProject, company, displayTasks, activeTaskId, mode,
    setWorkspace, handleSidebarModeChange, handleSidebarTaskSelect, handleSidebarBack,
  ])

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

  if (isAuthorized === false) {
    return null
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <GlobalStyles />
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden p-3 relative">
          {!selectedProject ? (
                <div className="flex-1 flex flex-col overflow-y-auto px-6 py-8">
                  <div className="max-w-4xl mx-auto w-full">
                    <p className="text-[11px] uppercase tracking-wide text-white/40 mb-1">Projects</p>
                    <h1 className="text-[22px] font-semibold text-white mb-2">Virtual environments</h1>
                    <p className="text-[14px] text-white/55 mb-8 max-w-xl">
                      Pick an environment to open its task board. You can switch anytime from the sidebar or by going back here.
                    </p>
                    {environmentProjectsForPicker.length === 0 ? (
                      <p className="text-[13px] text-white/60">No environments available yet.</p>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {environmentProjectsForPicker.map((project) => (
                          <button
                            key={project.project_id}
                            type="button"
                            onClick={() => handleProjectClick(project.project_id)}
                            className="text-left rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/25 hover:bg-white/10"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-medium text-[15px] text-white">{project.name}</h3>
                              <Badge variant="secondary" className="text-[10px] bg-white/10 text-white border-white/20 capitalize shrink-0">
                                {project.status || "active"}
                              </Badge>
                            </div>
                            <p className="text-[12px] text-white/55 line-clamp-3 mb-3">
                              {project.description || "No description"}
                            </p>
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
                </div>
              ) : selectedProject && isVirtualSelectedProject && !hasJoinedVirtualWorkspace ? (
                <div className="flex-1 flex flex-col overflow-y-auto px-6 py-8">
                  <div className="max-w-3xl mx-auto w-full space-y-8">
                    <button
                      type="button"
                      onClick={handleBackToEnvironments}
                      className="inline-flex items-center gap-1 text-[13px] text-white/60 hover:text-white transition-colors rounded-lg px-2 py-1.5 hover:bg-white/5 -ml-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      All environments
                    </button>

                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-emerald-400/90 mb-2">
                        {company?.name}
                      </p>
                      <h1 className="text-[26px] font-semibold text-white mb-3">
                        {currentSelectedProject?.name || "Environment"}
                      </h1>
                      <Badge variant="secondary" className="text-[10px] bg-white/10 text-white border-white/20 capitalize">
                        {currentSelectedProject?.status || "open"}
                      </Badge>
                    </div>

                    {(company?.description || company?.mission) && (
                      <div>
                        <h2 className="text-[13px] font-medium text-white/80 mb-2">About the company</h2>
                        <p className="text-[14px] text-white/55 leading-relaxed">
                          {company.description || company.mission}
                        </p>
                      </div>
                    )}

                    <div>
                      <h2 className="text-[13px] font-medium text-white/80 mb-2">Environment overview</h2>
                      <p className="text-[14px] text-white/55 leading-relaxed whitespace-pre-wrap">
                        {currentSelectedProject?.description || "No description provided."}
                      </p>
                    </div>

                    <div>
                      <h2 className="text-[13px] font-medium text-white/80 mb-2">Tech stack</h2>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(currentSelectedProject?.tech_stack)
                          ? currentSelectedProject.tech_stack
                          : []
                        ).map((tech: string) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="text-[11px] border-white/20 text-white bg-white/5"
                          >
                            {tech}
                          </Badge>
                        ))}
                        {(!currentSelectedProject?.tech_stack ||
                          currentSelectedProject.tech_stack.length === 0) && (
                          <span className="text-[13px] text-white/40">Not specified</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-[13px] font-medium text-white/80 mb-3">Deliverables (tasks)</h2>
                      {loadingPreviewTasks ? (
                        <div className="flex items-center gap-2 text-[13px] text-white/50">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Loading outline…
                        </div>
                      ) : previewTasks.length === 0 ? (
                        <p className="text-[13px] text-white/45">No tasks published for this environment yet.</p>
                      ) : (
                        <ol className="list-decimal list-inside space-y-2 text-[14px] text-white/75">
                          {previewTasks.map((t) => (
                            <li key={t.task_id} className="pl-1">
                              <span className="text-white/90">{t.title}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-[13px] text-white/50 mb-4">
                        Join this environment to unlock the task board, progress tracking, and learning tools.
                      </p>
                      <Button
                        type="button"
                        onClick={handleJoinEnvironment}
                        disabled={isJoiningEnvironment}
                        className="h-11 px-8 text-[15px] bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/30"
                      >
                        {isJoiningEnvironment ? (
                          <>
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 align-middle" />
                            Joining…
                          </>
                        ) : (
                          "Join environment"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : selectedProject && isVirtualSelectedProject && hasJoinedVirtualWorkspace && (!environmentRepoUrl || isRepoLoading) ? (
                <div className="flex-1 flex flex-col overflow-y-auto px-6 py-8">
                  <div className="max-w-2xl mx-auto w-full">
                    <button
                      type="button"
                      onClick={handleBackToEnvironments}
                      className="inline-flex items-center gap-1 text-[13px] text-white/60 hover:text-white transition-colors rounded-lg px-2 py-1.5 hover:bg-white/5 -ml-2 mb-6"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      All environments
                    </button>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300/80">Required setup</p>
                      <h2 className="text-[22px] font-semibold text-white">Connect your project repository</h2>
                      <p className="text-[14px] text-white/60">
                        Before starting tasks, paste your GitHub repository URL for this environment.
                        We will use this repo automatically for code reviews.
                      </p>

                      {isRepoLoading ? (
                        <div className="flex items-center gap-2 text-[13px] text-white/50">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Loading repository setup...
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">GitHub Repository URL</label>
                            <input
                              type="url"
                              value={repoInputUrl}
                              onChange={(e) => setRepoInputUrl(e.target.value)}
                              placeholder="https://github.com/owner/repo"
                              className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-all text-sm"
                            />
                          </div>

                          <Button
                            type="button"
                            onClick={saveEnvironmentRepo}
                            disabled={isSavingRepo || !repoInputUrl.trim()}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            {isSavingRepo ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Saving...
                              </>
                            ) : (
                              "Save & Continue"
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : loadingTasks ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              ) : displayTasks.length > 0 ? (
                mode === "project" ? (
                <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
                  {/* Kanban Board */}
                  <div className="px-6 py-4 border-b border-white/10 overflow-hidden min-w-0 flex flex-col max-h-[50%] flex-shrink-0">
                    <div className="flex flex-wrap items-center gap-3 mb-4 flex-shrink-0">
                      <button
                        type="button"
                        onClick={handleBackToEnvironments}
                        className="inline-flex items-center gap-1 text-[13px] text-white/60 hover:text-white transition-colors rounded-lg px-2 py-1.5 hover:bg-white/5 -ml-2 shrink-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        All environments
                      </button>
                      <h2 className="text-[17px] font-semibold text-white flex items-center gap-2 min-w-0">
                        <Columns className="w-5 h-5 text-white/70 shrink-0" />
                        <span className="truncate">Task Board – {currentSelectedProject?.name || "Project"}</span>
                      </h2>
                    </div>
                    <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto pb-1">
                      <div className="flex gap-3 min-w-max h-full">
                      {([
                        { id: "locked", label: "Locked", icon: Lock, color: "border-zinc-700/50 bg-zinc-800/30" },
                        { id: "unlocked", label: "Unlocked", icon: Unlock, color: "border-violet-500/30 bg-violet-500/5" },
                        { id: "in_progress", label: "In Progress", icon: Clock, color: "border-blue-500/30 bg-blue-500/5" },
                        { id: "submitted", label: "Submitted", icon: Clock, color: "border-amber-500/30 bg-amber-500/5" },
                        { id: "approved", label: "Approved", icon: CheckCircle2, color: "border-emerald-500/30 bg-emerald-500/5" },
                      ] as const).map(col => {
                        const colTasks = displayTasks.filter((t: any) => t.status === col.id)
                        const ColIcon = col.icon
                        return (
                          <div
                            key={col.id}
                            className={`w-[240px] shrink-0 rounded-xl border ${col.color} min-h-[180px] p-3 flex flex-col`}
                          >
                            <div className="flex items-center justify-between mb-3 flex-shrink-0">
                              <span className="text-[12px] font-medium text-white/80 flex items-center gap-1.5">
                                <ColIcon className="w-3.5 h-3.5" />
                                {col.label}
                              </span>
                              <span className="text-[11px] text-white/40">{colTasks.length}</span>
                            </div>
                            <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
                              {colTasks.map((task: any) => {
                                const isActive = activeTaskId === task.task_id
                                const isLocked = task.status === "locked"
                                return (
                                  <button
                                    key={task.task_id}
                                    disabled={isLocked}
                                    onClick={() => {
                                      if (isLocked) return
                                      setActiveTaskId(task.task_id)
                                      setSelectedPrId(null)
                                      setActiveResourceId(null)
                                      setSelectedTopicId(null)
                                      updateUrlParams({ taskId: task.task_id, prId: null, resourceId: null })
                                    }}
                                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                                      isLocked
                                        ? "bg-zinc-900/50 border-zinc-800/50 opacity-50 cursor-not-allowed"
                                        : isActive
                                          ? "bg-white/15 border-white/30"
                                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <p className={`text-[13px] font-medium ${isLocked ? "text-white/40" : "text-white"}`}>{task.title}</p>
                                      {isLocked && <Lock className="w-3 h-3 text-white/30 shrink-0 mt-0.5" />}
                                      {task.status === "approved" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2">
                                      <Badge variant="outline" className="text-[10px] border-white/20 text-white/60 capitalize">
                                        {task.role}
                                      </Badge>
                                      {task.status === "unlocked" && (
                                        <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400 bg-violet-500/10">
                                          Ready
                                        </Badge>
                                      )}
                                      {task.status === "submitted" && (
                                        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 bg-amber-500/10">
                                          Pending Review
                                        </Badge>
                                      )}
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                      </div>
                    </div>
                  </div>

                  {/* PM Agent Chat below the Kanban */}
                  <div className="flex-1 min-h-[300px] p-3 pt-0">
                    <PmAgentChat
                      studentId={studentId}
                      environmentId={selectedProject}
                      companyName={company?.name}
                      studentInitial={student?.full_name?.charAt(0) || student?.name?.charAt(0) || "U"}
                    />
                  </div>
                </div>
                ) : mode === "task_details" ? (
                <div className="flex-1 flex flex-col overflow-y-auto px-6 py-6">
                  <div className="max-w-6xl mx-auto w-full pb-24 px-6 font-sans antialiased selection:bg-emerald-500/30">
                    <div className="flex items-center gap-3 mb-6">
                      <button
                        type="button"
                        onClick={handleBackToEnvironments}
                        className="inline-flex items-center gap-1 text-[13px] text-white/60 hover:text-white transition-colors rounded-lg px-2 py-1.5 hover:bg-white/5 -ml-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        All environments
                      </button>
                      <h2 className="text-[18px] font-semibold text-white">Task Details</h2>
                    </div>

                    {!activeTask && (
                      <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-600">
                        <p className="text-sm font-light">Select a task to view details</p>
                      </div>
                    )}

                    {activeTask && selectedPrId ? (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-300 pt-2">
                        {(() => {
                          const pr = realPrs.find((p) => p.id === selectedPrId)
                          if (!pr) return <div className="text-zinc-500 font-mono text-sm">Loading or PR Not Found...</div>

                          const normalizedStatus = pr.status === "accepted" ? "approved" : pr.status

                          return (
                            <div className="max-w-4xl mx-auto">
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

                              <header className="mb-10 pb-8 border-b border-zinc-800/50">
                                <div className="flex justify-between items-start gap-6">
                                  <div>
                                    <h1 className="text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 leading-tight tracking-tight mb-3 drop-shadow-sm">
                                      {pr.title}
                                    </h1>
                                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                                      <span className="flex items-center gap-1.5">
                                        <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400">
                                          {pr.author?.charAt(0)}
                                        </div>
                                        {pr.author}
                                      </span>
                                      <span>•</span>
                                      <span>{pr.timestamp}</span>
                                      <span>•</span>
                                      <a href={pr.pr_url} target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                                        View on GitHub <ChevronRight className="w-3 h-3" />
                                      </a>
                                    </div>
                                  </div>

                                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium uppercase tracking-wider shadow-sm
                                    ${normalizedStatus === "approved" ? "border-emerald-900/30 bg-emerald-500/5 text-emerald-500" : ""}
                                    ${normalizedStatus === "rejected" || normalizedStatus === "changes_requested" ? "border-rose-900/30 bg-rose-500/5 text-rose-500" : ""}
                                    ${normalizedStatus === "pending" || normalizedStatus === "submitted" ? "border-amber-900/30 bg-amber-500/5 text-amber-500" : ""}
                                  `}>
                                    <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_6px_currentColor] ${
                                      normalizedStatus === "approved" ? "bg-emerald-500" : (normalizedStatus === "rejected" || normalizedStatus === "changes_requested") ? "bg-rose-500" : "bg-amber-500"
                                    }`} />
                                    {normalizedStatus}
                                  </div>
                                </div>
                              </header>

                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="lg:col-span-2 space-y-10">
                                  <section>
                                    <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                      <Sparkles className="w-3 h-3" /> Analysis Summary
                                    </h3>
                                    <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-lg p-5">
                                      <p className="text-[14px] leading-7 text-zinc-300 font-light">{pr.summary}</p>
                                    </div>
                                  </section>

                                  <section>
                                    <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">Key Improvements & Issues</h3>
                                    <div className="border border-zinc-800/50 rounded-lg bg-zinc-900/10 overflow-hidden">
                                      {pr.issues && pr.issues.length > 0 ? (
                                        <ul className="divide-y divide-zinc-800/50">
                                          {pr.issues.map((issue, idx) => (
                                            <li key={idx} className="p-4 flex items-start gap-4 group hover:bg-zinc-900/30 transition-colors">
                                              <div className="mt-1 flex-shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 group-hover:bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]" />
                                              </div>
                                              <p className="text-sm text-zinc-400 group-hover:text-zinc-200 leading-relaxed font-light">{issue}</p>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <div className="p-8 text-center text-zinc-600 text-sm italic">No critical issues found. Great job!</div>
                                      )}
                                    </div>
                                  </section>
                                </div>

                                <div className="space-y-8">
                                  <div className="border border-zinc-800/60 rounded-lg p-5 bg-zinc-900/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 blur-[40px] rounded-full pointer-events-none"></div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Quality Score</div>
                                    <div className="flex items-baseline gap-1 relative z-10">
                                      <span className={`text-4xl font-medium tracking-tighter bg-clip-text text-transparent bg-gradient-to-b ${pr.score > 80 ? "from-emerald-300 to-emerald-600" : "from-rose-300 to-rose-600"}`}>
                                        {pr.score}
                                      </span>
                                      <span className="text-sm text-zinc-600">/100</span>
                                    </div>
                                  </div>

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
                                      <span className="text-zinc-300 capitalize">{normalizedStatus}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    ) : (
                      <>
                        {activeTask && currentSelectedProject && (
                          <div className="space-y-12 animate-in fade-in duration-500 pt-2">
                            <header className="space-y-6">
                              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-6">
                                <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                                  <span className="px-2 py-1 bg-zinc-900 rounded border border-zinc-800 text-zinc-400">
                                    {currentSelectedProject.name.toUpperCase()}
                                  </span>
                                  <span className="text-zinc-700">/</span>
                                  <span>TASK-{activeTask.task_order ?? "—"}</span>
                                </div>

                                <span className={`text-[10px] uppercase tracking-widest font-medium px-2 py-1 rounded ${activeTask.status === "approved" ? "text-emerald-500" : "text-zinc-500"}`}>
                                  {activeTask.status.replace("_", " ")}
                                </span>
                              </div>

                              <div className="max-w-3xl">
                                <h1 className="text-4xl font-medium text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 tracking-tight mb-4 leading-tight drop-shadow-sm">
                                  {activeTask.title}
                                </h1>
                                <p className="text-zinc-400 text-base font-light leading-relaxed">
                                  {activeTask.description || activeTask.title}
                                </p>
                              </div>
                            </header>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-zinc-800/30 pt-10">
                              <div className="lg:col-span-8 space-y-6">
                                <div className="flex items-baseline justify-between mb-2">
                                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Task Resources</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                  {taskResources[activeTask.task_id]?.length > 0 ? (
                                    taskResources[activeTask.task_id].map((res) => {
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
                                            ${isThisStreaming ? "bg-emerald-950/10 border-emerald-500/20 ring-1 ring-emerald-500/20" : "bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50"}
                                          `}
                                        >
                                          {!isThisStreaming && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                                          )}

                                          <div className="flex items-center gap-4 relative z-10">
                                            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors shadow-sm
                                              ${isThisStreaming ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-500 group-hover:text-zinc-300 group-hover:border-zinc-600"}
                                            `}>
                                              {isThisStreaming ? (
                                                <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                              ) : (
                                                <BookOpen className="w-4 h-4" />
                                              )}
                                            </div>
                                            <div>
                                              <h4 className={`text-sm font-medium transition-colors ${isThisStreaming ? "text-emerald-100" : "text-zinc-300 group-hover:text-white"}`}>{res.question}</h4>
                                              {isThisStreaming ? (
                                                <div className="flex items-center gap-2 mt-1.5">
                                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                  <span className="text-[10px] font-mono text-emerald-400 animate-pulse tracking-wide uppercase">{streamStatus || "INITIALIZING..."}</span>
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-600 font-mono">
                                                  <span className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[9px] uppercase text-zinc-500">AI Generated</span>
                                                  <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>

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
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="lg:col-span-4 space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Submission History</h3>
                                  <button
                                    type="button"
                                    onClick={() => setShowReviewModal(true)}
                                    className="text-[10px] text-zinc-500 hover:text-zinc-300 border-b border-zinc-800 hover:border-zinc-500 transition-all pb-0.5"
                                  >
                                    REQUEST REVIEW
                                  </button>
                                </div>

                                <div className="relative pl-2 space-y-0">
                                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-800"></div>
                                  {realPrs.map((pr, idx) => {
                                    const normalizedStatus = pr.status === "accepted" ? "approved" : pr.status
                                    return (
                                      <div key={pr.id} className="relative pl-8 py-3 group">
                                        <div className={`absolute left-[3px] top-5 w-[5px] h-[5px] rounded-full z-10
                                          ${normalizedStatus === "approved" ? "bg-emerald-500" : ""}
                                          ${(normalizedStatus === "rejected" || normalizedStatus === "changes_requested") ? "bg-rose-500" : ""}
                                          ${(normalizedStatus === "pending" || normalizedStatus === "submitted") ? "bg-zinc-600" : ""}
                                        `}></div>

                                        <button
                                          onClick={() => updateUrlParams({ prId: pr.id })}
                                          className="block w-full text-left hover:cursor-pointer p-3 rounded-md hover:bg-zinc-900/50 transition-colors"
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-zinc-300 group-hover:text-white font-medium transition-colors truncate max-w-[150px]">{pr.title}</span>
                                            <span className="text-[9px] text-zinc-600 font-mono flex-shrink-0">{pr.timestamp}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className={`text-[9px] uppercase tracking-wider font-medium
                                              ${normalizedStatus === "approved" ? "text-emerald-500" : ""}
                                              ${(normalizedStatus === "rejected" || normalizedStatus === "changes_requested") ? "text-rose-500" : ""}
                                              ${(normalizedStatus === "pending" || normalizedStatus === "submitted") ? "text-zinc-500" : ""}
                                            `}>
                                              {normalizedStatus}
                                            </span>
                                            {idx === 0 && <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 rounded">LATEST</span>}
                                          </div>
                                        </button>
                                      </div>
                                    )
                                  })}
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
                </div>
                ) : (
                <div className="flex-1 flex flex-col overflow-y-auto px-6 py-6">
                  <div className="max-w-4xl mx-auto w-full space-y-6">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleBackToEnvironments}
                        className="inline-flex items-center gap-1 text-[13px] text-white/60 hover:text-white transition-colors rounded-lg px-2 py-1.5 hover:bg-white/5 -ml-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        All environments
                      </button>
                      <h2 className="text-[18px] font-semibold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-white/70" />
                        Environment Learn
                      </h2>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-2">Environment Context</p>
                      <h3 className="text-[22px] font-semibold text-white mb-2">{currentSelectedProject?.name || "Environment"}</h3>
                      <p className="text-[14px] text-white/60 leading-relaxed">
                        This area will host environment-aware learning with AI mentor support, tied to your selected workspace and its tasks.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                        <p className="text-[12px] font-medium text-white mb-1">Context-aware concepts</p>
                        <p className="text-[12px] text-white/55">Learn architecture, patterns, and stack topics specific to this environment.</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                        <p className="text-[12px] font-medium text-white mb-1">Task-linked mentoring</p>
                        <p className="text-[12px] text-white/55">Agent guidance will align with selected tasks, milestones, and PR feedback.</p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 text-[12px] text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-full px-3 py-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Environment Learn agent UI coming soon
                    </div>
                  </div>
                </div>
                )
          ) : (
                <div className="flex-1 flex items-center justify-center px-6">
                  <div className="max-w-2xl w-full text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                        <FolderKanban className="w-10 h-10 text-white/70" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h1 className="text-[32px] font-bold text-white leading-tight">
                        {currentSelectedProject?.name || "Welcome to Your Project"}
                      </h1>
                      <p className="text-[16px] text-white/70 leading-relaxed max-w-xl mx-auto">
                        {currentSelectedProject?.description ||
                          "Get started by taking on your first task. We'll guide you through each step with personalized learning resources."}
                      </p>
                    </div>
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
                    <div className="pt-4 border-t border-white/10 max-w-xs mx-auto">
                      <p className="text-[12px] text-white/50 mb-2">Your assigned role:</p>
                      <Badge variant="outline" className="text-[13px] border-white/20 text-white bg-white/10 capitalize px-4 py-1.5">
                        {studentRole}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
        </div>


      {/* Manual Code Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#181a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-semibold text-white">Request Code Review</h3>
                </div>
                <button onClick={() => setShowReviewModal(false)} className="text-white/50 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Repository</label>
                  <div className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white/85 text-sm truncate">
                    {environmentRepoUrl || "No repository configured"}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">PR Number</label>
                  <input
                    type="text"
                    value={reviewPrNumber}
                    onChange={(e) => setReviewPrNumber(e.target.value)}
                    placeholder="e.g. 42"
                    className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-white/10 bg-white/5">
                <Button variant="ghost" onClick={() => setShowReviewModal(false)} className="text-white/70 hover:text-white hover:bg-white/10 text-xs">
                  Cancel
                </Button>
                <Button
                  onClick={handleManualReview}
                  disabled={isReviewLoading || !parseRepoNameFromUrl(environmentRepoUrl) || !reviewPrNumber.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  {isReviewLoading ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Reviewing...</>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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