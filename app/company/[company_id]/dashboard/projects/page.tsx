"use client"

import { useParams } from "next/navigation"
import { CreateProjectPanel } from "@/components/company/create-project-panel"

export default function ProjectsPage() {
  const params = useParams()
  const companyId = params.company_id as string

  return companyId ? (
    <CreateProjectPanel companyId={companyId} />
  ) : (
    <div className="p-6 text-muted-foreground">Missing company id.</div>
  )
}
