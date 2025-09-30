"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { ArrowRight, Bot, User as UserIcon } from "lucide-react"

type SurveyStep =
  | { id: string; type: "message"; content: string; showIf?: (answers: Answers) => boolean }
  | { id: string; type: "text"; content: string; showIf?: (answers: Answers) => boolean }
  | { id: string; type: "multiChoice"; content: string; options: string[]; maxSelect?: number; showIf?: (answers: Answers) => boolean }
  | { id: string; type: "yesNo"; content: string; showIf?: (answers: Answers) => boolean }
  | {
      id: string
      type: "scale"
      content: string
      scale: { min: number; max: number; labels: [string, string] }
      showIf?: (answers: Answers) => boolean
    }
  | { id: string; type: "links"; content: string; showIf?: (answers: Answers) => boolean }

const chatSurvey: { title: string; description: string; flow: SurveyStep[] } = {
  title: "Student Onboarding Survey",
  description:
    "We’ll start with your recent experience and goals to tailor a few focused questions.",
  flow: [
    { id: "intro", type: "message", content: "👋 Hi! Tell me a bit about what you’ve actually done and what you want next — I’ll keep it short." },
    {
      id: "experience_story",
      type: "text",
      content: "What was the last project or hands-on work you did? What did YOU do, what stack did you use, and what was hardest?",
    },
    {
      id: "responsibilities",
      type: "multiChoice",
      content: "In that work, which of these did you personally handle?",
      options: [
        "Scoping requirements",
        "Setting up repo & tooling",
        "Designing schema/APIs",
        "Implementing features end-to-end",
        "Writing tests",
        "CI/CD & deployments",
        "Performance/debugging",
      ],
      maxSelect: 4,
    },
    {
      id: "autonomy_scale",
      type: "scale",
      content: "When stuck on an unfamiliar task, how independently could you progress?",
      scale: { min: 1, max: 5, labels: ["Need close guidance", "Very independent"] },
    },
    {
      id: "skills_strengths",
      type: "multiChoice",
      content: "Which strengths describe you best? (up to 3)",
      options: ["Frontend", "Backend", "DevOps", "Data/ML", "Mobile", "UI/UX", "Product thinking"],
      maxSelect: 3,
    },
    {
      id: "tools_used",
      type: "multiChoice",
      content: "Which languages/frameworks/tools have you used in real work?",
      options: ["Python", "JavaScript/TypeScript", "React", "Node.js", "Java", "C/C++", "Go", "SQL", "Other"],
      maxSelect: 6,
    },
    {
      id: "tools_used_other",
      type: "text",
      content: "List any other tools or stacks you’ve used.",
      showIf: (a) => Array.isArray(a["tools_used"]) && (a["tools_used"] as string[]).includes("Other"),
    },
    {
      id: "learning_goals",
      type: "multiChoice",
      content: "What do you want to learn next? (up to 3)",
      options: [
        "System design",
        "Data structures & algorithms",
        "AI/ML",
        "Cloud/DevOps",
        "Full-stack apps",
        "Open-source contributions",
        "Design & UX",
        "Other",
      ],
      maxSelect: 3,
    },
    {
      id: "learning_goals_other",
      type: "text",
      content: "Tell me more about what else you’d like to learn.",
      showIf: (a) => Array.isArray(a["learning_goals"]) && (a["learning_goals"] as string[]).includes("Other"),
    },
    {
      id: "companies_interest",
      type: "multiChoice",
      content: "Any companies you’d be excited to work at?",
      options: [
        "Google",
        "Microsoft",
        "Amazon",
        "OpenAI",
        "Stripe",
        "Atlassian",
        "Any startup",
        "Other",
      ],
      maxSelect: 4,
    },
    {
      id: "companies_other",
      type: "text",
      content: "Name a few specific companies or teams you like.",
      showIf: (a) => Array.isArray(a["companies_interest"]) && (a["companies_interest"] as string[]).includes("Other"),
    },
    {
      id: "domains_interest",
      type: "multiChoice",
      content: "Which domains interest you?",
      options: ["Healthcare", "Fintech", "AI", "Sustainability", "Education"],
      maxSelect: 3,
    },
    { id: "social_links", type: "links", content: "Drop your GitHub and LinkedIn (optional)." },
    { id: "outro", type: "message", content: "✅ Thanks! This gives us enough to infer your level and tailor a plan." },
  ],
}

type Answers = Record<string, string | string[] | number | boolean>

