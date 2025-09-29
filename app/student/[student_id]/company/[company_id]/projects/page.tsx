"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Users, Star, Search, ArrowRight, Code, Clock } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

const projects = [
  {
    id: "1",
    title: "E-commerce Platform",
    description: "Build a modern e-commerce platform with payment integration and admin dashboard",
    difficulty: "Intermediate",
    duration: "8-12 weeks",
    technologies: ["React", "Node.js", "PostgreSQL", "Stripe API"],
    teams: 3,
    rating: 4.8,
    openSpots: 5,
    featured: true,
  },
  {
    id: "2",
    title: "Analytics Dashboard",
    description: "Create a real-time analytics dashboard with data visualization and reporting",
    difficulty: "Advanced",
    duration: "6-10 weeks",
    technologies: ["Next.js", "TypeScript", "D3.js", "PostgreSQL"],
    teams: 2,
    rating: 4.9,
    openSpots: 3,
    featured: false,
  },
  {
    id: "3",
    title: "Social Media App",
    description: "Develop a social media application with real-time messaging and content sharing",
    difficulty: "Intermediate",
    duration: "10-14 weeks",
    technologies: ["React", "Express", "MongoDB", "Socket.io"],
    teams: 4,
    rating: 4.6,
    openSpots: 8,
    featured: false,
  },
  {
    id: "4",
    title: "Task Management Tool",
    description: "Build a collaborative task management tool with team features and integrations",
    difficulty: "Beginner",
    duration: "4-6 weeks",
    technologies: ["React", "Node.js", "MySQL"],
    teams: 2,
    rating: 4.7,
    openSpots: 6,
    featured: false,
  },
]

const companyData = {
  "1": { name: "TechCorp Solutions", logo: "TC" },
  "2": { name: "InnovateLabs", logo: "IL" },
  "3": { name: "StartupHub", logo: "SH" },
}

export default function CompanyProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const studentId = params.student_id as string
  const companyId = params.company_id as string
  const company = companyData[companyId as keyof typeof companyData]

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = !selectedDifficulty || project.difficulty === selectedDifficulty
    return matchesSearch && matchesDifficulty
  })

  const handleJoinProject = (projectId: string) => {
    router.push(`/student/${studentId}/company/${companyId}/project/${projectId}/teams`)
  }

  const handleBackToCompany = () => {
    router.push(`/student/${studentId}/company/${companyId}`)
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={handleBackToCompany}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Company
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
              <span className="font-bold">{company?.logo}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{company?.name} Projects</h1>
              <p className="text-muted-foreground">Choose a project to join and start building</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["Beginner", "Intermediate", "Advanced"].map((difficulty) => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Project */}
        {filteredProjects.some((p) => p.featured) && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Featured Project
            </h2>
            {filteredProjects
              .filter((p) => p.featured)
              .map((project) => (
                <Card key={project.id} className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <CardDescription className="mt-2">{project.description}</CardDescription>
                      </div>
                      <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                        <Badge variant="outline">{project.difficulty}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Duration</p>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{project.duration}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Teams</p>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{project.teams}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="text-sm">{project.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Technologies:</p>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech) => (
                            <Badge key={tech} variant="outline">
                              <Code className="w-3 h-3 mr-1" />
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{project.openSpots} open spots available</span>
                      </div>
                    </div>

                    <Button className="mt-6" onClick={() => handleJoinProject(project.id)}>
                      Join Project
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* All Projects */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Projects ({filteredProjects.length})</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects
              .filter((p) => !p.featured)
              .map((project) => (
                <Card key={project.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription className="mt-2">{project.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm">{project.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{project.difficulty}</Badge>
                        <span className="text-muted-foreground">{project.duration}</span>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{project.teams} teams</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Technologies:</p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.technologies.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">{project.openSpots} open spots available</div>
                    </div>

                    <Button className="w-full mt-4" onClick={() => handleJoinProject(project.id)}>
                      Join Project
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
