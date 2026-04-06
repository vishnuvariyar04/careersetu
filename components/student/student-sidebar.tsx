"use client"

import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Building2,
  LayoutGrid,
  User,
  LogOut,
  BookOpen,
  FolderKanban,
  ChevronLeft,
  Lock,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useSidebarContext } from "./sidebar-context"

export function StudentSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const studentId = params.student_id as string

  const { student, workspace } = useSidebarContext()

  const isDashboard = pathname.endsWith("/dashboard")
  const isLearnRoute = pathname.endsWith("/learn")
  const isEnvironmentDetailsRoute = pathname.includes("/company/") && pathname.endsWith("/details")
  const dashboardTab = searchParams.get("tab") || "companies"

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  return (
    <div className="w-64 shrink-0 border-r border-white/10 bg-[#171a1a] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-white/10">
        {workspace?.environment ? (
          <div>
            <button
              onClick={workspace.onBackToEnvironments}
              className="flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-white/40 hover:text-white/70 transition mb-2"
            >
              <ChevronLeft className="w-3 h-3" />
              {workspace.company?.name || "Back"}
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-[11px]">
                {workspace.environment.name?.charAt(0) || "E"}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-white truncate">
                  {workspace.environment.name}
                </p>
                <p className="text-[10px] text-white/40 capitalize">
                  {workspace.environment.status || "active"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-[11px]">
              {student?.full_name?.charAt(0) || "S"}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-white truncate">
                {student?.full_name || "Student"}
              </p>
              <p className="text-[10px] text-white/40 truncate">
                {student?.email || ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Global nav */}
        <div className="p-2">
          <p className="px-3 pt-2 pb-1 text-[9px] uppercase tracking-[0.2em] text-white/30 font-medium">
            Navigation
          </p>
          <NavButton
            icon={Building2}
            label="All Environments"
            active={isDashboard && dashboardTab === "companies"}
            onClick={() => router.push(`/student/${studentId}/dashboard`)}
          />
          <NavButton
            icon={LayoutGrid}
            label="Directory"
            active={isDashboard && dashboardTab === "explore"}
            onClick={() => router.push(`/student/${studentId}/dashboard?tab=explore`)}
          />
          <NavButton
            icon={User}
            label="Profile"
            active={isDashboard && dashboardTab === "profile"}
            onClick={() => router.push(`/student/${studentId}/dashboard?tab=profile`)}
          />
          <NavButton
            icon={BookOpen}
            label="Learn"
            active={isLearnRoute}
            onClick={() => router.push(`/student/${studentId}/learn`)}
          />
        </div>

        {/* Workspace section — visible when inside an environment */}
        {workspace?.environment && (
          <>
            <div className="mx-3 h-px bg-white/5" />
            <div className="p-2">
              <p className="px-3 pt-2 pb-1 text-[9px] uppercase tracking-[0.2em] text-white/30 font-medium">
                Workspace
              </p>
              <NavButton
                icon={FolderKanban}
                label="Board & Chat"
                active={workspace.mode === "project"}
                onClick={() => workspace.onModeChange("project")}
              />
              <NavButton
                icon={BookOpen}
                label="Task Details"
                active={workspace.mode === "task_details"}
                onClick={() => workspace.onModeChange("task_details")}
              />
              <NavButton
                icon={BookOpen}
                label="Environment Learn"
                active={workspace.mode === "learn"}
                onClick={() => workspace.onModeChange("learn")}
              />
            </div>

            {/* Task list */}
            {workspace.mode === "task_details" && workspace.tasks.length > 0 && (
              <>
                <div className="mx-3 h-px bg-white/5" />
                <div className="p-2">
                  <p className="px-3 pt-2 pb-1 text-[9px] uppercase tracking-[0.2em] text-white/30 font-medium">
                    Tasks ({workspace.tasks.length})
                  </p>
                  <div className="space-y-0.5">
                    {workspace.tasks.map((task, idx) => {
                      const isActive = workspace.activeTaskId === task.task_id
                      const isLocked = task.status === "locked"
                      return (
                        <button
                          key={task.task_id}
                          disabled={isLocked}
                          onClick={() => {
                            if (!isLocked) workspace.onTaskSelect(task.task_id)
                          }}
                          className={`w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-left transition text-[11px] ${
                            isLocked
                              ? "text-white/25 cursor-not-allowed"
                              : isActive
                                ? "bg-white/10 text-white"
                                : "text-white/55 hover:text-white/80 hover:bg-white/5"
                          }`}
                        >
                          <TaskStatusIcon status={task.status} index={idx} />
                          <span className="truncate">{task.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}

      </div>

      {/* Footer */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="w-full h-9 px-3 rounded-lg flex items-center gap-2.5 text-[12px] text-white/50 hover:text-white hover:bg-white/10 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  )
}

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-9 px-3 rounded-lg flex items-center gap-2.5 text-[12px] transition ${
        active
          ? "bg-white/10 text-white font-medium"
          : "text-white/60 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}

function TaskStatusIcon({ status, index }: { status: string; index: number }) {
  return (
    <span className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold border border-white/10 bg-white/5">
      {status === "locked" ? (
        <Lock className="w-2.5 h-2.5 text-white/20" />
      ) : status === "approved" ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
      ) : status === "submitted" ? (
        <Clock className="w-3 h-3 text-amber-400" />
      ) : status === "in_progress" ? (
        <div className="w-2 h-2 rounded-full bg-blue-400" />
      ) : (
        <span className="text-white/40">{index + 1}</span>
      )}
    </span>
  )
}
