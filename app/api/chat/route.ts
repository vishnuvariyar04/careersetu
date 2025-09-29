import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { messages, agentType } = await request.json()

    const systemPrompt =
      agentType === "pm"
        ? `You are a Project Management AI Agent. You help teams with task assignment, progress tracking, and project coordination. You are concise, helpful, and focused on productivity. You can:
        - Assign and prioritize tasks
        - Track project progress
        - Identify blockers and suggest solutions
        - Provide project insights and recommendations
        - Coordinate team activities`
        : `You are a Learning AI Agent. You help developers learn new technologies and improve their skills. You are patient, encouraging, and educational. You can:
        - Explain complex concepts in simple terms
        - Provide step-by-step tutorials
        - Create personalized learning paths
        - Suggest practice exercises
        - Adapt to different learning styles`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      maxTokens: 500,
    })

    return Response.json({
      content: text,
      type: determineMessageType(text, agentType),
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

function determineMessageType(content: string, agentType: string) {
  const lowerContent = content.toLowerCase()

  if (agentType === "pm") {
    if (lowerContent.includes("task") && (lowerContent.includes("assign") || lowerContent.includes("create"))) {
      return "task_assignment"
    }
    if (lowerContent.includes("progress") || lowerContent.includes("status") || lowerContent.includes("update")) {
      return "progress_update"
    }
  } else {
    if (lowerContent.includes("learn") || lowerContent.includes("tutorial") || lowerContent.includes("explain")) {
      return "learning_suggestion"
    }
  }

  return "general"
}
