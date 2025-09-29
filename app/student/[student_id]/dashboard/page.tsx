"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Building2,
  Trophy,
  TrendingUp,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Plus,
  BarChart3,
  Target,
  BookOpen,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { storage, type Student, type Company, type StudentProgress } from "@/lib/storage"
import { supabase } from "@/lib/supabase"

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [student, setStudent] = useState<any>()
  const [joinedCompanies, setJoinedCompanies] = useState<any[]>([])
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([])
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([])
  const params = useParams()
  const router = useRouter()
  const studentId = params.student_id as string


  useEffect(() => {
   
  

      // Get all data from Supabase
      ;(async () => {
        // Get the student's record from Supabase
        const { data: studentRow, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("student_id", studentId)
          .single()
        console.log("studentRow", studentRow)
        setStudent(studentRow)
        if (studentError) {
          console.error("Error fetching student companies:", studentError)
          setJoinedCompanies([])
        } else {
          const joinedCompanyIds: string[] = studentRow?.companies_joined || []

          if (joinedCompanyIds.length > 0) {
            // Fetch company details for each joined company
            const { data: companiesData, error: companiesError } = await supabase
              .from("companies")
              .select("*")
              .in("company_id", joinedCompanyIds)

            if (companiesError) {
              console.error("Error fetching companies:", companiesError)
              setJoinedCompanies([])
            } else {
              setJoinedCompanies(companiesData || [])
            }
          } else {
            setJoinedCompanies([])
          }
        }

        // Get available companies from Supabase
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
        console.log("companiesData", companiesData)
        
        if (companiesError) {
          console.error('Error fetching companies:', companiesError)
          // Fallback to local storage
          setAvailableCompanies([])
        } else {
          // Filter out companies the student has already joined
          const joinedIds = Array.isArray(studentRow?.companies_joined) ? studentRow.companies_joined : []
          const available = companiesData?.filter((c) => !joinedIds.includes(c.company_id || c.id)) || []
          console.log("available", available)
          setAvailableCompanies(available)
        }

        // Get student progress
        const progress = storage.getStudentProjectProgress(studentId)
        setStudentProgress(progress)
      })()
   
  }, [studentId])

  const handleJoinCompany = (companyId: string) => {
    (async () => {
      // Get the current student's row
      const { data: studentRow, error: studentError } = await supabase
        .from("students")
        .select("companies_joined")
        .eq("student_id", studentId)
        .single();

      if (studentError) {
        console.error("Error fetching student row:", studentError);
        return;
      }

      // Ensure companies_joined is an array
      const currentCompanies = Array.isArray(studentRow?.companies_joined)
        ? studentRow.companies_joined
        : [];

        console.log("company id", companyId)

      // Only add if not already joined
      if (!currentCompanies.includes(companyId)) {
        const updatedCompanies = [...currentCompanies, companyId];

        const { error: updateError } = await supabase
          .from("students")
          .update({ companies_joined: updatedCompanies })
          .eq("student_id", studentId);

        if (updateError) {
          console.error("Error updating companies_joined:", updateError);
        }
      }
    })();
    router.push(`/student/${studentId}/company/${companyId}/details`)
  }

  const handleViewCompany = (companyId: string) => {
    router.push(`/student/${studentId}/company/${companyId}/details`)
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const activeProjects = studentProgress.filter((p) => p.status === "active").length
  const completedProjects = studentProgress.filter((p) => p.status === "completed").length

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg font-bold">{student.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {student.name}!</h1>
              <p className="text-muted-foreground">Track your progress and discover new opportunities</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{student.overallScore}</span>
              <span className="text-muted-foreground">/5.0</span>
            </div>
            <p className="text-sm text-muted-foreground">Rank #{student.rank} of 247</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Projects Completed</p>
                  <p className="text-3xl font-bold">{completedProjects}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                  <p className="text-3xl font-bold">{activeProjects}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Companies Joined</p>
                  <p className="text-3xl font-bold">{student.companies_joined.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Skills Learned</p>
                  <p className="text-3xl font-bold">{student.skills?.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "companies", label: "My Companies", icon: Building2 },
            { id: "explore", label: "Explore Companies", icon: Target },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "secondary" : "ghost"}
              className="flex items-center gap-2"
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Performance Chart */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance Overview
                  </CardTitle>
                  <CardDescription>Your progress across all companies and projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {joinedCompanies.map((company) => (
                      <div key={company.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold">{company.logo}</span>
                            </div>
                            <div>
                              <p className="font-medium">{company.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {
                                  studentProgress.filter((p) => p.companyId === company.id && p.status === "completed")
                                    .length
                                }{" "}
                                completed,{" "}
                                {
                                  studentProgress.filter((p) => p.companyId === company.id && p.status === "active")
                                    .length
                                }{" "}
                                active
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <span className="font-medium">{company.rating}</span>
                          </div>
                        </div>
                        <Progress value={(company.rating / 5) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills Overview */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Skills</CardTitle>
                  <CardDescription>Technologies you've mastered</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill:any) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "companies" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {joinedCompanies.map((company) => (
              <Card key={company.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                        <span className="font-bold">{company.logo}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{company.difficulty} level</p>
                      </div>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-semibold">
                          {studentProgress.filter((p) => p.companyId === company.id && p.status === "completed").length}{" "}
                          projects
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Active</p>
                        <p className="font-semibold">
                          {studentProgress.filter((p) => p.companyId === company.id && p.status === "active").length}{" "}
                          projects
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="font-medium">{company.rating}</span>
                        <span className="text-sm text-muted-foreground">rating</span>
                      </div>
                      <Button size="sm" onClick={() => handleViewCompany(company.company_id)}>
                        View Projects
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "explore" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Discover New Companies</h2>
                <p className="text-muted-foreground">Expand your skills by joining new companies and projects</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {availableCompanies.map((company) => (
                <Card key={company.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                          <span className="font-bold">{company.logo}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {company.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm">{company.rating}</span>
                      </div>
                    </div>
                    <CardDescription className="mt-3">{company.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        {company.totalProjects} active projects
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Key Technologies:</p>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(company.requiredSkills) && company.requiredSkills.length > 0 ? (
                            <>
                              {company.requiredSkills.slice(0, 3).map((tech:any) => (
                                <Badge key={tech} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {company.requiredSkills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{company.requiredSkills.length - 3} more
                                </Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">No skills listed</span>
                          )}
                        </div>
                      </div>

                      <Button className="w-full" onClick={() => handleJoinCompany(company.company_id)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Join Company
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
