import { NextResponse } from "next/server"
import { createClient } from "@/lib/server-supabase"

export const runtime = "nodejs"

const BUCKET = "project-documents"
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
    const companyId = String(form.get("companyId") || "")
    const file = form.get("file")

    if (companyId !== user.id) {
      return NextResponse.json({ error: "Invalid company scope" }, { status: 403 })
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "file required" }, { status: 400 })
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF allowed" }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "PDF must be 15MB or smaller" }, { status: 400 })
    }

    const safeName = file.name.replace(/[^\w.\-]+/g, "_") || "document.pdf"
    const path = `${companyId}/${Date.now()}_${safeName}`
    const buf = Buffer.from(await file.arrayBuffer())

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, {
      contentType: "application/pdf",
      upsert: false,
    })

    if (upErr) {
      console.error("[upload-project-pdf]", upErr)
      return NextResponse.json(
        {
          error: upErr.message,
          hint: `Create a public or authenticated Storage bucket named "${BUCKET}" in Supabase, or skip PDF upload and paste requirements in the prompt.`,
        },
        { status: 500 }
      )
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)

    return NextResponse.json({
      path,
      publicUrl: pub?.publicUrl ?? null,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Upload failed"
    console.error("[upload-project-pdf]", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
