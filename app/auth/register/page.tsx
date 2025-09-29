"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    storage.initializeData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

 
      if (formData.role === "student") {
        // Create new student ID
        const studentId = `student_${Date.now()}`
        document.cookie = `studentId=${studentId}; path=/;`

        // Create student record
        const newStudent = {
          id: studentId,
          name: formData.name,
          email: formData.email,
          avatar: formData.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          skills: [],
          overallScore: 0,
          totalProjects: 0,
          completedProjects: 0,
          activeProjects: 0,
          companiesJoined: [],
          skillsLearned: 0,
          rank: 0,
          joinedDate: new Date().toISOString(),
        }

        // Insert student data into Supabase "students" table
        const { data, error } = await supabase
          .from("students")
          .insert([
            {
              student_id: studentId,
              name: formData.name,
              email: formData.email,
              password_hash: formData.password, // In production, hash this!
              skills: [],
              roles: [],
              projects: [],
              // status, created_at use defaults
            }
          ]);

        if (error) {
          // Handle error (e.g., show error message)
          console.error("Error registering student:", error.message);
          setIsLoading(false);
          return;
        }

      

        // Redirect to chat-style onboarding survey UI (no persistence, UI only)
        router.push(`/student/${studentId}/onboarding/survey`)
      } else {
        // For supervisors, redirect to supervisor dashboard (will implement later)
        router.push("/supervisor/dashboard")
      }
  
  }

  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Join DevFlow AI and start building with AI</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">I am a...</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student Developer</SelectItem>
                    <SelectItem value="supervisor">Company Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !formData.role}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