export default function ChatSurveyPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.student_id as string

  const [activeIndex, setActiveIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [textDraft, setTextDraft] = useState("")
  const [githubDraft, setGithubDraft] = useState("")
  const [linkedinDraft, setLinkedinDraft] = useState("")

  const visibleFlow = useMemo(
    () => chatSurvey.flow.filter((s) => !s.showIf || s.showIf(answers)),
    [answers],
  )
  const interactiveSteps = useMemo(() => visibleFlow.filter((s) => s.type !== "message"), [visibleFlow])
  const completedInteractive = useMemo(
    () => Object.keys(answers).filter((id) => visibleFlow.find((s) => s.id === id && s.type !== "message")).length,
    [answers, visibleFlow],
  )

  const currentStep = visibleFlow[activeIndex]
  const isLast = activeIndex >= visibleFlow.length - 1

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(visibleFlow.length - 1, 0)))
  }, [visibleFlow.length])

  const goNext = () => {
    if (isLast) return
    setActiveIndex((i) => Math.min(i + 1, visibleFlow.length - 1))
    setTextDraft("")
  }

  const goPrev = () => {
    setActiveIndex((i) => Math.max(0, i - 1))
  }

  const submitText = () => {
    if (!currentStep || currentStep.type !== "text") return
    if (!textDraft.trim()) return
    setAnswers((a) => ({ ...a, [currentStep.id]: textDraft.trim() }))
    goNext()
  }

  const toggleMulti = (id: string, option: string, maxSelect?: number) => {
    setAnswers((prev) => {
      const existing = (prev[id] as string[]) || []
      const already = existing.includes(option)
      let next: string[]
      if (already) next = existing.filter((o) => o !== option)
      else next = maxSelect && existing.length >= maxSelect ? [...existing.slice(1), option] : [...existing, option]
      return { ...prev, [id]: next }
    })
  }

  const confirmMulti = () => goNext()

  const answerYesNo = (value: boolean) => {
    if (currentStep?.type !== "yesNo") return
    setAnswers((a) => ({ ...a, [currentStep.id]: value }))
    goNext()
  }

  const setScale = (value: number[]) => {
    if (currentStep?.type !== "scale") return
    setAnswers((a) => ({ ...a, [currentStep.id]: value[0] }))
  }

  const confirmScale = () => goNext()

  const confirmLinks = () => {
    const github = githubDraft.trim()
    const linkedin = linkedinDraft.trim()
    const summary = [github ? `GitHub: ${github}` : "", linkedin ? `LinkedIn: ${linkedin}` : ""].filter(Boolean).join(" | ") || "No links provided"
    setAnswers((a) => ({ ...a, social_links: summary, github, linkedin }))
    goNext()
  }

  const handleFinish = () => {
    router.push(`/student/${studentId}/dashboard`)
  }

  const totalInteractive = interactiveSteps.length
  const progressPct = (completedInteractive / (totalInteractive || 1)) * 100

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="mb-4">
          <CardHeader className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>{chatSurvey.title}</CardTitle>
              <CardDescription>{chatSurvey.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Setup Progress</span>
                <span>
                  {completedInteractive}/{totalInteractive}
                </span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {visibleFlow.slice(0, activeIndex + 1).map((step) => {
            const value = answers[step.id]
            return (
              <div key={step.id} className="space-y-2">
                {/* Assistant bubble */}
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-card border p-3 rounded-lg max-w-[85%]">
                    <p className="text-sm whitespace-pre-wrap">{step.content}</p>
                  </div>
                </div>

                {/* User answer bubble (if answered) */}
                {typeof value !== "undefined" && (
                  <div className="flex items-start gap-2 justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[85%]">
                      <p className="text-sm whitespace-pre-wrap">
                        {Array.isArray(value) ? value.join(", ") : String(value)}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Composer */}
        <Card className="mt-4 sticky bottom-4">
          <CardContent className="pt-6">
            {currentStep && currentStep.type === "message" && (
              <div className="flex items-center justify-between">
                <Button onClick={goPrev} variant="outline" disabled={activeIndex === 0}>
                  Back
                </Button>
                {isLast ? (
                  <Button onClick={handleFinish}>
                    Finish
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={goNext}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}

            {currentStep && currentStep.type === "text" && (
              <div className="space-y-3">
                <Textarea
                  value={textDraft}
                  onChange={(e) => setTextDraft(e.target.value)}
                  placeholder="Type your response..."
                  rows={4}
                />
                <div className="flex items-center justify-between">
                  <Button onClick={goPrev} variant="outline" disabled={activeIndex === 0}>
                    Back
                  </Button>
                  <Button onClick={submitText} disabled={!textDraft.trim()}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep && currentStep.type === "multiChoice" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {currentStep.options.map((opt) => {
                    const selected = Array.isArray(answers[currentStep.id])
                      ? (answers[currentStep.id] as string[]).includes(opt)
                      : false
                    const count = Array.isArray(answers[currentStep.id])
                      ? (answers[currentStep.id] as string[]).length
                      : 0
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
                  <div className="text-xs text-muted-foreground">
                    Select up to {currentStep.maxSelect}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Button onClick={goPrev} variant="outline" disabled={activeIndex === 0}>
                    Back
                  </Button>
                  <Button onClick={confirmMulti} disabled={!answers[currentStep.id] || (Array.isArray(answers[currentStep.id]) && (answers[currentStep.id] as string[]).length === 0)}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep && currentStep.type === "yesNo" && (
              <div className="flex items-center justify-between gap-2">
                <Button onClick={() => answerYesNo(true)} className="flex-1">
                  Yes
                </Button>
                <Button onClick={() => answerYesNo(false)} variant="outline" className="flex-1">
                  No
                </Button>
              </div>
            )}

            {currentStep && currentStep.type === "scale" && (
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
                <div className="flex items-center justify-between">
                  <Button onClick={goPrev} variant="outline" disabled={activeIndex === 0}>
                    Back
                  </Button>
                  <Button onClick={confirmScale}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep && currentStep.type === "links" && (
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
                <div className="flex items-center justify-between">
                  <Button onClick={goPrev} variant="outline" disabled={activeIndex === 0}>
                    Back
                  </Button>
                  <Button onClick={confirmLinks}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


