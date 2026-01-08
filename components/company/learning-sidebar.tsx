"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Bot, ListChecks, BookOpen, GraduationCap, ArrowLeft } from "lucide-react"

export type LearningSidebarView = 'teacher' | 'skills' | 'projects'

type LearningSidebarProps = {
  activeView: LearningSidebarView
  onChangeView: (v: LearningSidebarView) => void
  isJoined: boolean
  onLeaveCompany: () => void
  skillCoveragePercent: number
  companyRequiredSkills: string[]
  companyName?: string
  onBack?: () => void
  isCurriculumVisible?: boolean
  onToggleCurriculum?: () => void
}

export default function LearningSidebar({
  activeView,
  onChangeView,
  isJoined,
  onLeaveCompany,
  skillCoveragePercent,
  companyRequiredSkills,
  companyName,
  onBack,
  isCurriculumVisible,
  onToggleCurriculum,
}: LearningSidebarProps) {
  return (
    <aside className="group absolute left-0 top-0 h-full z-50 transition-all duration-150 ease-in-out w-16 hover:w-64">
      <div className="h-full overflow-hidden bg-background/95 backdrop-blur-md border-r border-border/50 shadow-xl">
        <ScrollArea className="h-full">
          <div className="px-2 py-3 space-y-4">
            {/* Collapsed State Logo/Brand */}
            <div className="flex justify-center pt-1 pb-3 group-hover:hidden">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                <span className="text-sm font-bold text-primary">L</span>
              </div>
            </div>

            {/* Expanded State Header: Back Icon + Company Name */}
            <div className="hidden group-hover:block pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="h-8 w-8"
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {companyName || 'Company'}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    Learning Dashboard
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Section */}
            <div>
              {/* Collapsed: Icon-only buttons - centered with consistent highlight */}
              <div className="group-hover:hidden flex flex-col items-center space-y-2">
                <button
                  onClick={() => onChangeView('teacher')}
                  className={`w-10 h-10 rounded-lg transition-all duration-150 flex items-center justify-center ${
                    activeView === 'teacher'
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                  title="Teacher Agent"
                >
                  <Bot className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onChangeView('skills')}
                  className={`w-10 h-10 rounded-lg transition-all duration-150 flex items-center justify-center ${
                    activeView === 'skills'
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                  title="Skills Assessment"
                >
                  <ListChecks className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onChangeView('projects')}
                  className={`w-10 h-10 rounded-lg transition-all duration-150 flex items-center justify-center ${
                    activeView === 'projects'
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                  title="Company Projects"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded: Full navigation with text */}
              <div className="hidden group-hover:block space-y-1">
                <button
                  onClick={() => onChangeView('teacher')}
                  className={`w-full rounded-lg transition-all duration-150 ${
                    activeView === 'teacher' 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 p-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeView === 'teacher' 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium text-sm ${activeView === 'teacher' ? 'text-primary' : 'text-foreground'}`}>
                        Teacher Agent
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onChangeView('skills')}
                  className={`w-full rounded-lg transition-all duration-150 ${
                    activeView === 'skills' 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 p-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeView === 'skills' 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <ListChecks className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium text-sm ${activeView === 'skills' ? 'text-primary' : 'text-foreground'}`}>
                        Skills Assessment
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onChangeView('projects')}
                  className={`w-full rounded-lg transition-all duration-150 ${
                    activeView === 'projects' 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 p-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeView === 'projects' 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium text-sm ${activeView === 'projects' ? 'text-primary' : 'text-foreground'}`}>
                        Company Projects
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Skills Overview - show only on hover (no collapsed content) */}
            <div className="hidden group-hover:block">
              <div className="rounded-lg border border-border/50 bg-card/80 overflow-hidden">
                {/* Header */}
                <div className="p-3 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <GraduationCap className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-sm font-semibold">Skills Overview</div>
                  </div>
                </div>
                {/* Progress */}
                <div className="p-3 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Coverage</span>
                      <span className="text-xs font-bold text-primary">
                        {skillCoveragePercent}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${skillCoveragePercent}%` }}
                      />
                    </div>
                  </div>
 
                  <div className="space-y-1.5">
                    <div className="text-xs text-muted-foreground font-medium">Required Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {companyRequiredSkills.length > 0 ? (
                        companyRequiredSkills.slice(0, 6).map((skill) => (
                          <div 
                            key={skill} 
                            className="text-[10px] px-1.5 py-0.5 rounded bg-muted/80 border border-border/50 text-foreground/80"
                          >
                            {skill}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No skills listed yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Leave Company - show only on hover */}
            {isJoined && (
              <div className="hidden group-hover:block">
                <Button
                  onClick={onLeaveCompany}
                  className="w-full p-2 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-all duration-150 text-xs text-destructive font-medium"
                  variant="ghost"
                >
                  Leave Company
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
        {/* Collapsed-only round Curriculum toggle removed */}
      </div>
    </aside>
  )
}


