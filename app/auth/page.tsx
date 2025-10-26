"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bot, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

function getDashboardUrl(userId: string, role?: string): string {
  const userRole = role || 'student'
  if (userRole === 'company') {
    return `/company/${userId}/dashboard`
  } else if (userRole === 'supervisor') {
    return '/supervisor/dashboard'
  } else {
    return `/student/${userId}/dashboard`
  }
}

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"checking" | "login" | "register">("checking")
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // User is already logged in, redirect to dashboard
        redirectToDashboard(session.user)
      } else {
        setMode("login")
      }
    }
    checkAuth()
  }, [router])

  const redirectToDashboard = (user: any) => {
    const redirect = searchParams.get('redirect')
    if (redirect) {
      router.push(redirect)
      return
    }

    const role = user.user_metadata?.role || 'student'
    if (role === 'company') {
      router.push(`/company/${user.id}/dashboard`)
    } else if (role === 'supervisor') {
      router.push('/supervisor/dashboard')
    } else {
      router.push(`/student/${user.id}/dashboard`)
    }
  }

  const checkUserExists = async (email: string): Promise<boolean> => {
    // Try to sign in with a dummy password to check if user exists
    // If user exists but password is wrong, we'll get an "Invalid login credentials" error
    // If user doesn't exist, we'll get the same error, so we need a different approach
    
    // For now, we'll just try to sign in and handle the error
    return false // This will be determined by the actual sign-in attempt
  }

  const handleEmailBlur = async () => {
    if (!email || !email.includes('@')) return
    
    // We'll determine if user exists by attempting sign-in
    // If it fails, we'll show registration form
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    console.log("Auth form submitted:", { mode, email })

    try {
      if (mode === "login") {
        // Try to sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        console.log("Login attempt result:", { 
          hasUser: !!data?.user, 
          hasSession: !!data?.session,
          error: signInError?.message 
        })

        if (signInError) {
          // Check if it's an invalid credentials error
          if (signInError.message.includes("Invalid login credentials")) {
            // User might not exist, offer to register
            setError("Account not found or incorrect password. Want to register?")
            setMode("register")
            setIsLoading(false)
            return
          }
          
          if (signInError.message.includes("Email not confirmed")) {
            setError("Please check your email and confirm your account before logging in.")
            setIsLoading(false)
            return
          }
          
          setError(signInError.message)
          setIsLoading(false)
          return
        }

        if (data.user && data.session) {
          console.log("Login successful, redirecting:", data.user.email)
          // Force a hard refresh to ensure cookies are set
          window.location.href = redirect || getDashboardUrl(data.user.id, data.user.user_metadata?.role)
        }
      } else if (mode === "register") {
        // Check if name is provided for registration
        if (!name.trim()) {
          setError("Please enter your name")
          setIsLoading(false)
          return
        }

        console.log("Attempting registration for:", email)

        // Try to register
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              role: 'student', // Default role
            },
          },
        })

        console.log("Registration result:", {
          hasUser: !!data?.user,
          hasSession: !!data?.session,
          error: signUpError?.message,
          userId: data?.user?.id,
        })

        if (signUpError) {
          // Check if user already exists
          if (signUpError.message.includes("already registered") || 
              signUpError.message.includes("already been registered")) {
            setError("Account already exists. Please login.")
            setMode("login")
            setIsLoading(false)
            return
          }
          
          setError(signUpError.message)
          setIsLoading(false)
          return
        }

        if (data.user) {
          console.log("Registration successful:", {
            email: data.user.email,
            id: data.user.id,
            hasSession: !!data.session,
          })

          // INSERT_YOUR_CODE
          // Insert the new student into the students table
          try {
            const { error: studentInsertError } = await supabase
              .from("students")
              .insert([
                {
                  name: data.user.user_metadata?.name || name,
                  email: data.user.email,
                  student_id: data.user.id,
                },
              ]);
            if (studentInsertError) {
              console.error("Error inserting new student:", studentInsertError);
            }
          } catch (err) {
            console.error("Unexpected error inserting student:", err);
          }
          
          // Check if email confirmation is required
          if (data.session) {
            // User is logged in immediately (email confirmation disabled)
            console.log("User has session, redirecting to dashboard")
            // Force a hard refresh to ensure cookies are set
            window.location.href = redirect || getDashboardUrl(data.user.id, data.user.user_metadata?.role)
          } else {
            // Email confirmation required
            console.log("Email confirmation required")
            setError("Registration successful! Please check your email to confirm your account, then login.")
            setMode("login")
            setIsLoading(false)
          }
        }
      }
    } catch (err) {
      console.error("Auth error:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login")
    setError("")
  }

  if (mode === "checking") {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
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
            <CardTitle className="text-2xl">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {mode === "login" 
                ? "Sign in to your DevFlow AI account" 
                : "Join DevFlow AI to start your journey"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
              
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={mode === "login" ? "Enter your password" : "Create a password (min 6 characters)"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading 
                  ? (mode === "login" ? "Signing in..." : "Creating account...") 
                  : (mode === "login" ? "Sign In" : "Create Account")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={toggleMode}
                  className="text-primary hover:underline font-medium"
                  type="button"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

