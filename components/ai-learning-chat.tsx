// Filename: components/AIChat.tsx

"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  inputVariant = 'sticky',
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
  const isFloating = inputVariant === 'floating'

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
        // Speak via avatar only if video panel is open and no direct video URL
        if (showVideoPanel && !apiResponse.video_url && avatarRef.current && sdkModuleRef.current) {
          try {
            const ns = typeof sdkModuleRef.current?.default === "object" ? sdkModuleRef.current.default : sdkModuleRef.current;
            const { TaskType, TaskMode } = ns;
            
            await avatarRef.current.speak({ 
                text: apiResponse.output,
                taskType: TaskType.REPEAT,
                taskMode: TaskMode.ASYNC,
            });
          } catch (e) {
            console.error("Avatar failed to speak the new response:", e);
          }
        }

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
        className={`h-full min-h-0 overflow-hidden grid ${showVideoPanel ? 'grid-cols-[1fr_380px]' : 'grid-cols-1'}`}
    >
        {/* --- MAIN: CHAT INTERFACE --- */}
        <div className="flex flex-col h-full min-h-0 relative">
            {!hideHeader && (
              <div className="p-4 border-b border-border bg-muted/40">
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
            )}

            <ScrollArea className={`flex-1 p-4 ${isFloating ? 'pb-4' : 'pb-36'}`} ref={scrollAreaRef}>
                <div className="space-y-4 mx-auto max-w-2xl" ref={chatAreaRef}>
                    {messages.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bot className="w-8 h-8 text-primary-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Start Learning!</h3>
                            <p className="text-sm text-muted-foreground mb-4">Type / to see available commands</p>
                            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                                {COMMANDS.map((cmd) => (
                                    <button
                                        key={cmd.name}
                                        onClick={() => handleCommandSelect(cmd.name)}
                                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
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
                        <div key={message.id} className="flex items-start gap-3">
                            {message.role === "assistant" ? (
                                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0">
                                    <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                                </div>
                            ) : (
                                <Avatar className="w-7 h-7 shrink-0">
                                    <AvatarFallback className="text-[10px]"> <User className="w-3 h-3" /> </AvatarFallback>
                                </Avatar>
                            )}
                            <div className="flex-1">
                                {message.context && message.role === "user" && (
                                    <div className="mb-2">
                                        <div className="bg-amber-50 dark:bg-amber-950 border-l-4 border-amber-400 p-3 rounded-r-lg">
                                            <div className="flex items-start gap-2">
                                                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">Context:</div>
                                                    <div className="text-xs text-amber-800 dark:text-amber-200 italic line-clamp-2">"{message.context}"</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className={`${message.role === 'assistant' ? 'assistant-message bg-muted' : 'bg-background'} border rounded-2xl px-4 py-3`}> 
                                    <div
                                        className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ __html: message.content }}
                                    />
                                </div>
                                <div className="mt-1 text-[11px] text-muted-foreground">{formatTime(message.timestamp)}</div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <Loader2 className="w-3 h-3 animate-spin text-primary-foreground" />
                            </div>
                            <span className="text-sm font-medium">{agentName} is thinking...</span>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {hideHeader && (
              <div className="absolute right-2 top-2 z-10 opacity-60 hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={handleClearHistory} title="Clear chat history">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}

            {showCommands && (
                <div className="mx-4 mb-2 bg-background rounded-lg shadow-lg border">
                    <div className="p-2 border-b"><div className="text-xs font-semibold px-2">COMMANDS</div></div>
                    <div className="max-h-64 overflow-y-auto">
                        {COMMANDS.filter((cmd) => cmd.name.includes(input.slice(1).toLowerCase())).map((cmd, index) => (
                            <button
                                key={cmd.name}
                                onClick={() => handleCommandSelect(cmd.name)}
                                className={`w-full flex items-center gap-3 p-3 text-left ${index === activeCommandIndex ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                            >
                                <cmd.icon className={`w-4 h-4 ${index !== activeCommandIndex && cmd.color}`} />
                                <div className="flex-1">
                                    <div className="text-sm font-medium">/{cmd.name}</div>
                                    <div className={`text-xs ${index === activeCommandIndex ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{cmd.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {selectedText && (
                <div className="mx-4 mb-2">
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Selected context:</div>
                                <div className="text-xs text-blue-800 dark:text-blue-200 line-clamp-2">"{selectedText}"</div>
                            </div>
                            <button onClick={() => setSelectedText("")} title="Remove context">
                                <X className="w-4 h-4 text-blue-500 hover:text-blue-700" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isFloating ? (
                <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[env(safe-area-inset-bottom)] pointer-events-none">
                    <div className="pointer-events-auto mx-auto w-full max-w-[900px] relative">
                        <div className="absolute -top-4 left-0 right-0 h-4 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                        <div className="flex items-end gap-2">
                            <div className="flex-1 flex items-start gap-2 rounded-2xl border border-input bg-background px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/30">
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
                                    <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                                        /{selectedCommand}
                                        <button onClick={removeCommand} className="ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                )}
                                <textarea
                                    placeholder={selectedCommand !== 'none' ? 'Type your message...' : 'Message the tutor...'}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (showCommands) {
                                            const filtered = COMMANDS.filter(cmd => cmd.name.includes(input.slice(1).toLowerCase()));
                                            if (e.key === 'ArrowDown') setActiveCommandIndex(i => (i + 1) % filtered.length);
                                            else if (e.key === 'ArrowUp') setActiveCommandIndex(i => (i - 1 + filtered.length) % filtered.length);
                                            else if (e.key === 'Enter') handleCommandSelect(filtered[activeCommandIndex].name);
                                            else if (e.key === 'Escape') setShowCommands(false);
                                        } else if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    disabled={isLoading}
                                    ref={textareaRef as any}
                                    rows={1}
                                    className="flex-1 outline-none bg-transparent text-sm w-full resize-none max-h-[200px]"
                                />
                            </div>
                            <Button
                                size="icon"
                                className="rounded-full h-10 w-10 shadow"
                                onClick={handleSend}
                                disabled={isLoading || (!input.trim() && selectedCommand === 'none')}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="sticky bottom-0 left-0 right-0 px-4 pt-3 pb-2 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="mx-auto max-w-2xl">
                        <div className="flex items-end gap-2">
                            <div className="flex-1 flex items-start gap-2 rounded-2xl border border-input bg-background px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/30">
                                {selectedCommand !== "none" && (
                                    <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                                        /{selectedCommand}
                                        <button onClick={removeCommand} className="ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                )}
                                <textarea
                                    placeholder={selectedCommand !== "none" ? "Type your message..." : "Message the tutor..."}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (showCommands) {
                                            const filtered = COMMANDS.filter(cmd => cmd.name.includes(input.slice(1).toLowerCase()));
                                            if (e.key === "ArrowDown") setActiveCommandIndex(i => (i + 1) % filtered.length);
                                            else if (e.key === "ArrowUp") setActiveCommandIndex(i => (i - 1 + filtered.length) % filtered.length);
                                            else if (e.key === "Enter") handleCommandSelect(filtered[activeCommandIndex].name);
                                            else if (e.key === "Escape") setShowCommands(false);
                                        } else if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    disabled={isLoading}
                                    ref={textareaRef as any}
                                    rows={1}
                                    className="flex-1 outline-none bg-transparent text-sm w-full resize-none max-h-[200px]"
                                />
                            </div>
                            <Button
                                size="icon"
                                className="rounded-full h-10 w-10 shadow"
                                onClick={handleSend}
                                disabled={isLoading || (!input.trim() && selectedCommand === "none")}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="mt-2">
                            <div className="mx-auto max-w-2xl flex items-center gap-2">
                                <span className="text-xs text-muted-foreground px-1">Tools</span>
                                <div className="flex-1 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    {COMMANDS.map((cmd) => (
                                        <button
                                            key={cmd.name}
                                            onClick={() => handleCommandSelect(cmd.name)}
                                            className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 hover:bg-muted px-3 py-1 text-xs mr-2"
                                            title={`/${cmd.name} — ${cmd.description}`}
                                        >
                                            <cmd.icon className={`w-3.5 h-3.5 ${cmd.color}`} />
                                            <span>/{cmd.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* --- SIDE: COLLAPSIBLE VIDEO PANEL --- */}
        {showVideoPanel && (
          <aside className="h-full border-l border-border flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="text-sm font-medium flex items-center gap-2"><Video className="w-4 h-4" /> Video</div>
              <Button size="sm" variant="ghost" onClick={closeVideoPanel}>Close</Button>
            </div>
            <div className="p-3 flex-1 overflow-auto">
              {videoUrl ? (
                <div className="aspect-video bg-black/5 rounded overflow-hidden">
                  <video controls playsInline className="w-full h-full object-contain">
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                </div>
              ) : (
                <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                  <video ref={avatarVideoRef} autoPlay playsInline muted={videoMuted} className="w-full h-full object-contain">
                    <track kind="captions" />
                  </video>
                  {videoMuted && (
                    <div className="absolute inset-x-0 bottom-3 flex justify-center">
                      <Button size="sm" onClick={() => {
                        setVideoMuted(false)
                        try { avatarVideoRef.current?.play?.() } catch {}
                      }}>
                        Enable sound
                      </Button>
                    </div>
                  )}
                  {avatarError && <div className="text-xs text-destructive mt-2">{avatarError}</div>}
                </div>
              )}
              {!videoUrl && (
                <p className="text-xs text-muted-foreground mt-2">Generating an explanation video. This may take a moment.</p>
              )}
            </div>
          </aside>
        )}
    </div>
  )
}