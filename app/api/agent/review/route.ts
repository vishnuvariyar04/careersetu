import { NextRequest, NextResponse } from "next/server"

const CODE_REVIEWER_URL = process.env.CODE_REVIEWER_URL || "http://localhost:8001"

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const repoName = searchParams.get("repo_name")
    const prNumber = searchParams.get("pr_number")

    if (!repoName || !prNumber) {
      return NextResponse.json(
        { error: "repo_name and pr_number query params are required" },
        { status: 400 }
      )
    }

    const upstream = await fetch(
      `${CODE_REVIEWER_URL}/review?repo_name=${encodeURIComponent(repoName)}&pr_number=${encodeURIComponent(prNumber)}`,
      { method: "POST" }
    )

    if (!upstream.ok) {
      const text = await upstream.text()
      return NextResponse.json(
        { error: `CodeReviewer error: ${upstream.status}`, detail: text },
        { status: upstream.status }
      )
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (e: any) {
    console.error("agent/review proxy error:", e)
    return NextResponse.json(
      { error: "Failed to reach CodeReviewer Agent", detail: e.message },
      { status: 502 }
    )
  }
}
