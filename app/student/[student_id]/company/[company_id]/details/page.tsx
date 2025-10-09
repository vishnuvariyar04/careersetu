"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Bot, BookOpen, ListChecks, GraduationCap, Video, Image as ImageIcon, Sparkles, CheckCircle2 } from "lucide-react"
import LearningSidebar from "@/components/company/learning-sidebar"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useEffect, useMemo, useState } from "react"
import AIChat from "@/components/ai-learning-chat"
import CurriculumSidebar from "@/components/teacher-agent/CurriculumSidebar"
import LessonPlayer from "@/components/teacher-agent/LessonPlayer"
import LessonContent from "@/components/teacher-agent/LessonContent"
import QuizBlock from "@/components/teacher-agent/QuizBlock"
// ProgressSummary intentionally not used to keep UI minimal
import type { Module as TeacherModule } from "@/lib/teacher-progress"
import { ensureSkillInitialized, getProgress, updateLesson, markQuiz, computeReadiness } from "@/lib/teacher-progress"

export default function CompanyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.student_id as string
  const companyId = params.company_id as string

  const [company, setCompany] = useState<any>()
  const [student, setStudent] = useState<any>()
  const [isJoined, setIsJoined] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  

  useEffect(() => {
    const fetchData = async () => {
      // Fetch company data
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("company_id", companyId)
        .single()
      if (companyError) {
        console.error("Error fetching company:", companyError)
        return
      }
      setCompany(companyData)

      // Fetch projects for the company
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("company_id", companyId)
      if (projectsError) {
        console.error("Error fetching projects:", projectsError)
        return
      }

      console.log("Projects: ",projectsData)
      setProjects(projectsData || [])

      // Fetch the current student's data (skills included)
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*, companies_joined, projects, skills")
        .eq("student_id", studentId)
        .single()
      if (studentError) {
        console.error("Error fetching student:", studentError)
        return
      }
      setStudent(studentData)

      const joinedCompanies = studentData?.companies_joined || []
      setIsJoined(joinedCompanies.includes(companyId))
    }
    fetchData()
  }, [companyId, studentId])
  // --- Skills Derivations ---
  const companyRequiredSkills: string[] = useMemo(() => {
    const set = new Set<string>()
    projects.forEach((p: any) => {
      if (p && Array.isArray(p.required_skills)) {
        p.required_skills.forEach((s: string) => {
          if (s) set.add(s)
        })
      }
    })
    return Array.from(set)
  }, [projects])

  const studentSkills: string[] = useMemo(() => {
    const raw = (student?.skills || []) as any
    return Array.isArray(raw) ? raw.filter(Boolean) : []
  }, [student])

  const missingSkills: string[] = useMemo(() => {
    const set = new Set(studentSkills)
    return companyRequiredSkills.filter((s) => !set.has(s))
  }, [companyRequiredSkills, studentSkills])

  const skillCoveragePercent = useMemo(() => {
    if (companyRequiredSkills.length === 0) return 0
    const covered = companyRequiredSkills.filter((s) => studentSkills.includes(s)).length
    return Math.round((covered / companyRequiredSkills.length) * 100)
  }, [companyRequiredSkills, studentSkills])

  const [activeView, setActiveView] = useState<'teacher' | 'skills' | 'projects'>('teacher')
  const [teacherTab, setTeacherTab] = useState<'lesson' | 'tutor'>('tutor')
  const [showQuiz, setShowQuiz] = useState(false)

  // --- Teacher Agent State ---
  const [selectedSkill, setSelectedSkill] = useState<string>("")
  const [skillModules, setSkillModules] = useState<TeacherModule[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!student || !company) return
    // Initialize selected skill from missing skills, fallback to any company required skill
    const initialSkill = (missingSkills[0] || companyRequiredSkills[0] || "").toString()
    if (!initialSkill) return
    setSelectedSkill((prev) => prev || initialSkill)
  }, [student, company, missingSkills, companyRequiredSkills])

  useEffect(() => {
    if (!selectedSkill) return
    const { modules } = ensureSkillInitialized(studentId, companyId, selectedSkill)
    setSkillModules(modules)
    setSelectedModuleId((prev) => prev || modules[0]?.id)
  }, [selectedSkill, studentId, companyId])

  const currentModule = useMemo(() => skillModules.find((m) => m.id === selectedModuleId) || skillModules[0], [skillModules, selectedModuleId])
  const currentLesson = useMemo(() => {
    if (!currentModule) return undefined
    const firstTodo = currentModule.lessons.find((l) => l.status !== 'done')
    return firstTodo || currentModule.lessons[0]
  }, [currentModule])

  const refreshModulesFromStorage = () => {
    const progress = getProgress(studentId, companyId)
    const sp = progress[selectedSkill]
    if (sp) setSkillModules(sp.modules)
  }

  const handleLessonDone = () => {
    if (!currentModule || !currentLesson) return
    updateLesson(studentId, companyId, selectedSkill, currentModule.id, currentLesson.id, 'done')
    refreshModulesFromStorage()
  }

  const handleQuizResult = (passed: boolean) => {
    if (!currentModule) return
    markQuiz(studentId, companyId, selectedSkill, currentModule.id, passed)
    refreshModulesFromStorage()
  }

  const readinessPercent = useMemo(() => {
    const progress = getProgress(studentId, companyId)
    return computeReadiness(progress, companyRequiredSkills)
  }, [studentId, companyId, companyRequiredSkills, skillModules])

  // --- Event Handlers ---
  const handleJoinCompany = async (companyId: string) => {
    if (!student) return
    const currentCompanies = student.companies_joined || []
    if (!currentCompanies.includes(companyId)) {
      const updatedCompanies = [...currentCompanies, companyId]
      const { error } = await supabase.from("students").update({ companies_joined: updatedCompanies }).eq("student_id", studentId)
      if (error) console.error("Error joining company:", error)
      else setIsJoined(true)
    }
    
  }
  const handleLeaveCompany = async () => {
    // Return early if essential data isn't loaded yet.
    if (!student || !projects) return;
  
    // 1. Get the IDs of all projects belonging to the company being left.
    const projectsToRemoveIds = projects.map(p => p.project_id);
  
    // --- New Logic Start ---
    // Before updating the student, remove them from any teams within those projects.
    if (projectsToRemoveIds.length > 0) {
      // 2. Find all team IDs associated with the projects to be removed.
      const { data: teamsInCompany, error: teamsError } = await supabase
        .from('teams')
        .select('team_id')
        .in('project_id', projectsToRemoveIds);
  
      if (teamsError) {
        console.error("Error fetching teams to leave:", teamsError);
        return; // Stop the process if we can't get the teams
      }
  
      if (teamsInCompany && teamsInCompany.length > 0) {
        const teamIdsToRemove = teamsInCompany.map(t => t.team_id);
  
        // 3. Delete the student's membership from all identified teams.
        const { error: deleteMemberError } = await supabase
          .from('team_members')
          .delete()
          .eq('student_id', studentId)
          .in('team_id', teamIdsToRemove);
  
        if (deleteMemberError) {
          console.error("Error removing student from team memberships:", deleteMemberError);
          return; // Stop the process if deletion fails
        }
      }
    }
    // --- New Logic End ---
  
    // 4. Filter the student's current project list.
    const currentStudentProjects = student.projects || [];
    const updatedStudentProjects = currentStudentProjects.filter(
      (projectId: string) => !projectsToRemoveIds.includes(projectId)
    );
  
    // 5. Filter the student's joined companies list.
    const currentCompanies = student.companies_joined || [];
    const updatedCompanies = currentCompanies.filter((c: any) => c !== companyId);
  
    // 6. Update the student's record with the cleaned lists.
    const { error: updateStudentError } = await supabase
      .from("students")
      .update({ 
        companies_joined: updatedCompanies,
        projects: updatedStudentProjects
      })
      .eq("student_id", studentId);
      
    if (updateStudentError) {
      console.error("Error leaving company:", updateStudentError);
    } else {
      setIsJoined(false);
      router.push(`/student/${studentId}/dashboard`);
    }
  }

  const handleJoinProject = async (projectId: string) => {
    if (!student) return

    const currentProjects = student.projects || []

    // First, ensure the student is officially part of the project in the database.
    // This runs only if they haven't already joined this project.
    if (!currentProjects.includes(projectId)) {
      const updatedProjects = [...currentProjects, projectId]
      const { error } = await supabase
        .from("students")
        .update({ projects: updatedProjects })
        .eq("student_id", studentId)

      if (error) {
        console.error("Error joining project:", error)
        // If the database update fails, we should not navigate.
        return 
      } else {
        // Also update the local state for UI consistency
        setStudent((prev: any) => ({ ...prev, projects: updatedProjects }))
      }
    }

    // After the student has successfully joined, redirect them to the team selection page.
    router.push(`/student/${studentId}/company/${companyId}/project/${projectId}/teams`)
  }

  const handleGoToWorkspace = (projectId: string) => {
    router.push(`/student/${studentId}/company/${companyId}/project/${projectId}/teams/team_3/workspace`)
  }

  if (!company || !student) {
    return <div>Loading...</div> // Or a proper loading spinner component
  }
  
  return (
    <div className="h-screen bg-background">
      <div className="h-full overflow-hidden">
        {/* Main Layout */}
        <div className="flex gap-0 h-full min-h-0">
		  {/* Futuristic Collapsible Sidebar (component) */}
		  <LearningSidebar
			activeView={activeView}
			onChangeView={(v) => setActiveView(v)}
			isJoined={isJoined}
			onLeaveCompany={handleLeaveCompany}
			skillCoveragePercent={skillCoveragePercent}
			companyRequiredSkills={companyRequiredSkills}
		  />

          {/* Main content */}
          <main className="flex-1 h-full flex flex-col min-h-0">
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-8 py-6 space-y-6 max-w-[1800px] mx-auto w-full">
            {/* Toolbar */}
            <div className="flex items-center gap-2 py-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/student/${studentId}/dashboard`)}
                aria-label="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-5 w-px bg-border/70" />
                <span className="truncate text-base md:text-lg font-semibold md:font-bold tracking-tight leading-5 bg-gradient-to-r from-primary via-foreground to-foreground/70 bg-clip-text text-transparent">
                  {company.name}
                </span>
              </div>
            </div>

            {activeView === 'teacher' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Teacher Agent</h2>
                  <Badge className="gap-1" variant="secondary"><Sparkles className="w-3 h-3" /> Personalized</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Readiness: <span className="font-semibold text-foreground">{readinessPercent}%</span>
                </div>
              </div>

              {/* Improved 2-column layout with expandable sidebar */}
              <div className="flex gap-4 min-h-[600px]">
                {/* Curriculum Sidebar - Always visible, not collapsible */}
                <div className="w-80 flex-shrink-0">
                  <CurriculumSidebar
                    skills={missingSkills.length > 0 ? missingSkills : companyRequiredSkills}
                    selectedSkill={selectedSkill}
                    onSelectSkill={(s) => setSelectedSkill(s)}
                    modules={skillModules}
                    selectedModuleId={selectedModuleId}
                    onSelectModule={(id) => setSelectedModuleId(id)}
                    compact={false}
                  />
                </div>

                {/* Main Content Area - Tabs for Lesson/Tutor */}
                <div className="flex-1 min-w-0">
                  <Tabs value={teacherTab} onValueChange={(v) => setTeacherTab(v as 'lesson' | 'tutor')} className="h-full">
                    <TabsList className="mb-4 w-full justify-start">
                      <TabsTrigger value="tutor" className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        AI Tutor
                      </TabsTrigger>
                      <TabsTrigger value="lesson" className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Lesson
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="lesson" className="space-y-4 mt-0">
                      <div className="space-y-4">
                        <LessonPlayer title={currentLesson ? currentLesson.title : 'Select a lesson'} />
                        <LessonContent
                          moduleTitle={currentModule ? currentModule.title : 'Module'}
                          lessonTitle={currentLesson ? currentLesson.title : 'Lesson'}
                          explanationHtml={`<p>Learn <strong>${selectedSkill || 'this skill'}</strong> step-by-step. Use the AI Tutor tab for deeper, personalized help.</p>`}
                          codeSample={`// Example code for ${selectedSkill || 'skill'}\nconsole.log('Hello ${selectedSkill || 'Skill'}');`}
                          resources={selectedSkill?.toLowerCase() === 'react' ? [{ label: 'Official Docs', href: 'https://react.dev' }] : []}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="default" onClick={handleLessonDone}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark Complete
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setShowQuiz((s) => !s)}>
                            {showQuiz ? 'Hide Quiz' : 'Take Quiz'}
                          </Button>
                        </div>
                        {currentModule && (
                          <span className="text-xs text-muted-foreground">
                            {currentModule.lessons.filter(l => l.status === 'done').length} / {currentModule.lessons.length} lessons completed
                          </span>
                        )}
                      </div>
                      {showQuiz && (
                        <div className="mt-4">
                          <QuizBlock moduleId={currentModule ? currentModule.id : 'module'} onResult={handleQuizResult} />
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="tutor" className="rounded-lg border overflow-hidden mt-0 h-[calc(100vh-300px)]">
                      <div className="px-4 py-3 border-b bg-muted/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium">AI Tutor - {selectedSkill || 'Learning'}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">Interactive</Badge>
                      </div>
                      <div className="h-full">
                        <AIChat
                          agentName="Teacher Agent"
                          agentDescription={`Helps you learn ${selectedSkill || 'skills'} with video, text, and graphics`}
                          uid={studentId}
                          company_id={companyId}
                          project_id={projects?.[0]?.project_id}
                          team_id={"learning"}
                          learningPaneKey={`${studentId}_${companyId}_${selectedSkill}`}
                          selectedTask={{ title: currentLesson ? currentLesson.title : 'Learning' }}
                          learningPrefill={`Teach ${selectedSkill || 'the skill'} with examples.`}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </section>
            )}

            {activeView === 'skills' && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Skills Assessment</h2>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Overall Coverage: </span>
                  <span className="font-semibold text-lg text-foreground">{skillCoveragePercent}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Missing Skills */}
                <Card className="border-2 border-amber-200 dark:border-amber-900">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Skills to Learn</CardTitle>
                        <CardDescription>Start learning these with Teacher Agent</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-amber-700 border-amber-300">
                        {missingSkills.length} pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {missingSkills.length > 0 ? missingSkills.map((skill) => (
                      <div key={skill} className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-muted/50 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                          </div>
                          <span className="font-medium">{skill}</span>
                        </div>
                        <Button size="sm" variant="default" onClick={() => setActiveView('teacher')}>
                          Start Learning
                        </Button>
                      </div>
                    )) : (
                      <div className="py-8 text-center">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                        <p className="text-sm font-medium">All caught up!</p>
                        <p className="text-xs text-muted-foreground">You have all required skills</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Mastered Skills */}
                <Card className="border-2 border-green-200 dark:border-green-900">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Your Skills</CardTitle>
                        <CardDescription>Skills you've already mastered</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        {studentSkills.length} mastered
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {studentSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {studentSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-sm">
                            <CheckCircle2 className="w-3 h-3 mr-1.5 text-green-600" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No skills added yet.</p>
                        <p className="text-xs mt-1">Complete lessons to build your skillset</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>
            )}

            {activeView === 'projects' && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Company Projects</h2>
                </div>
                <Badge variant="outline">{projects.length} {projects.length === 1 ? 'Project' : 'Projects'}</Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.length > 0 ? projects.map((project) => {
                  const hasJoinedProject = student.projects?.includes(project.project_id)
                  const isActive = project.status === "active"
                  return (
                    <Card key={project.project_id} className={`flex flex-col hover:shadow-lg transition-all ${hasJoinedProject ? 'border-2 border-primary/30' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">{project.name}</CardTitle>
                              {hasJoinedProject && (
                                <Badge variant="default" className="text-xs">Joined</Badge>
                              )}
                            </div>
                            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                          </div>
                          <Badge variant={isActive ? "default" : "secondary"} className="flex-shrink-0">
                            {project.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4">
                        {/* Required Skills */}
                        {Array.isArray(project.required_skills) && project.required_skills.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Required Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {project.required_skills.map((skill: string) => {
                                const hasSkill = studentSkills.includes(skill)
                                return (
                                  <Badge 
                                    key={skill} 
                                    variant={hasSkill ? "secondary" : "outline"}
                                    className={`text-xs ${hasSkill ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'border-amber-300 text-amber-700'}`}
                                  >
                                    {hasSkill && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                    {skill}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setActiveView('teacher')}
                            className="text-xs"
                          >
                            <GraduationCap className="w-4 h-4 mr-1.5" />
                            Learn Skills
                          </Button>
                          {hasJoinedProject ? (
                            <Button size="sm" onClick={() => handleGoToWorkspace(project.project_id)}>
                              Open Workspace
                            </Button>
                          ) : (
                            <Button size="sm" variant="default" onClick={() => handleJoinProject(project.project_id)}>
                              <Plus className="w-4 h-4 mr-1.5" />
                              Join Project
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                }) : (
                  <Card className="lg:col-span-2">
                    <CardContent className="py-12 text-center">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-lg font-medium text-muted-foreground mb-1">No projects available yet</p>
                      <p className="text-sm text-muted-foreground">Check back later for new opportunities</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
            )}
            
            </div>
          </ScrollArea>
          </main>
        </div>
      </div>
    </div>
  )
}

// --- UI-only helper components for chat bubbles ---
function AgentMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Avatar className="h-7 w-7">
        <AvatarFallback>TA</AvatarFallback>
      </Avatar>
      <div className="rounded-lg bg-muted px-3 py-2 text-sm max-w-[36rem]">
        {children}
      </div>
    </div>
  )
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 justify-end">
      <div className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm max-w-[36rem]">
        {children}
      </div>
      <Avatar className="h-7 w-7">
        <AvatarFallback>YOU</AvatarFallback>
      </Avatar>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
      <path d="M8 5v14l11-7z"></path>
    </svg>
  )
}