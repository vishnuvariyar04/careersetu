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
  uid,
  company_id,
  project_id,
  team_id,
  enableSlashShortcut = false,
  prefillInput,
  autoFocusInput = false,

}: any) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function formatTime(date: Date) {
    return date
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace("AM", "am")
      .replace("PM", "pm")
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (typeof prefillInput === 'string' && prefillInput.length > 0) {
      setInput(prefillInput)
      if (autoFocusInput) {
        requestAnimationFrame(() => inputRef.current?.focus())
      }
    }
  }, [prefillInput, autoFocusInput])

  useEffect(() => {
    if (!enableSlashShortcut) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const active = document.activeElement as HTMLElement | null
        const isTyping = !!active && (
          active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable === true
        )
        if (isTyping) return
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enableSlashShortcut])

const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {

      console.log("Sending request with:", { uid, company_id, project_id, team_id, message: currentInput });
      const requestBody = {
        uid: uid,
        company_id: company_id,
        project_id: project_id,
        message: currentInput,
        team_id: team_id,
      };

      const response = await fetch("https://n8n.srv1034714.hstgr.cloud/webhook/f723e0a5-2fbf-4453-8393-153d2db4a248", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const apiResponse:any = await response.text();  
console.log("API Response:", apiResponse);
      // Check if the response is an array and contains the required data
      if (apiResponse ) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: apiResponse, // Use the message from the API
          role: "assistant",
          timestamp: new Date(),
          type: "general", // Default to general as other types are removed
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Failed to get response from API:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error processing the server's response.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="flex flex-col h-full min-h-0">
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
            ref={inputRef}
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