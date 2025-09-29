"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bot, Send, Loader2, User, Lightbulb, CheckCircle, AlertTriangle } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  type?: "task_assignment" | "learning_suggestion" | "progress_update" | "general"
}

interface AIChatProps {
  agentType: "pm" | "learning"
  agentName: string
  agentDescription: string
  initialMessages?: Message[]
  onTaskAssigned?: (task: any) => void
  onLearningRequest?: (topic: string) => void
}

export function AIChat({
  agentType,
  agentName,
  agentDescription,
  initialMessages = [],
  onTaskAssigned,
  onLearningRequest,
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)


  function formatTime(date: Date) {
    return date
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace("AM", "am")
      .replace("PM", "pm") // 🔑 force lowercase
  }
  

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(
      () => {
        const aiResponse = generateAIResponse(input, agentType)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse.content,
          role: "assistant",
          timestamp: new Date(),
          type: aiResponse.type,
        }

        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)

        // Handle special actions
        if (aiResponse.type === "task_assignment" && onTaskAssigned) {
          onTaskAssigned(aiResponse.task)
        }
        if (aiResponse.type === "learning_suggestion" && onLearningRequest) {
          onLearningRequest(aiResponse.topic)
        }
      },
      1000 + Math.random() * 2000,
    )
  }

  const generateAIResponse = (userInput: string, type: "pm" | "learning") => {
    const input = userInput.toLowerCase()

    if (type === "pm") {
      if (input.includes("task") || input.includes("assign")) {
        return {
          content:
            "I've analyzed your request and created a new task for you: 'Implement user authentication middleware'. This task has been added to your task tracker with high priority. The estimated completion time is 3-4 hours based on your current skill level.",
          type: "task_assignment" as const,
          task: {
            title: "Implement user authentication middleware",
            priority: "high",
            estimatedTime: "3-4 hours",
          },
        }
      }
      if (input.includes("progress") || input.includes("status")) {
        return {
          content:
            "Your team is making excellent progress! You've completed 3 out of 5 sprint tasks, putting you 15% ahead of schedule. Sarah has finished the UI components, and Mike is 80% done with the database integration. Keep up the great work!",
          type: "progress_update" as const,
        }
      }
      if (input.includes("help") || input.includes("stuck")) {
        return {
          content:
            "I understand you're facing a challenge. Based on your current task, I recommend breaking it down into smaller steps: 1) Set up the middleware structure, 2) Implement token validation, 3) Add error handling. Would you like me to create subtasks for these steps?",
          type: "general" as const,
        }
      }
      return {
        content:
          "I'm here to help manage your project efficiently. I can assign tasks, track progress, provide updates, and help resolve blockers. What would you like to work on today?",
        type: "general" as const,
      }
    } else {
      // Learning agent responses
      if (input.includes("react") || input.includes("component")) {
        return {
          content:
            "Great question about React! I've prepared a personalized learning path for React components. This includes: functional vs class components, props and state management, and lifecycle methods. Would you like me to start with a hands-on tutorial?",
          type: "learning_suggestion" as const,
          topic: "React Components",
        }
      }
      if (input.includes("database") || input.includes("sql")) {
        return {
          content:
            "Database design is crucial for your current project! I recommend starting with entity-relationship modeling, then moving to normalization principles. I can provide interactive exercises with your e-commerce database schema. Shall we begin?",
          type: "learning_suggestion" as const,
          topic: "Database Design",
        }
      }
      if (input.includes("api") || input.includes("backend")) {
        return {
          content:
            "API development is a key skill! I'll guide you through RESTful API principles, authentication patterns, and error handling. Based on your current task, we should focus on JWT implementation first. Ready to dive in?",
          type: "learning_suggestion" as const,
          topic: "API Development",
        }
      }
      return {
        content:
          "I'm your personal learning assistant! I can help you understand any technology, provide tutorials, create practice exercises, and adapt to your learning style. What would you like to learn today?",
        type: "general" as const,
      }
    }
  }

  const getMessageIcon = (message: Message) => {
    if (message.role === "user") return <User className="w-3 h-3" />

    switch (message.type) {
      case "task_assignment":
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case "learning_suggestion":
        return <Lightbulb className="w-3 h-3 text-yellow-500" />
      case "progress_update":
        return <AlertTriangle className="w-3 h-3 text-blue-500" />
      default:
        return <Bot className="w-3 h-3" />
    }
  }

  const getMessageBadge = (message: Message) => {
    if (message.role === "user") return null

    switch (message.type) {
      case "task_assignment":
        return (
          <Badge variant="default" className="text-xs">
            Task Assigned
          </Badge>
        )
      case "learning_suggestion":
        return (
          <Badge variant="secondary" className="text-xs">
            Learning
          </Badge>
        )
      case "progress_update":
        return (
          <Badge variant="outline" className="text-xs">
            Progress
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">{agentName}</h3>
            <p className="text-sm text-muted-foreground">{agentDescription}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className="flex items-center gap-2">
                {message.role === "assistant" ? (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    {getMessageIcon(message)}
                  </div>
                ) : (
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      <User className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="text-sm font-medium">{message.role === "assistant" ? agentName : "You"}</span>
                <span className="text-xs text-muted-foreground">
  {formatTime(message.timestamp)}
</span>

                {getMessageBadge(message)}
              </div>
              <div className="ml-8">
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Loader2 className="w-3 h-3 animate-spin" />
                </div>
                <span className="text-sm font-medium">{agentName}</span>
                <span className="text-xs text-muted-foreground">typing...</span>
              </div>
              <div className="ml-8">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder={
              agentType === "pm"
                ? "Ask about tasks, progress, or project management..."
                : "Ask me to explain concepts, provide tutorials..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}
