"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

type Question = {
  id: string
  prompt: string
  options: string[]
  answerIndex: number
}

type Props = {
  moduleId: string
  onResult: (passed: boolean) => void
  questions?: Question[]
}

export default function QuizBlock({ moduleId, onResult, questions }: Props) {
  const qs: Question[] = questions || [
    { id: `${moduleId}_q1`, prompt: "React components should be ...", options: ["Stateful only", "Reusable UI pieces", "Classes only"], answerIndex: 1 },
    { id: `${moduleId}_q2`, prompt: "useState returns ...", options: ["value and setter", "component", "CSS"], answerIndex: 0 },
  ]
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [passed, setPassed] = useState<boolean | null>(null)

  const onSubmit = () => {
    let correct = 0
    for (const q of qs) {
      if (answers[q.id] === q.answerIndex) correct += 1
    }
    const p = correct === qs.length
    setPassed(p)
    setSubmitted(true)
    onResult(p)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Quick Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {qs.map((q) => (
          <div key={q.id} className="space-y-2">
            <p className="text-sm font-medium">{q.prompt}</p>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt, idx) => {
                const selected = answers[q.id] === idx
                return (
                  <Button
                    key={idx}
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                    disabled={submitted}
                  >
                    {opt}
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <Button onClick={onSubmit} disabled={submitted || Object.keys(answers).length < qs.length}>Submit</Button>
          {submitted && (
            <p className={`text-sm ${passed ? "text-green-600" : "text-red-600"}`}>{passed ? "Passed!" : "Try again"}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


