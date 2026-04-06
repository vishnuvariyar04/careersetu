import { NextResponse } from "next/server"
import { createClient } from "@/lib/server-supabase"

export const runtime = "nodejs"

type TaskInput = { title: string; description: string | null; task_order: number }

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const companyId = String(body.companyId || "")
    const title = String(body.title || "").trim()
    const description = String(body.description || "").trim()
    const status = (body.status as string) || "open"
    const tasks = (body.tasks || []) as TaskInput[]
    const referencePdfUrls = Array.isArray(body.referencePdfUrls) ? body.referencePdfUrls.map(String) : []
    const techStack = Array.isArray(body.techStack)
      ? (body.techStack as unknown[]).map((t) => String(t).trim()).filter(Boolean)
      : []

    if (!companyId || companyId !== user.id) {
      return NextResponse.json({ error: "Invalid company scope" }, { status: 403 })
    }
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (!tasks.length) {
      return NextResponse.json({ error: "At least one task is required" }, { status: 400 })
    }

    const { data: companyRow, error: companyErr } = await supabase
      .from("companies")
      .select("company_id")
      .eq("company_id", companyId)
      .maybeSingle()

    if (companyErr || !companyRow) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    let fullDescription = description
    if (referencePdfUrls.length > 0) {
      fullDescription =
        (fullDescription ? fullDescription + "\n\n" : "") +
        "**Reference documents (PDF):**\n" +
        referencePdfUrls.map((u: string) => `- ${u}`).join("\n")
    }

    const { data: env, error: envError } = await supabase
      .from("virtual_environments")
      .insert({
        company_id: companyId,
        title,
        description: fullDescription || null,
        status: ["open", "in_progress", "completed"].includes(status) ? status : "open",
        tech_stack: techStack.length ? techStack : [],
      })
      .select("environment_id")
      .single()

    if (envError || !env) {
      console.error("[save-environment] insert env", envError)
      return NextResponse.json({ error: envError?.message || "Failed to create environment" }, { status: 500 })
    }

    const environmentId = env.environment_id as string

    const taskRows = tasks
      .map((t, i) => ({
        environment_id: environmentId,
        title: String(t.title || "").trim(),
        description: t.description ? String(t.description).trim() : null,
        task_order: typeof t.task_order === "number" ? t.task_order : i + 1,
      }))
      .filter((t) => t.title.length > 0)

    if (!taskRows.length) {
      await supabase.from("virtual_environments").delete().eq("environment_id", environmentId)
      return NextResponse.json({ error: "No valid tasks" }, { status: 400 })
    }

    const { error: tasksError } = await supabase.from("tasks").insert(taskRows)

    if (tasksError) {
      console.error("[save-environment] insert tasks", tasksError)
      await supabase.from("virtual_environments").delete().eq("environment_id", environmentId)
      return NextResponse.json({ error: tasksError.message }, { status: 500 })
    }

    return NextResponse.json({ environment_id: environmentId, tasks_created: taskRows.length })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Save failed"
    console.error("[save-environment]", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
