"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, CheckCircle, Users, Code, MessageSquare, TrendingUp, Clock } from "lucide-react"

interface ActivityItem {
  id: string
  type: "task_completed" | "team_joined" | "project_milestone" | "code_commit" | "message" | "achievement"
  user: {
    name: string
    avatar: string
    role: string
  }
  action: string
  target?: string
  timestamp: Date
  metadata?: any
}

interface LiveActivityFeedProps {
  companyId?: string
  projectId?: string
  teamId?: string
  maxItems?: number
}

export function LiveActivityFeed({ companyId, projectId, teamId, maxItems = 20 }: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    // Simulate real-time activity feed
    const interval = setInterval(() => {
      if (isLive) {
        const newActivity = generateRandomActivity()
        setActivities((prev) => [newActivity, ...prev.slice(0, maxItems - 1)])
      }
    }, 8000) // New activity every 8 seconds

    // Initial activities
    const initialActivities = Array.from({ length: 10 }, () => generateRandomActivity())
    setActivities(initialActivities)

    return () => clearInterval(interval)
  }, [isLive, maxItems])

  const generateRandomActivity = (): ActivityItem => {
    const users = [
      { name: "Sarah Chen", avatar: "SC", role: "Frontend Developer" },
      { name: "Alex Rodriguez", avatar: "AR", role: "Full Stack Developer" },
      { name: "Emma Wilson", avatar: "EW", role: "Backend Developer" },
      { name: "Mike Johnson", avatar: "MJ", role: "UI/UX Designer" },
      { name: "David Kim", avatar: "DK", role: "DevOps Engineer" },
    ]

    const activityTemplates = [
      {
        type: "task_completed" as const,
        action: "completed task",
        target: "User Authentication System",
      },
      {
        type: "team_joined" as const,
        action: "joined team",
        target: "Alpha Team",
      },
      {
        type: "project_milestone" as const,
        action: "reached milestone",
        target: "75% completion on E-commerce Platform",
      },
      {
        type: "code_commit" as const,
        action: "pushed code",
        target: "feat: add payment integration",
      },
      {
        type: "message" as const,
        action: "sent message",
        target: "Great work on the API endpoints!",
      },
      {
        type: "achievement" as const,
        action: "earned achievement",
        target: "Top Performer of the Week",
      },
    ]

    const user = users[Math.floor(Math.random() * users.length)]
    const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)]

    return {
      id: Date.now().toString() + Math.random(),
      ...template,
      user,
      timestamp: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "team_joined":
        return <Users className="w-4 h-4 text-blue-500" />
      case "project_milestone":
        return <TrendingUp className="w-4 h-4 text-purple-500" />
      case "code_commit":
        return <Code className="w-4 h-4 text-orange-500" />
      case "message":
        return <MessageSquare className="w-4 h-4 text-cyan-500" />
      case "achievement":
        return <Activity className="w-4 h-4 text-yellow-500" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "task_completed":
        return "default"
      case "team_joined":
        return "secondary"
      case "project_milestone":
        return "default"
      case "achievement":
        return "default"
      default:
        return "outline"
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return timestamp.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Activity Feed
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
            <span className="text-xs text-muted-foreground">{isLive ? "Live" : "Paused"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">{activity.user.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user.name}</span>
                        <span className="text-muted-foreground"> {activity.action} </span>
                        {activity.target && <span className="font-medium">"{activity.target}"</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.user.role}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
