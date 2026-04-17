"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import staticStudentProfile from "@/data/static_student_profile.json"

export interface SidebarTask {
  task_id: string
  title: string
  status: string
}

export interface SidebarWorkspace {
  company: { name: string } | null
  environment: { id: string; name: string; status: string } | null
  tasks: SidebarTask[]
  activeTaskId: string | null
  mode: "project" | "task_details" | "learn"
  onModeChange: (mode: "project" | "task_details" | "learn") => void
  onTaskSelect: (taskId: string) => void
  onBackToEnvironments: () => void
}

interface SidebarContextType {
  student: Record<string, any> | null
  setStudent: (s: Record<string, any> | null) => void
  workspace: SidebarWorkspace | null
  setWorkspace: (w: SidebarWorkspace | null) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  student: null,
  setStudent: () => {},
  workspace: null,
  setWorkspace: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
})

export function useSidebarContext() {
  return useContext(SidebarContext)
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Record<string, any> | null>(null)
  const [workspace, setWorkspace] = useState<SidebarWorkspace | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const params = useParams()
  const studentId = params.student_id as string | undefined

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("careersetu.sidebarCollapsed")
      if (raw === "1") setSidebarCollapsed(true)
      if (raw === "0") setSidebarCollapsed(false)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem("careersetu.sidebarCollapsed", sidebarCollapsed ? "1" : "0")
    } catch {
      // ignore
    }
  }, [sidebarCollapsed])

  useEffect(() => {
    if (!studentId) return
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from("students")
        .select("full_name, email, github_url")
        .eq("student_id", studentId)
        .single()
      if (cancelled) return
      if (!error && data) {
        setStudent((prev) => ({ ...prev, ...data }))
      } else {
        setStudent({ ...(staticStudentProfile as any), student_id: studentId })
      }
    })()
    return () => { cancelled = true }
  }, [studentId])

  return (
    <SidebarContext.Provider
      value={{
        student,
        setStudent,
        workspace,
        setWorkspace,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}
