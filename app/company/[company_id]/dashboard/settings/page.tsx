"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Pencil } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface CompanyRow {
  name?: string | null
  industry?: string | null
  mission?: string | null
  vision?: string | null
  employee_count?: number | null
  evaluation_metrics?: string[] | null
  onboarding_advanced?: { roles?: { name: string; skills?: string[] }[] } | null
}

export default function SettingsPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.company_id as string

  const [company, setCompany] = useState<CompanyRow | null>(null)
  const [companyLoading, setCompanyLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    let mounted = true
    setCompanyLoading(true)
    
    const run = async () => {
      try {
        const { data } = await supabase
          .from("companies")
          .select("name, industry, mission, vision, employee_count, evaluation_metrics, onboarding_advanced")
          .eq("company_id", companyId)
          .single()
        
        if (mounted) {
          setCompany(data as CompanyRow | null)
        }
      } catch {
        if (mounted) {
          setCompany(null)
        }
      } finally {
        if (mounted) {
          setCompanyLoading(false)
        }
      }
    }
    run()
    
    return () => {
      mounted = false
    }
  }, [companyId])

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex flex-col space-y-6">
      <div className="flex items-center justify-between rounded-2xl border bg-card p-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your company profile and onboarding details</p>
        </div>
        {companyId && (
          <Button
            onClick={() => router.push(`/company/${companyId}/onboarding`)}
            className="gap-2 rounded-full"
          >
            <Pencil className="w-4 h-4" />
            Edit onboarding details
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            {companyLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <>
                {(() => {
                  const checkpoints = [
                    Boolean(company?.name),
                    Boolean(company?.industry),
                    Boolean(company?.mission),
                    Boolean(company?.vision),
                    Boolean(company?.employee_count),
                    Boolean(company?.evaluation_metrics?.length),
                    Boolean((company?.onboarding_advanced as any)?.roles?.length),
                  ]
                  const completed = checkpoints.filter(Boolean).length
                  const pct = Math.round((completed / checkpoints.length) * 100)
                  return (
                    <div className="space-y-3">
                      <p className="text-3xl font-bold">{pct}%</p>
                      <Progress value={pct} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {completed}/{checkpoints.length} onboarding sections configured
                      </p>
                    </div>
                  )
                })()}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quick Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Company</p>
              <p className="text-sm font-medium mt-1">{company?.name || "—"}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Industry</p>
              <p className="text-sm font-medium mt-1">{company?.industry || "—"}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Employees</p>
              <p className="text-sm font-medium mt-1">{company?.employee_count ?? "—"}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Roles Configured</p>
              <p className="text-sm font-medium mt-1">{(company?.onboarding_advanced as any)?.roles?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">Onboarding Details</CardTitle>
          <CardDescription>Company information configured during onboarding</CardDescription>
        </CardHeader>
        <CardContent>
          {companyLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : company && (company.name || company.industry || company.mission) ? (
            <dl className="space-y-5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-muted-foreground">Company Name</dt>
                <dd className="font-medium sm:col-span-2">{company.name || "—"}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-muted-foreground">Industry</dt>
                <dd className="font-medium sm:col-span-2">{company.industry || "—"}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-muted-foreground">Employees</dt>
                <dd className="font-medium sm:col-span-2">{company.employee_count ?? "—"}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-muted-foreground">Mission</dt>
                <dd className="font-medium sm:col-span-2 leading-relaxed">{company.mission || "—"}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <dt className="text-muted-foreground">Vision</dt>
                <dd className="font-medium sm:col-span-2 leading-relaxed">{company.vision || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-1">Tech stack</dt>
                <dd className="text-muted-foreground text-sm">
                  Set per project in <span className="font-medium text-foreground">Projects</span> when you create or edit a virtual environment.
                </dd>
              </div>
              {company.evaluation_metrics && company.evaluation_metrics.length > 0 && (
                <div>
                  <dt className="text-muted-foreground mb-1">Evaluation Metrics</dt>
                  <dd className="flex flex-wrap gap-1">
                    {company.evaluation_metrics.map((m) => (
                      <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                    ))}
                  </dd>
                </div>
              )}
              {company.onboarding_advanced?.roles && company.onboarding_advanced.roles.length > 0 && (
                <div>
                  <dt className="text-muted-foreground mb-1">Roles</dt>
                  <dd className="flex flex-wrap gap-1">
                    {company.onboarding_advanced.roles.map((r) => (
                      <Badge key={r.name} variant="outline" className="text-xs">{r.name}</Badge>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-muted-foreground">No onboarding details yet. Complete onboarding to configure your company.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
