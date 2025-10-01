"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Bot, BookOpen, ListChecks, GraduationCap, Video, Image as ImageIcon, Sparkles } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useEffect, useMemo, useState } from "react"

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
      <div className="container mx-auto h-full px-4 py-8 overflow-hidden">
      {/* Header moved into right column */}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
          {/* Sidebar */}
          <aside className="lg:col-span-3 lg:border-r lg:pr-6">
            <div className="lg:sticky lg:top-4">
              <div className="pr-2">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Learning Navigator</CardTitle>
                      <CardDescription>Quickly jump between sections</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        variant={'ghost'}
                        size="sm"
                        className={`w-full justify-start gap-2 ${activeView === 'teacher' ? 'bg-muted' : 'hover:bg-muted'}`}
                        onClick={() => setActiveView('teacher')}
                      >
                        <Bot className="w-4 h-4" /> Teacher Agent
                      </Button>
                      <Button
                        variant={'ghost'}
                        size="sm"
                        className={`w-full justify-start gap-2 ${activeView === 'skills' ? 'bg-muted' : 'hover:bg-muted'}`}
                        onClick={() => setActiveView('skills')}
                      >
                        <ListChecks className="w-4 h-4" /> Skills
                      </Button>
                      <Button
                        variant={'ghost'}
                        size="sm"
                        className={`w-full justify-start gap-2 ${activeView === 'projects' ? 'bg-muted' : 'hover:bg-muted'}`}
                        onClick={() => setActiveView('projects')}
                      >
                        <BookOpen className="w-4 h-4" /> Projects
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Skills Overview</CardTitle>
                      <CardDescription>Coverage and requirements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Coverage</span>
                        <span className="text-sm font-medium">{skillCoveragePercent}%</span>
                      </div>
                      <Progress value={skillCoveragePercent} />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {companyRequiredSkills.length > 0 ? (
                          companyRequiredSkills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No skills listed yet.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-2 border-t pt-2">
                    {isJoined && (
                      <Button
                        variant="link"
                        size="sm"
                        className="w-full justify-start px-0 text-muted-foreground"
                        onClick={handleLeaveCompany}
                      >
                        Leave company
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9 lg:pl-6 h-full flex flex-col min-h-0">
            <ScrollArea className="flex-1 min-h-0 pr-2">
              <div className="space-y-6">
            {/* Back */}
            <div>
              <Button variant="outline" size="sm" onClick={() => router.push(`/student/${studentId}/dashboard`)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            {/* Company Header (right column) */}
            <div className="rounded-lg border bg-muted/30 p-4 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <span className="text-lg font-bold">{company.logo || company.name.substring(0, 2)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{company.name}</h1>
                    <Badge variant="secondary">Company</Badge>
                    {isJoined && <Badge variant="outline">Joined</Badge>}
                  </div>
                  <p className="text-muted-foreground text-sm">{company.description}</p>
                </div>
              </div>
              {!isJoined && (
                <Button onClick={() => handleJoinCompany(companyId)}>
                  <Plus className="w-4 h-4 mr-2" /> Join Company
                </Button>
              )}
            </div>
            {activeView === 'teacher' && (
            <section>
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">Teacher Agent</CardTitle>
                    </div>
                    <Badge className="gap-1" variant="secondary"><Sparkles className="w-3 h-3" /> Personalized</Badge>
                  </div>
                  <CardDescription>Teaches missing skills with text, images, and video</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {/* Lesson Media Panel */}
                  <div className="rounded-lg border bg-muted/30 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Video className="w-4 h-4" /> Lesson Preview
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm"><ImageIcon className="w-4 h-4 mr-1" /> Image</Button>
                        <Button size="sm"><Video className="w-4 h-4 mr-1" /> Video</Button>
                      </div>
                    </div>
                    <div className="aspect-video bg-black/5 flex items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <PlayIcon />
                        </div>
                        <p className="text-sm text-muted-foreground">Your lesson will appear here</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Panel */}
                  <div className="rounded-lg border bg-background">
                    <div className="px-4 py-2 border-b bg-muted/50 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      <p className="text-sm font-medium">Live Tutoring</p>
                    </div>
                    <div className="p-4">
                      <div className="space-y-4">
                        {/* Sample messages (UI only) */}
                        <AgentMessage>Hi {student.name?.split(" ")[0] || "there"}, I see you’re missing <strong>{missingSkills[0] || "some skills"}</strong>. Shall we start?</AgentMessage>
                        <UserMessage>Yes, teach me with examples.</UserMessage>
                        <AgentMessage>Great. Here’s a quick visual and a short video overview. Ask questions anytime!</AgentMessage>
                      </div>
                    </div>
                    <div className="p-3 border-t bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Input placeholder={`Ask to learn ${missingSkills[0] || "a skill"}...`} className="flex-1" />
                        <Button className="gap-1"><Sparkles className="w-4 h-4" /> Teach</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
            )}

            {activeView === 'skills' && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Skills</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Missing Skills</CardTitle>
                    <CardDescription>What the agent will teach next</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {missingSkills.length > 0 ? missingSkills.map((skill) => (
                      <div key={skill} className="flex items-center justify-between rounded-md border px-3 py-2 bg-background">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{skill}</Badge>
                        </div>
                        <Button size="sm" variant="secondary">Start module</Button>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground">You’re all set. No missing skills!</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Your Skills</CardTitle>
                    <CardDescription>Already mastered by you</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {studentSkills.length > 0 ? (
                      studentSkills.map((skill) => (
                        <Badge key={skill} className="text-xs" variant="secondary">{skill}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills added yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>
            )}

            {activeView === 'projects' && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Projects in this company</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.length > 0 ? projects.map((project) => {
                  const hasJoinedProject = student.projects?.includes(project.project_id)
                  return (
                    <Card key={project.project_id} className="flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{project.name}</CardTitle>
                            <CardDescription>{project.description}</CardDescription>
                          </div>
                          <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="mt-1 space-y-3">
                        {Array.isArray(project.required_skills) && project.required_skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.required_skills.map((skill: string) => (
                              <span key={skill} className="inline-block rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="secondary" size="sm">Learn skills</Button>
                          {hasJoinedProject ? (
                            <Button size="sm" onClick={() => handleGoToWorkspace(project.project_id)}>Open</Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleJoinProject(project.project_id)}>Join</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                }) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">No projects available yet.</CardContent>
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