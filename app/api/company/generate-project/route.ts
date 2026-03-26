import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { GEMINI_FLASH_MODEL } from "@/lib/gemini-models"
// Override with GEMINI_MODEL if needed (default: gemini-3-flash-preview)
import { parseJsonFromModelText } from "@/lib/parse-json-response"

export const runtime = "nodejs"
export const maxDuration = 120

const SYSTEM_INSTRUCTION = `You are a technical project planner for CareerSetu virtual company environments.
Return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "title": "string (short project name)",
  "description": "string (2-4 paragraphs: overview, goals, scope)",
  "key_features": ["string", ...],
  "project_structure_summary": "string (high-level architecture: folders, services, data flow)",
  "tasks": [
    { "title": "string", "description": "string (what the student must deliver)", "task_order": 1 }
  ]
}
Rules:
- tasks must be ordered sequentially with task_order starting at 1
- 5–12 tasks typical; each task is concrete and assessable
- descriptions should match a learning/work simulation context`

export async function POST(req: Request) {
  try {
    const key = process.env.GEMINI_API_KEY
    if (!key) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server" }, { status: 500 })
    }

    const contentType = req.headers.get("content-type") || ""
    let prompt = ""
    let pdfPart: { inlineData: { data: string; mimeType: string } } | null = null

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData()
      prompt = String(form.get("prompt") || "").trim()
      const file = form.get("file")
      if (file instanceof File && file.size > 0) {
        if (file.type !== "application/pdf") {
          return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 })
        }
        const buf = Buffer.from(await file.arrayBuffer())
        if (buf.byteLength > 20 * 1024 * 1024) {
          return NextResponse.json({ error: "PDF must be 20MB or smaller" }, { status: 400 })
        }
        pdfPart = {
          inlineData: {
            data: buf.toString("base64"),
            mimeType: "application/pdf",
          },
        }
      }
    } else {
      const body = await req.json().catch(() => ({}))
      prompt = String(body.prompt || "").trim()
      if (body.pdfBase64 && body.pdfMimeType === "application/pdf") {
        pdfPart = {
          inlineData: {
            data: String(body.pdfBase64),
            mimeType: "application/pdf",
          },
        }
      }
    }

    if (!prompt && !pdfPart) {
      return NextResponse.json({ error: "Provide a prompt and/or a PDF" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(key)
    const modelName = process.env.GEMINI_MODEL || GEMINI_FLASH_MODEL
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.35,
      },
      systemInstruction: SYSTEM_INSTRUCTION,
    })

    const userText =
      prompt ||
      "Infer the project scope, goals, and a sensible task breakdown from the attached PDF only."

    const parts = pdfPart
      ? [
          { text: userText + "\n\nUse the PDF as the primary source of requirements where applicable." },
          pdfPart,
        ]
      : [{ text: userText }]

    const result = await model.generateContent(parts)
    const text = result.response.text()
    let parsed: unknown
    try {
      parsed = parseJsonFromModelText(text)
    } catch {
      return NextResponse.json(
        { error: "Model returned non-JSON. Try again or shorten the prompt." },
        { status: 502 }
      )
    }

    return NextResponse.json({ project: parsed })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Generation failed"
    console.error("[generate-project]", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
