"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type PromptInputBoxProps = {
  value?: string
  onChange?: (v: string) => void
  onSend: (message: string) => void
  isLoading: boolean
  placeholder?: string
  className?: string
}

export function PromptInputBox({
  value,
  onChange,
  onSend,
  isLoading,
  placeholder,
  className,
}: PromptInputBoxProps) {
  const isControlled = typeof value === "string"
  const [localValue, setLocalValue] = useState("")

  useEffect(() => {
    if (isControlled) return
    // keep local value in sync when prop value becomes defined after mount
    setLocalValue(value ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const currentValue = isControlled ? (value as string) : localValue

  const sendDisabled = isLoading || !currentValue.trim()

  const handleSend = () => {
    const msg = currentValue.trim()
    if (!msg || sendDisabled) return
    onSend(msg)
    if (!isControlled) setLocalValue("")
    onChange?.("")
  }

  const inputClass = useMemo(
    () =>
      cn(
        "w-full bg-transparent text-[14px] text-white placeholder:text-white/50 focus:outline-none",
      ),
    [],
  )

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Input
        value={currentValue}
        onChange={(e) => {
          const next = e.target.value
          if (!isControlled) setLocalValue(next)
          onChange?.(next)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
        placeholder={placeholder}
        className={inputClass}
      />

      <Button
        type="button"
        onClick={handleSend}
        disabled={sendDisabled}
        className="rounded-full bg-white/20 hover:bg-white/30 text-white px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </Button>
    </div>
  )
}

