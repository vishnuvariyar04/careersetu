"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { ArrowRight, Bot, User as UserIcon } from "lucide-react"

type SurveyStep =
  | { id: string; type: "message"; content: string }
  | { id: string; type: "text"; content: string }
  | { id: string; type: "multiChoice"; content: string; options: string[]; maxSelect?: number }
  | { id: string; type: "yesNo"; content: string }
  | {
      id: string
      type: "scale"
      content: string
      scale: { min: number; max: number; labels: [string, string] }
    }

const chatSurvey: { title: string; description: string; flow: SurveyStep[] } = {
  title: "Student Onboarding Survey",
  description:
    "Answer a few questions to help us personalize your learning journey and career guidance.",
  flow: [
    { id: "intro", type: "message", content: "👋 Hi! Let’s get to know you better. Please answer a few quick questions." },
    { id: "projects_proud", type: "text", content: "What projects (academic, personal, or professional) are you most proud of?" },
    { id: "meaningful_experience", type: "text", content: "Describe your most meaningful internship, volunteer, or work experience so far." },
    { id: "roles_experienced", type: "multiChoice", content: "What technical and non-technical roles have you experienced?", options: ["Leadership", "Teamwork", "Research", "Development", "Design", "Other"] },
    { id: "skills_confidence", type: "text", content: "What skills do you feel most confident about? Where do you want to improve?" },
    { id: "tools_used", type: "multiChoice", content: "Which programming languages, frameworks, or tools have you used in real-world settings?", options: ["Python", "JavaScript", "React", "Node.js", "Java", "C/C++", "Other"] },
    { id: "problem_solved", type: "text", content: "What’s one complex problem you’ve solved, and how did you approach it?" },
    { id: "motivation_learning", type: "text", content: "What motivates you to learn new technologies or pick up new skills?" },
    { id: "industries_excite", type: "multiChoice", content: "What types of problems or industries excite you most?", options: ["Healthcare", "Fintech", "AI", "Sustainability", "Education", "Other"] },
    { id: "career_goal", type: "text", content: "What career goal inspires your current efforts?" },
    { id: "role_models", type: "text", content: "Who are your professional role models, and why?" },
    { id: "learning_style", type: "multiChoice", content: "How do you prefer to learn?", options: ["Independently", "With a mentor", "In groups", "By teaching others"] },
    { id: "challenge_help", type: "multiChoice", content: "When faced with challenges, what’s your preferred way to get help?", options: ["Online resources", "Mentor guidance", "Peer discussion", "Trial and error"] },
    { id: "peer_learning", type: "yesNo", content: "Have you participated in peer-to-peer learning, mentorship, or hackathons before?" },
    { id: "collaboration_comfort", type: "scale", content: "Rate your comfort collaborating with people from diverse backgrounds.", scale: { min: 1, max: 5, labels: ["Not comfortable", "Very comfortable"] } },
    { id: "career_5years", type: "text", content: "How do you envision your career in five years?" },
    { id: "top_skills", type: "multiChoice", content: "What are the top 3 skills you want to develop to reach your goals?", options: ["Leadership", "Problem-solving", "Communication", "AI/ML", "Full-stack development", "UI/UX", "Other"], maxSelect: 3 },
    { id: "impact_field", type: "text", content: "What kind of impact do you hope to make in your field?" },
    { id: "successful_experience", type: "text", content: "What does a ‘successful’ internship or work experience look like to you?" },
    { id: "motivation_type", type: "multiChoice", content: "What motivates you more?", options: ["Solving real-world problems", "Earning recognition", "Building expertise"] },
    { id: "fears", type: "text", content: "What challenges or fears hold you back from taking on new projects?" },
    { id: "values", type: "multiChoice", content: "What do you value most in a learning or work environment?", options: ["Autonomy", "Collaboration", "Feedback", "Flexibility", "Growth opportunities"] },
    { id: "personal_needs", type: "text", content: "Are there any personal circumstances or learning needs you want your mentor to know?" },
    { id: "influential_resources", type: "text", content: "Which resources, communities, or extracurricular activities have most impacted your journey so far (and how)?" },
    { id: "outro", type: "message", content: "✅ Thanks for sharing! Your responses will help us tailor your journey and recommendations." },
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

  const interactiveSteps = useMemo(() => chatSurvey.flow.filter((s) => s.type !== "message"), [])
  const completedInteractive = useMemo(
    () => Object.keys(answers).filter((id) => chatSurvey.flow.find((s) => s.id === id && s.type !== "message")).length,
    [answers],
  )

  const currentStep = chatSurvey.flow[activeIndex]
  const isLast = activeIndex >= chatSurvey.flow.length - 1

  const goNext = () => {
    if (isLast) return
    setActiveIndex((i) => Math.min(i + 1, chatSurvey.flow.length - 1))
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

  const handleFinish = () => {
    router.push(`/student/${studentId}/dashboard`)
  }

  const totalInteractive = interactiveSteps.length
  const progressPct = (completedInteractive / totalInteractive) * 100

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
          {chatSurvey.flow.slice(0, activeIndex + 1).map((step) => {
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
            {currentStep.type === "message" && (
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
                    Start
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}

            {currentStep.type === "text" && (
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

            {currentStep.type === "multiChoice" && (
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

            {currentStep.type === "yesNo" && (
              <div className="flex items-center justify-between gap-2">
                <Button onClick={() => answerYesNo(true)} className="flex-1">
                  Yes
                </Button>
                <Button onClick={() => answerYesNo(false)} variant="outline" className="flex-1">
                  No
                </Button>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


