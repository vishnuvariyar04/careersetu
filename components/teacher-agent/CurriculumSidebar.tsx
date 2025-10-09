"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Module } from "@/lib/teacher-progress"
import { BookOpen, CheckCircle2, PlayCircle } from "lucide-react"

type Props = {
  skills: string[]
  selectedSkill: string
  onSelectSkill: (skill: string) => void
  modules: Module[]
  selectedModuleId?: string
  onSelectModule: (moduleId: string) => void
  compact?: boolean
}

export default function CurriculumSidebar({ skills, selectedSkill, onSelectSkill, modules, selectedModuleId, onSelectModule, compact }: Props) {
  const total = modules.length || 0
  const done = modules.filter((m) => m.status === "done" && m.quiz.passed).length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  if (compact) {
    return (
      <div className="space-y-3 w-[64px]">
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <div className="text-[10px] text-center truncate" title={selectedSkill}>{selectedSkill || 'Skill'}</div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="py-2">
            <CardTitle className="text-[11px] text-center">Modules</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="flex flex-col items-center gap-2">
              {modules.map((m, idx) => {
                const isActive = selectedModuleId ? selectedModuleId === m.id : idx === 0
                const completed = m.status === 'done' && m.quiz.passed
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectModule(m.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold border transition ${isActive ? 'bg-muted' : 'hover:bg-muted/50'} ${completed ? 'border-green-500 text-green-700' : 'border-border'}`}
                    title={m.title}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div>
          <Progress value={percent} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4" /> Curriculum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? skills.map((s) => (
              <Button key={s} size="sm" variant={s === selectedSkill ? "default" : "outline"} onClick={() => onSelectSkill(s)}>
                {s}
              </Button>
            )) : <p className="text-sm text-muted-foreground">No skills available.</p>}
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{percent}%</span>
            </div>
            <Progress value={percent} />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Modules</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[48vh]">
            <div className="divide-y">
              {modules.map((m, idx) => {
                const isActive = selectedModuleId ? selectedModuleId === m.id : idx === 0
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectModule(m.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition flex items-center justify-between ${isActive ? "bg-muted/40" : ""}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{idx + 1}.</span>
                        <span className="text-sm font-medium">{m.title}</span>
                        {m.quiz.passed && <Badge variant="secondary" className="text-[10px]">Quiz</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {m.status === "done" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="w-3 h-3" /> Completed</span>
                        ) : m.status === "in_progress" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600"><PlayCircle className="w-3 h-3" /> In progress</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not started</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{m.lessons.filter(l => l.status === "done").length}/{m.lessons.length} lessons</div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}


