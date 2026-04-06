import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/server-supabase"

const PM_AGENT_URL = process.env.PM_AGENT_URL || "http://localhost:8000"

export async function GET(
  req: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    // Support both plain and Promise-like params shapes.
    const resolvedParams = await Promise.resolve(params as any)
    const sessionId = resolvedParams?.session_id
    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit") || "50"
    const parsedLimit = Number.parseInt(limit, 10)
    const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 200)
      : 50

    const upstream = await fetch(
      `${PM_AGENT_URL}/sessions/${sessionId}/messages?limit=${safeLimit}`
    )

    if (!upstream.ok) {
      const text = await upstream.text()
      // Fallback to direct DB read so historical sessions are still accessible.
      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from("pm_agent_messages")
          .select("role, content, created_at")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true })
          .limit(safeLimit)

        if (!error && Array.isArray(data)) {
          const messages = data.map((m: any) => ({
            role: m.role === "student" ? "student" : "agent",
            content: m.content ?? "",
            created_at: m.created_at ?? new Date().toISOString(),
          }))
          return NextResponse.json({
            messages,
            source: "supabase_fallback",
            upstream_error: { status: upstream.status, detail: text },
          })
        }

        return NextResponse.json(
          {
            error: `PM Agent error: ${upstream.status}`,
            detail: text,
            fallback_error: error?.message ?? "Unknown Supabase fallback error",
          },
          { status: upstream.status }
        )
      } catch (fallbackErr: any) {
        return NextResponse.json(
          {
            error: `PM Agent error: ${upstream.status}`,
            detail: text,
            fallback_error: fallbackErr?.message ?? "Supabase fallback failed",
          },
          { status: upstream.status }
        )
      }
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (e: any) {
    console.error("agent/sessions/messages proxy error:", e)
    return NextResponse.json(
      { error: "Failed to reach PM Agent", detail: e.message },
      { status: 502 }
    )
  }
}
