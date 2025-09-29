"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bot, Building2, Users, ArrowRight, CheckCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { storage, type Student, type Company } from "@/lib/storage"
import { supabase } from "@/lib/supabase"

export default function StudentOnboardingPage() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [currentSkills, setCurrentSkills] = useState<string[]>([])
  const [step, setStep] = useState(1)
  const [student, setStudent] = useState<Student | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const router = useRouter()
  const params = useParams()
  const studentId = params.student_id as string

  useEffect(() => {
    const fetchData = async () => {


      const { data: studentRow, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("student_id", studentId)
      .single()
    console.log("studentRow", studentRow)
    setStudent(studentRow)
     
        setStudent(studentRow)
        setCurrentSkills(studentRow.skills)
      

      // Fetch companies from Supabase
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
      
      if (companiesError) {
        console.error('Error fetching companies:', companiesError)
        // Fallback to local storage
        const localCompanies = storage.getAllCompanies()
        setCompanies(localCompanies)
      } else {
        setCompanies(companiesData || [])
      }
    }

    fetchData()
  }, [studentId])

  const handleSkillToggle = async (skill: string) => {
    const newSkills = currentSkills.includes(skill) 
      ? currentSkills.filter((s) => s !== skill) 
      : [...currentSkills, skill]
    
    setCurrentSkills(newSkills)
    
    // Update skills in Supabase immediately
    if (student) {
      const status = newSkills.length > 0 ? 'experienced' : 'newbie'
      
      const { error } = await supabase
        .from('students')
        .update({ 
          skills: newSkills,
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', studentId)
      
      if (error) {
        console.error('Error updating skills:', error)
      }
    }
  }

  const handleJoinCompany = async () => {
    if (!selectedCompany || !student) return

    const company = companies.find((c) => c.company_id === selectedCompany)
    if (!company) return

    // Update student in Supabase with company join
    const updatedProjects = [...(student.projects || []), selectedCompany]
    const status = currentSkills.length > 0 ? 'experienced' : 'newbie'
    
    const { error } = await supabase
      .from('students')
      .update({ 
        skills: currentSkills,
        companies_joined: updatedProjects,
        status: status
      })
      .eq('student_id', studentId)

    if (error) {
      console.error('Error updating student company:', error)
      return
    }

  
  

 
      router.push(`/student/${studentId}/dashboard`)
   
  }

  const allSkills = [
    "React",
    "Next.js",
    "Node.js",
    "Express",
    "TypeScript",
    "JavaScript",
    "Python",
    "PostgreSQL",
    "MongoDB",
    "MySQL",
    "AI/ML",
  ]

  if (!student) {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome to DevFlow AI, {student.name}</h1>
            <p className="text-muted-foreground">Let's get you set up with the perfect company</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Setup Progress</span>
            <span className="text-sm text-muted-foreground">{step}/2</span>
          </div>
          <Progress value={(step / 2) * 100} className="h-2" />
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">What are your current skills?</h2>
              <p className="text-muted-foreground mb-6">
                Select the technologies you're comfortable with. This helps us match you with the right projects.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {allSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant={currentSkills.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm"
                  onClick={() => handleSkillToggle(skill)}
                >
                  {currentSkills.includes(skill) && <CheckCircle className="w-3 h-3 mr-1" />}
                  {skill}
                </Badge>
              ))}
            </div>

            <Button onClick={async () => {
              // Update status in Supabase when moving to step 2
              if (student) {
                const status = currentSkills.length > 0 ? 'experienced' : 'newbie'
                
                const { error } = await supabase
                  .from('students')
                  .update({ 
                    skills: currentSkills,
                    status: status,
                    updated_at: new Date().toISOString()
                  })
                  .eq('student_id', studentId)
                
                if (error) {
                  console.error('Error updating student status:', error)
                }
              }
              setStep(2)
            }} className="mt-8">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Choose a company to join</h2>
              <p className="text-muted-foreground mb-6">
                Each company has different projects and skill requirements. Pick one that matches your interests.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => {
              

                return (
                  <Card
                    key={company.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      selectedCompany === company.company_id ? "border-green-900 bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedCompany(company.company_id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                            <span className="font-bold text-sm">{company.logo}</span>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{company.name}</CardTitle>
                           
                          </div>
                        </div>
                      </div>
                      <CardDescription className="mt-3">{company.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {company.totalProjects} projects
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {company.activeProjects} active
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Required Skills:</p>
                            {/* <div className="flex flex-wrap gap-1">
                              {company.requiredSkills.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant={currentSkills.includes(skill) ? "default" : "outline"}
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div> */}
                        </div>

                       
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="flex items-center justify-between pt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleJoinCompany} disabled={!selectedCompany}>
                Join Company
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
