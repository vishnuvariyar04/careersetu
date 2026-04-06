import { NextResponse } from "next/server"
import { createClient } from "@/lib/server-supabase"

export const runtime = "nodejs"

const BUCKET = "student-resumes"
const MAX_BYTES = 15 * 1024 * 1024

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

    const form = await req.formData()
    const file = form.get("file")

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "file required" }, { status: 400 })
    }
    if (!["application/pdf"].includes(file.type)) {
      return NextResponse.json({ error: "Only PDF resumes are allowed" }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Resume must be 15MB or smaller" }, { status: 400 })
    }

    const safeName = file.name.replace(/[^\w.\-]+/g, "_") || "resume.pdf"
    const path = `${user.id}/${Date.now()}_${safeName}`
    const buf = Buffer.from(await file.arrayBuffer())

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, {
      contentType: "application/pdf",
      upsert: false,
    })

    if (upErr) {
      console.error("[upload-resume]", upErr)
      return NextResponse.json(
        {
          error: upErr.message,
          hint: `Create a public or authenticated Storage bucket named "${BUCKET}" in Supabase, then try again.`,
        },
        { status: 500 }
      )
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)

    // Persist on the student row for convenience
    const publicUrl = pub?.publicUrl ?? null
    if (publicUrl) {
      await supabase
        .from("students")
        .update({ resume_url: publicUrl })
        .eq("student_id", user.id)
    }

    return NextResponse.json({
      path,
      publicUrl,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Upload failed"
    console.error("[upload-resume]", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

