"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  BarChart3,
  FolderKanban,
  Settings,
  GraduationCap,
  LogOut,
  Loader2,
  Megaphone,
  FileText,
} from "lucide-react"
import { signOut } from "@/lib/auth-helpers"
import { supabase } from "@/lib/supabase"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const companyId = params.company_id as string
  const [gateChecking, setGateChecking] = useState(true)

  useEffect(() => {
    if (!companyId) return
    let cancelled = false

    const runGuard = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession()
        const session = authData.session
        if (!session) {
          if (!cancelled) router.push(`/auth?redirect=${encodeURIComponent(`/company/${companyId}/dashboard`)}`)
          return
        }

        const role = session.user.user_metadata?.role
        if (role !== "company" || session.user.id !== companyId) {
          if (!cancelled) router.push("/auth")
          return
        }

        const { data: row } = await supabase
          .from("companies")
          .select("industry, mission, vision, employee_count, evaluation_metrics, policies, onboarding_advanced")
          .eq("company_id", companyId)
          .single()

        const hasOnboardingData = Boolean(
          row?.industry ||
            row?.mission ||
            row?.vision ||
            row?.employee_count ||
            (Array.isArray(row?.evaluation_metrics) && row.evaluation_metrics.length > 0) ||
            row?.policies ||
            ((row?.onboarding_advanced as any)?.roles?.length ?? 0) > 0
        )

        if (!hasOnboardingData) {
          if (!cancelled) router.push(`/company/${companyId}/onboarding`)
          return
        }
      } catch {
        if (!cancelled) router.push(`/company/${companyId}/onboarding`)
        return
      } finally {
        if (!cancelled) setGateChecking(false)
      }
    }

    void runGuard()
    return () => {
      cancelled = true
    }
  }, [companyId, router])

  const navItems = [
    { id: "analytics", label: "Analytics", icon: BarChart3, href: `/company/${companyId}/dashboard/analytics` },
    { id: "projects", label: "Projects", icon: FolderKanban, href: `/company/${companyId}/dashboard/projects` },
    { id: "postjobs", label: "Post Jobs", icon: Megaphone, href: `/company/${companyId}/dashboard/postjobs` },
    { id: "applications", label: "Applns", icon: FileText, href: `/company/${companyId}/dashboard/applications` },
    { id: "students", label: "Students", icon: GraduationCap, href: `/company/${companyId}/dashboard/students` },
    { id: "settings", label: "Settings", icon: Settings, href: `/company/${companyId}/dashboard/settings` },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (e) {
      console.error("Error signing out", e)
    } finally {
      router.push("/auth/login")
    }
  }

  if (gateChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking company onboarding...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex overflow-y-hidden">
      {/* Left Sidebar */}
      <aside className="w-18 border-r bg-card flex flex-col items-center py-6 gap-6 fixed h-screen">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mb-4">
          <span className="text-primary-foreground font-bold text-lg">C</span>
        </div>
        
        <nav className="flex flex-1 flex-col items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Check if current pathname starts with the href
            const isActive = pathname.includes(`/dashboard/${item.id}`)
            return (
              <Link
                key={item.id}
                href={item.href}
                title={item.label}
                className={`
                  flex h-15 w-15 flex-col items-center justify-center gap-1 rounded-lg 
                  transition-colors duration-200 ease-in-out p-3
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }
                `}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback>CO</AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-16 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </div>
  )
}
