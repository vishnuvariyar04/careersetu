"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2, Users, Star, CheckCircle, Award, Target, BarChart3,
  Calendar, ArrowLeft, Globe, MapPin, Briefcase, Code, Trophy,
  Activity, Zap, Plus,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function CompanyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.student_id as string
  const companyId = params.company_id as string

  const [company, setCompany] = useState<any>()
  const [student, setStudent] = useState<any>()
  const [isJoined, setIsJoined] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([]) // Assuming a 'teams' table exists
  const [companyStudents, setCompanyStudents] = useState<any[]>([])
  const [allProgress, setAllProgress] = useState<any[]>([]) // Assuming a 'progress' table exists

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

      // Fetch the current student's data
      // NOTE: Assuming 'companies_joined' array exists on students table for company membership logic.
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*, companies_joined, projects")
        .eq("student_id", studentId)
        .single()
      if (studentError) {
        console.error("Error fetching student:", studentError)
        return
      }
      setStudent(studentData)

      
      
      const joinedCompanies = studentData?.companies_joined || []
      setIsJoined(joinedCompanies.includes(companyId))

      // Fetch all students who have joined this company
      const { data: companyStudentsData, error: companyStudentsError } = await supabase
        .from("students")
        .select("*")
        .contains("companies_joined", [companyId])
      if (companyStudentsError) console.error("Error fetching company students:", companyStudentsError)
      else setCompanyStudents(companyStudentsData || [])

      // Fetch all progress data related to this company
      // NOTE: This assumes a 'progress' table with student_id, project_id, company_id, status, score
      const { data: progressData, error: progressError } = await supabase
        .from("progress")
        .select("*")
        .eq("company_id", companyId)
      if (progressError) console.log(" ")
      else setAllProgress(progressData || [])
    }
    fetchData()
  }, [companyId, studentId])

  // --- Live Data Calculations ---
  const totalStudents = companyStudents.length
  const activeProjects = projects.filter((p) => p.status === "active").length
  const completedProjectsCount = projects.filter((p) => p.status === "completed").length
  
  const completedProgress = allProgress.filter((p) => p.status === "completed")
  const completionRate = allProgress.length > 0 ? (completedProgress.length / allProgress.length) * 100 : 0
  
  const scoresWithValues = completedProgress.filter((p) => typeof p.score === 'number')
  const averageScore = scoresWithValues.length > 0
      ? scoresWithValues.reduce((sum, p) => sum + p.score, 0) / scoresWithValues.length
      : 0

  const studentScores = companyStudents
    .map((s) => {
      const studentProgress = allProgress.filter((p) => p.student_id === s.student_id && typeof p.score === 'number')
      const avgScore = studentProgress.length > 0
          ? studentProgress.reduce((sum, p) => sum + p.score, 0) / studentProgress.length
          : 0
      const projectsCompleted = studentProgress.filter((p) => p.status === "completed").length
      return { student: s, avgScore, projectsCompleted }
    })
    .sort((a, b) => b.avgScore - a.avgScore)

    const techCounts: Record<string, number> = {}
      projects.forEach((project) => {
        // ADDED: Check if the project itself is a valid object.
        if (project && project.requiredSkills && Array.isArray(project.requiredSkills)) {
          project.requiredSkills.forEach((skill: any) => {
            // ADDED: Ensure the skill is not null/undefined before using it as a key.
            if (skill) {
              techCounts[skill] = (techCounts[skill] || 0) + 1
            }
          })
        }
      })
      const popularTechs = Object.entries(techCounts).sort(([, a], [, b]) => b - a).slice(0, 8)

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
    router.push(`/student/${studentId}/company/${companyId}/project/${projectId}/teams/workspace`)
  }

  if (!company || !student) {
    return <div>Loading...</div> // Or a proper loading spinner component
  }
  
  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => router.push(`/student/${studentId}/dashboard`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold">{company.logo || company.name.substring(0, 2)}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground text-lg">{company.description}</p>
            <div className="flex items-center gap-6 mt-3">
              {isJoined ? (
                <>
                  <div className="text-sm bg-green-100 text-green-700 rounded-md px-3 py-1 font-medium">✓ You're a member</div>
                  <div className="text-sm bg-red-100 text-red-600 rounded-md px-3 py-1 cursor-pointer hover:bg-red-200" onClick={handleLeaveCompany}>Leave company</div>
                </>
              ) : (
                <Button onClick={() => handleJoinCompany(companyId)}><Plus className="w-4 h-4 mr-2" /> Join Company</Button>
              )}
              {/* Other header info */}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold">{totalStudents}</p>
                  <p className="text-xs text-muted-foreground mt-1">Active learners</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                  <p className="text-3xl font-bold">{activeProjects}</p>
                  <p className="text-xs text-muted-foreground mt-1">of {projects.length} total</p>
                </div>
                <Briefcase className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold">{Math.round(completionRate)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Project success</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-3xl font-bold">{averageScore.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
                </div>
                <Trophy className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="required_skills">Required Skills</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* --- PROJECTS TAB --- */}
            <TabsContent value="projects" className="space-y-6">
            {isJoined ? (
                // VIEW FOR STUDENTS WHO HAVE JOINED THE COMPANY
                <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Your Available Projects</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {projects.length > 0 ? projects.map((project) => {
                    const hasJoinedProject = student.projects?.includes(project.project_id)
                    return (
                        <Card key={project.project_id} className="border-green-200 bg-green-50/30 flex flex-col justify-between">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>{project.name}</CardTitle>
                                <CardDescription>{project.description}</CardDescription>
                            </div>
                            <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Other project details */}
                            {Array.isArray(project.required_skills) && project.required_skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {project.required_skills.map((skill: string) => (
                              <span
                                key={skill}
                                className="inline-block rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                            {hasJoinedProject ? (
                            <Button className="w-full" onClick={() => handleGoToWorkspace(project.project_id)}>
                                <Zap className="w-4 h-4 mr-2" /> Go to Workspace
                            </Button>
                            ) : (
                            <Button className="w-full" variant="outline" onClick={() => handleJoinProject(project.project_id)}>
                                <Plus className="w-4 h-4 mr-2" /> Join Project
                            </Button>
                            )}
                        </CardContent>
                        </Card>
                    )
                    }) : (
                    <p>No projects available in this company yet.</p>
                    )}
                </div>
                </div>
            ) : (
                // VIEW FOR STUDENTS WHO HAVE NOT JOINED THE COMPANY
                <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Available Projects (Previews)</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {projects.length > 0 ? projects.map((project) => (
                    <Card key={project.project_id} className="border-blue-200 bg-blue-50/30">
                        <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                            <CardTitle>{project.name}</CardTitle>
                            <CardDescription>{project.description}</CardDescription>
                            </div>
                            <Badge variant="outline">{project.status}</Badge>
                        </div>
                        </CardHeader>
                        <CardContent>
                        {/* Preview details, NO button is shown */}
                        {Array.isArray(project.required_skills) && project.required_skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {project.required_skills.map((skill: string) => (
                              <span
                                key={skill}
                                className="inline-block rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">Join the company to participate in this project.</p>
                        </CardContent>
                    </Card>
                    )) : (
                    <p>No projects available in this company yet.</p>
                    )}
                </div>
                </div>
            )}
            </TabsContent>

            {/* --- STUDENTS TAB --- */}
            <TabsContent value="students" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyStudents.map((s) => {
                    const studentProgress = allProgress.filter((p) => p.student_id === s.student_id)
                    const activeProjectsCount = studentProgress.filter((p) => p.status === "active").length
                    const completedProjectsCount = studentProgress.filter((p) => p.status === "completed").length
                    const studentAvgScore = studentScores.find(scoreItem => scoreItem.student.student_id === s.student_id)?.avgScore || 0

                    return (
                    <Card key={s.student_id}>
                        <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar>
                            <AvatarFallback>{s.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                            <p className="font-semibold">{s.name}</p>
                            <p className="text-sm text-muted-foreground">{s.email}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Average Score</span>
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-primary text-primary" />
                                    <span className="font-semibold">{studentAvgScore.toFixed(1)}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><p className="text-muted-foreground">Active</p><p className="font-semibold">{activeProjectsCount}</p></div>
                                <div><p className="text-muted-foreground">Completed</p><p className="font-semibold">{completedProjectsCount}</p></div>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">Skills:</p>
                                <div className="flex flex-wrap gap-1">
                                    {s.skills?.slice(0, 3).map((skill: string) => <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>)}
                                    {s.skills?.length > 3 && <Badge variant="outline" className="text-xs">+{s.skills.length - 3}</Badge>}
                                </div>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                    )
                })}
                </div>
            </TabsContent>
            
            {/* Other Tabs can be filled similarly using live data */}
            <TabsContent value="overview">
                {/* Build out Overview tab using 'company', 'studentScores', etc. */}
            </TabsContent>
            <TabsContent value="technologies">
                 {/* Build out Technologies tab using 'popularTechs' */}
            </TabsContent>
            <TabsContent value="analytics">
                {/* Build out Analytics tab using calculated rates and scores */}
            </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}