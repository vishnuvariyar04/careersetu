"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { AIChat } from "@/components/ai-chat"
import { Users, CheckSquare, BarChart3, BookOpen, User, Clock, AlertCircle, CheckCircle, Circle, LayoutPanelTop, PanelRightClose, PanelRightOpen, LayoutGrid, GraduationCap } from "lucide-react"
import { useParams } from "next/navigation"
import { TeammatesList } from "@/components/teammates-list"
import { supabase } from "@/lib/supabase"
// import { set } from "date-fns"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { AspectRatio } from "@/components/ui/aspect-ratio"
// import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const teamData = {
  1: {
    name: "Alpha Team",
    project: "E-commerce Platform",
    members: [
      { id: 1, name: "Sarah Chen", role: "Frontend Developer", avatar: "SC", status: "online" },
      { id: 2, name: "Mike Johnson", role: "UI/UX Designer", avatar: "MJ", status: "away" },
      { id: 3, name: "You", role: "Backend Developer", avatar: "YU", status: "online" },
    ],
    progress: 65,
  },
}

const initialPMMessages: any = [
  // {
  //   id: "1",
  //   content:
  //     "Hello! I'm your PM Agent assistant. I'm here to help you with understanding customer needs and identifying improvement opportunities. How can I assist you today?",
  //   role: "assistant" as const,
  //   timestamp: new Date(Date.now() - 3600000),
  //   type: "general" as const,
  // },
  // {
  //   id: "2",
  //   content: "New task assigned: Database schema design. Check your task tracker for details.",
  //   role: "assistant" as const,
  //   timestamp: new Date(Date.now() - 1800000),
  //   type: "task_assignment" as const,
  // },
]

const initialLearningMessages = [
  {
    id: "1",
    content:
      "Welcome to your personalized learning experience! I can help you understand any technology, provide step-by-step tutorials, and create practice exercises tailored to your current project needs. What would you like to learn today?",
    role: "assistant" as const,
    timestamp: new Date(Date.now() - 7200000),
    type: "general" as const,
  },
]

