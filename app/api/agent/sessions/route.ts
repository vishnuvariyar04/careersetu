import { NextRequest, NextResponse } from "next/server"

const PM_AGENT_URL = process.env.PM_AGENT_URL || "http://localhost:8000"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("student_id")
    const environmentId = searchParams.get("environment_id")

    if (!studentId || !environmentId) {
      return NextResponse.json(
        { error: "student_id and environment_id query params are required" },
        { status: 400 }
      )
    }

    const upstream = await fetch(
      `${PM_AGENT_URL}/sessions/${studentId}/${environmentId}`
    )

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
    console.error("agent/sessions proxy error:", e)
    return NextResponse.json(
      { error: "Failed to reach PM Agent", detail: e.message },
      { status: 502 }
    )
  }
}
