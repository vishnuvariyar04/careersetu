"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Github } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

// --- 0. Font Loading Helper ---
const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    
    body {
      font-family: 'Space Grotesk', sans-serif;
    }
  `}</style>
)

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
  const [role, setRole] = useState<"student" | "company">("student")
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

    // GitHub provider = always student, regardless of metadata
    const provider = user.app_metadata?.provider
    if (provider === 'github') {
      router.push(`/student/${user.id}/dashboard`)
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

  const handleEmailBlur = async () => {
    if (!email || !email.includes('@')) return
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    console.log("Auth form submitted:", { mode, email })

    try {
      if (mode === "login") {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          if (signInError.message.includes("Invalid login credentials")) {
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
          window.location.href = redirect || getDashboardUrl(data.user.id, data.user.user_metadata?.role)
        }
      } else if (mode === "register") {
        if (!name.trim()) {
          setError(role === "company" ? "Please enter your company name" : "Please enter your name")
          setIsLoading(false)
          return
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              role: role,
              ...(role === "company" ? { company_name: name } : {}),
            },
          },
        })

        if (signUpError) {
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
          if (data.session) {
            window.location.href = redirect || getDashboardUrl(data.user.id, data.user.user_metadata?.role)
          } else {
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

  const handleStudentGithubSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      const next = encodeURIComponent("/auth")
      const redirectTo = `${window.location.origin}/auth/callback?next=${next}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo,
          scopes: "repo read:user user:email",
        },
      })
      if (error) throw error
    } catch (err) {
      console.error("GitHub OAuth error:", err)
      setError("GitHub sign-in failed. Please try again.")
      setIsLoading(false)
    }
  }

  // --- LOADING STATE ---
  if (mode === "checking") {
    return (
      <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center p-4 font-['Space_Grotesk']">
        <GlobalStyles />
        <div className="text-center">
          <div className=" flex items-center justify-center mx-auto mb-4 animate-pulse">
            <img src="/images/careersetu-fav.png" className="w-24" alt="careersetu" />
          </div>
          <p className="text-zinc-500 font-mono text-sm">Initializing Secure Session...</p>
        </div>
      </div>
    )
  }

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center p-4 relative overflow-hidden font-['Space_Grotesk']">
      <GlobalStyles />
      
      {/* 1. Background Effects (Matches Landing Page) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0a0f16]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl">
          
          {/* Header */}
          <div className="text-center flex flex-col items-center justify-center mb-8">
            <img src="/images/careersetu-fav.png" className="w-36 mb-6" alt="" />
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-zinc-400 text-sm">
              {mode === "login" 
                ? "Enter your credentials to access your workspace" 
                : "Join DevFlow AI to start your engineering journey"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-2">
                 <span className="shrink-0 mt-0.5">⚠️</span>
                 <span>{error}</span>
              </div>
            )}
            
            {mode === "register" && (
              <>
                {/* Role toggle */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-full border ${
                      role === "student"
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-[#050910] text-zinc-400 border-white/10 hover:text-white"
                    }`}
                  >
                    I am a student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("company")}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-full border ${
                      role === "company"
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-[#050910] text-zinc-400 border-white/10 hover:text-white"
                    }`}
                  >
                    I represent a company
                  </button>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-zinc-300 text-xs uppercase tracking-wider font-bold ml-1"
                  >
                    {role === "company" ? "Company Name" : "Full Name"}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={role === "company" ? "e.g. Acme Corp" : "e.g. Alex Chen"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-[#050910] border-white/10 text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 rounded-xl font-['Space_Grotesk']"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 text-xs uppercase tracking-wider font-bold ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                required
                className="bg-[#050910] border-white/10 text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 rounded-xl font-['Space_Grotesk']"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <Label htmlFor="password" className="text-zinc-300 text-xs uppercase tracking-wider font-bold ml-1">Password</Label>
                 {mode === "login" && (
                    <Link href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot?</Link>
                 )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder={mode === "login" ? "••••••••" : "Min 6 characters"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-[#050910] border-white/10 text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 rounded-xl font-['Space_Grotesk']"
              />
            </div>

            <Button 
                type="submit" 
                className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-base shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] mt-2 font-['Space_Grotesk']" 
                disabled={isLoading}
            >
              {isLoading ? (
                  <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {mode === "login" ? "Signing in..." : "Creating account..."}
                  </span>
              ) : (
                  mode === "login" ? "Sign In" : "Create Account"
              )}
            </Button>

            {role === "student" && (
              <>
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-zinc-500">
                    <span className="bg-[#0a0f16]/80 px-2">or</span>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleStudentGithubSignIn}
                  disabled={isLoading}
                  className="w-full h-11 rounded-full bg-[#111827] hover:bg-[#1f2937] text-white border border-white/10"
                >
                  <Github className="w-4 h-4 mr-2" />
                  Continue with GitHub (Student)
                </Button>
              </>
            )}
          </form>

          {/* Footer Toggle */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-zinc-500">
              {mode === "login" ? "New to the platform? " : "Already have an account? "}
              <button
                onClick={toggleMode}
                className="text-blue-400 hover:text-blue-300 font-bold transition-colors ml-1"
                type="button"
              >
                {mode === "login" ? "Join now" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
        
        {/* Simple footer links */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-zinc-600">
            <Link href="#" className="hover:text-zinc-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-zinc-400 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-zinc-400 transition-colors">Contact</Link>
        </div>

      </div>
    </div>
  )
}