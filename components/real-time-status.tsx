"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wifi, WifiOff } from "lucide-react"

interface UserStatus {
  id: string
  name: string
  avatar: string
  role: string
  status: "online" | "away" | "busy" | "offline"
  lastSeen?: Date
  currentTask?: string
}

interface RealTimeStatusProps {
  teamId?: string
  projectId?: string
}

export function RealTimeStatus({ teamId, projectId }: RealTimeStatusProps) {
  const [users, setUsers] = useState<UserStatus[]>([])
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    // Simulate real-time status updates
    const initialUsers: UserStatus[] = [
      {
        id: "1",
        name: "Sarah Chen",
        avatar: "SC",
        role: "Frontend Developer",
        status: "online",
        currentTask: "Working on product catalog UI",
      },
      {
        id: "2",
        name: "Alex Rodriguez",
        avatar: "AR",
        role: "Full Stack Developer",
        status: "busy",
        currentTask: "Debugging API endpoints",
      },
      {
        id: "3",
        name: "Emma Wilson",
        avatar: "EW",
        role: "Backend Developer",
        status: "away",
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
      },
      {
        id: "4",
        name: "Mike Johnson",
        avatar: "MJ",
        role: "UI/UX Designer",
        status: "online",
        currentTask: "Creating wireframes",
      },
      {
        id: "5",
        name: "David Kim",
        avatar: "DK",
        role: "DevOps Engineer",
        status: "offline",
        lastSeen: new Date(Date.now() - 7200000), // 2 hours ago
      },
    ]

    setUsers(initialUsers)

    // Simulate status changes
    const interval = setInterval(() => {
      setUsers((prev) =>
        prev.map((user) => {
          // Randomly change status
          if (Math.random() < 0.1) {
            const statuses: UserStatus["status"][] = ["online", "away", "busy", "offline"]
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
            return {
              ...user,
              status: newStatus,
              lastSeen: newStatus === "offline" ? new Date() : user.lastSeen,
            }
          }
          return user
        }),
      )
    }, 10000) // Update every 10 seconds

    // Simulate connection status
    const connectionInterval = setInterval(() => {
      if (Math.random() < 0.05) {
        // 5% chance to simulate connection issue
        setIsConnected(false)
        setTimeout(() => setIsConnected(true), 2000)
      }
    }, 30000)

    return () => {
      clearInterval(interval)
      clearInterval(connectionInterval)
    }
  }, [])

  const getStatusColor = (status: UserStatus["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "busy":
        return "bg-red-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: UserStatus["status"]) => {
    switch (status) {
      case "online":
        return "Online"
      case "away":
        return "Away"
      case "busy":
        return "Busy"
      case "offline":
        return "Offline"
      default:
        return "Unknown"
    }
  }

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date()
    const diff = now.getTime() - lastSeen.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return lastSeen.toLocaleDateString()
  }

  const onlineCount = users.filter((u) => u.status === "online").length
  const totalCount = users.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Status
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
            <Badge variant="outline" className="text-xs">
              {onlineCount}/{totalCount} online
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>{user.avatar}</AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(
                    user.status,
                  )}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm truncate">{user.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {getStatusText(user.status)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                {user.status === "online" || user.status === "busy"
                  ? user.currentTask && (
                      <p className="text-xs text-muted-foreground truncate mt-1">{user.currentTask}</p>
                    )
                  : user.lastSeen && (
                      <p className="text-xs text-muted-foreground mt-1">Last seen {formatLastSeen(user.lastSeen)}</p>
                    )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
