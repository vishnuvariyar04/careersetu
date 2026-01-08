// Filename: components/AIChat.tsx

"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bot, Send, Loader2, User, Trash2, Video, BookOpen, FileText, Code, Lightbulb, MessageSquare, X, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

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
  learningPaneKey,
  selectedTask,
  learningPrefill,
  hideHeader = false,
  showToolsRow = true,
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  

  // Streaming Avatar (Learning Agent) integration – only when video panel is open
  const avatarVideoRef = useRef<HTMLVideoElement>(null)
  const avatarRef = useRef<any>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const hasSpokenRef = useRef(false)
  const LEARNING_AVATAR_SCRIPT = "Hello! I am your learning coach avatar. Let's get started."
  const [videoMuted, setVideoMuted] = useState(true)
  const sdkModuleRef = useRef<any>(null);

  // Collapsible side video panel
  const [showVideoPanel, setShowVideoPanel] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

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

  // Handle text selection
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

    container.addEventListener("mouseup", handleMouseUp)
    return () => {
      container.removeEventListener("mouseup", handleMouseUp)
    }
  }, [chatAreaRef])

  // Auto-scroll
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Auto-resize textarea like ChatGPT
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const maxHeight = 200 // ~8 lines
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + 'px'
  }, [input])

  

  // Enhance code blocks in assistant messages with copy buttons
  useEffect(() => {
    const container = chatAreaRef.current
    if (!container) return
    const blocks = Array.from(container.querySelectorAll('.assistant-message pre')) as HTMLElement[]
    blocks.forEach((pre) => {
      const wrapper = pre.parentElement as HTMLElement | null
      if (!wrapper) return
      wrapper.classList.add('relative', 'group')
      if (wrapper.querySelector('.copy-btn')) return
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'copy-btn absolute top-2 right-2 rounded-md border bg-background px-2 py-1 text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow'
      btn.textContent = 'Copy'
      btn.addEventListener('click', () => {
        try {
          const code = pre.textContent || ''
          navigator.clipboard.writeText(code)
          btn.textContent = 'Copied'
          setTimeout(() => (btn.textContent = 'Copy'), 1200)
        } catch (_) {}
      })
      wrapper.appendChild(btn)
    })
  }, [messages])

  // Initialize Streaming Avatar when video panel is shown and no direct videoUrl is provided
  useEffect(() => {
    if (!showVideoPanel || videoUrl) return
    let isMounted = true
    ;(async () => {
      try {
        const avatarId = process.env.NEXT_PUBLIC_HEYGEN_AVATAR_ID || "Ann_Therapist_public"
        const basePath = process.env.NEXT_PUBLIC_BASE_API_URL || "https://api.heygen.com"

        const mod: any = await import("@heygen/streaming-avatar")
        if (isMounted) {
            sdkModuleRef.current = mod;
        }
        if (!isMounted) return
        
        const res = await fetch("/api/get-access-token", { method: "POST" })
        if (!res.ok) {
          setAvatarError(`Failed to fetch access token: HTTP ${res.status}`)
          return
        }
        const token = await res.text()

        const StreamingAvatarCtor =
          typeof mod?.default === "function" ? mod.default :
          typeof mod?.StreamingAvatar === "function" ? mod.StreamingAvatar :
          typeof mod?.default?.StreamingAvatar === "function" ? mod.default.StreamingAvatar : null
          
        if (!StreamingAvatarCtor) {
          throw new Error("StreamingAvatar constructor not found in SDK module")
        }

        const ns = typeof mod?.default === "object" && !("prototype" in (mod.default || {})) ? mod.default : mod
        const { StreamingEvents, AvatarQuality, VoiceChatTransport, VoiceEmotion, STTProvider, TaskType, TaskMode } = ns

        avatarRef.current = new StreamingAvatarCtor({ token, basePath })

        avatarRef.current.on(StreamingEvents.STREAM_READY, ({ detail }: any) => {
          if (!avatarVideoRef.current) return
          avatarVideoRef.current.srcObject = detail
          avatarVideoRef.current.onloadedmetadata = () => {
            avatarVideoRef.current?.play?.()
          }
        })

        await avatarRef.current.createStartAvatar({
          quality: AvatarQuality.Low,
          avatarName: avatarId,
          voice: {
            rate: 1.2,
            emotion: VoiceEmotion.EXCITED,
          },
          language: "en",
        })

        if (!hasSpokenRef.current) {
          hasSpokenRef.current = true
          await avatarRef.current.speak({
            text: LEARNING_AVATAR_SCRIPT,
            taskType: TaskType.REPEAT,
            taskMode: TaskMode.ASYNC,
          })
        }
      } catch (e: any) {
        const msg = e?.message || String(e)
        console.error("Learning avatar init error", e)
        setAvatarError(`Avatar failed to initialize: ${msg}.`)
      }
    })()

    return () => {
      isMounted = false
      try {
        avatarRef.current?.stopAvatar?.()
      } catch {}
    }
  }, [showVideoPanel, videoUrl])

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
    const currentMessageData = { ...messageData }
    setInput("")
    setSelectedCommand("none")
    // Open video panel immediately for /video requests
    if (currentMessageData.command === 'video') {
      setShowVideoPanel(true)
      setVideoUrl(null)
    }
    setIsLoading(true)

    try {
      const requestBody = {
        uid: uid,
        company_id: company_id,
        project_id: project_id,
        message_data: currentMessageData,
        team_id: team_id,
      }

      const response = await fetch("https://n8n.srv1034714.hstgr.cloud/webhook/c6df30d4-8536-4bca-9546-ce2399081e87", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) throw new Error(`API request failed with status ${response.status}`)

      const apiResponse: any = await response.json()

      if (apiResponse && apiResponse.output) {
        // If API returns a concrete video URL, prefer inline player
        if (apiResponse.video_url) {
          setVideoUrl(apiResponse.video_url)
        }
        
        // Process the output - check if it's JSON with html_explanation
        let processedContent = apiResponse.output
        try {
          const parsed = JSON.parse(apiResponse.output)
          if (parsed.html_explanation) {
            // Use the html_explanation as-is (it's already HTML formatted)
            processedContent = parsed.html_explanation
          }
        } catch (e) {
          // Not JSON or doesn't have html_explanation, use output as-is
          processedContent = apiResponse.output
        }
        
        // Speak via avatar only if video panel is open and no direct video URL
        if (showVideoPanel && !apiResponse.video_url && avatarRef.current && sdkModuleRef.current) {
          try {
            const ns = typeof sdkModuleRef.current?.default === "object" ? sdkModuleRef.current.default : sdkModuleRef.current;
            const { TaskType, TaskMode } = ns;
            
            // Strip HTML tags for speech
            const textForSpeech = processedContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
            
            await avatarRef.current.speak({ 
                text: textForSpeech.substring(0, 500), // Limit length for speech
                taskType: TaskType.REPEAT,
                taskMode: TaskMode.ASYNC,
            });
          } catch (e) {
            console.error("Avatar failed to speak the new response:", e);
          }
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: processedContent,
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
      .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
      .replace("AM", "am").replace("PM", "pm")
  }

  const getCommandInfo = (commandName: string) => {
    return COMMANDS.find((cmd) => cmd.name === commandName)
  }

  const closeVideoPanel = () => {
    setShowVideoPanel(false)
    setVideoUrl(null)
    setVideoMuted(true)
    try { avatarRef.current?.stopAvatar?.() } catch {}
  }

  return (
    <div
        key={learningPaneKey}
        className={`h-full flex overflow-hidden ${showVideoPanel ? 'gap-0' : ''}`}
    >
        {/* --- MAIN: CHAT INTERFACE --- */}
        <div className={`flex flex-col h-full overflow-hidden ${showVideoPanel ? 'flex-1' : 'w-full'} min-w-0 bg-background`}>
            {/* Header */}
            {!hideHeader && (
              <header className="flex-shrink-0 px-6 py-3.5 border-b">
                  <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-primary-foreground" />
                          </div>
                          <h3 className="font-medium text-sm truncate">{agentName}</h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleClearHistory} 
                        title="Clear chat history"
                        className="flex-shrink-0 h-8 px-2 text-xs"
                      >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Clear
                      </Button>
                  </div>
              </header>
            )}

            {/* Messages Area with Proper Scrolling */}
            <div 
              className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 relative" 
              ref={scrollAreaRef}
              style={{ scrollbarGutter: 'stable' }}
            >
                <div 
                  className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 space-y-6" 
                  ref={chatAreaRef}
                >
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4">
                                <Bot className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">How can I help you today?</h3>
                            <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
                                Ask me anything or use commands to get specific help
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
                                {COMMANDS.map((cmd) => (
                                    <button
                                        key={cmd.name}
                                        onClick={() => handleCommandSelect(cmd.name)}
                                        className="flex items-start gap-3 p-3.5 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
                                    >
                                        <cmd.icon className={`w-5 h-5 ${cmd.color} mt-0.5 flex-shrink-0`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium mb-0.5">/{cmd.name}</div>
                                            <div className="text-xs text-muted-foreground leading-relaxed">{cmd.description}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((message) => {
                        const isUser = message.role === 'user'
                        return (
                          <div 
                            key={message.id} 
                            className="group"
                          >
                            <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                              {/* Avatar - only for assistant */}
                              {!isUser && (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 mt-1">
                                  <Bot className="w-4 h-4 text-primary-foreground" />
                                </div>
                              )}

                              {/* Message Content */}
                              <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}>
                                {/* Context Chip for User Messages */}
                                {message.context && isUser && (
                                  <div className="mb-2 inline-block max-w-full">
                                    <div className="bg-muted/50 border rounded-lg px-3 py-2 text-left">
                                      <div className="flex items-start gap-2">
                                        <Lightbulb className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <div className="text-xs font-medium text-muted-foreground mb-0.5">
                                            Context
                                          </div>
                                          <div className="text-xs text-foreground/80 break-words">
                                            "{message.context}"
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Message Text */}
                                <div className={`inline-block text-left max-w-full ${isUser ? 'text-right' : ''}`}>
                                  <div
                                    className={`
                                      prose prose-sm max-w-none dark:prose-invert
                                      prose-p:my-3 prose-p:leading-[1.7] prose-p:text-[15px]
                                      prose-headings:font-semibold prose-headings:tracking-tight
                                      prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4 prose-h1:pb-2 prose-h1:border-b
                                      prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                                      prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2
                                      prose-h4:text-base prose-h4:mt-4 prose-h4:mb-2
                                      prose-ul:my-3 prose-ul:space-y-1.5
                                      prose-ol:my-3 prose-ol:space-y-1.5
                                      prose-li:my-1 prose-li:leading-relaxed
                                      prose-pre:my-4 prose-pre:bg-muted/50 prose-pre:border prose-pre:rounded-lg prose-pre:p-4
                                      prose-code:text-sm prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:bg-muted/50 prose-code:font-mono
                                      prose-code:before:content-none prose-code:after:content-none
                                      prose-strong:font-semibold prose-strong:text-foreground
                                      prose-em:italic
                                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                                      prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic
                                      prose-hr:my-6 prose-hr:border-border
                                      prose-img:rounded-lg prose-img:shadow-sm
                                      break-words
                                      ${isUser ? 'text-foreground/90' : ''}
                                    `}
                                    dangerouslySetInnerHTML={{ __html: message.content }}
                                  />
                                </div>

                                {/* Timestamp - shows on hover */}
                                <div className={`mt-1 text-[11px] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'text-right' : 'text-left'}`}>
                                  {formatTime(message.timestamp)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                    })}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 mt-1">
                                <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                            </div>
                            <div className="flex-1 max-w-3xl pt-1">
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <span className="animate-pulse">●</span>
                                    <span className="animate-pulse animation-delay-200">●</span>
                                    <span className="animate-pulse animation-delay-400">●</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Clear History Button (when header is hidden) */}
            {hideHeader && (
              <div className="absolute right-4 top-4 z-10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClearHistory} 
                  title="Clear chat history"
                  className="opacity-60 hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Input Composer - Fixed at Bottom */}
            <div 
              ref={inputContainerRef} 
              className="flex-shrink-0 border-t"
            >
              <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-3.5">
                    {/* Selected Context Chip */}
                    {selectedText && (
                      <div className="mb-2.5">
                        <div className="bg-muted/50 border rounded-lg px-3 py-2">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                Context
                              </div>
                              <div className="text-xs text-foreground/80 break-words line-clamp-2">
                                "{selectedText}"
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedText("")}
                              className="flex-shrink-0 p-1 hover:bg-muted rounded"
                              title="Remove context"
                            >
                              <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Command Suggestions Menu */}
                    {showCommands && (
                      <div className="mb-2.5">
                        <div className="rounded-lg border bg-popover shadow-lg overflow-hidden">
                          {COMMANDS.filter(cmd => cmd.name.includes(input.slice(1).toLowerCase())).slice(0,5).map((cmd, index) => (
                            <button
                              key={cmd.name}
                              onClick={() => handleCommandSelect(cmd.name)}
                              className={`
                                w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                                ${index === activeCommandIndex 
                                  ? 'bg-accent' 
                                  : 'hover:bg-muted/50'
                                }
                              `}
                            >
                              <cmd.icon className={`w-4 h-4 flex-shrink-0 ${cmd.color}`} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium">/{cmd.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {cmd.description}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input Composer */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1 flex items-center gap-2 rounded-xl border bg-background px-3.5 py-2 shadow-sm transition-colors focus-within:border-primary/60">
                        {showToolsRow && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="shrink-0 rounded-full p-1.5 hover:bg-accent" title="Tools">
                                <Plus className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                              {COMMANDS.map((cmd) => (
                                <DropdownMenuItem key={cmd.name} onClick={() => handleCommandSelect(cmd.name)}>
                                  <cmd.icon className={`mr-2 h-4 w-4 ${cmd.color}`} /> /{cmd.name} — {cmd.description}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {selectedCommand !== 'none' && (
                          <div className="flex items-center gap-1 shrink-0 bg-muted/80 rounded-md px-2 py-1">
                            <span className="text-xs font-medium text-foreground/80">/{selectedCommand}</span>
                            <button 
                              onClick={removeCommand} 
                              className="hover:bg-muted-foreground/20 rounded p-0.5 transition-colors"
                              title="Remove command"
                            >
                              <X className="w-2.5 h-2.5 text-muted-foreground" />
                            </button>
                          </div>
                        )}
                        <textarea
                          placeholder={selectedCommand !== 'none' ? 'Type your message...' : 'Message AI Assistant...'}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (showCommands) {
                              const filtered = COMMANDS.filter(cmd => cmd.name.includes(input.slice(1).toLowerCase()))
                              if (e.key === 'ArrowDown') {
                                e.preventDefault()
                                setActiveCommandIndex(i => (i + 1) % filtered.length)
                              }
                              else if (e.key === 'ArrowUp') {
                                e.preventDefault()
                                setActiveCommandIndex(i => (i - 1 + filtered.length) % filtered.length)
                              }
                              else if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleCommandSelect(filtered[activeCommandIndex]?.name)
                              }
                              else if (e.key === 'Escape') setShowCommands(false)
                            } else if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSend()
                            }
                          }}
                          disabled={isLoading}
                          ref={textareaRef as any}
                          rows={1}
                          className="flex-1 outline-none bg-transparent text-[15px] leading-relaxed w-full resize-none max-h-[200px] placeholder:text-muted-foreground/50 disabled:opacity-50"
                        />
                      </div>
                      <Button
                        size="icon"
                        variant={input.trim() || selectedCommand !== 'none' ? 'default' : 'ghost'}
                        className="rounded-lg h-9 w-9 flex-shrink-0 transition-all"
                        onClick={handleSend}
                        disabled={isLoading || (!input.trim() && selectedCommand === 'none')}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
              </div>
            </div>
        </div>

        {/* --- SIDE: VIDEO PANEL --- */}
        {showVideoPanel && (
          <aside className="w-full sm:w-96 h-full border-l border-border bg-muted/20 flex flex-col">
            {/* Panel Header */}
            <header className="flex-shrink-0 px-4 py-3 border-b border-border bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <Video className="w-4 h-4 text-red-500" />
                  </div>
                  <h3 className="text-sm font-semibold">Video Tutorial</h3>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={closeVideoPanel}
                  className="h-8 px-3"
                >
                  <X className="w-4 h-4 mr-1" />
                  Close
                </Button>
              </div>
            </header>

            {/* Video Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {videoUrl ? (
                <div className="space-y-3">
                  <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                    <video 
                      controls 
                      playsInline 
                      className="w-full h-full object-contain"
                    >
                      <source src={videoUrl ?? undefined} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Video tutorial generated successfully
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-video bg-gradient-to-br from-black to-black/80 rounded-xl overflow-hidden shadow-lg">
                    <video 
                      ref={avatarVideoRef} 
                      autoPlay 
                      playsInline 
                      muted={videoMuted} 
                      className="w-full h-full object-contain"
                    >
                      <track kind="captions" />
                    </video>
                    {videoMuted && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Button 
                          size="sm"
                          className="shadow-lg"
                          onClick={() => {
                            setVideoMuted(false)
                            try { avatarVideoRef.current?.play?.() } catch {}
                          }}
                        >
                          🔊 Enable Sound
                        </Button>
                      </div>
                    )}
                  </div>
                  {avatarError ? (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-xs text-destructive">{avatarError}</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-900 dark:text-blue-100">
                          Your AI tutor is preparing an interactive video explanation. This may take a moment...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
    </div>
  )
}