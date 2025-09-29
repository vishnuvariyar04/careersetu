"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookOpen, Play, CheckCircle, Clock, ArrowRight } from "lucide-react"

interface LearningModalProps {
  isOpen: boolean
  onClose: () => void
  topic: string
  taskContext?: string
}

const learningContent = {
  "React Components": {
    title: "React Components Mastery",
    description: "Learn to build reusable, efficient React components",
    duration: "45 minutes",
    difficulty: "Intermediate",
    modules: [
      { title: "Functional vs Class Components", duration: "10 min", completed: false },
      { title: "Props and State Management", duration: "15 min", completed: false },
      { title: "Component Lifecycle", duration: "12 min", completed: false },
      { title: "Hands-on Practice", duration: "8 min", completed: false },
    ],
  },
  "Database Design": {
    title: "Database Design Fundamentals",
    description: "Master relational database design principles",
    duration: "60 minutes",
    difficulty: "Intermediate",
    modules: [
      { title: "Entity-Relationship Modeling", duration: "15 min", completed: false },
      { title: "Normalization Principles", duration: "20 min", completed: false },
      { title: "Schema Design Best Practices", duration: "15 min", completed: false },
      { title: "Practice with E-commerce Schema", duration: "10 min", completed: false },
    ],
  },
  "API Development": {
    title: "RESTful API Development",
    description: "Build robust and scalable APIs",
    duration: "75 minutes",
    difficulty: "Advanced",
    modules: [
      { title: "REST Principles and Design", duration: "20 min", completed: false },
      { title: "Authentication with JWT", duration: "25 min", completed: false },
      { title: "Error Handling Patterns", duration: "15 min", completed: false },
      { title: "API Testing and Documentation", duration: "15 min", completed: false },
    ],
  },
}

export function LearningModal({ isOpen, onClose, topic, taskContext }: LearningModalProps) {
  const [currentModule, setCurrentModule] = useState(0)
  const [modules, setModules] = useState(learningContent[topic as keyof typeof learningContent]?.modules || [])

  const content = learningContent[topic as keyof typeof learningContent]
  if (!content) return null

  const completedModules = modules.filter((m) => m.completed).length
  const progress = (completedModules / modules.length) * 100

  const handleStartModule = (index: number) => {
    setCurrentModule(index)
    // Simulate module completion after a delay
    setTimeout(() => {
      setModules((prev) => prev.map((module, i) => (i === index ? { ...module, completed: true } : module)))
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {content.title}
          </DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Duration</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{content.duration}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
              <Badge variant="outline" className="mt-1">
                {content.difficulty}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Progress</p>
              <p className="text-sm font-bold mt-1">{Math.round(progress)}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Learning Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedModules}/{modules.length} modules
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Task Context */}
          {taskContext && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4">
                <p className="text-sm">
                  <strong>Related to your current task:</strong> {taskContext}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Modules */}
          <div className="space-y-3">
            <h3 className="font-semibold">Learning Modules</h3>
            {modules.map((module, index) => (
              <Card
                key={index}
                className={`transition-all ${
                  module.completed ? "border-primary bg-primary/5" : "hover:border-primary/50 cursor-pointer"
                }`}
                onClick={() => !module.completed && handleStartModule(index)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          module.completed ? "bg-primary text-primary-foreground" : "bg-secondary"
                        }`}
                      >
                        {module.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{module.title}</h4>
                        <p className="text-sm text-muted-foreground">{module.duration}</p>
                      </div>
                    </div>
                    {!module.completed && (
                      <Button size="sm" variant="outline">
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {progress === 100 ? (
              <Button>
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed!
              </Button>
            ) : (
              <Button onClick={() => handleStartModule(currentModule)}>
                Continue Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
