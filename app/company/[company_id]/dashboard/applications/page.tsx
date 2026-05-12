"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Loader2, Search, Mail, Eye, ChevronLeft, ChevronRight,
  Trophy, Users, ArrowUpDown, Briefcase, Code2, GraduationCap,
  Github, FileText as FileTextIcon, Star,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

const PAGE_SIZE = 10

const STATUS_STYLES: Record<string, string> = {
  matched: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  applied: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  shortlisted: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  interviewed: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  offered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
}

function getInitials(name: string): string {
  if (!name) return "??"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function ApplicationsPage() {
  const params = useParams()
  const companyId = params.company_id as string

  const [applications, setApplications] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterJob, setFilterJob] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<"match_score" | "created_at">("match_score")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  // Pagination
  const [page, setPage] = useState(0)

  // Detail sheet
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [detailData, setDetailData] = useState<any | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      // Fetch company jobs
      const { data: jobRows } = await supabase
        .from("job_openings").select("id, title").eq("company_id", companyId)
      setJobs(jobRows || [])

      const jobIds = (jobRows || []).map((j: any) => j.id)
      if (jobIds.length === 0) { setApplications([]); setLoading(false); return }

      // Fetch applications with student join
      const { data: appRows } = await supabase
        .from("job_applications")
        .select("*, students(full_name, email, about, github_url)")
        .in("job_id", jobIds)
        .order("match_score", { ascending: false })

      // Attach job title
      const jobMap = Object.fromEntries((jobRows || []).map((j: any) => [j.id, j.title]))
      setApplications(
        (appRows || []).map((a: any) => ({
          ...a,
          job_title: jobMap[a.job_id] || "Unknown",
          student_name: a.students?.full_name || "Unknown",
          student_email: a.students?.email || "",
        }))
      )
    } catch (err) {
      console.error("Failed to fetch applications:", err)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  const updateStatus = async (appId: string, newStatus: string) => {
    setUpdatingStatus(appId)
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", appId)

      if (error) throw error
      
      // Update local state
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a))
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus })
      }
    } catch (err) {
      console.error("Failed to update status:", err)
    } finally {
      setUpdatingStatus(null)
    }
  }

  useEffect(() => { fetchData() }, [fetchData])

  // Filtered + sorted
  const filtered = useMemo(() => {
    let result = [...applications]
    if (filterJob !== "all") result = result.filter((a) => a.job_id === filterJob)
    if (filterStatus !== "all") result = result.filter((a) => a.status === filterStatus)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((a) => a.student_name.toLowerCase().includes(q) || a.student_email.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      const aVal = a[sortField] ?? 0
      const bVal = b[sortField] ?? 0
      return sortDir === "desc" ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1)
    })
    return result
  }, [applications, filterJob, filterStatus, searchQuery, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  useEffect(() => { setPage(0) }, [filterJob, filterStatus, searchQuery])

  const toggleSort = (field: "match_score" | "created_at") => {
    if (sortField === field) setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    else { setSortField(field); setSortDir("desc") }
  }

  // Fetch full student details for the sheet
  const openDetail = async (app: any) => {
    setSelectedApp(app)
    setDetailLoading(true)
    setDetailData(null)
    try {
      const sid = app.student_id
      const [
        { data: student },
        { data: skills },
        { data: experience },
        { data: participations },
      ] = await Promise.all([
        supabase.from("students").select("*").eq("student_id", sid).single(),
        supabase.from("student_skills").select("*").eq("student_id", sid),
        supabase.from("experience").select("*").eq("student_id", sid),
        supabase.from("environment_participants").select("environment_id, virtual_environments(title, status, company_id, companies(name))").eq("student_id", sid),
      ])

      // Task progress summary
      const envIds = (participations || []).map((p: any) => p.environment_id).filter(Boolean)
      let taskSummary: any[] = []
      if (envIds.length > 0) {
        const { data: tasks } = await supabase.from("tasks").select("task_id, environment_id, title").in("environment_id", envIds)
        const taskIds = (tasks || []).map((t: any) => t.task_id)
        if (taskIds.length > 0) {
          const { data: progress } = await supabase.from("task_progress").select("task_id, status").eq("student_id", sid).in("task_id", taskIds)
          const pMap: Record<string, string> = {}
          ;(progress || []).forEach((p: any) => { pMap[p.task_id] = p.status })
          taskSummary = (tasks || []).map((t: any) => ({ ...t, progress_status: pMap[t.task_id] || "locked" }))
        }
      }

      setDetailData({ student, skills: skills || [], experience: experience || [], participations: participations || [], taskSummary })
    } catch (err) {
      console.error("Failed to fetch details:", err)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Applications</h1>
        <p className="text-muted-foreground">Review and manage applicants across all your job openings</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Applications</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{applications.length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Shortlisted</CardTitle><Star className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{applications.filter((a) => a.status === "shortlisted").length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Offered</CardTitle><Trophy className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{applications.filter((a) => a.status === "offered").length}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Avg Match Score</CardTitle><ArrowUpDown className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{applications.length > 0 ? Math.round(applications.reduce((s, a) => s + (a.match_score || 0), 0) / applications.length) : 0}%</div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by student name..." className="pl-10" />
        </div>
        <Select value={filterJob} onValueChange={setFilterJob}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by job" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map((j) => (<SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {["matched","applied","shortlisted","interviewed","offered","rejected"].map((s) => (<SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2 text-muted-foreground">Loading applications...</span></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-16 space-y-2"><FileTextIcon className="w-12 h-12 text-muted-foreground/50" /><p className="text-lg font-medium">No applications found</p><p className="text-sm text-muted-foreground">Try adjusting your filters or create job openings first.</p></CardContent></Card>
      ) : (
        <>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("match_score")}>
                    <span className="inline-flex items-center gap-1">Match Score <ArrowUpDown className="w-3 h-3" /></span>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("created_at")}>
                    <span className="inline-flex items-center gap-1">Applied <ArrowUpDown className="w-3 h-3" /></span>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((app, idx) => (
                  <TableRow key={app.id} className="group">
                    <TableCell className="font-bold text-muted-foreground">{page * PAGE_SIZE + idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8"><AvatarFallback className="text-xs">{getInitials(app.student_name)}</AvatarFallback></Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{app.student_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.student_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm truncate block max-w-[180px]">{app.job_title}</span></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${app.match_score || 0}%` }} /></div>
                        <span className="text-sm font-medium">{app.match_score ?? 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        disabled={updatingStatus === app.id}
                        value={app.status}
                        onValueChange={(val) => updateStatus(app.id, val)}
                      >
                        <SelectTrigger className={`h-8 w-32 text-xs border-0 capitalize ${STATUS_STYLES[app.status] || ""}`}>
                          {updatingStatus === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <SelectValue />}
                        </SelectTrigger>
                        <SelectContent>
                          {["matched","applied","shortlisted","interviewed","offered","rejected"].map(s => (
                            <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(app)} title="View Details"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Email"><a href={`mailto:${app.student_email}`}><Mail className="w-4 h-4" /></a></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="w-4 h-4 mr-1" />Prev</Button>
              <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next<ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        </>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selectedApp} onOpenChange={(open) => { if (!open) setSelectedApp(null) }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Applicant Details</SheetTitle>
            <SheetDescription>Full profile for {selectedApp?.student_name}</SheetDescription>
          </SheetHeader>

          {detailLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : detailData ? (
            <div className="space-y-6 mt-6">
              {/* Student info */}
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14"><AvatarFallback className="text-lg">{getInitials(detailData.student?.full_name || "")}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-lg font-semibold">{detailData.student?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{detailData.student?.email}</p>
                  {detailData.student?.github_url && (
                    <a href={detailData.student.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary inline-flex items-center gap-1 hover:underline"><Github className="w-3.5 h-3.5" />{detailData.student.github_url}</a>
                  )}
                </div>
                <Button size="sm" variant="outline" asChild><a href={`mailto:${detailData.student?.email}`}><Mail className="w-4 h-4 mr-2" />Email</a></Button>
              </div>

              {/* About */}
              {detailData.student?.about && (
                <div className="space-y-1"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">About</p><p className="text-sm leading-relaxed">{detailData.student.about}</p></div>
              )}

              {/* Match info */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Application Details</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Job</span><span className="font-medium">{selectedApp?.job_title}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Match Score</span><span className="font-bold text-primary">{selectedApp?.match_score ?? 0}%</span></div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Select
                      disabled={updatingStatus === selectedApp?.id}
                      value={selectedApp?.status}
                      onValueChange={(val) => updateStatus(selectedApp!.id, val)}
                    >
                      <SelectTrigger className={`h-8 w-32 text-xs border-0 capitalize ${STATUS_STYLES[selectedApp?.status] || ""}`}>
                        {updatingStatus === selectedApp?.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <SelectValue />}
                      </SelectTrigger>
                      <SelectContent>
                        {["matched","applied","shortlisted","interviewed","offered","rejected"].map(s => (
                          <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Applied</span><span>{selectedApp?.created_at ? new Date(selectedApp.created_at).toLocaleDateString() : "—"}</span></div>
                  {selectedApp?.match_reasons && Array.isArray(selectedApp.match_reasons) && selectedApp.match_reasons.length > 0 && (
                    <div className="space-y-1 pt-2 border-t"><p className="text-xs text-muted-foreground font-medium">Match Reasons</p>{selectedApp.match_reasons.map((r: any, i: number) => (<p key={i} className="text-xs">• {typeof r === "string" ? r : JSON.stringify(r)}</p>))}</div>
                  )}
                </CardContent>
              </Card>

              {/* Cover letter */}
              {selectedApp?.cover_letter && (
                <div className="space-y-1"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cover Letter</p><div className="rounded-lg border p-3 text-sm leading-relaxed bg-muted/30">{selectedApp.cover_letter}</div></div>
              )}

              <Separator />

              {/* Skills */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Code2 className="w-3.5 h-3.5" />Skills ({detailData.skills.length})</p>
                {detailData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">{detailData.skills.map((s: any) => (<Badge key={s.id || s.skill_name} variant="secondary" className="text-xs gap-1">{s.skill_name}<span className="text-muted-foreground capitalize">· {s.experience_level || "beginner"}</span></Badge>))}</div>
                ) : (<p className="text-sm text-muted-foreground">No skills recorded</p>)}
              </div>

              <Separator />

              {/* Experience */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />Experience ({detailData.experience.length})</p>
                {detailData.experience.length > 0 ? (
                  <div className="space-y-3">{detailData.experience.map((exp: any) => (
                    <div key={exp.experience_id} className="rounded-lg border p-3 space-y-1">
                      <div className="flex items-center justify-between"><p className="font-medium text-sm">{exp.role}</p>{exp.exp_years && <span className="text-xs text-muted-foreground">{exp.exp_years}</span>}</div>
                      <p className="text-sm text-muted-foreground">{exp.company_name}</p>
                      {exp.technologies_used?.length > 0 && (<div className="flex flex-wrap gap-1 pt-1">{exp.technologies_used.map((t: string) => (<Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>))}</div>)}
                      {exp.description && <p className="text-xs text-muted-foreground pt-1">{exp.description}</p>}
                    </div>
                  ))}</div>
                ) : (<p className="text-sm text-muted-foreground">No professional experience</p>)}
              </div>

              <Separator />

              {/* Environment participation */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />Environments ({detailData.participations.length})</p>
                {detailData.participations.length > 0 ? (
                  <div className="space-y-2">{detailData.participations.map((p: any) => {
                    const env = p.virtual_environments
                    const company = env?.companies
                    return (
                      <div key={p.environment_id} className="rounded-lg border p-3">
                        <p className="font-medium text-sm">{env?.title || "Environment"}</p>
                        <p className="text-xs text-muted-foreground">{company?.name || "Company"} · {env?.status || "unknown"}</p>
                      </div>
                    )
                  })}</div>
                ) : (<p className="text-sm text-muted-foreground">Not participating in any environments</p>)}
              </div>

              {/* Task progress summary */}
              {detailData.taskSummary?.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Task Progress ({detailData.taskSummary.filter((t: any) => t.progress_status === "approved" || t.progress_status === "submitted").length}/{detailData.taskSummary.length} completed)</p>
                    <div className="grid grid-cols-1 gap-1">{detailData.taskSummary.slice(0, 10).map((t: any) => (
                      <div key={t.task_id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-muted/30">
                        <span className="truncate flex-1">{t.title}</span>
                        <Badge variant="outline" className={`text-[10px] capitalize ${t.progress_status === "approved" ? "bg-emerald-500/10 text-emerald-500" : t.progress_status === "submitted" ? "bg-blue-500/10 text-blue-400" : "bg-zinc-500/10 text-zinc-400"}`}>{t.progress_status}</Badge>
                      </div>
                    ))}</div>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
