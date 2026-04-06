import { NextRequest, NextResponse } from "next/server"

const PM_AGENT_URL = process.env.PM_AGENT_URL || "http://localhost:8000"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { student_id, environment_id, message, session_id } = body

    if (!student_id || !environment_id || !message) {
      return NextResponse.json(
        { error: "student_id, environment_id, and message are required" },
        { status: 400 }
      )
    }

    const upstream = await fetch(`${PM_AGENT_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id, environment_id, message, session_id: session_id ?? null }),
    })

    if (!upstream.ok) {
      const text = await upstream.text()
      return NextResponse.json(
        { error: `PM Agent error: ${upstream.status}`, detail: text },
        { status: upstream.status }
      )
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (e: any) {
    console.error("agent/chat proxy error:", e)
    return NextResponse.json(
      { error: "Failed to reach PM Agent", detail: e.message },
      { status: 502 }
    )
  }
}
