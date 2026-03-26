export type GeneratedTask = {
  title: string
  description: string
  task_order: number
}

export type GeneratedProjectPayload = {
  title: string
  description: string
  key_features: string[]
  project_structure_summary: string
  tasks: GeneratedTask[]
}

export function normalizeGeneratedProject(raw: unknown): GeneratedProjectPayload | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const title = String(o.title || "").trim()
  const description = String(o.description || "").trim()
  const key_features = Array.isArray(o.key_features)
    ? o.key_features.map((x) => String(x)).filter(Boolean)
    : []
  const project_structure_summary = String(o.project_structure_summary || "").trim()
  const tasksRaw = Array.isArray(o.tasks) ? o.tasks : []
  const tasks: GeneratedTask[] = tasksRaw.map((t, i) => {
    const row = t as Record<string, unknown>
    return {
      title: String(row.title || `Task ${i + 1}`).trim(),
      description: String(row.description || "").trim(),
      task_order: typeof row.task_order === "number" ? row.task_order : i + 1,
    }
  })
  if (!title) return null
  return {
    title,
    description,
    key_features,
    project_structure_summary,
    tasks: tasks.length ? tasks : [{ title: "First milestone", description: "Define scope", task_order: 1 }],
  }
}