export default function TeamWorkspacePage() {
  const [activeTab, setActiveTab] = useState("tasks")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [focusMode, setFocusMode] = useState(false)
  const [selectionBar, setSelectionBar] = useState<{ visible: boolean; text: string; taskId: string | null; x: number; y: number }>({ visible: false, text: "", taskId: null, x: 0, y: 0 })
  const [learningPrefill, setLearningPrefill] = useState<string>("")
  const [learningPaneKey, setLearningPaneKey] = useState<number>(0)
  const params = useParams()
  const teamId = Number(params.team_id)
  const projectId = params.project_id
  const studentId = params.student_id
  const companyId = params.company_id
  const team = teamData[teamId as keyof typeof teamData]

  // Change from `[]` to `{}`
const [teammateDetails, setTeammateDetails] = useState<{ [key: string]: any }>({});

useEffect(() => {
    const fetchTeammateDetails = async () => {
      // Step 1: Fetch all member records from `team_members`
      const { data: membersData, error: membersError } = await supabase
        .from("team_members")
        .select("student_id") // We only need the student_id from this table
        .eq("team_id", params.team_id);

      if (membersError) {
        console.error("Error fetching team members:", membersError);
        return;
      }

      if (!membersData || membersData.length === 0) {
        return; // No members in this team
      }

      // Extract the student IDs into a simple array
      const studentIds = membersData.map((member) => member.student_id);

      // Step 2: Fetch the details for those students from the `students` table
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*") // Get all details for each student
        .in("student_id", studentIds); // Use the `.in()` filter to get all of them in one query

      if (studentsError) {
        console.error("Error fetching student details:", studentsError);
        return;
      }

      // Create the final lookup map: { student_id_1: {details}, student_id_2: {details} }
      if (studentsData) {
        const detailsMap = studentsData.reduce((acc, student) => {
          acc[student.student_id] = student;
          return acc;
        }, {});
        
        // Set the final object to your state

        console.log("Teammate Details Map:", detailsMap);
        setTeammateDetails(detailsMap);
      }
    };

    fetchTeammateDetails();
  }, []); // Make sure to re-run if the team_id changes

  const [tasks, setTask] = useState<any>([])
  const personalTasks = tasks.filter((t: any) => t.assignee === params.student_id)
  const selectedTask = selectedTaskId ? tasks.find((t: any) => String(t.id) === String(selectedTaskId)) : null

useEffect(() => {
  const fetchTask = async () => {
    const { data, error } = await supabase
      .from("tasks-duo-1")
      .select("*")
      .eq("team_id", params.team_id)

    if (error) {
      console.error("Error fetching tasks:", error)
      setTask([]) // Set to empty array on error
      return
    }

    if (data) {
      const transformedTasks = data.map((task: any) => ({
        id: task.id,
        title: task.task,
        description: task["task-description"],
        status: task.status,
        assignee: task["assigned-to"],
        priority: task.priority || "medium",
        dueDate: task.dueDate || new Date(task.created_at).toISOString().split("T")[0],
        tags: task.tags || [],
      }))
      setTask(transformedTasks)
      console.log("Fetched and transformed task data:", transformedTasks)
    } else {
      setTask([])
    }
  }

  fetchTask()

  // ✅ Realtime subscription
  const channel = supabase
    .channel("tasks-duo-1-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks-duo-1", filter: `team_id=eq.${params.team_id}` },
      (payload) => {
        console.log("Realtime change received:", payload)

        if (payload.eventType === "INSERT") {
          const newTask = {
            id: payload.new.id,
            title: payload.new.task,
            description: payload.new["task-description"],
            status: payload.new.status,
            assignee: payload.new["assigned-to"],
            priority: payload.new.priority || "medium",
            dueDate:
              payload.new.dueDate || new Date(payload.new.created_at).toISOString().split("T")[0],
            tags: payload.new.tags || [],
          }
          setTask((prev) => [...prev, newTask])
        }

        if (payload.eventType === "UPDATE") {
          setTask((prev) =>
            prev.map((task) =>
              task.id === payload.new.id
                ? {
                    ...task,
                    title: payload.new.task,
                    description: payload.new["task-description"],
                    status: payload.new.status,
                    assignee: payload.new["assigned-to"],
                    priority: payload.new.priority || "medium",
                    dueDate:
                      payload.new.dueDate ||
                      new Date(payload.new.created_at).toISOString().split("T")[0],
                    tags: payload.new.tags || [],
                  }
                : task
            )
          )
        }

        if (payload.eventType === "DELETE") {
          setTask((prev) => prev.filter((task) => task.id !== payload.old.id))
        }
      }
    )
    .subscribe()

  // Cleanup when component unmounts or team_id changes
  return () => {
    supabase.removeChannel(channel)
  }
}, [params.team_id])


  const handleTaskAssigned = (task: any) => {
    console.log("[v0] New task assigned:", task)
    // In a real app, this would update the task list
  }

  const handleLearningRequest = (topic: string) => {
    console.log("[v0] Learning request for:", topic)
    // In a real app, this would open learning materials
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "in-progress":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      default:
        return "secondary"
    }
  }

  const openLearnForTask = (taskId: string, prefill: string) => {
    setSelectedTaskId(taskId)
    setLearningPrefill(prefill)
    setLearningPaneKey((k) => k + 1)
    setActiveTab('learning')
  }

  const openLearningTab = () => {
    setLearningPaneKey((k) => k + 1)
    setActiveTab('learning')
  }

  useEffect(() => {
    const onMouseUp = () => {
      const sel = window.getSelection()
      const text = sel ? sel.toString().trim() : ""
      const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null
      if (!text || !range) {
        setSelectionBar((s) => ({ ...s, visible: false, text: "", taskId: null }))
        return
      }
      const rect = range.getBoundingClientRect()
      // find closest card with data-task-id
      let node: any = sel?.anchorNode as HTMLElement | null
      while (node && node.nodeType !== 1) node = node.parentElement
      const cardEl = node ? (node as HTMLElement).closest('[data-task-id]') as HTMLElement | null : null
      const taskId = cardEl?.getAttribute('data-task-id') || null
      if (!taskId) {
        setSelectionBar((s) => ({ ...s, visible: false, text: "", taskId: null }))
        return
      }
      setSelectionBar({ visible: true, text, taskId, x: rect.left + rect.width / 2, y: Math.max(8, rect.top - 8) })
    }
    document.addEventListener('mouseup', onMouseUp)
    return () => document.removeEventListener('mouseup', onMouseUp)
  }, [])

  

  return (
    <>
    <div className="min-h-screen bg-background grid-pattern">
      <div className="flex h-screen">
        {/* Left Icon Rail Sidebar */}
        {!focusMode && (
        <div className="w-16 border-r border-border bg-card/50 flex flex-col items-center py-3 gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="text-xs">{(team?.name || 'T')[0]}</AvatarFallback>
          </Avatar>
          <div className="h-px w-8 bg-border my-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setActiveTab('tasks')} className={`rounded-md p-2 ${activeTab==='tasks'?'bg-primary text-primary-foreground':'hover:bg-muted'}`}>
                <CheckSquare className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Tasks</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setActiveTab('teammates')} className={`rounded-md p-2 ${activeTab==='teammates'?'bg-primary text-primary-foreground':'hover:bg-muted'}`}>
                <Users className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Teammates</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setActiveTab('tracker')} className={`rounded-md p-2 ${activeTab==='tracker'?'bg-primary text-primary-foreground':'hover:bg-muted'}`}>
                <LayoutGrid className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Task Tracker</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={openLearningTab} className={`rounded-md p-2 ${activeTab==='learning'?'bg-primary text-primary-foreground':'hover:bg-muted'}`}>
                <GraduationCap className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Learning</TooltipContent>
          </Tooltip>
          <div className="mt-auto flex flex-col items-center gap-3">
            <div className="w-10 text-center">
              <div className="text-[10px] text-muted-foreground">{team?.progress}%</div>
              <div className="h-1 bg-muted rounded-full mt-1">
                <div className="h-1 bg-primary rounded-full" style={{width: `${team?.progress || 0}%`}} />
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setFocusMode(true)} className="rounded-md p-2 hover:bg-muted">
                  <LayoutPanelTop className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Focus Mode</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setActiveTab('profile')} className={`rounded-md p-2 ${activeTab==='profile'?'bg-primary text-primary-foreground':'hover:bg-muted'}`}>
                  <User className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Profile</TooltipContent>
            </Tooltip>
          </div>
        </div>
        )}

        {/* Main Content with resizable panels */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between gap-4">
                <div>
              <h1 className="text-2xl font-bold capitalize">{activeTab}</h1>
              <p className="text-muted-foreground">
                {activeTab === "tasks" && "Manage your assigned tasks and track progress"}
                {activeTab === "teammates" && "View team members and their current status"}
                {activeTab === "tracker" && "Kanban board view of all team tasks"}
                {activeTab === "learning" && "Get help and learn new skills with AI"}
                {activeTab === "profile" && "Manage your profile and preferences"}
              </p>
                </div>
                <div className="flex items-center gap-2">
                  {focusMode && (
                    <Button variant="outline" size="sm" onClick={() => setFocusMode(false)}>
                      <PanelRightOpen className="w-4 h-4 mr-2" /> Exit Focus
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-0 min-h-0">
              {activeTab === "tasks" && (
                <ResizablePanelGroup direction="horizontal">
                  {/* Personal tasks list */}
                  <ResizablePanel defaultSize={42} minSize={30} className="min-w-[280px] max-w-[560px]">
                    <div className="h-full overflow-auto p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Your Tasks</h3>
                        <Badge variant="secondary">{personalTasks.length}</Badge>
                      </div>
                      {personalTasks.length === 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">No tasks yet</CardTitle>
                            <CardDescription>Ask the PM Agent to assign tasks.</CardDescription>
                          </CardHeader>
                        </Card>
                      )}
                      {personalTasks.map((task: any) => (
                        <Card key={task.id} data-task-id={String(task.id)} className={`${String(selectedTaskId)===String(task.id)?'ring-2 ring-primary':''}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                {getStatusIcon(task.status)}
                                <div>
                                  <CardTitle className="text-base">{task.title}</CardTitle>
                                  <CardDescription className="mt-1 line-clamp-2">{task.description}</CardDescription>
                                </div>
                              </div>
                              <Badge variant={getPriorityColor(task.priority) as any}>{task.priority}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                {task.tags.map((tag: any) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {task.dueDate}
                              </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                              <Button size="sm" onClick={() => setSelectedTaskId(String(task.id))}>Select</Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                const prefill = `Teach me this task with project context.\n\nTask: ${task.title}\n\nDescription:\n${task.description || ''}`
                                openLearnForTask(String(task.id), prefill)
                              }}>
                                <GraduationCap className="w-4 h-4 mr-1" /> Learn
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  {/* PM Agent chat center stage + context editor */}
                  <ResizablePanel defaultSize={58} minSize={40}>
                    <div className="h-full flex flex-col min-h-0">
                      {/* Context bar */}
                      <div className="px-6 py-3 border-b border-border flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Chat with PM Agent</span>
                        <div className="ml-auto hidden sm:flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => setFocusMode((v)=>!v)}>
                            {focusMode ? <PanelRightOpen className="w-4 h-4 mr-2"/> : <PanelRightClose className="w-4 h-4 mr-2"/>}
                            {focusMode ? 'Exit Focus' : 'Focus'}
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1 min-h-0">
                        <AIChat
                          agentType="pm"
                          agentName="PM Agent"
                          agentDescription={selectedTask ? `Helping with: ${selectedTask.title}` : "Product Management Assistant"}
                          initialMessages={initialPMMessages}
                          onTaskAssigned={handleTaskAssigned}
                          uid={params.student_id}
                          company_id={params.company_id}
                          project_id={params.project_id}
                          team_id={params.team_id}
                          enableSlashShortcut
                        />
                      </div>
                </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              )}

              {activeTab === "teammates" && <TeammatesList teamId={params.team_id} />}

              {activeTab === "tracker" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Circle className="w-4 h-4 text-muted-foreground" />
                      In-Progress
                    </h3>
                    <div className="space-y-3">
                      {tasks
                        .filter((task: any) => task.status === "not-assigned" || task.status === "open" || task.status === "in-progress")
                        .map((task: any) => (
                          <Card key={task.id} className="p-3">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <p>{task.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{teammateDetails[task.assignee]?.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{teammateDetails[task.assignee]?.skills.map((skill: any) => (
                              <span key={skill} className="inline-block mr-1">
                                <Badge variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              </span>
                            ))}</p> 
                            <div className="flex gap-1 mt-2">
                              {task.tags.map((tag: any) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div> */}

                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      In Progress
                    </h3>
                    <div className="space-y-3">
                      {tasks
                        .filter((task: any) => task.status === "pending" || task.status === "in-progress")
                        .map((task: any) => (
                          <Card key={task.id} className="p-3">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{teammateDetails[task.assignee]?.name}</p>
                            
                            <div className="flex gap-1 mt-2">
                              {task.tags.map((tag: any) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Completed
                    </h3>
                    <div className="space-y-3">
                      {tasks
                        .filter((task: any) => task.status === "completed")
                        .map((task: any) => (
                          <Card key={task.id} className="p-3">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{task.assignee}</p>
                            <div className="flex gap-1 mt-2">
                              {task.tags.map((tag: any) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        Issues
                      </h3>
                    <div className="space-y-3">
                      {tasks
                        .filter((task: any) => task.status === "issues")
                        .map((task: any) => (
                          <Card key={task.id} className="p-3">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{task.assignee}</p>
                            <div className="flex gap-1 mt-2">
                              {task.tags.map((tag: any) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "learning" && (
                <div key={learningPaneKey} className="h-full min-h-0 overflow-hidden will-change-transform transition-transform duration-500 ease-out translate-x-0 animate-[slideIn_0.5s_ease-out]">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 h-full">
                    {/* Lesson Canvas */}
                    <div className="p-6 overflow-auto space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold">{selectedTask ? `Learning: ${selectedTask.title}` : 'Learning'}</h2>
                        <p className="text-sm text-muted-foreground">Rich lesson with video, images, code and text tailored to your task and project.</p>
                      </div>
                      {/* Video Section */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Video Walkthrough</h3>
                        <AspectRatio ratio={16/9}>
                          <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">Video will appear here</span>
                          </div>
                        </AspectRatio>
                      </div>
                      {/* Image Gallery */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Image References</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="aspect-video bg-muted rounded-md"></div>
                          <div className="aspect-video bg-muted rounded-md"></div>
                          <div className="aspect-video bg-muted rounded-md"></div>
                        </div>
                      </div>
                      {/* Code Snippets */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Code Snippet</h3>
                        <div className="rounded-md border bg-background">
                          <pre className="p-3 overflow-auto text-xs">
{`${learningPrefill ? learningPrefill.slice(0, 400) : '// Code examples and steps will be generated here based on your selection and task context.'}`}
                          </pre>
                        </div>
                      </div>
                      {/* Text Explanation */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Explanation</h3>
                        <p className="text-sm text-muted-foreground">The assistant will explain concepts and guide you step-by-step, referencing your project context and the selected task.</p>
                      </div>
                    </div>
                    {/* Learning Agent Chat */}
                    <div className="min-h-0 border-l border-border">
                      <AIChat
                        agentType="learning"
                        agentName="Learning Agent"
                        agentDescription={selectedTask ? `Teach: ${selectedTask.title}` : "AI-powered learning assistant"}
                        initialMessages={initialLearningMessages}
                        onLearningRequest={handleLearningRequest}
                        uid={params.student_id}
                        company_id={params.company_id}
                        project_id={params.project_id}
                        team_id={params.team_id}
                        prefillInput={learningPrefill}
                        autoFocusInput
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="max-w-2xl">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Profile</CardTitle>
                      <CardDescription>Manage your profile information and preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarFallback className="text-lg">YU</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">Your Name</h3>
                          <p className="text-sm text-muted-foreground">Backend Developer</p>
                          <Badge className="mt-1">Team Member</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Tasks Completed</p>
                          <p className="text-2xl font-bold">12</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Team Rating</p>
                          <p className="text-2xl font-bold">4.8</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Contextual Help Drawer removed; Learn is now the full Learning tab */}
        </div>
      </div>
    </div>
    {/* Floating Selection Bar */}
    {selectionBar.visible && selectionBar.taskId && (
      <div
        className="fixed z-50 -translate-x-1/2 -translate-y-full"
        style={{ left: selectionBar.x, top: selectionBar.y }}
      >
        <div className="bg-popover text-popover-foreground border rounded-md shadow-lg p-1 flex items-center gap-1">
          <Button size="sm" onClick={() => {
            const task = tasks.find((t:any)=> String(t.id)===String(selectionBar.taskId))
            const prefill = `Teach me this task with project context.\n\nTask: ${task?.title || ''}\n\nSelected:\n${selectionBar.text}`
            openLearnForTask(String(selectionBar.taskId!), prefill)
            setSelectionBar({ visible: false, text: '', taskId: null, x: 0, y: 0 })
          }}>
            <GraduationCap className="w-3.5 h-3.5 mr-1" /> Learn
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectionBar({ visible: false, text: '', taskId: null, x: 0, y: 0 })}>Dismiss</Button>
        </div>
      </div>
    )}
    </>
  )
}

function LearningChatWrapper({ description, uid, company_id, project_id, team_id }: any) {
  const [prefill, setPrefill] = useState<string>("")

  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail) setPrefill(e.detail as string)
    }
    window.addEventListener('learning-prefill', handler as any)
    return () => window.removeEventListener('learning-prefill', handler as any)
  }, [])

  return (
    <AIChat
      agentType="learning"
      agentName="Learning Coach"
      agentDescription={description}
      initialMessages={initialLearningMessages}
      uid={uid}
      company_id={company_id}
      project_id={project_id}
      team_id={team_id}
      prefillInput={prefill}
      autoFocusInput
    />
  )
}