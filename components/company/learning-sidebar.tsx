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
    <aside className="group relative h-full border-r border-border/40 backdrop-blur-sm bg-gradient-to-b from-background via-background to-muted/20 transition-all duration-500 ease-out w-20 hover:w-80 shadow-2xl">
      <div className="h-full overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-2 py-3 space-y-6">
            {/* Collapsed State Logo/Brand */}
            <div className="flex justify-center pt-2 pb-4 group-hover:hidden w-20 mx-auto">
              <div className="relative">
                <div className="absolute inset-1 bg-primary/25 rounded-full blur-sm animate-pulse pointer-events-none" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-primary/40">
                  <span className="text-lg font-bold text-primary-foreground">L</span>
                </div>
              </div>
            </div>

            {/* Expanded State Header: Back Icon + Company Name */}
            <div className="hidden group-hover:block pb-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="px-2"
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-base md:text-lg font-semibold md:font-bold tracking-tight bg-gradient-to-r from-primary via-foreground to-foreground/70 bg-clip-text text-transparent">
                    {companyName || 'Company'}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    Learning
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Section */}
            <div>
              {/* Collapsed: Icon-only buttons - centered with consistent highlight */}
              <div className="group-hover:hidden w-20 mx-auto flex flex-col items-center space-y-3">
                <button
                  onClick={() => onChangeView('teacher')}
                  className={`relative w-12 h-12 rounded-xl transition-colors duration-300 flex items-center justify-center ${
                    activeView === 'teacher'
                      ? 'bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/40 shadow-lg shadow-primary/30'
                      : 'bg-muted/30 hover:bg-muted/60 hover:ring-1 hover:ring-primary/20'
                  }`}
                  title="Teacher Agent"
                >
                  {activeView === 'teacher' && (
                    <div className="absolute inset-1 bg-primary/25 rounded-lg blur-sm pointer-events-none" />
                  )}
                  <Bot className={`w-5 h-5 transition-colors relative z-10 ${activeView === 'teacher' ? 'text-primary' : 'text-muted-foreground'}`} />
                  {activeView === 'teacher' && (
                    <div className="absolute right-1 top-1 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => onChangeView('skills')}
                  className={`relative w-12 h-12 rounded-xl transition-colors duration-300 flex items-center justify-center ${
                    activeView === 'skills'
                      ? 'bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/40 shadow-lg shadow-primary/30'
                      : 'bg-muted/30 hover:bg-muted/60 hover:ring-1 hover:ring-primary/20'
                  }`}
                  title="Skills Assessment"
                >
                  {activeView === 'skills' && (
                    <div className="absolute inset-1 bg-primary/25 rounded-lg blur-sm pointer-events-none" />
                  )}
                  <ListChecks className={`w-5 h-5 transition-colors relative z-10 ${activeView === 'skills' ? 'text-primary' : 'text-muted-foreground'}`} />
                  {activeView === 'skills' && (
                    <div className="absolute right-1 top-1 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => onChangeView('projects')}
                  className={`relative w-12 h-12 rounded-xl transition-colors duration-300 flex items-center justify-center ${
                    activeView === 'projects'
                      ? 'bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/40 shadow-lg shadow-primary/30'
                      : 'bg-muted/30 hover:bg-muted/60 hover:ring-1 hover:ring-primary/20'
                  }`}
                  title="Company Projects"
                >
                  {activeView === 'projects' && (
                    <div className="absolute inset-1 bg-primary/25 rounded-lg blur-sm pointer-events-none" />
                  )}
                  <BookOpen className={`w-5 h-5 transition-colors relative z-10 ${activeView === 'projects' ? 'text-primary' : 'text-muted-foreground'}`} />
                  {activeView === 'projects' && (
                    <div className="absolute right-1 top-1 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </button>
              </div>

              {/* Expanded: Full navigation with text */}
              <div className="hidden group-hover:block space-y-1.5">
                <button
                  onClick={() => onChangeView('teacher')}
                  className={`w-full rounded-xl transition-all duration-300 ${
                    activeView === 'teacher' 
                      ? 'bg-gradient-to-r from-primary/20 via-primary/10 to-transparent shadow-lg shadow-primary/20 border border-primary/30' 
                      : 'hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 p-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      activeView === 'teacher' 
                        ? 'bg-gradient-to-br from-primary/30 to-primary/10 text-primary shadow-lg shadow-primary/30' 
                        : 'bg-muted/50 text-muted-foreground'
                    }`}>
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium text-sm ${activeView === 'teacher' ? 'text-primary' : 'text-foreground'}`}>
                        Teacher Agent
                      </div>
                      <div className="text-[10px] text-muted-foreground">AI-powered learning</div>
                    </div>
                    {activeView === 'teacher' && (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => onChangeView('skills')}
                  className={`w-full rounded-xl transition-all duration-300 ${
                    activeView === 'skills' 
                      ? 'bg-gradient-to-r from-primary/20 via-primary/10 to-transparent shadow-lg shadow-primary/20 border border-primary/30' 
                      : 'hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 p-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      activeView === 'skills' 
                        ? 'bg-gradient-to-br from-primary/30 to-primary/10 text-primary shadow-lg shadow-primary/30' 
                        : 'bg-muted/50 text-muted-foreground'
                    }`}>
                      <ListChecks className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium text-sm ${activeView === 'skills' ? 'text-primary' : 'text-foreground'}`}>
                        Skills Assessment
                      </div>
                      <div className="text-[10px] text-muted-foreground">Track your growth</div>
                    </div>
                    {activeView === 'skills' && (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => onChangeView('projects')}
                  className={`w-full rounded-xl transition-all duration-300 ${
                    activeView === 'projects' 
                      ? 'bg-gradient-to-r from-primary/20 via-primary/10 to-transparent shadow-lg shadow-primary/20 border border-primary/30' 
                      : 'hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 p-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      activeView === 'projects' 
                        ? 'bg-gradient-to-br from-primary/30 to-primary/10 text-primary shadow-lg shadow-primary/30' 
                        : 'bg-muted/50 text-muted-foreground'
                    }`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-medium text-sm ${activeView === 'projects' ? 'text-primary' : 'text-foreground'}`}>
                        Company Projects
                      </div>
                      <div className="text-[10px] text-muted-foreground">Explore opportunities</div>
                    </div>
                    {activeView === 'projects' && (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Skills Overview - show only on hover (no collapsed content) */}
            <div className="relative hidden group-hover:block">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-blue-500/10 to-transparent rounded-2xl blur-xl opacity-100 transition-opacity duration-500" />
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card to-card/60 backdrop-blur-md shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
                {/* Header */}
                <div className="p-4 border-b border-border/30 bg-gradient-to-r from-violet-500/5 to-transparent">
                  <div className="flex items-center gap-3 group-hover:justify-start justify-center">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <div className="absolute inset-0 bg-violet-500/20 rounded-xl blur-md animate-pulse" />
                      <div className="relative w-10 h-10 bg-gradient-to-br from-violet-500/30 to-blue-500/10 rounded-xl flex items-center justify-center border border-violet-500/30">
                        <GraduationCap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                    </div>
                    <div className="overflow-hidden opacity-100 transition-all duration-500 delay-100">
                      <div className="text-sm font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent whitespace-nowrap">
                        Skills Overview
                      </div>
                      <div className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                        Track your progress
                      </div>
                    </div>
                  </div>
                </div>
                {/* Expanded View - Detailed Progress */}
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Coverage</span>
                      <span className="text-sm font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                        {skillCoveragePercent}%
                      </span>
                    </div>
                    <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-violet-500 to-blue-500 rounded-full transition-all duration-500 shadow-lg shadow-primary/50"
                        style={{ width: `${skillCoveragePercent}%` }}
                      />
                    </div>
                  </div>
 
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Required Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {companyRequiredSkills.length > 0 ? (
                        companyRequiredSkills.slice(0, 6).map((skill) => (
                          <div 
                            key={skill} 
                            className="text-[10px] px-2 py-1 rounded-md bg-gradient-to-r from-muted/80 to-muted/50 border border-border/50 text-foreground/80 font-medium backdrop-blur-sm"
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
              <div className="hidden group-hover:block transition-all duration-500 delay-200">
                <Button
                  onClick={onLeaveCompany}
                  className="w-full p-3 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/40 transition-all duration-300 text-xs text-destructive font-medium backdrop-blur-sm"
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


