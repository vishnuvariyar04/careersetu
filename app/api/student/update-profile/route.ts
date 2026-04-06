import { NextResponse } from "next/server"
import { createClient } from "@/lib/server-supabase"

export const runtime = "nodejs"

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

    const body = await req.json().catch(() => ({}))
    const github_url = body.github_url ? String(body.github_url).trim() : undefined

    if (!github_url) {
      return NextResponse.json({ error: "github_url is required" }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from("students")
      .update({ github_url })
      .eq("student_id", user.id)

    if (updateError) {
      console.error("[student/update-profile]", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Update failed"
    console.error("[student/update-profile]", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

