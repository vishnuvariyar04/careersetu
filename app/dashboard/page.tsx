"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // For demo purposes, redirect to supervisor dashboard
    // In a real app, this would check user role and redirect accordingly
    router.push("/supervisor/dashboard")
  }, [router])

  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Dashboard...</h1>
        <p className="text-muted-foreground">Please wait while we load your personalized dashboard.</p>
      </div>
    </div>
  )
}
