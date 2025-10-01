"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { ArrowRight, Bot, User, Loader2 } from "lucide-react"

type SurveyStep =
  | { id: string; type: "message"; content: string }
  | { id: string; type: "text"; content: string }
  | { id: string; type: "multiChoice"; content: string; options: string[]; maxSelect?: number }
  | { id: string; type: "buttons"; content: string; options: string[] }
  | { id: string; type: "yesNo"; content: string }
  | { id: string; type: "scale"; content: string; scale: { min: number; max: number; labels: [string, string] } }
  | { id: string; type: "links"; content: string }

const WEBHOOK_URL = "https://n8n.srv1034714.hstgr.cloud/webhook/4d4f0ae7-7913-466e-8c5d-f337a9cc9907"
const SURVEY_TITLE = "Student Onboarding Survey"
const SURVEY_DESCRIPTION = "We'll tailor a few focused questions to your background."

type RemoteStep = {
  id: string
  ui_type: "message" | "multi_choice" | "buttons" | "links_input" | "text" | "text_input" | "slider" | string
  content: string
  options?: string[]
  max_select?: number
  min?: number
  max?: number
  labels?: [string, string]
}

type Answers = Record<string, string | string[] | number | boolean>

export default function ChatSurveyPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.student_id as string

  const [flow, setFlow] = useState<SurveyStep[]>([])
  const [answers, setAnswers] = useState<Answers>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [textDraft, setTextDraft] = useState("")
  const [githubDraft, setGithubDraft] = useState("")
  const [linkedinDraft, setLinkedinDraft] = useState("")
  const [loading, setLoading] = useState<boolean>(true)
  const [answering, setAnswering] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [isComplete, setIsComplete] = useState(false)

  const parseWebhookResponse = (raw: string): { steps: RemoteStep[], completed?: boolean } => {
    try {
      const parsed = JSON.parse(raw)
      const steps: RemoteStep[] = []
      let completed = false
      
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item.completed === true) {
            completed = true
          }
          if (item.output) {
            let outputStr = item.output.trim()
            outputStr = outputStr.replace(/^```json\s*/i, '')
            outputStr = outputStr.replace(/^```\s*/, '')
            outputStr = outputStr.replace(/```\s*$/, '')
            outputStr = outputStr.trim()
            
            try {
              const stepObj = JSON.parse(outputStr)
              if (stepObj && typeof stepObj === "object") {
                steps.push(stepObj)
              }
            } catch (e) {
              console.warn("Failed to parse output field:", outputStr, e)
            }
          } else if (item.id && item.ui_type && item.content) {
            steps.push(item)
          }
        }
      } else if (parsed?.completed === true) {
        completed = true
      } else if (parsed?.steps && Array.isArray(parsed.steps)) {
        steps.push(...parsed.steps)
        if (parsed.completed === true) completed = true
      } else if (parsed && typeof parsed === "object" && parsed.id) {
        steps.push(parsed)
      }
      
      const validSteps = steps.filter((s: any) => 
        s && typeof s === "object" && typeof s.id === "string" && typeof s.ui_type === "string" && typeof s.content === "string"
      )
      
      return { steps: validSteps, completed }
    } catch (e) {
      console.error("Parse error:", e)
      return { steps: [], completed: false }
    }
  }

  const mapRemoteToSurveySteps = (steps: RemoteStep[]): SurveyStep[] => {
    return steps.map((s) => {
      switch (s.ui_type) {
        case "message":
          return { id: s.id, type: "message", content: s.content }
        case "multi_choice":
          return { id: s.id, type: "multiChoice", content: s.content, options: s.options || [], maxSelect: s.max_select }
        case "buttons":
          return { id: s.id, type: "buttons", content: s.content, options: s.options || [] }
        case "links_input":
          return { id: s.id, type: "links", content: s.content }
        case "text":
        case "text_input":
          return { id: s.id, type: "text", content: s.content }
        case "slider":
          return { 
            id: s.id, 
            type: "scale", 
            content: s.content,
            scale: {
              min: s.min ?? 0,
              max: s.max ?? 10,
              labels: s.labels ?? ["Low", "High"]
            }
          }
        default:
          return { id: s.id, type: "message", content: s.content }
      }
    })
  }

  const sendAnswerAndGetNext = async (stepId: string, value: unknown) => {
    if (answering) return // Prevent duplicate requests
    
    setAnswering(true)
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          event: "answer", 
          student_id: studentId, 
          step_id: stepId, 
          value 
        }),
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const raw = await res.text()
      console.log("Answer response:", raw)
      
      const { steps: newSteps, completed } = parseWebhookResponse(raw)
      
      if (completed) {
        setIsComplete(true)
      } else if (newSteps.length > 0) {
        const mapped = mapRemoteToSurveySteps(newSteps)
        setFlow(prev => {
          const existingIds = new Set(prev.map(s => s.id))
          const deduped = mapped.filter(s => !existingIds.has(s.id))
          return [...prev, ...deduped]
        })
      } else {
        // No more questions and no completed flag, assume complete
        setIsComplete(true)
      }
      
      setCurrentIndex(prev => prev + 1)
    } catch (err: any) {
      console.error("Answer error:", err)
      setError(`Failed to submit answer: ${err.message}`)
    } finally {
      setAnswering(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "init", student_id: studentId }),
        })
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const raw = await res.text()
        console.log("Init response:", raw)

        const result = parseWebhookResponse(raw)
        console.log("Parsed result:", result)
        
        if (result.completed) {
          setIsComplete(true)
        }
        
        if (result.steps.length === 0 && !result.completed) {
          setError("No valid survey questions received from server.")
          return
        }
        
        const mapped = mapRemoteToSurveySteps(result.steps)
        setFlow(mapped)
        setCurrentIndex(0)
        
      } catch (err: any) {
        console.error("Survey init error:", err)
        setError(`Failed to load survey: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [studentId])

  const interactiveSteps = useMemo(() => flow.filter((s) => s.type !== "message"), [flow])
  const completedInteractive = useMemo(() => Object.keys(answers).length, [answers])
  const currentStep = flow[currentIndex]
  const progressPct = interactiveSteps.length > 0 ? (completedInteractive / interactiveSteps.length) * 100 : 0

  const handleMessageNext = async () => {
    if (!currentStep || currentStep.type !== "message" || answering) return
    
    // Check if there's a next step already loaded
    if (currentIndex + 1 < flow.length) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // Need to fetch next question from webhook
      await sendAnswerAndGetNext(currentStep.id, "continue")
    }
  }

  const submitText = async () => {
    if (!currentStep || currentStep.type !== "text" || answering) return
    if (!textDraft.trim()) return
    const value = textDraft.trim()
    setAnswers(a => ({ ...a, [currentStep.id]: value }))
    await sendAnswerAndGetNext(currentStep.id, value)
    setTextDraft("")
  }

  const toggleMulti = (id: string, option: string, maxSelect?: number) => {
    setAnswers((prev) => {
      const existing = (prev[id] as string[]) || []
      const already = existing.includes(option)
      let next: string[]
      if (already) {
        next = existing.filter((o) => o !== option)
      } else {
        next = maxSelect && existing.length >= maxSelect 
          ? [...existing.slice(1), option] 
          : [...existing, option]
      }
      return { ...prev, [id]: next }
    })
  }

  const confirmMulti = async () => {
    if (!currentStep || currentStep.type !== "multiChoice" || answering) return
    const value = answers[currentStep.id]
    if (!value || (Array.isArray(value) && value.length === 0)) return
    await sendAnswerAndGetNext(currentStep.id, value)
  }

  const selectButtonOption = async (option: string) => {
    if (!currentStep || currentStep.type !== "buttons" || answering) return
    setAnswers(a => ({ ...a, [currentStep.id]: option }))
    await sendAnswerAndGetNext(currentStep.id, option)
  }

  const answerYesNo = async (value: boolean) => {
    if (!currentStep || currentStep.type !== "yesNo" || answering) return
    setAnswers(a => ({ ...a, [currentStep.id]: value }))
    await sendAnswerAndGetNext(currentStep.id, value)
  }

  const setScale = (value: number[]) => {
    if (!currentStep || currentStep.type !== "scale") return
    setAnswers(a => ({ ...a, [currentStep.id]: value[0] }))
  }

  const confirmScale = async () => {
    if (!currentStep || currentStep.type !== "scale" || answering) return
    const value = answers[currentStep.id]
    if (value === undefined) return
    await sendAnswerAndGetNext(currentStep.id, value)
  }

  const confirmLinks = async () => {
    if (!currentStep || currentStep.type !== "links" || answering) return
    const github = githubDraft.trim()
    const linkedin = linkedinDraft.trim()
    const summary = [
      github ? `GitHub: ${github}` : "", 
      linkedin ? `LinkedIn: ${linkedin}` : ""
    ].filter(Boolean).join(" | ") || "No links provided"
    
    setAnswers(a => ({ ...a, [currentStep.id]: summary }))
    await sendAnswerAndGetNext(currentStep.id, { github, linkedin })
    setGithubDraft("")
    setLinkedinDraft("")
  }

  const handleFinish = async () => {
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "complete", student_id: studentId, answers }),
      })
    } catch (e) {
      console.error("Complete webhook failed", e)
    }
    router.push(`/student/${studentId}/dashboard`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-destructive text-lg font-semibold">Error</div>
              <p className="text-sm">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="mb-4">
          <CardHeader className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>{SURVEY_TITLE}</CardTitle>
              <CardDescription>{SURVEY_DESCRIPTION}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{completedInteractive}/{interactiveSteps.length}</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 pb-64">
          {flow.slice(0, currentIndex + 1).map((step, idx) => {
            const value = answers[step.id]
            
            return (
              <div key={step.id} className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-card border p-3 rounded-lg max-w-[85%]">
                    <p className="text-sm whitespace-pre-wrap">{step.content}</p>
                  </div>
                </div>

                {typeof value !== "undefined" && (
                  <div className="flex items-start gap-2 justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[85%]">
                      <p className="text-sm whitespace-pre-wrap">
                        {Array.isArray(value) ? value.join(", ") : String(value)}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          
          {answering && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {currentStep && !answering && !isComplete && (
          <Card className="fixed bottom-4 left-4 right-4 mx-auto max-w-3xl">
            <CardContent className="pt-6">
              {currentStep.type === "message" && (
                <div className="flex justify-end">
                  <Button onClick={handleMessageNext}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {currentStep.type === "text" && (
                <div className="space-y-3">
                  <Textarea 
                    value={textDraft} 
                    onChange={(e) => setTextDraft(e.target.value)} 
                    placeholder="Type your response..." 
                    rows={4}
                    className="w-full"
                  />
                  <div className="flex justify-end">
                    <Button onClick={submitText} disabled={!textDraft.trim()}>
                      Send
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep.type === "multiChoice" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {currentStep.options.map((opt) => {
                      const selected = Array.isArray(answers[currentStep.id]) && (answers[currentStep.id] as string[]).includes(opt)
                      const count = Array.isArray(answers[currentStep.id]) ? (answers[currentStep.id] as string[]).length : 0
                      const atMax = currentStep.maxSelect ? count >= currentStep.maxSelect && !selected : false
                      return (
                        <Button 
                          key={opt} 
                          size="sm" 
                          variant={selected ? "default" : "outline"} 
                          onClick={() => toggleMulti(currentStep.id, opt, currentStep.maxSelect)} 
                          disabled={atMax}
                        >
                          {opt}
                        </Button>
                      )
                    })}
                  </div>
                  {currentStep.maxSelect && (
                    <div className="text-xs text-muted-foreground">Select up to {currentStep.maxSelect}</div>
                  )}
                  <div className="flex justify-end">
                    <Button 
                      onClick={confirmMulti} 
                      disabled={!answers[currentStep.id] || (Array.isArray(answers[currentStep.id]) && (answers[currentStep.id] as string[]).length === 0)}
                    >
                      Send
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep.type === "buttons" && (
                <div className="flex flex-wrap gap-2">
                  {currentStep.options.map((opt) => (
                    <Button key={opt} onClick={() => selectButtonOption(opt)}>
                      {opt}
                    </Button>
                  ))}
                </div>
              )}

              {currentStep.type === "yesNo" && (
                <div className="flex items-center gap-2">
                  <Button onClick={() => answerYesNo(true)} className="flex-1">Yes</Button>
                  <Button onClick={() => answerYesNo(false)} variant="outline" className="flex-1">No</Button>
                </div>
              )}

              {currentStep.type === "scale" && (
                <div className="space-y-4">
                  <div className="px-1">
                    <Slider 
                      value={[Number(answers[currentStep.id] ?? currentStep.scale.min)]} 
                      min={currentStep.scale.min} 
                      max={currentStep.scale.max} 
                      step={1} 
                      onValueChange={setScale} 
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                      <span>{currentStep.scale.labels[0]}</span>
                      <span>{currentStep.scale.labels[1]}</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={confirmScale}>
                      Send
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep.type === "links" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input 
                      placeholder="GitHub profile URL" 
                      value={githubDraft} 
                      onChange={(e) => setGithubDraft(e.target.value)} 
                    />
                    <Input 
                      placeholder="LinkedIn profile URL" 
                      value={linkedinDraft} 
                      onChange={(e) => setLinkedinDraft(e.target.value)} 
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">Optional — add either or both.</div>
                  <div className="flex justify-end">
                    <Button onClick={confirmLinks}>
                      Send
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isComplete && (
          <Card className="fixed bottom-4 left-4 right-4 mx-auto max-w-3xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-lg font-semibold">Survey Complete! 🎉</p>
                <p className="text-sm text-muted-foreground">Thank you for completing the onboarding survey.</p>
                <Button onClick={handleFinish} size="lg" className="w-full">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}