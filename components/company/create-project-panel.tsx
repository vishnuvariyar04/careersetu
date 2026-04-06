"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  Save,
  FileText,
  PencilLine,
  Wand2,
  GripVertical,
  FolderKanban,
  Calendar,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { GeneratedProjectPayload, GeneratedTask } from "@/types/company-project"
import { normalizeGeneratedProject } from "@/types/company-project"

type Props = {
  companyId: string
}

type SavedEnvironment = {
  environment_id: string
  title: string
  description: string | null
  status: string
  created_at: string
  tech_stack?: string[] | null
}

type SavedTask = {
  task_id: string
  title: string
  description: string | null
  task_order: number
}

export function CreateProjectPanel({ companyId }: Props) {
  const [savedEnvironments, setSavedEnvironments] = useState<SavedEnvironment[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<SavedTask[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)

  const [mode, setMode] = useState<"ai" | "manual">("ai")
  const [prompt, setPrompt] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [project, setProject] = useState<GeneratedProjectPayload | null>(null)
  const [referencePdfUrls, setReferencePdfUrls] = useState<string[]>([])

  const [refineOpen, setRefineOpen] = useState(false)
  const [refineTaskIndex, setRefineTaskIndex] = useState<number | null>(null)
  const [refineInstruction, setRefineInstruction] = useState("Make this task clearer with concrete deliverables.")
  const [refining, setRefining] = useState(false)

  const loadEnvironments = useCallback(async () => {
    setListLoading(true)
    try {
      const { data, error } = await supabase
        .from("virtual_environments")
        .select("environment_id, title, description, status, created_at, tech_stack")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setSavedEnvironments((data as SavedEnvironment[]) || [])
    } catch (e) {
      console.error("loadEnvironments", e)
      setSavedEnvironments([])
    } finally {
      setListLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    loadEnvironments()
  }, [loadEnvironments])

  useEffect(() => {
    if (listLoading || !selectedSavedId) return
    if (!savedEnvironments.some((e) => e.environment_id === selectedSavedId)) {
      setSelectedSavedId(null)
    }
  }, [listLoading, selectedSavedId, savedEnvironments])

  useEffect(() => {
    if (!selectedSavedId) {
      setSelectedTasks([])
      return
    }
    let cancelled = false
    setTasksLoading(true)
    supabase
      .from("tasks")
      .select("task_id, title, description, task_order")
      .eq("environment_id", selectedSavedId)
      .order("task_order", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error("load tasks", error)
          setSelectedTasks([])
        } else {
          setSelectedTasks((data as SavedTask[]) || [])
        }
        setTasksLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedSavedId])

  const startNewProject = () => {
    setSelectedSavedId(null)
    setProject(null)
    setPrompt("")
    setPdfFile(null)
    setReferencePdfUrls([])
    setError(null)
  }

  const projectContextForAi = useCallback(() => {
    if (!project) return ""
    return [
      `Project: ${project.title}`,
      project.description,
      project.key_features?.length ? `Features: ${project.key_features.join("; ")}` : "",
      project.project_structure_summary ? `Structure: ${project.project_structure_summary}` : "",
    ]
      .filter(Boolean)
      .join("\n")
  }, [project])

  const handleGenerate = async () => {
    setError(null)
    setSelectedSavedId(null)
    if (!prompt.trim() && !pdfFile) {
      setError("Enter a prompt and/or attach a PDF.")
      return
    }
    setGenerating(true)
    try {
      const form = new FormData()
      form.set("prompt", prompt)
      if (pdfFile) form.set("file", pdfFile)

      const res = await fetch("/api/company/generate-project", {
        method: "POST",
        body: form,
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Generation failed")
      }
      const normalized = normalizeGeneratedProject(data.project)
      if (!normalized) {
        throw new Error("Could not parse project from model. Try again.")
      }
      setProject(normalized)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed")
    } finally {
      setGenerating(false)
    }
  }

  const startManual = () => {
    setError(null)
    setSelectedSavedId(null)
    setProject({
      title: "",
      description: "",
      key_features: [],
      project_structure_summary: "",
      tasks: [
        { title: "Kickoff & requirements", description: "Clarify scope and success criteria.", task_order: 1 },
        { title: "Implementation milestone", description: "Deliver core functionality.", task_order: 2 },
      ],
    })
  }

  const updateTask = (index: number, patch: Partial<GeneratedTask>) => {
    setProject((prev) => {
      if (!prev) return prev
      const tasks = [...prev.tasks]
      tasks[index] = { ...tasks[index], ...patch }
      return { ...prev, tasks }
    })
  }

  const addTask = () => {
    setProject((prev) => {
      if (!prev) return prev
      const nextOrder = prev.tasks.length + 1
      return {
        ...prev,
        tasks: [
          ...prev.tasks,
          { title: `Task ${nextOrder}`, description: "", task_order: nextOrder },
        ],
      }
    })
  }

  const removeTask = (index: number) => {
    setProject((prev) => {
      if (!prev) return prev
      const tasks = prev.tasks.filter((_, i) => i !== index).map((t, i) => ({ ...t, task_order: i + 1 }))
      return { ...prev, tasks }
    })
  }

  const openRefine = (index: number) => {
    setRefineTaskIndex(index)
    setRefineInstruction("Improve clarity and list concrete deliverables.")
    setRefineOpen(true)
  }

  const runRefine = async () => {
    if (refineTaskIndex === null || !project) return
    const t = project.tasks[refineTaskIndex]
    setRefining(true)
    setError(null)
    try {
      const res = await fetch("/api/company/refine-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: t.title,
          description: t.description,
          instruction: refineInstruction,
          projectContext: projectContextForAi(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Refine failed")
      updateTask(refineTaskIndex, { title: data.title, description: data.description })
      setRefineOpen(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Refine failed")
    } finally {
      setRefining(false)
    }
  }

  const uploadPdfReference = async (file: File) => {
    setError(null)
    const form = new FormData()
    form.set("companyId", companyId)
    form.set("file", file)
    const res = await fetch("/api/company/upload-project-pdf", {
      method: "POST",
      body: form,
      credentials: "include",
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || data.hint || "Upload failed")
    }
    if (data.publicUrl) {
      setReferencePdfUrls((prev) => [...prev, data.publicUrl])
    }
    return data
  }

  const handleSave = async () => {
    if (!project) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/company/save-environment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          companyId,
          title: project.title,
          description: project.description,
          status: "open",
          techStack: [],
          tasks: project.tasks.map((t, i) => ({
            title: t.title,
            description: t.description || null,
            task_order: t.task_order ?? i + 1,
          })),
          referencePdfUrls,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Save failed")
      setError(null)
      await loadEnvironments()
      setSelectedSavedId(data.environment_id)
      setProject(null)
      setPrompt("")
      setPdfFile(null)
      setReferencePdfUrls([])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const selectedSaved = savedEnvironments.find((e) => e.environment_id === selectedSavedId)

  return (
    <div className="flex w-full min-h-[calc(100vh-6rem)] border rounded-lg overflow-hidden bg-background">
      {/* Left: saved projects */}
      <aside className="w-[280px] shrink-0 border-r flex flex-col bg-muted/30">
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FolderKanban className="h-4 w-4" />
            Projects
          </div>
          <Button type="button" size="sm" className="w-full" variant="default" onClick={startNewProject}>
            <Plus className="h-4 w-4 mr-2" />
            New project
          </Button>
        </div>
        <ScrollArea className="flex-1 min-h-[200px]">
          <div className="p-2 space-y-1">
            {listLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading…
              </div>
            ) : savedEnvironments.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-4 text-center">No saved projects yet.</p>
            ) : (
              savedEnvironments.map((env) => (
                <button
                  key={env.environment_id}
                  type="button"
                  onClick={() => setSelectedSavedId(env.environment_id)}
                  className={`w-full text-left rounded-md px-3 py-2.5 text-sm transition-colors border ${
                    selectedSavedId === env.environment_id
                      ? "bg-background border-primary shadow-sm"
                      : "border-transparent hover:bg-muted/80"
                  }`}
                >
                  <div className="font-medium line-clamp-2">{env.title}</div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground uppercase tracking-wide">
                    <span>{env.status}</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(env.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col overflow-auto">
        {selectedSavedId && selectedSaved ? (
          <div className="p-4 md:p-6 space-y-6 max-w-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{selectedSaved.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Environment <code className="text-xs bg-muted px-1 rounded">{selectedSaved.environment_id}</code>
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={startNewProject}>
                Create another
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase">Status</span>
              <span className="text-sm capitalize">{selectedSaved.status}</span>
            </div>
            {selectedSaved.description && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold">Description</h2>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap border rounded-md p-3 bg-muted/20">
                  {selectedSaved.description}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Tasks ({tasksLoading ? "…" : selectedTasks.length})</h2>
              {tasksLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <ul className="space-y-2">
                  {selectedTasks.map((t) => (
                    <li key={t.task_id} className="border rounded-lg p-3 text-sm">
                      <div className="font-medium">
                        #{t.task_order} — {t.title}
                      </div>
                      {t.description && (
                        <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{t.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create new project</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Generate a project and tasks with Gemini 3 Flash, review and edit, then save to{" "}
          <code className="text-xs bg-muted px-1 rounded">virtual_environments</code> and{" "}
          <code className="text-xs bg-muted px-1 rounded">tasks</code>.
        </p>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "ai" | "manual")}>
        <TabsList>
          <TabsTrigger value="ai">Prompt + AI</TabsTrigger>
          <TabsTrigger value="manual">Manual only</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5" />
                Describe your project
              </CardTitle>
              <CardDescription>
                Optional PDF is sent to Gemini 3 Flash with your prompt for richer requirements. You can also add reference PDFs
                below (uploaded to Supabase Storage when saved).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g. A 6-week virtual internship: build a REST API for inventory with auth, tests, and CI/CD."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  disabled={generating}
                />
              </div>
              <div className="space-y-2">
                <Label>PDF for AI (optional)</Label>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  disabled={generating}
                />
                {pdfFile && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" /> {pdfFile.name}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleGenerate} disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate project
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={startManual} disabled={generating}>
                  <PencilLine className="h-4 w-4 mr-2" />
                  Skip to manual draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <Button type="button" variant="secondary" onClick={startManual}>
            <Plus className="h-4 w-4 mr-2" />
            Start empty project
          </Button>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {project && (
        <Card>
          <CardHeader>
            <CardTitle>Review & edit</CardTitle>
            <CardDescription>Adjust titles and descriptions. Reorder by editing task numbers or use AI refine per task.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={project.title}
                  onChange={(e) => setProject({ ...project, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (stored on virtual_environment)</Label>
                <Textarea
                  rows={5}
                  value={project.description}
                  onChange={(e) => setProject({ ...project, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Key features (reference)</Label>
                <Textarea
                  rows={3}
                  value={project.key_features.join("\n")}
                  onChange={(e) =>
                    setProject({
                      ...project,
                      key_features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="One feature per line"
                />
              </div>
              <div className="space-y-2">
                <Label>Project structure summary (reference)</Label>
                <Textarea
                  rows={3}
                  value={project.project_structure_summary}
                  onChange={(e) => setProject({ ...project, project_structure_summary: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reference PDFs (optional, appended to description on save)</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  try {
                    await uploadPdfReference(f)
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : "Upload failed")
                  }
                  e.target.value = ""
                }}
              />
              {referencePdfUrls.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {referencePdfUrls.map((u) => (
                    <li key={u}>
                      <a href={u} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                        {u}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Tasks</Label>
                <Button type="button" size="sm" variant="outline" onClick={addTask}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add task
                </Button>
              </div>
              <div className="space-y-3">
                {project.tasks.map((task, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 space-y-2 bg-card/50"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-2 shrink-0" />
                      <div className="flex-1 grid gap-2">
                        <Input
                          placeholder="Task title"
                          value={task.title}
                          onChange={(e) => updateTask(index, { title: e.target.value })}
                        />
                        <Textarea
                          placeholder="Task description"
                          rows={3}
                          value={task.description}
                          onChange={(e) => updateTask(index, { description: e.target.value })}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Input
                            className="w-24"
                            type="number"
                            min={1}
                            value={task.task_order}
                            onChange={(e) =>
                              updateTask(index, { task_order: Number(e.target.value) || index + 1 })
                            }
                          />
                          <Button type="button" size="sm" variant="secondary" onClick={() => openRefine(index)}>
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI refine
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => removeTask(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" onClick={handleSave} disabled={saving || !project.title.trim()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save to database
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={refineOpen} onOpenChange={setRefineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refine task with AI</DialogTitle>
            <DialogDescription>Uses Gemini 3 Flash to rewrite this task&apos;s title and description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Instruction</Label>
            <Textarea
              value={refineInstruction}
              onChange={(e) => setRefineInstruction(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRefineOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={runRefine} disabled={refining}>
              {refining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="text-xs text-muted-foreground border-t pt-4">
        <p className="font-medium text-foreground mb-1">Environment</p>
        <code className="block">GEMINI_API_KEY</code> — server-side only. Default model:{" "}
        <code className="text-xs">gemini-3-flash-preview</code>. Override with <code className="text-xs">GEMINI_MODEL</code>.{" "}
        <code className="block mt-1">project-documents</code> — Supabase Storage bucket for PDF URLs (optional).
      </div>
          </div>
        )}
      </div>
    </div>
  )
}
