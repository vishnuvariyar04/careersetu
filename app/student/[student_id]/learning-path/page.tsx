"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Bot, BookOpen, Code, CheckCircle, Clock, ArrowRight } from "lucide-react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { storage, type Student, type Company } from "@/lib/storage"

const learningModules = [
  {
    id: 1,
    title: "React Fundamentals",
    description: "Learn the basics of React components, state, and props",
    duration: "2 weeks",
    status: "available",
    lessons: 12,
  },
  {
    id: 2,
    title: "TypeScript Essentials",
    description: "Master type safety and modern JavaScript features",
    duration: "1 week",
    status: "locked",
    lessons: 8,
  },
  {
    id: 3,
    title: "Node.js Backend Development",
    description: "Build scalable server-side applications",
    duration: "3 weeks",
    status: "locked",
    lessons: 15,
  },
  {
    id: 4,
    title: "Database Design",
    description: "Design and optimize relational databases",
    duration: "2 weeks",
    status: "locked",
    lessons: 10,
  },
]

export default function LearningPathPage() {
  const [currentModule, setCurrentModule] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [student, setStudent] = useState<Student | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const studentId = params.student_id as string
  const companyId = searchParams.get("company")

  useEffect(() => {
    storage.initializeData()

    const studentData = storage.getStudent(studentId)
    if (studentData) {
      setStudent(studentData)
    }

    if (companyId) {
      const companyData = storage.getCompany(companyId)
      if (companyData) {
        setCompany(companyData)
      }
    }

    // Simulate progress loading
    setProgress(25)
  }, [studentId, companyId])

  const handleStartModule = (moduleId: number) => {
    setCurrentModule(moduleId)
    // Simulate starting a module
    setTimeout(() => {
      router.push(`/student/${studentId}/learning/module/${moduleId}`)
    }, 500)
  }

  const handleSkipLearning = () => {
    router.push(`/student/${studentId}/dashboard`)
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading learning path...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Learning Path</h1>
              <p className="text-muted-foreground">Get ready for {company?.name || "your next project"}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSkipLearning}>
            Skip Learning Path
          </Button>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Your Learning Journey
            </CardTitle>
            <CardDescription>
              Complete these modules to unlock projects{company ? ` at ${company.name}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{progress}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
              {company && (
                <div className="flex flex-wrap gap-2">
                  {company.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Learning Modules */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Learning Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningModules.map((module, index) => {
              const isAvailable = module.status === "available" || index === 0
              const isCompleted = module.status === "completed"
              const isLocked = module.status === "locked" && index > 0

              return (
                <Card
                  key={module.id}
                  className={`transition-all ${
                    isAvailable ? "hover:border-primary/50 cursor-pointer" : "opacity-60"
                  } ${isCompleted ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => isAvailable && handleStartModule(module.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : isAvailable
                                ? "bg-secondary"
                                : "bg-muted"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : isLocked ? (
                            <span className="text-sm font-bold">{index + 1}</span>
                          ) : (
                            <Code className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={isAvailable ? "default" : "secondary"} className="text-xs">
                              {isCompleted ? "Completed" : isAvailable ? "Available" : "Locked"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-3">{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {module.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {module.lessons} lessons
                      </div>
                    </div>
                    {isAvailable && !isCompleted && (
                      <Button className="w-full mt-4" onClick={() => handleStartModule(module.id)}>
                        Start Module
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* AI Learning Assistant */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">AI Learning Assistant</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  I'm here to help you learn! I can provide personalized tutorials, answer questions, and track your
                  progress. Each module is tailored to your learning style and pace.
                </p>
                <Button size="sm">Chat with Learning Assistant</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
