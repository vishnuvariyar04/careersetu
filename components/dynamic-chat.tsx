"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Loader2, User } from "lucide-react"

type UIType =
  | "multi_choice"
  | "single_choice"
  | "buttons"
  | "message"
  | "links_input"
  | "text_input"

type WebhookBlock = {
  id: string
  ui_type: UIType
  content: string
  options?: string[]
  max_select?: number
  placeholder?: string
}

type ConversationItem =
  | { role: "assistant"; block: WebhookBlock }
  | { role: "user"; blockId: string; summary: string }

type DynamicChatProps = {
  webhookUrl: string
  context?: Record<string, any>
  className?: string
}

export function DynamicChat({ webhookUrl, context, className }: DynamicChatProps) {
  const [conversation, setConversation] = useState<ConversationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // local interaction state for the currently active assistant block
  const [currentSelections, setCurrentSelections] = useState<Record<string, Set<string>>>({})
  const [currentInputs, setCurrentInputs] = useState<Record<string, { github?: string; linkedin?: string }>>({})

  const scrollRef = useRef<HTMLDivElement>(null)

  const assistantBlocks = useMemo(
    () => conversation.filter((c) => c.role === "assistant") as { role: "assistant"; block: WebhookBlock }[],
    [conversation]
  )

  const activeAssistant = assistantBlocks[assistantBlocks.length - 1]

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [conversation, isLoading])

  const normalizeBlock = (b: any): WebhookBlock => {
    const id = typeof b?.id === "string" && b.id.length > 0 ? b.id : crypto.randomUUID()
    const ui_type = (b?.ui_type as UIType) || "message"
    const contentSource =
      typeof b?.content === "string"
        ? b.content
        : typeof b?.text === "string"
          ? b.text
          : typeof b?.message === "string"
            ? b.message
            : ""
    const content = contentSource
    const options: string[] | undefined = Array.isArray(b?.options)
      ? b.options.map((o: any) => String(o))
      : undefined
    const max_select = typeof b?.max_select === "number" ? b.max_select : undefined
    const placeholder = typeof b?.placeholder === "string" ? b.placeholder : undefined
    return { id, ui_type, content, options, max_select, placeholder }
  }

  const parseWebhookResponse = (raw: any): WebhookBlock[] => {
    try {
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) return parsed.map(normalizeBlock)
          if (parsed && typeof parsed === "object") {
            if (Array.isArray((parsed as any).blocks)) return (parsed as any).blocks.map(normalizeBlock)
            return [normalizeBlock(parsed)]
          }
        } catch (_) {
          const lines = raw
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean)
          const blocks: WebhookBlock[] = []
          for (const line of lines) {
            try {
              const obj = JSON.parse(line)
              blocks.push(normalizeBlock(obj))
            } catch (_) {
              blocks.push({ id: crypto.randomUUID(), ui_type: "message", content: line })
            }
          }
          return blocks
        }
      }
      if (Array.isArray(raw)) return raw.map(normalizeBlock)
      if (raw && typeof raw === "object") {
        if (Array.isArray((raw as any).blocks)) return (raw as any).blocks.map(normalizeBlock)
        return [normalizeBlock(raw)]
      }
    } catch (_) {
      // fallthrough
    }
    return [
      {
        id: crypto.randomUUID(),
        ui_type: "message",
        content: "Sorry, I couldn't parse the server response.",
      },
    ]
  }

  const fetchNext = useCallback(
    async (payload: Record<string, any>) => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json, text/plain;q=0.9" },
          body: JSON.stringify({ ...(context || {}), ...payload }),
        })
        const contentType = res.headers.get("content-type") || ""
        let raw: any
        if (contentType.includes("application/json")) raw = await res.json()
        else raw = await res.text() ;console.log(raw)
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${typeof raw === "string" ? raw : JSON.stringify(raw)}`)
        const blocks = parseWebhookResponse(raw)
        const effectiveBlocks = blocks.length > 0
          ? blocks
          : [
              {
                id: crypto.randomUUID(),
                ui_type: "message",
                content: "👋 Hi there! Let's get started.",
              } as WebhookBlock,
            ]
        setConversation((prev) => [
          ...prev,
          ...effectiveBlocks.map((b) => ({ role: "assistant", block: b }) as ConversationItem),
        ])
      } catch (e: any) {
        setError(e?.message || "Failed to contact server")
      } finally {
        setIsLoading(false)
      }
    },
    [webhookUrl, context]
  )

  useEffect(() => {
    fetchNext({ event: "init" })
  }, [fetchNext])

  const submitUserReply = async (block: WebhookBlock, replyPayload: any, summaryText: string) => {
    setConversation((prev) => [...prev, { role: "user", blockId: block.id, summary: summaryText }])
    await fetchNext({ id: block.id, response: replyPayload })
  }

  const toggleSelection = (blockId: string, option: string, max?: number) => {
    setCurrentSelections((prev) => {
      const existing = new Set(prev[blockId] || [])
      if (existing.has(option)) existing.delete(option)
      else {
        if (typeof max === "number" && existing.size >= max) return prev
        existing.add(option)
      }
      return { ...prev, [blockId]: existing }
    })
  }

  const renderAssistantBlock = (block: WebhookBlock, isActive: boolean) => {
    switch (block.ui_type) {
      case "message":
        return (
          <div className="space-y-1">
            <p className="text-sm leading-relaxed">{block.content}</p>
            {!isActive ? null : null}
          </div>
        )
      case "single_choice": {
        const onSelect = (opt: string) => submitUserReply(block, { option: opt }, opt)
        return (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{block.content}</p>
            <RadioGroup disabled={!isActive}>
              {(block.options || []).map((opt) => (
                <label key={opt} className="inline-flex items-center gap-2">
                  <RadioGroupItem value={opt} onClick={() => isActive && onSelect(opt)} />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        )
      }
      case "buttons": {
        const onClick = (opt: string) => submitUserReply(block, { option: opt }, opt)
        return (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{block.content}</p>
            <div className="flex flex-wrap gap-2">
              {(block.options || []).map((opt) => (
                <Button key={opt} size="sm" variant="secondary" disabled={!isActive} onClick={() => onClick(opt)}>
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        )
      }
      case "multi_choice": {
        const max = block.max_select ?? (block.options?.length || 0)
        const selected = currentSelections[block.id] || new Set<string>()
        const onSubmit = () => {
          const values = Array.from(selected)
          submitUserReply(block, { options: values }, values.join(", "))
        }
        return (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{block.content}</p>
            <div className="flex flex-col gap-2">
              {(block.options || []).map((opt) => {
                const checked = selected.has(opt)
                return (
                  <label key={opt} className="inline-flex items-center gap-2">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => isActive && toggleSelection(block.id, opt, max)}
                      disabled={!isActive}
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                )
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {selected.size}/{max} selected
              </span>
              <Button size="sm" onClick={onSubmit} disabled={!isActive || selected.size === 0}>
                Continue
              </Button>
            </div>
          </div>
        )
      }
      case "links_input": {
        const values = currentInputs[block.id] || { github: "", linkedin: "" }
        const setValue = (k: "github" | "linkedin", v: string) =>
          setCurrentInputs((prev) => ({ ...prev, [block.id]: { ...(prev[block.id] || {}), [k]: v } }))
        const onSubmit = () => {
          submitUserReply(block, { github: values.github || null, linkedin: values.linkedin || null }, "Links submitted")
        }
        return (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{block.content}</p>
            <div className="grid grid-cols-1 gap-2">
              <Input
                placeholder="GitHub URL (optional)"
                value={values.github || ""}
                onChange={(e) => isActive && setValue("github", e.target.value)}
                disabled={!isActive}
              />
              <Input
                placeholder="LinkedIn URL (optional)"
                value={values.linkedin || ""}
                onChange={(e) => isActive && setValue("linkedin", e.target.value)}
                disabled={!isActive}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={onSubmit} disabled={!isActive}>
                Submit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => submitUserReply(block, { skipped: true }, "Skipped") } disabled={!isActive}>
                Skip
              </Button>
            </div>
          </div>
        )
      }
      case "text_input": {
        const values = currentInputs[block.id] || { text: "" as any }
        const setText = (v: string) =>
          setCurrentInputs((prev) => ({ ...prev, [block.id]: { ...(prev[block.id] || {}), text: v } }))
        const onSubmit = () => {
          const text = (values as any).text || ""
          submitUserReply(block, { text }, text)
        }
        return (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{block.content}</p>
            <Textarea
              placeholder={block.placeholder || "Type your answer..."}
              value={(values as any).text || ""}
              onChange={(e) => isActive && setText(e.target.value)}
              disabled={!isActive}
            />
            <div>
              <Button size="sm" onClick={onSubmit} disabled={!isActive}>
                Continue
              </Button>
            </div>
          </div>
        )
      }
      default:
        return <p className="text-sm">Unsupported block type.</p>
    }
  }

  return (
    <div className={className}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Onboarding Assistant</h3>
            <p className="text-sm text-muted-foreground">Guides you through setup</p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[60vh] p-4" ref={scrollRef}>
        <div className="space-y-4">
          {conversation.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2">
                {item.role === "assistant" ? (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3" />
                  </div>
                ) : (
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      <User className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="text-sm font-medium">{item.role === "assistant" ? "Assistant" : "You"}</span>
              </div>
              <div className="ml-8">
                {item.role === "assistant"
                  ? renderAssistantBlock(item.block, !!activeAssistant && item.block.id === activeAssistant.block.id)
                  : (
                    <p className="text-sm leading-relaxed">{item.summary}</p>
                  )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Loader2 className="w-3 h-3 animate-spin" />
                </div>
                <span className="text-sm font-medium">Assistant</span>
                <span className="text-xs text-muted-foreground">typing...</span>
              </div>
            </div>
          )}
          {!!error && (
            <div className="text-xs text-red-500">{error}</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default DynamicChat


