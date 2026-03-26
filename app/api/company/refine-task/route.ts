import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { GEMINI_FLASH_MODEL } from "@/lib/gemini-models"
import { parseJsonFromModelText } from "@/lib/parse-json-response"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const key = process.env.GEMINI_API_KEY
    if (!key) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server" }, { status: 500 })
    }

    const body = await req.json()
    const title = String(body.title || "").trim()
    const description = String(body.description || "").trim()
    const instruction = String(body.instruction || "Improve clarity and add concrete deliverables.").trim()
    const projectContext = String(body.projectContext || "").trim()

    if (!title && !description) {
      return NextResponse.json({ error: "title or description required" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(key)
    const modelName = process.env.GEMINI_MODEL || GEMINI_FLASH_MODEL
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    })

    const prompt = `You refine a single learning task for a virtual company project.
Return ONLY JSON: { "title": "string", "description": "string" }

Project context (optional):
${projectContext || "(none)"}

Current task title: ${title}
Current task description: ${description}

User instruction: ${instruction}

Keep title under 120 chars. Description should be 2-6 sentences with clear deliverables.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const parsed = parseJsonFromModelText(text) as { title?: string; description?: string }

    return NextResponse.json({
      title: String(parsed.title || title),
      description: String(parsed.description || description),
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Refine failed"
    console.error("[refine-task]", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
