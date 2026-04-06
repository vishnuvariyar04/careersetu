import { NextResponse } from "next/server"
import { createClient } from "@/lib/server-supabase"

export const runtime = "nodejs"

/**
 * Records that the authenticated student has joined a virtual environment.
 */
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

    const studentId = user.id
    const body = await req.json()
    const environmentId = String(body.environmentId || "").trim()
    const companyIdFromClient = String(body.companyId || "").trim()

    if (!environmentId) {
      return NextResponse.json({ error: "environmentId is required" }, { status: 400 })
    }

    const { data: envRow, error: envErr } = await supabase
      .from("virtual_environments")
      .select("environment_id, company_id")
      .eq("environment_id", environmentId)
      .maybeSingle()

    if (envErr || !envRow) {
      return NextResponse.json({ error: "Environment not found" }, { status: 404 })
    }

    if (companyIdFromClient && companyIdFromClient !== envRow.company_id) {
      return NextResponse.json({ error: "Company mismatch" }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from("environment_participants")
      .select("id")
      .eq("environment_id", environmentId)
      .eq("student_id", studentId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ ok: true, alreadyJoined: true })
    }

    const { error: insertErr } = await supabase.from("environment_participants").insert({
      student_id: studentId,
      environment_id: environmentId,
    })

    if (insertErr) {
      console.error("join-environment insert", insertErr)
      return NextResponse.json(
        { error: insertErr.message || "Could not join environment" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("join-environment", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
