"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, ChevronDown, MessageSquare, Plus, Sparkles, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface PmChatMessage {
  role: "student" | "agent"
  content: string
  created_at: string
  tool_calls_made?: string[]
}

interface PmSession {
  session_id: string
  created_at: string
}

interface PmAgentChatProps {
  studentId: string
  environmentId: string | null
  companyName?: string
  studentInitial?: string
}

export function PmAgentChat({ studentId, environmentId, companyName, studentInitial = "U" }: PmAgentChatProps) {
  const [sessions, setSessions] = useState<PmSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isNewConversation, setIsNewConversation] = useState(false)
  const [messages, setMessages] = useState<PmChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState("")
  const [showPicker, setShowPicker] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const prevEnvironmentRef = useRef<string | null>(null)

  const normalizeSession = (raw: any): PmSession | null => {
    const sessionId = raw?.session_id ?? raw?.id ?? raw?.sessionId ?? null
    if (!sessionId) return null
    return {
      session_id: String(sessionId),
      created_at: String(raw?.created_at ?? raw?.createdAt ?? new Date().toISOString()),
    }
  }

  const normalizeMessage = (raw: any): PmChatMessage | null => {
    const roleRaw = String(raw?.role ?? "").toLowerCase()
    const role: "student" | "agent" =
      roleRaw === "student" || roleRaw === "user" ? "student" : "agent"
    const content = raw?.content ?? raw?.message ?? raw?.text
    if (!content) return null
    return {
      role,
      content: String(content),
      created_at: String(raw?.created_at ?? raw?.createdAt ?? new Date().toISOString()),
      tool_calls_made: Array.isArray(raw?.tool_calls_made) ? raw.tool_calls_made : undefined,
    }
  }

  const fetchSessions = useCallback(async (envId: string) => {
    try {
      const res = await fetch(`/api/agent/sessions?student_id=${studentId}&environment_id=${envId}`)
      if (!res.ok) return
      const data = await res.json()
      const rawList: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.sessions)
          ? data.sessions
          : Array.isArray(data?.data)
            ? data.data
            : []
      const list = rawList
        .map(normalizeSession)
        .filter((s): s is PmSession => Boolean(s))
        .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      setSessions(list)

      // Re-select a valid session for this environment.
      const currentIsValid = activeSessionId && list.some((s) => s.session_id === activeSessionId)
      if (!currentIsValid && !isNewConversation) {
        setActiveSessionId(list[0]?.session_id ?? null)
      }
    } catch (e) {
      console.error("fetchPmSessions", e)
    }
  }, [studentId, activeSessionId, isNewConversation])

  const fetchMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/agent/sessions/${sessionId}/messages?limit=50`)
      if (!res.ok) return
      const data = await res.json()
      const rawList: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.messages)
          ? data.messages
          : Array.isArray(data?.data)
            ? data.data
            : []
      setMessages(
        rawList
          .map(normalizeMessage)
          .filter((m): m is PmChatMessage => Boolean(m))
      )
    } catch (e) {
      console.error("fetchPmMessages", e)
    }
  }, [])

  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId)
    } else {
      setMessages([])
    }
  }, [activeSessionId, fetchMessages])

  useEffect(() => {
    if (!environmentId) return
    // Environment switched -> reset local session/message state first.
    if (prevEnvironmentRef.current && prevEnvironmentRef.current !== environmentId) {
      setActiveSessionId(null)
      setMessages([])
      setSessions([])
      setIsNewConversation(false)
    }
    prevEnvironmentRef.current = environmentId
    fetchSessions(environmentId)
  }, [environmentId, fetchSessions])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading || !environmentId) return

    const userMsg: PmChatMessage = { role: "student", content: text, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          environment_id: environmentId,
          message: text,
          session_id: activeSessionId,
        }),
      })
      if (!res.ok) throw new Error(`Agent error: ${res.status}`)
      const data = await res.json()

      if (!activeSessionId && data.session_id) {
        setActiveSessionId(data.session_id)
        setIsNewConversation(false)
        setSessions(prev => [{ session_id: data.session_id, created_at: new Date().toISOString() }, ...prev])
      }

      const agentMsg: PmChatMessage = {
        role: "agent",
        content: data.reply,
        created_at: new Date().toISOString(),
        tool_calls_made: data.tool_calls_made,
      }
      setMessages(prev => [...prev, agentMsg])
    } catch (e) {
      console.error("PM Agent send error:", e)
      setMessages(prev => [
        ...prev,
        { role: "agent", content: "Sorry, I couldn't reach the PM Agent. Please try again.", created_at: new Date().toISOString() },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const startNewSession = () => {
    setActiveSessionId(null)
    setMessages([])
    setIsNewConversation(true)
    setShowPicker(false)
  }

  return (
    <div className="h-full bg-[#1f2121]/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-white/10 bg-black/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <h1 className="text-[15px] font-semibold text-white">PM Agent</h1>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              {companyName || "Chat"}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-white/60 hover:text-white hover:bg-white/10 transition border border-white/5"
              >
                <MessageSquare className="w-3 h-3" />
                {isNewConversation ? "New conversation" : activeSessionId ? "Session" : "No session"}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showPicker && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-[#1a1d1d] border border-white/10 rounded-lg shadow-2xl z-50 py-1 max-h-60 overflow-y-auto">
                  <button
                    onClick={startNewSession}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-emerald-400 hover:bg-white/5 transition"
                  >
                    <Plus className="w-3 h-3" /> New conversation
                  </button>
                  <div className="h-px bg-white/5 my-1" />
                  {sessions.map((s) => (
                    <button
                      key={s.session_id}
                      onClick={() => {
                        setActiveSessionId(s.session_id)
                        setIsNewConversation(false)
                        setShowPicker(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-[11px] transition truncate ${
                        activeSessionId === s.session_id
                          ? "bg-white/10 text-white"
                          : "text-white/50 hover:bg-white/5 hover:text-white/80"
                      }`}
                    >
                      {new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </button>
                  ))}
                  {sessions.length === 0 && (
                    <p className="px-3 py-2 text-[11px] text-white/30 italic">No previous sessions</p>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={startNewSession}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
              title="New conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Bot className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-[15px] font-medium text-white mb-1">PM Agent</p>
              <p className="text-[13px] text-white/50 max-w-sm">
                Ask about your tasks, get code review feedback, or request guidance on your current project.
              </p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "student" ? "justify-end" : "justify-start"}`}>
              {msg.role === "agent" && (
                <Avatar className="h-7 w-7 mr-2 flex-shrink-0">
                  <AvatarFallback className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Bot className="w-3.5 h-3.5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[80%] rounded-lg px-3.5 py-2.5 ${
                msg.role === "student"
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-white border border-white/10"
              }`}>
                {msg.role === "agent" ? (
                  <div className="prose prose-invert prose-sm max-w-none text-[13px] leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-emerald-300 [&_code]:text-[12px] [&_pre]:bg-black/30 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:border [&_pre]:border-white/5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-[13px] leading-relaxed">{msg.content}</p>
                )}
                {msg.tool_calls_made && msg.tool_calls_made.length > 0 && (
                  <p className="text-[10px] text-white/30 mt-1.5 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Used: {msg.tool_calls_made.join(", ")}
                  </p>
                )}
                <p className={`text-[10px] mt-1 ${msg.role === "student" ? "text-white/50" : "text-white/30"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {msg.role === "student" && (
                <Avatar className="h-7 w-7 ml-2 flex-shrink-0">
                  <AvatarFallback className="bg-white/10 text-white border border-white/20">
                    {studentInitial}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Avatar className="h-7 w-7 mr-2 flex-shrink-0">
                <AvatarFallback className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Bot className="w-3.5 h-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 text-[12px] text-white/50">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  Agent is thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-2.5 border-t border-white/10 bg-black/20 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask PM Agent about your tasks, PRs, or progress..."
            className="flex-1 px-3.5 py-2 rounded-lg border border-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/30 bg-white/5 text-white text-[13px] placeholder:text-white/30 transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
