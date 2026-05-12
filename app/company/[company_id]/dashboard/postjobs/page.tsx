"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Users,
  MapPin,
  Calendar,
  Briefcase,
  X,
  Megaphone,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"] as const
const JOB_TYPES = ["internship", "full_time", "part_time", "contract"] as const
const JOB_STATUSES = ["open", "closed", "filled"] as const

const JOB_TYPE_LABELS: Record<string, string> = {
  internship: "Internship",
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
}

const STATUS_STYLES: Record<string, string> = {
  open: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  closed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
  filled: "bg-blue-500/10 text-blue-400 border-blue-500/30",
}

interface JobOpening {
  id: string
  company_id: string
  title: string
  description: string | null
  required_skills: string[]
  min_experience_level: string
  job_type: string
  location: string | null
  status: string
  created_at: string
  updated_at: string
  applicant_count?: number
}

interface JobFormData {
  title: string
  description: string
  required_skills: string[]
  min_experience_level: string
  job_type: string
  location: string
  status: string
}

const emptyForm: JobFormData = {
  title: "",
  description: "",
  required_skills: [],
  min_experience_level: "beginner",
  job_type: "internship",
  location: "",
  status: "open",
}

export default function PostJobsPage() {
  const params = useParams()
  const companyId = params.company_id as string

  const [jobs, setJobs] = useState<JobOpening[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null)
  const [formData, setFormData] = useState<JobFormData>(emptyForm)
  const [skillInput, setSkillInput] = useState("")

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<JobOpening | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchJobs = useCallback(async () => {
    if (!companyId) return
    setLoading(true)
    try {
      const { data: openings, error } = await supabase
        .from("job_openings")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Get applicant counts
      const jobIds = (openings || []).map((j: any) => j.id)
      let countMap: Record<string, number> = {}
      if (jobIds.length > 0) {
        const { data: apps } = await supabase
          .from("job_applications")
          .select("job_id")
          .in("job_id", jobIds)

        if (apps) {
          apps.forEach((a: any) => {
            countMap[a.job_id] = (countMap[a.job_id] || 0) + 1
          })
        }
      }

      setJobs(
        (openings || []).map((j: any) => ({
          ...j,
          applicant_count: countMap[j.id] || 0,
        }))
      )
    } catch (err) {
      console.error("Failed to fetch jobs:", err)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const openCreateDialog = () => {
    setEditingJob(null)
    setFormData(emptyForm)
    setSkillInput("")
    setDialogOpen(true)
  }

  const openEditDialog = (job: JobOpening) => {
    setEditingJob(job)
    setFormData({
      title: job.title,
      description: job.description || "",
      required_skills: [...job.required_skills],
      min_experience_level: job.min_experience_level,
      job_type: job.job_type,
      location: job.location || "",
      status: job.status,
    })
    setSkillInput("")
    setDialogOpen(true)
  }

  const addSkill = () => {
    const skill = skillInput.trim()
    if (!skill || formData.required_skills.includes(skill)) return
    setFormData((prev) => ({ ...prev, required_skills: [...prev.required_skills, skill] }))
    setSkillInput("")
  }

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((s) => s !== skill),
    }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        company_id: companyId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        required_skills: formData.required_skills,
        min_experience_level: formData.min_experience_level,
        job_type: formData.job_type,
        location: formData.location.trim() || null,
        status: formData.status,
        updated_at: new Date().toISOString(),
      }

      if (editingJob) {
        const { error } = await supabase
          .from("job_openings")
          .update(payload)
          .eq("id", editingJob.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("job_openings")
          .insert(payload)
        if (error) throw error
      }

      setDialogOpen(false)
      await fetchJobs()
    } catch (err) {
      console.error("Failed to save job:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from("job_openings")
        .delete()
        .eq("id", deleteTarget.id)
      if (error) throw error
      setDeleteTarget(null)
      await fetchJobs()
    } catch (err) {
      console.error("Failed to delete job:", err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Post Jobs</h1>
          <p className="text-muted-foreground">Create and manage job openings for your company</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Job Opening
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Openings</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Openings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.filter((j) => j.status === "open").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.reduce((sum, j) => sum + (j.applicant_count || 0), 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Job listings */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading jobs...</span>
        </div>
      ) : jobs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <Megaphone className="w-12 h-12 text-muted-foreground/50" />
            <div className="text-center space-y-1">
              <p className="text-lg font-medium">No job openings yet</p>
              <p className="text-sm text-muted-foreground">Create your first job opening to start receiving applications.</p>
            </div>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Job Opening
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="group hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {JOB_TYPE_LABELS[job.job_type] || job.job_type}
                      </span>
                      {job.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={STATUS_STYLES[job.status] || ""}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.length > 0 ? (
                      job.required_skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No specific skills required</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {job.applicant_count || 0} applicant{(job.applicant_count || 0) !== 1 ? "s" : ""}
                    </span>
                    <Badge variant="outline" className="text-xs capitalize">
                      Min: {job.min_experience_level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(job)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(job)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit Job Opening" : "Create New Job Opening"}</DialogTitle>
            <DialogDescription>
              {editingJob ? "Update the details of this job opening." : "Fill in the details to create a new job opening."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Frontend Developer Intern"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={formData.job_type}
                  onValueChange={(v) => setFormData((p) => ({ ...p, job_type: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{JOB_TYPE_LABELS[t] || t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Min Experience Level</Label>
                <Select
                  value={formData.min_experience_level}
                  onValueChange={(v) => setFormData((p) => ({ ...p, min_experience_level: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((l) => (
                      <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Remote, Bangalore"
                />
              </div>
              {editingJob && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {JOB_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addSkill() }
                  }}
                  placeholder="Type a skill and press Enter"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
              </div>
              {formData.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.required_skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-destructive ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formData.title.trim()}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingJob ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete job opening?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.title}&quot; and all associated applications. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
