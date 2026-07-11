"use client"

import { SidebarProvider } from "@/components/student/sidebar-context"
import { StudentSidebar } from "@/components/student/student-sidebar"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="h-screen w-screen overflow-hidden bg-[#181a1a] flex">
        <StudentSidebar />
        <main className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
