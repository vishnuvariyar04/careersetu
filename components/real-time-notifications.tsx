"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, X, CheckCircle, Info, Users, MessageSquare } from "lucide-react"

interface Notification {
  id: string
  type: "task" | "team" | "system" | "message"
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: "low" | "medium" | "high"
  avatar?: string
  actionUrl?: string
}

interface RealTimeNotificationsProps {
  userId?: string
  userRole?: "student" | "supervisor"
}

export function RealTimeNotifications({ userId, userRole = "student" }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const newNotification = generateRandomNotification(userRole)
      setNotifications((prev) => [newNotification, ...prev.slice(0, 19)]) // Keep last 20
      setUnreadCount((prev) => prev + 1)
    }, 15000) // New notification every 15 seconds

    // Initial notifications
    const initialNotifications = Array.from({ length: 5 }, () => generateRandomNotification(userRole))
    setNotifications(initialNotifications)
    setUnreadCount(initialNotifications.length)

    return () => clearInterval(interval)
  }, [userRole])

  const generateRandomNotification = (role: "student" | "supervisor"): Notification => {
    const studentNotifications = [
      {
        type: "task" as const,
        title: "New Task Assigned",
        message: "PM Agent assigned you: Implement user authentication middleware",
        priority: "high" as const,
      },
      {
        type: "team" as const,
        title: "Team Update",
        message: "Sarah Chen completed the UI components task",
        priority: "medium" as const,
        avatar: "SC",
      },
      {
        type: "system" as const,
        title: "Learning Milestone",
        message: "You've completed the React Components module! 🎉",
        priority: "low" as const,
      },
      {
        type: "message" as const,
        title: "Team Message",
        message: "Mike Johnson: Great work on the API integration!",
        priority: "medium" as const,
        avatar: "MJ",
      },
    ]

    const supervisorNotifications = [
      {
        type: "system" as const,
        title: "Performance Alert",
        message: "Team Alpha has exceeded their sprint goals by 15%",
        priority: "high" as const,
      },
      {
        type: "team" as const,
        title: "Student Achievement",
        message: "Sarah Chen reached top 5% performance ranking",
        priority: "medium" as const,
        avatar: "SC",
      },
      {
        type: "task" as const,
        title: "Project Milestone",
        message: "E-commerce Platform project is 75% complete",
        priority: "medium" as const,
      },
      {
        type: "system" as const,
        title: "AI Insight",
        message: "Detected skill gap in DevOps - recommend training",
        priority: "high" as const,
      },
    ]

    const pool = role === "student" ? studentNotifications : supervisorNotifications
    const template = pool[Math.floor(Math.random() * pool.length)]

    return {
      id: Date.now().toString() + Math.random(),
      ...template,
      timestamp: new Date(),
      read: false,
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "team":
        return <Users className="w-4 h-4 text-blue-500" />
      case "system":
        return <Info className="w-4 h-4 text-purple-500" />
      case "message":
        return <MessageSquare className="w-4 h-4 text-orange-500" />
      default:
        return <Bell className="w-4 h-4" />
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
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 z-50 shadow-lg">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="max-h-80">
            <div className="p-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50 ${
                        !notification.read ? "bg-primary/5 border-primary/20" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {notification.avatar ? (
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">{notification.avatar}</AvatarFallback>
                            </Avatar>
                          ) : (
                            getNotificationIcon(notification.type)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                            <Badge
                              variant={getPriorityColor(notification.priority) as any}
                              className="text-xs flex-shrink-0"
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {notification.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}
