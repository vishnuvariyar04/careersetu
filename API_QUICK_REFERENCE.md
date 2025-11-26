# Learning Resources API - Quick Reference

## 🚀 Quick Start

### Replace the Endpoint
In `page.tsx` line 418, replace:
```typescript
const API_ENDPOINT = "YOUR_BACKEND_ENDPOINT_HERE/api/learning-resources/generate"
```

With your actual endpoint:
```typescript
const API_ENDPOINT = "https://your-api.com/api/learning-resources/generate"
```

---

## 📤 Request Format

```typescript
{
  student_id: string,          // UUID
  company_id: string,          // UUID  
  project_id: string,          // UUID
  task_id: string,             // UUID
  task_title: string,          // e.g., "Setup project structure"
  task_description: string,    // Task details
  question: string,            // User's question
  context: {
    project_title: string,     // Parent project name
    project_description: string,
    existing_topics: string[], // Already created topics
    tech_stack: string[]       // Technologies used
  },
  timestamp: string            // ISO 8601 format
}
```

---

## 📥 Response Format

```typescript
{
  success: boolean,
  topic: {
    id: string,                // UUID
    title: string,             // Auto-generated title
    content: string,           // Full explanation (markdown)
    metadata: {
      sources_count: number,
      generated_at: string,    // ISO 8601
      confidence_score: number, // 0-1
      related_topics: string[]
    },
    sections: [
      {
        heading: string,
        content: string
      }
    ],
    resources: [
      {
        type: "video" | "documentation" | "article" | "tutorial",
        title: string,
        url: string,
        duration?: string       // Optional, for videos
      }
    ]
  }
}
```

---

## 🔑 Key Points

1. **Content Formatting**: Use `\n\n` to separate paragraphs in the `content` field
2. **Error Handling**: The frontend has fallback content if API fails
3. **Rate Limiting**: 10 requests/minute, 100/day per student
4. **Required Fields**: All fields in request are required except those marked optional

---

## 📝 Example Request

```json
{
  "student_id": "123e4567-e89b-12d3-a456-426614174000",
  "company_id": "987fcdeb-51a2-43f1-b456-426614174111",
  "project_id": "proj_001",
  "task_id": "task_setup_001",
  "task_title": "Setup Project Structure",
  "task_description": "Initialize the project",
  "question": "Teach me about project structure",
  "context": {
    "project_title": "E-commerce Platform",
    "project_description": "Full-stack e-commerce app",
    "existing_topics": ["Introduction to React"],
    "tech_stack": ["React", "Node.js", "MongoDB"]
  },
  "timestamp": "2025-11-18T10:30:00.000Z"
}
```

---

## 📝 Example Response

```json
{
  "success": true,
  "topic": {
    "id": "topic_abc123",
    "title": "Project Structure Best Practices",
    "content": "Understanding Project Structure\n\nA well-organized project...",
    "metadata": {
      "sources_count": 12,
      "generated_at": "2025-11-18T10:30:15.234Z",
      "confidence_score": 0.94,
      "related_topics": ["Configuration files", "Environment variables"]
    },
    "sections": [
      {
        "heading": "Introduction",
        "content": "A well-organized project structure..."
      }
    ],
    "resources": [
      {
        "type": "video",
        "title": "React Project Structure",
        "url": "https://youtube.com/...",
        "duration": "15:30"
      }
    ]
  }
}
```

---

## ⚠️ Error Codes

| Code | Meaning |
|------|---------|
| `INVALID_REQUEST` | Missing/invalid fields |
| `UNAUTHORIZED` | Auth failed |
| `RESOURCE_NOT_FOUND` | Task/project not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

---

## 🎯 Frontend Integration Status

✅ Request payload structure implemented  
✅ Fetch API call ready  
✅ Response parsing configured  
✅ Error handling with fallback  
✅ TypeScript types defined  
✅ Loading states ready  

**Only missing**: Your actual backend endpoint URL!

---

## 📚 Full Documentation

See `API_DOCUMENTATION.md` for complete details including:
- Error response formats
- Rate limiting details
- Database schema recommendations
- Testing examples
- Best practices

