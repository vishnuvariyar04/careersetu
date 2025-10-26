"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Building2, Star, ArrowRight, Plus, Target, Search, User, LogOut } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { storage, type Student, type Company, type StudentProgress } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import { signOut } from "@/lib/auth-helpers"
import { useStudentAuth } from "@/hooks/use-student-auth"

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState("companies")
  const [student, setStudent] = useState<any>()
  const [joinedCompanies, setJoinedCompanies] = useState<any[]>([])
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([])
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([])
  const [exploreQuery, setExploreQuery] = useState("")
  const [exploreDifficulty, setExploreDifficulty] = useState<string | null>(null)
  const [exploreSort, setExploreSort] = useState("relevance")
  const params = useParams()
  const router = useRouter()
  const studentId = params.student_id as string

  // Security check: Verify the logged-in user matches the student_id in URL
  const isAuthorized = useStudentAuth(studentId)

  useEffect(() => {
    // Only fetch data if user is authorized
    if (isAuthorized !== true) {
      return
    }
   
  

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
   
  }, [studentId, isAuthorized])

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

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Show loading while checking authorization or loading student data
  if (isAuthorized === null || !student) {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If not authorized, don't render anything (redirect is in progress)
  if (isAuthorized === false) {
    return null
  }

  // Focus the UI on companies; omit secondary stats

  // --- Derived helpers for Explore & Recommendations ---
  const studentSkills: string[] = Array.isArray(student?.skills) ? student.skills : []
  const getOverlap = (company: any) => {
    const req = Array.isArray(company?.requiredSkills) ? company.requiredSkills : []
    return req.filter((s: any) => studentSkills.includes(s)).length
  }

  const recommendedCompanies = [...availableCompanies]
    .sort((a, b) => {
      const ob = getOverlap(b)
      const oa = getOverlap(a)
      if (ob !== oa) return ob - oa
      const rb = Number(b?.rating ?? 0)
      const ra = Number(a?.rating ?? 0)
      return rb - ra
    })
    .slice(0, 3)

  const filteredCompanies = availableCompanies.filter((company) => {
    const q = exploreQuery.trim().toLowerCase()
    const matchesQuery = q
      ? String(company?.name || "").toLowerCase().includes(q) ||
        String(company?.description || "").toLowerCase().includes(q)
      : true
    const matchesDifficulty = exploreDifficulty ? company?.difficulty === exploreDifficulty : true
    return matchesQuery && matchesDifficulty
  })

  // Avoid duplicates between recommended and main list
  const recommendedIdSet = new Set(
    recommendedCompanies.map((c: any) => String(c?.company_id ?? c?.id))
  )

  const visibleCompanies = [...filteredCompanies]
    .filter((c) => !recommendedIdSet.has(String(c?.company_id ?? c?.id)))
    .sort((a, b) => {
    if (exploreSort === "relevance") {
      const diff = getOverlap(b) - getOverlap(a)
      if (diff !== 0) return diff
      return Number(b?.rating ?? 0) - Number(a?.rating ?? 0)
    }
    if (exploreSort === "rating") {
      return Number(b?.rating ?? 0) - Number(a?.rating ?? 0)
    }
    if (exploreSort === "projects") {
      return Number(b?.totalProjects ?? 0) - Number(a?.totalProjects ?? 0)
    }
    return String(a?.name || "").localeCompare(String(b?.name || ""))
  })

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarContent className="overflow-y-auto overflow-x-hidden">
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeTab === "companies"}
                    onClick={() => setActiveTab("companies")}
                    className="justify-start"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>My Companies</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{joinedCompanies.length}</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeTab === "explore"}
                    onClick={() => setActiveTab("explore")}
                    className="justify-start"
                  >
                    <Target className="w-4 h-4" />
                    <span>Explore</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{availableCompanies.length}</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activeTab === "profile"}
                    onClick={() => setActiveTab("profile")}
                    className="justify-start"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarSeparator />
          </SidebarContent>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <div className="border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs font-bold">{student.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex items-baseline gap-2">
                  <h1 className="text-xl font-semibold">{student.name}</h1>
                  <span className="text-muted-foreground text-sm">Student Dashboard</span>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 ml-auto">
                {studentSkills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {studentSkills.length > 4 && (
                  <Badge variant="outline" className="text-xs">+{studentSkills.length - 4}</Badge>
                )}
                {/* Removed header Explore and Update Skills actions as requested */}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="ml-2"
              >
                <LogOut className="w-4 h-4 mr-2 hover:text-gray-500" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            {activeTab === "companies" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">My Companies</h2>
                    <p className="text-muted-foreground">Companies you have joined</p>
                  </div>
                </div>

                {joinedCompanies.length === 0 ? (
                  <Card className="bg-muted/30">
                    <CardContent className="py-10">
                      <div className="flex flex-col items-center text-center gap-2">
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">You haven't joined any companies yet.</p>
                        <Button onClick={() => setActiveTab("explore")}>Explore Companies</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {joinedCompanies.map((company) => (
                      <Card
                        key={company.company_id || company.id}
                        className="hover:shadow-lg hover:border-primary/40 transition-all duration-200 bg-gradient-to-b from-muted/30 to-background"
                      >
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "explore" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Explore Companies</h2>
                    <p className="text-muted-foreground">Discover and join new opportunities</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-end">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search companies..."
                      value={exploreQuery}
                      onChange={(e) => setExploreQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    {["Beginner", "Intermediate", "Advanced"].map((d) => (
                      <Button
                        key={d}
                        size="sm"
                        variant={exploreDifficulty === d ? "default" : "outline"}
                        onClick={() => setExploreDifficulty(exploreDifficulty === d ? null : d)}
                      >
                        {d}
                      </Button>
                    ))}
                  </div>
                  <div className="w-full lg:w-56">
                    <Select value={exploreSort} onValueChange={setExploreSort}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Sort: Relevance</SelectItem>
                        <SelectItem value="rating">Sort: Rating</SelectItem>
                        <SelectItem value="projects">Sort: Projects</SelectItem>
                        <SelectItem value="name">Sort: Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Recommended */}
                {recommendedCompanies.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Recommended for you</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {recommendedCompanies.map((company) => (
                        <Card
                          key={company.company_id || company.id}
                          className="hover:shadow-lg hover:border-primary/40 transition-all duration-200 bg-gradient-to-b from-muted/30 to-background"
                        >
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
                            {company.description && (
                              <CardDescription className="mt-3">{company.description}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {typeof company.totalProjects !== "undefined" && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Building2 className="w-4 h-4" />
                                  {company.totalProjects} active projects
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium mb-2">Key Technologies</p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {visibleCompanies.map((company) => (
                    <Card
                      key={company.company_id || company.id}
                      className="hover:shadow-lg hover:border-primary/40 transition-all duration-200 bg-gradient-to-b from-muted/30 to-background"
                    >
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
                        {company.description && (
                          <CardDescription className="mt-3">{company.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {typeof company.totalProjects !== "undefined" && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Building2 className="w-4 h-4" />
                              {company.totalProjects} active projects
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-medium mb-2">Key Technologies</p>
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
                {visibleCompanies.length === 0 && (
                  <Card className="bg-muted/30">
                    <CardContent className="py-10">
                      <div className="text-center text-muted-foreground">No companies match your filters.</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="text-base font-bold">{student.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
                    <p className="text-muted-foreground">Manage your personal details</p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>About You</CardTitle>
                    <CardDescription>Basic information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Name</p>
                        <div className="rounded-md border bg-background px-3 py-2 text-sm">{student.name}</div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <div className="rounded-md border bg-background px-3 py-2 text-sm">{student.email || "—"}</div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {(studentSkills.length ? studentSkills : ["No skills added"]).map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Companies Joined</CardTitle>
                    <CardDescription>Your current organizations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {joinedCompanies.length === 0 ? (
                      <div className="text-sm text-muted-foreground">You haven't joined any companies yet.</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {joinedCompanies.map((c) => (
                          <Badge key={c.company_id || c.id} variant="secondary" className="text-xs">{c.name}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
