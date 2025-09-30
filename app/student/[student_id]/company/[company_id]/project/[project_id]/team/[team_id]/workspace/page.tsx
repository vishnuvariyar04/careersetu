"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { AIChat } from "@/components/ai-chat"
import { RealTimeNotifications } from "@/components/real-time-notifications"
import { LiveActivityFeed } from "@/components/live-activity-feed"
import { RealTimeStatus } from "@/components/real-time-status"
import { Users, CheckSquare, BarChart3, BookOpen, User, Clock, AlertCircle, CheckCircle, Circle } from "lucide-react"
import { useParams } from "next/navigation"
import { TeammatesList } from "@/components/teammates-list"
import { supabase } from "@/lib/supabase"
import { set } from "date-fns"

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
        // Transform the data from Supabase to match the component's expected format
        const transformedTasks = data.map((task: any) => ({
          id: task.id,
          title: task.task, // Map 'task' to 'title'
          description: task["task-description"], // Map 'task-description' to 'description'
          status: task.status,
          assignee: task["assigned-to"], // Map 'assigned-to' to 'assignee'
          priority: task.priority || "medium", // Provide a default priority to prevent errors
          // Format created_at as a fallback for dueDate
          dueDate: task.dueDate || new Date(task.created_at).toISOString().split("T")[0],
          // Provide default empty array for tags to prevent .map() from crashing
          tags: task.tags || [],
        }))
        setTask(transformedTasks)
        console.log("Fetched and transformed task data:", transformedTasks)
      } else {
        setTask([]) // Set to empty array if no data is returned
      }
    }
    fetchTask()
  }, [params.team_id]) // Dependency array ensures this runs again if team_id changes

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

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-border bg-card/50 flex flex-col">
          {/* Team Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">{team?.name}</h2>
              {/* < RealTimeNotifications userId="current-user" userRole="student" /> */}
            </div>
            <p className="text-sm text-muted-foreground">{team?.project}</p>
            <div className="mt-3">
              {}
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{team?.progress}%</span>
              </div>
              <Progress value={team?.progress} className="h-2" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <Button
                variant={activeTab === "tasks" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("tasks")}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Tasks
              </Button>
              <Button
                variant={activeTab === "teammates" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("teammates")}
              >
                <Users className="w-4 h-4 mr-2" />
                Teammates
              </Button>
              <Button
                variant={activeTab === "tracker" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("tracker")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Task Tracker
              </Button>
              <Button
                variant={activeTab === "learning" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("learning")}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Learning Agent
              </Button>
              <Button
                variant={activeTab === "profile" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("profile")}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </nav>

          {/* <div className="p-4 border-t border-border">
            <RealTimeStatus teamId={teamId.toString()} />
          </div> */}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <h1 className="text-2xl font-bold capitalize">{activeTab}</h1>
              <p className="text-muted-foreground">
                {activeTab === "tasks" && "Manage your assigned tasks and track progress"}
                {activeTab === "teammates" && "View team members and their current status"}
                {activeTab === "tracker" && "Kanban board view of all team tasks"}
                {activeTab === "learning" && "Get help and learn new skills with AI"}
                {activeTab === "profile" && "Manage your profile and preferences"}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-auto min-h-0">
              {activeTab === "tasks" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    {tasks
                      .filter((task: any) => task.assignee === params.student_id)
                      .map((task: any) => (
                        <Card key={task.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                {getStatusIcon(task.status)}
                                <div>
                                  <CardTitle className="text-lg">{task.title}</CardTitle>
                                  <CardDescription className="mt-1">{task.description}</CardDescription>
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
                                Due {task.dueDate}
                              </div>
                            </div>
                            {task.status === "pending" && (
                              <Button className="mt-4" size="sm">
                                Start Task
                              </Button>
                            )}
                            {task.status === "in-progress" && (
                              <Button className="mt-4 bg-transparent" size="sm" variant="outline">
                                Mark Complete
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                  {/* <div>
                    <LiveActivityFeed teamId={teamId.toString()} maxItems={15} />
                  </div> */}
                </div>
              )}

              {activeTab === "teammates" && <TeammatesList teamId={params.team_id} />}

              {activeTab === "tracker" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Circle className="w-4 h-4 text-muted-foreground" />
                      In-Progress
                    </h3>
                    <div className="space-y-3">
                      {tasks
                        .filter((task: any) => task.status === "not-assigned" || task.status === "in-progress" || task.status === "pending")
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
                  </div>

                  {/* <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      In Progress
                    </h3>
                    <div className="space-y-3">
                      {tasks
                        .filter((task: any) => task.status === "pending")
                        .map((task: any) => (
                          <Card key={task.id} className="p-3">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <p>{task.description}</p>
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
                  </div> */}

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
                </div>
              )}

              {activeTab === "learning" && (
                <div className="h-full min-h-0 overflow-hidden">
                  <AIChat
                    agentType="learning"
                    agentName="Learning Agent"
                    agentDescription="AI-powered learning assistant"
                    initialMessages={initialLearningMessages}
                    onLearningRequest={handleLearningRequest}
                    uid={params.student_id}
                    company_id={params.company_id}
                    project_id={params.project_id}
                    team_id={params.team_id}
                  />
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

          {/* Right Sidebar - AI PM Agent */}
          <div className="w-80 border-l border-border bg-card/50 flex flex-col min-h-0 overflow-hidden">
            <AIChat
              agentType="pm"
              agentName="PM Agent"
              agentDescription="Product Management Assistant"
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
      </div>
    </div>
  )
}