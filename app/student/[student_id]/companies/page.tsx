"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building2, Users, Star, Search, ArrowRight, Code } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

const companies = [
  {
    id: "1",
    name: "TechCorp Solutions",
    logo: "TC",
    description: "Leading technology solutions provider specializing in web development and AI",
    rating: 4.8,
    difficulty: "Intermediate",
    students: 156,
    projects: 8,
    technologies: ["React", "Node.js", "TypeScript", "AWS"],
    featured: true,
  },
  {
    id: "2",
    name: "InnovateLabs",
    logo: "IL",
    description: "Cutting-edge research and development in machine learning and data science",
    rating: 4.9,
    difficulty: "Advanced",
    students: 89,
    projects: 5,
    technologies: ["Python", "TensorFlow", "Docker", "Kubernetes"],
    featured: false,
  },
  {
    id: "3",
    name: "StartupHub",
    logo: "SH",
    description: "Fast-paced startup environment building the next generation of mobile apps",
    rating: 4.6,
    difficulty: "Beginner",
    students: 203,
    projects: 12,
    technologies: ["React Native", "Firebase", "Swift", "Kotlin"],
    featured: false,
  },
  {
    id: "4",
    name: "CloudFirst Systems",
    logo: "CF",
    description: "Cloud infrastructure and DevOps solutions for enterprise clients",
    rating: 4.7,
    difficulty: "Advanced",
    students: 67,
    projects: 6,
    technologies: ["AWS", "Terraform", "Docker", "Go"],
    featured: false,
  },
]

export default function CompaniesListPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const studentId = params.student_id as string

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = !selectedDifficulty || company.difficulty === selectedDifficulty
    return matchesSearch && matchesDifficulty
  })

  const handleViewCompany = (companyId: string) => {
    router.push(`/student/${studentId}/company/${companyId}`)
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Explore Companies</h1>
            <p className="text-muted-foreground">Find the perfect company to join and start your learning journey</p>
          </div>
          <Button variant="outline" onClick={() => router.push(`/student/${studentId}/dashboard`)}>
            Back to Dashboard
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search companies..."
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

        {/* Featured Company */}
        {filteredCompanies.some((c) => c.featured) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Featured Company
            </h2>
            {filteredCompanies
              .filter((c) => c.featured)
              .map((company) => (
                <Card key={company.id} className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                          <span className="text-xl font-bold">{company.logo}</span>
                        </div>
                        <div>
                          <CardTitle className="text-xl">{company.name}</CardTitle>
                          <CardDescription className="mt-2">{company.description}</CardDescription>
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-primary text-primary" />
                              <span className="font-medium">{company.rating}</span>
                            </div>
                            <Badge variant="outline">{company.difficulty}</Badge>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{company.students} students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{company.projects} projects</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{company.technologies.length} technologies</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm font-medium mb-2">Technologies:</p>
                      <div className="flex flex-wrap gap-2">
                        {company.technologies.map((tech) => (
                          <Badge key={tech} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button onClick={() => handleViewCompany(company.id)}>
                      View Company
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* All Companies */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Companies ({filteredCompanies.length})</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCompanies
              .filter((c) => !c.featured)
              .map((company) => (
                <Card key={company.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                          <span className="font-bold">{company.logo}</span>
                        </div>
                        <div>
                          <CardTitle>{company.name}</CardTitle>
                          <CardDescription className="mt-1">{company.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm">{company.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{company.difficulty}</Badge>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{company.students}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span>{company.projects}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Technologies:</p>
                        <div className="flex flex-wrap gap-1">
                          {company.technologies.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {company.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{company.technologies.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-4" onClick={() => handleViewCompany(company.id)}>
                      View Company
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
