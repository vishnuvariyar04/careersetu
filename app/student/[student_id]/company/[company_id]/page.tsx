"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Star, ArrowRight, Play, CheckCircle, LogOut, UserPlus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { storage, type Company, type Project, type StudentProgress, type Team } from "@/lib/storage"

export default function StudentCompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.student_id as string
  const companyId = params.company_id as string

  const [company, setCompany] = useState<Company | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    storage.initializeData()

    const companyData = storage.getCompany(companyId)
    if (companyData) {
      setCompany(companyData)

      // Get company projects
      const companyProjects = storage.getCompanyProjects(companyId)
      setProjects(companyProjects)

      // Get student progress for this company
      const progress = storage.getStudentProjectProgress(studentId)
      const companyProgress = progress.filter((p) => p.companyId === companyId)
      setStudentProgress(companyProgress)

      // Get all teams for projects in this company
      const allTeams: Team[] = []
      companyProjects.forEach((project) => {
        const projectTeams = storage.getProjectTeams(project.id)
        allTeams.push(...projectTeams)
      })
      setTeams(allTeams)
    }
  }, [studentId, companyId])

  const handleViewProjects = () => {
    router.push(`/student/${studentId}/company/${companyId}/projects`)
  }

  const handleGoToWorkspace = (projectId: string) => {
    // Check if student has a team for this project
    const teamId = localStorage.getItem(`student_${studentId}_company_${companyId}_project_${projectId}_selected_team`)

    if (teamId) {
      router.push(`/student/${studentId}/company/${companyId}/project/${projectId}/team/${teamId}/workspace`)
    } else {
      // Navigate to team selection with proper nested URL
      router.push(`/student/${studentId}/company/${companyId}/project/${projectId}/teams`)
    }
  }

  const handleLeaveTeam = (projectId: string, teamId: string) => {
    storage.leaveTeam(studentId, teamId)
    // Refresh the page to show updated state
    window.location.reload()
  }

  const handleJoinProject = (projectId: string) => {
    router.push(`/student/${studentId}/company/${companyId}/project/${projectId}/teams`)
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading company details...</p>
        </div>
      </div>
    )
  }

  const activeProjects = projects.filter((project) =>
    studentProgress.some((p) => p.projectId === project.id && p.status === "active"),
  )

  const completedProjects = projects.filter((project) =>
    studentProgress.some((p) => p.projectId === project.id && p.status === "completed"),
  )

  const availableProjects = projects.filter((project) => !studentProgress.some((p) => p.projectId === project.id))

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-8">
        {/* Company Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold">{company.logo}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">{company.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="font-medium">{company.rating}</span>
              </div>
              <Badge variant="outline">{company.difficulty}</Badge>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push(`/student/${studentId}/dashboard`)}>
            Back to Dashboard
          </Button>
        </div>

        {/* Company Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Company Overview</h2>
            <Button variant="outline" onClick={handleViewProjects}>
              View All Projects
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Current Projects */}
        {activeProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-green-500" />
              Active Projects ({activeProjects.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeProjects.map((project) => {
                const progress = studentProgress.find((p) => p.projectId === project.id)
                const teamId = storage.getStudentTeam(studentId, project.id)
                const team = teamId ? storage.getTeam(teamId) : null

                return (
                  <Card
                    key={project.id}
                    className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </div>
                        <Badge className="bg-green-500 text-white">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Team: {team?.name || "No team"}</span>
                          <Badge variant="outline">{progress?.role || "Member"}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {project.requiredSkills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button className="flex-1" onClick={() => handleGoToWorkspace(project.id)}>
                            Go to Workspace
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                          {teamId && (
                            <Button variant="outline" size="sm" onClick={() => handleLeaveTeam(project.id, teamId)}>
                              <LogOut className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Completed Projects */}
        {completedProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              Completed Projects ({completedProjects.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {completedProjects.map((project) => {
                const progress = studentProgress.find((p) => p.projectId === project.id)

                return (
                  <Card
                    key={project.id}
                    className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="font-medium">{progress?.score || 4.5}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <Badge variant="outline">{progress?.role || "Member"}</Badge>
                          <span className="text-muted-foreground">
                            {progress?.completedDate
                              ? new Date(progress.completedDate).toLocaleDateString()
                              : "Recently"}
                          </span>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Technologies:</p>
                          <div className="flex flex-wrap gap-1">
                            {project.requiredSkills.map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Available Projects */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-orange-500" />
            Available Projects ({availableProjects.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableProjects.map((project) => {
              const projectTeams = storage.getProjectTeams(project.id)

              return (
                <Card key={project.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </div>
                      <Badge variant="outline">{project.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Duration: {project.duration}</span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {projectTeams.length} teams
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Technologies:</p>
                        <div className="flex flex-wrap gap-1">
                          {project.requiredSkills.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full" onClick={() => handleJoinProject(project.id)}>
                        Join Project
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
