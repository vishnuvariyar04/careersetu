"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bot, Send, Loader2, User, Trash2, Video, BookOpen, FileText, Code, Lightbulb, MessageSquare, ChevronRight, X } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  command?: string
  context?: string
}

interface MessageData {
  command: string
  user_text_typed: string
  context_selected: string
}

interface Command {
  name: string
  icon: any
  description: string
  color: string
}

const COMMANDS: Command[] = [
  { name: "video", icon: Video, description: "Get video tutorials on any topic", color: "text-red-500" },
  { name: "explain", icon: MessageSquare, description: "Get detailed explanations", color: "text-blue-500" },
  { name: "ppt", icon: FileText, description: "Generate presentation slides", color: "text-orange-500" },
  { name: "code", icon: Code, description: "Get code examples and snippets", color: "text-green-500" },
  { name: "summarize", icon: BookOpen, description: "Summarize long content", color: "text-purple-500" },
  { name: "tips", icon: Lightbulb, description: "Get learning tips and best practices", color: "text-yellow-500" },
]

export default function AIChat({
  agentName = "Learning Assistant",
  agentDescription = "Your personal learning companion",
  uid,
  company_id,
  project_id,
  team_id,
}: any) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCommands, setShowCommands] = useState(false)
  const [selectedCommand, setSelectedCommand] = useState<string>("none")
  const [selectedText, setSelectedText] = useState("")
  const [activeCommandIndex, setActiveCommandIndex] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatAreaRef = useRef<HTMLDivElement>(null)

  const cacheKey = `learningChat_${uid}_${team_id}`

  // Load from cache
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem(cacheKey)
      if (cachedData) {
        const { timestamp, messages: cachedMessages } = JSON.parse(cachedData)
        const fiveDaysInMillis = 5 * 24 * 60 * 60 * 1000

        if (Date.now() - timestamp > fiveDaysInMillis) {
          localStorage.removeItem(cacheKey)
        } else {
          setMessages(
            cachedMessages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          )
        }
      }
    } catch (error) {
      console.error("Failed to load chat history:", error)
      localStorage.removeItem(cacheKey)
    }
  }, [cacheKey])

  // Save to cache
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const dataToCache = {
          timestamp: Date.now(),
          messages: messages,
        }
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache))
      } catch (error) {
        console.error("Failed to save chat history:", error)
      }
    }
  }, [messages, cacheKey])

  // Handle text selection restricted to chat area only (persist until X is pressed)
  useEffect(() => {
    const container = chatAreaRef.current
    if (!container) return

    const getSelectedTextInContainer = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return ""
      const range = sel.getRangeAt(0)
      const common = range.commonAncestorContainer
      const node = (common as Node).nodeType === 1 ? (common as Element) : (common as Node).parentElement
      if (!node) return ""
      return container.contains(node) ? sel.toString().trim() : ""
    }

    const handleMouseUp = () => {
      const text = getSelectedTextInContainer()
      if (text) setSelectedText(text)
    }

    const handleKeyUp = () => {
      const text = getSelectedTextInContainer()
      if (text) setSelectedText(text)
    }

    container.addEventListener("mouseup", handleMouseUp)
    container.addEventListener("keyup", handleKeyUp)

    return () => {
      container.removeEventListener("mouseup", handleMouseUp)
      container.removeEventListener("keyup", handleKeyUp)
    }
  }, [chatAreaRef])

  // Auto-scroll
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Watch for "/" to show commands
  useEffect(() => {
    if (input.startsWith("/") && selectedCommand === "none") {
      setShowCommands(true)
      setActiveCommandIndex(0)
    } else {
      setShowCommands(false)
    }
  }, [input, selectedCommand])

  const handleClearHistory = () => {
    localStorage.removeItem(cacheKey)
    setMessages([])
  }

  const handleCommandSelect = (command: string) => {
    setSelectedCommand(command)
    setInput("")
    setShowCommands(false)
    inputRef.current?.focus()
  }

  const removeCommand = () => {
    setSelectedCommand("none")
    inputRef.current?.focus()
  }

  const handleSend = async () => {
    if ((!input.trim() && selectedCommand === "none") || isLoading) return

    const messageData: MessageData = {
      command: selectedCommand,
      user_text_typed: input.trim(),
      context_selected: selectedText,
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageData.user_text_typed,
      role: "user",
      timestamp: new Date(),
      command: messageData.command !== "none" ? messageData.command : undefined,
      context: messageData.context_selected || undefined,
    }

    setMessages((prev) => [...prev, userMessage])

    // Save current state before clearing
    const currentMessageData = { ...messageData }

    setInput("")
    setSelectedCommand("none")
    // Do not clear selectedText here; only clear when X is pressed
    setIsLoading(true)

    try {
      const requestBody = {
        uid: uid,
        company_id: company_id,
        project_id: project_id,
        message_data: currentMessageData,
        team_id: team_id,
      }

      console.log("Request Body:", requestBody)

      const response = await fetch("https://n8n.srv1034714.hstgr.cloud/webhook/c6df30d4-8536-4bca-9546-ce2399081e87", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const apiResponse: any = await response.json()
      console.log("API Response:", apiResponse)

      if (apiResponse) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: apiResponse.output,
          role: "assistant",
          timestamp: new Date(),
          command: currentMessageData.command !== "none" ? currentMessageData.command : undefined,
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("Failed to get response from API:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error processing your request.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace("AM", "am")
      .replace("PM", "pm")
  }

  const getCommandInfo = (commandName: string) => {
    return COMMANDS.find((cmd) => cmd.name === commandName)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{agentName}</h3>
            <p className="text-sm text-muted-foreground">{agentDescription}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClearHistory} title="Clear chat history">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4" ref={chatAreaRef}>
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Learning!</h3>
              <p className="text-sm text-muted-foreground mb-4">Type / to see all available commands</p>
              <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                {COMMANDS.map((cmd) => (
                  <button
                    key={cmd.name}
                    onClick={() => handleCommandSelect(cmd.name)}
                    className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors text-left"
                  >
                    <cmd.icon className={`w-4 h-4 ${cmd.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">/{cmd.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{cmd.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className="flex items-center gap-2">
                {message.role === "assistant" ? (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-primary-foreground" />
                  </div>
                ) : (
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      <User className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="text-sm font-medium">{message.role === "assistant" ? agentName : "You"}</span>
                <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                {message.command && (
                  <Badge variant="outline" className="text-xs">
                    /{message.command}
                  </Badge>
                )}
              </div>

              {/* Context Snippet */}
              {message.context && message.role === "user" && (
                <div className="ml-8 mb-2">
                  <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-400 p-3 rounded-r-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">Context:</div>
                        <div className="text-xs text-amber-800 dark:text-amber-200 italic line-clamp-2">
                          "{message.context}"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div className="ml-8">
                {message.role === "assistant" && message.command ? (
                  <div className="bg-accent/50 rounded-lg p-4 border border-border">
                    {(() => {
                      const cmdInfo = getCommandInfo(message.command)
                      return cmdInfo ? (
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className={`w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center`}
                          >
                            <cmdInfo.icon className={`w-4 h-4 ${cmdInfo.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm mb-1">{cmdInfo.description}</div>
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          </div>
                        </div>
                      ) : null
                    })()}
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  </div>
                ) : (
                  <div
                    className={message.role === "user" ? "text-sm" : "prose prose-sm max-w-none dark:prose-invert"}
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Loader2 className="w-3 h-3 animate-spin text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">{agentName}</span>
                <span className="text-xs text-muted-foreground">thinking...</span>
              </div>
              <div className="ml-8">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Command Palette */}
      {showCommands && (
        <div className="mx-4 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-border overflow-hidden">
          <div className="p-2 bg-gray-50 dark:bg-gray-900 border-b border-border">
            <div className="text-xs font-medium text-muted-foreground px-2">Available Commands</div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {COMMANDS.filter((cmd) => cmd.name.includes(input.slice(1).toLowerCase())).map((cmd, index) => (
              <button
                key={cmd.name}
                onClick={() => handleCommandSelect(cmd.name)}
                className={`w-full flex items-center gap-3 p-3 transition-colors text-left ${
                  index === activeCommandIndex ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                    index === activeCommandIndex
                      ? "bg-primary-foreground/10"
                      : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
                  }`}
                >
                  <cmd.icon
                    className={`w-4 h-4 ${index === activeCommandIndex ? "text-primary-foreground" : cmd.color}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">/{cmd.name}</div>
                  <div
                    className={`text-xs ${
                      index === activeCommandIndex ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {cmd.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Text Preview - only show when text is actually selected */}
      {selectedText && (
        <div className="mx-4 mb-2">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 shadow-sm">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Selected context:</div>
                <div className="text-xs text-blue-800 dark:text-blue-200 line-clamp-2">"{selectedText}"</div>
              </div>
              <button
                onClick={() => setSelectedText("")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                title="Remove context"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 border border-input rounded-md px-3 py-2 bg-background">
            {selectedCommand !== "none" && (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                /{selectedCommand}
                <button
                  onClick={removeCommand}
                  className="ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <input
              placeholder={
                selectedCommand !== "none" ? "Type your message..." : "Type / for commands or ask anything..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (showCommands) {
                  const filteredCommands = COMMANDS.filter((cmd) =>
                    cmd.name.includes(input.slice(1).toLowerCase())
                  )

                  if (e.key === "ArrowDown") {
                    e.preventDefault()
                    setActiveCommandIndex((prev) => (prev + 1) % filteredCommands.length)
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault()
                    setActiveCommandIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
                  } else if (e.key === "Enter") {
                    e.preventDefault()
                    handleCommandSelect(filteredCommands[activeCommandIndex].name)
                    return
                  } else if (e.key === "Escape") {
                    setShowCommands(false)
                    setInput("")
                  }
                } else if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={isLoading}
              ref={inputRef}
              className="flex-1 outline-none bg-transparent text-sm"
            />
          </div>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && selectedCommand === "none")}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">Press / to see commands • Select text in chat to use as context</p>
          {selectedText && (
            <Badge variant="outline" className="text-xs">
              Context captured
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}