# Learning Resources API Documentation

## Overview
This document describes the API structure for generating learning resources and explanations for tasks in the project management system.

---

## 1. Generate Learning Resource

### Endpoint
```
POST /api/learning-resources/generate
```

### Description
Generates a comprehensive learning resource/explanation based on a student's question about a specific task.

---

## Request Structure

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "student_id": "string (UUID)",
  "company_id": "string (UUID)",
  "project_id": "string (UUID)",
  "task_id": "string (UUID)",
  "task_title": "string",
  "task_description": "string",
  "question": "string",
  "context": {
    "project_title": "string",
    "project_description": "string",
    "existing_topics": ["string"],
    "tech_stack": ["string"]
  },
  "timestamp": "string (ISO 8601 format)"
}
```

### Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | string | Yes | Unique identifier for the student |
| `company_id` | string | Yes | Unique identifier for the company |
| `project_id` | string | Yes | Unique identifier for the project |
| `task_id` | string | Yes | Unique identifier for the task |
| `task_title` | string | Yes | Title of the task |
| `task_description` | string | No | Detailed description of the task |
| `question` | string | Yes | The student's question about the task |
| `context.project_title` | string | Yes | Title of the parent project |
| `context.project_description` | string | No | Description of the parent project |
| `context.existing_topics` | array | No | Array of existing topic titles for this task |
| `context.tech_stack` | array | No | Technologies used in the project |
| `timestamp` | string | Yes | When the request was made (ISO 8601) |

### Example Request
```json
{
  "student_id": "123e4567-e89b-12d3-a456-426614174000",
  "company_id": "987fcdeb-51a2-43f1-b456-426614174111",
  "project_id": "proj_001",
  "task_id": "task_setup_001",
  "task_title": "Setup Project Structure",
  "task_description": "Initialize the project with proper folder structure and configuration",
  "question": "Teach me about project structure best practices",
  "context": {
    "project_title": "E-commerce Platform",
    "project_description": "Build a full-stack e-commerce application",
    "existing_topics": [
      "Introduction to React",
      "Setting up Node.js backend"
    ],
    "tech_stack": ["React", "Node.js", "MongoDB", "Express"]
  },
  "timestamp": "2025-11-18T10:30:00.000Z"
}
```

---

## Response Structure

### Success Response (200 OK)

```json
{
  "success": true,
  "topic": {
    "id": "string (UUID)",
    "title": "string",
    "content": "string (markdown formatted)",
    "metadata": {
      "sources_count": "number",
      "generated_at": "string (ISO 8601)",
      "confidence_score": "number (0-1)",
      "related_topics": ["string"]
    },
    "sections": [
      {
        "heading": "string",
        "content": "string"
      }
    ],
    "resources": [
      {
        "type": "string (video|documentation|article|tutorial)",
        "title": "string",
        "url": "string",
        "duration": "string (optional, for videos)"
      }
    ]
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `topic.id` | string | Unique identifier for the generated topic |
| `topic.title` | string | Auto-generated title based on the question |
| `topic.content` | string | Full explanation content (markdown with \n\n for paragraphs) |
| `topic.metadata.sources_count` | number | Number of sources reviewed |
| `topic.metadata.generated_at` | string | When the content was generated (ISO 8601) |
| `topic.metadata.confidence_score` | number | AI confidence score (0-1) |
| `topic.metadata.related_topics` | array | Array of related topic titles |
| `topic.sections` | array | Structured sections of the content |
| `topic.sections[].heading` | string | Section heading |
| `topic.sections[].content` | string | Section content |
| `topic.resources` | array | Additional learning resources |
| `topic.resources[].type` | string | Type of resource (video, documentation, article, tutorial) |
| `topic.resources[].title` | string | Resource title |
| `topic.resources[].url` | string | Resource URL |
| `topic.resources[].duration` | string | Duration (optional, for videos) |

### Example Success Response
```json
{
  "success": true,
  "topic": {
    "id": "topic_9f8e7d6c5b4a3210",
    "title": "Project Structure Best Practices",
    "content": "Understanding Project Structure\n\nA well-organized project structure is the foundation of maintainable software. Let me break this down into digestible sections:\n\nCore Principles:\nEvery successful project starts with a clear separation of concerns. This means organizing your code so that each part has a specific responsibility and purpose.\n\nFolder Organization:\nIn a modern React/Node.js application, you typically want to separate your frontend and backend code. The frontend usually lives in a 'client' or 'src' directory, while the backend goes in a 'server' or 'api' folder.\n\nBest Practices:\n• Keep related files close together\n• Use consistent naming conventions\n• Separate concerns (components, utilities, services)\n• Create a logical hierarchy\n• Document your structure in README\n\nCommon Structure:\n```\nproject-root/\n├── client/\n│   ├── src/\n│   │   ├── components/\n│   │   ├── pages/\n│   │   ├── hooks/\n│   │   ├── utils/\n│   │   └── styles/\n│   └── public/\n├── server/\n│   ├── controllers/\n│   ├── models/\n│   ├── routes/\n│   ├── middleware/\n│   └── config/\n├── shared/\n│   └── types/\n└── README.md\n```\n\nImplementation Tips:\n1. Start with the basics and expand as needed\n2. Don't over-engineer early on\n3. Refactor as patterns emerge\n4. Keep configuration files at the root\n5. Use environment variables for sensitive data\n\nNext Steps:\nOnce your structure is in place, focus on establishing coding standards and documentation practices that your team will follow throughout development.",
    "metadata": {
      "sources_count": 12,
      "generated_at": "2025-11-18T10:30:15.234Z",
      "confidence_score": 0.94,
      "related_topics": [
        "Setting up configuration files",
        "Environment variables management",
        "Monorepo vs Polyrepo"
      ]
    },
    "sections": [
      {
        "heading": "Introduction",
        "content": "A well-organized project structure is the foundation of maintainable software."
      },
      {
        "heading": "Core Principles",
        "content": "Every successful project starts with a clear separation of concerns."
      },
      {
        "heading": "Folder Organization",
        "content": "In a modern React/Node.js application, you typically want to separate your frontend and backend code."
      },
      {
        "heading": "Best Practices",
        "content": "Keep related files close together, use consistent naming conventions, separate concerns..."
      },
      {
        "heading": "Implementation Tips",
        "content": "Start with the basics and expand as needed, don't over-engineer early on..."
      }
    ],
    "resources": [
      {
        "type": "video",
        "title": "React Project Structure Tutorial",
        "url": "https://youtube.com/watch?v=example",
        "duration": "15:30"
      },
      {
        "type": "documentation",
        "title": "React Official Documentation - Project Structure",
        "url": "https://react.dev/learn/project-structure"
      },
      {
        "type": "article",
        "title": "Best Practices for Node.js Project Structure",
        "url": "https://example.com/nodejs-structure"
      },
      {
        "type": "tutorial",
        "title": "Building Scalable Apps: Folder Structure Guide",
        "url": "https://example.com/scalable-structure"
      }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required field: question",
    "details": {
      "field": "question",
      "expected": "string"
    }
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Task not found",
    "details": {
      "task_id": "task_setup_001"
    }
  }
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retry_after": 60
    }
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An error occurred while generating the learning resource",
    "details": {
      "trace_id": "abc123xyz789"
    }
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Request body is malformed or missing required fields |
| `UNAUTHORIZED` | Authentication failed or token is invalid |
| `FORBIDDEN` | User doesn't have permission to access this resource |
| `RESOURCE_NOT_FOUND` | Requested task, project, or student not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests in a short time period |
| `AI_GENERATION_FAILED` | AI service failed to generate content |
| `INTERNAL_ERROR` | Unexpected server error |

---

## Content Formatting Guidelines

### The `content` Field
- Use `\n\n` to separate paragraphs
- Use markdown formatting for code blocks: ` ```language\ncode\n``` `
- Use bullet points with `•` or `-` for lists
- Keep paragraphs concise and readable
- Include practical examples where possible
- Structure content with clear sections

### Content Structure Recommendation
1. **Introduction/Overview** - Brief explanation of the topic
2. **Core Concepts** - Fundamental ideas and principles
3. **Implementation Details** - Step-by-step guidance
4. **Best Practices** - Industry standards and tips
5. **Common Pitfalls** - What to avoid
6. **Practical Examples** - Real-world scenarios
7. **Next Steps** - What to learn next

---

## Rate Limiting

- **Rate Limit**: 10 requests per minute per student
- **Burst Limit**: 3 requests per second
- **Daily Limit**: 100 requests per day per student

When rate limit is exceeded, the API returns a 429 status code with `retry_after` in seconds.

---

## Best Practices for Integration

1. **Handle Loading States**: Show a loading indicator while waiting for the response
2. **Error Handling**: Gracefully handle all error codes and show user-friendly messages
3. **Retry Logic**: Implement exponential backoff for retries on 5xx errors
4. **Caching**: Cache responses for identical questions to reduce API calls
5. **Optimistic Updates**: Update UI optimistically for better perceived performance
6. **Fallback Content**: Have fallback content ready if API is unavailable
7. **Timeout**: Set a reasonable timeout (e.g., 30 seconds) for API requests

---

## Frontend Implementation Notes

The frontend code in `page.tsx` includes:
- ✅ Complete request payload structure
- ✅ Fetch request with proper headers
- ✅ Response parsing and state management
- ✅ Error handling with fallback content
- ✅ TypeScript types for request/response

**To activate the API integration:**
Replace the placeholder endpoint on line 416:
```typescript
const API_ENDPOINT = "YOUR_BACKEND_ENDPOINT_HERE/api/learning-resources/generate"
```

With your actual backend endpoint:
```typescript
const API_ENDPOINT = "https://your-api.com/api/learning-resources/generate"
```

---

## Testing

### Test Request Example (cURL)
```bash
curl -X POST https://your-api.com/api/learning-resources/generate \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "123e4567-e89b-12d3-a456-426614174000",
    "company_id": "987fcdeb-51a2-43f1-b456-426614174111",
    "project_id": "proj_001",
    "task_id": "task_setup_001",
    "task_title": "Setup Project Structure",
    "task_description": "Initialize the project with proper folder structure",
    "question": "Teach me about project structure best practices",
    "context": {
      "project_title": "E-commerce Platform",
      "project_description": "Build a full-stack e-commerce application",
      "existing_topics": [],
      "tech_stack": ["React", "Node.js", "MongoDB"]
    },
    "timestamp": "2025-11-18T10:30:00.000Z"
  }'
```

---

## Database Schema Recommendation

### `learning_topics` Table
```sql
CREATE TABLE learning_topics (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  company_id UUID NOT NULL,
  project_id UUID NOT NULL,
  task_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  question TEXT NOT NULL,
  metadata JSONB,
  sections JSONB,
  resources JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE INDEX idx_learning_topics_task ON learning_topics(task_id);
CREATE INDEX idx_learning_topics_student ON learning_topics(student_id);
```

---

## Changelog

### Version 1.0.0 (2025-11-18)
- Initial API specification
- Complete request/response structure
- Error handling documentation
- Frontend integration ready

