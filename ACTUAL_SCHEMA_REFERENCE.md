# Actual Database Schema Reference

## Tasks Table Schema

Based on the actual database structure, here are the exact fields used:

### Task Object
```typescript
{
  idx: number,                    // Serial index
  task_id: string,                // Primary key (e.g., "task_101")
  title: string,                  // "Implement login page UI"
  role: "frontend" | "backend",   // Task role
  status: "pending" | "in_progress" | "completed",
  assignee: string | null,        // student_id when assigned
  depends_on: string,             // JSON string: "[]" or "[\"task_id\"]"
  description: string,            // Task description
  steps: string,                  // JSON string array of steps
  created_at: string,             // ISO timestamp
  task_order: number              // Order in project (1, 2, 3...)
}
```

**Note:** No `project_id` field. All tasks in the table belong to one project.

### Example Task
```json
{
  "idx": 0,
  "task_id": "task_101",
  "title": "Implement login page UI",
  "role": "frontend",
  "status": "pending",
  "assignee": null,
  "depends_on": "[]",
  "description": "Create the main login component using React and Tailwind.",
  "steps": "[\"Create Login.jsx component\", \"Add email and password input fields\", \"Add 'Login' button\", \"Style with Tailwind CSS\"]",
  "created_at": "2025-11-04 16:05:39.166818+00",
  "task_order": 1
}
```

---

## Projects Table Schema

Assumed structure based on implementation:

### Project Object
```typescript
{
  project_id: string,       // Primary key
  name: string,             // Project name
  description: string,      // Project description
  status: string,           // "active", "completed", etc.
  tech_stack: string[],     // Array of technologies
  company_id: string        // Foreign key
}
```

### Mock E-Commerce Project
```typescript
{
  project_id: "ecommerce-project",
  name: "E-Commerce Platform",
  description: "Build a full-stack e-commerce application with React and Express",
  status: "active",
  tech_stack: ["React", "Node.js", "MongoDB", "Express", "Tailwind CSS"]
}
```

---

## Team Members Table Schema

### Team Member Object
```typescript
{
  student_id: string,
  company_id: string,
  role: "frontend" | "backend" | "fullstack"
}
```

---

## Field Usage in Code

### Task Fields Used
- ✅ `task_id` - Primary identifier
- ✅ `title` - Display in UI
- ✅ `role` - Filter tasks by student role
- ✅ `status` - Track progress, display badges
- ✅ `assignee` - Assign to student, filter assigned tasks
- ✅ `description` - Show in task details section
- ✅ `task_order` - Order tasks in list
- ⚠️ `depends_on` - Not yet used (future: task dependencies)
- ⚠️ `steps` - Not yet used (future: step-by-step checklist)
- ⚠️ `created_at` - Not displayed

### Project Fields Used
- ✅ `project_id` - Primary identifier
- ✅ `name` - Display in UI
- ✅ `description` - Show in project details
- ✅ `status` - Display badge
- ✅ `tech_stack` - Show technology badges

---

## Important Notes

### 1. JSON String Fields
Both `depends_on` and `steps` are stored as JSON **strings**, not arrays:

```typescript
// ❌ Wrong
const steps = task.steps  // Returns string "[\"step1\", \"step2\"]"

// ✅ Correct
const steps = JSON.parse(task.steps)  // Returns ["step1", "step2"]
```

### 2. Assignee Field
- `null` = No one assigned (available task)
- `string` = Assigned to student with that ID

```typescript
// Check if task is assigned to current student
const isMyTask = task.assignee === studentId

// Check if task is available
const isAvailable = task.assignee === null
```

### 3. Task Status Values
```typescript
"pending"     // Not yet assigned/started
"in_progress" // Currently being worked on
"completed"   // Finished
```

### 4. Role-based Filtering
```typescript
// Frontend student
role === "frontend" → fetch only role: "frontend" tasks

// Backend student  
role === "backend" → fetch only role: "backend" tasks

// Fullstack student
role === "fullstack" → fetch BOTH "frontend" AND "backend" tasks
```

---

## Supabase Queries Used

### Fetch All Tasks (Single Project)
```typescript
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .order('task_order', { ascending: true })
```

### Assign Task to Student
```typescript
const { error } = await supabase
  .from('tasks')
  .update({ 
    assignee: studentId,
    status: 'in_progress'
  })
  .eq('task_id', taskId)
```

### Fetch First Available Task
```typescript
const { data: tasks, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('status', 'pending')
  .is('assignee', null)
  .in('role', ['frontend', 'backend'])  // or just ['frontend']
  .order('task_order', { ascending: true })
  .limit(1)
```

### Fetch Student Role
```typescript
const { data, error } = await supabase
  .from('team_members')
  .select('role')
  .eq('student_id', studentId)
  .eq('company_id', companyId)
  .single()
```

---

## Current Implementation Status

### ✅ Fully Implemented
- Task fetching by project
- Task assignment on "Start Project"
- Role-based task filtering
- Task status tracking
- Display assigned tasks only
- Task order preservation
- Real-time task updates

### ⚠️ Not Yet Implemented
- Parse and display `steps` field
- Check `depends_on` for task dependencies
- Task completion flow
- Auto-assign next task after completion
- Display `created_at` timestamp

---

## Testing with Real Data

### Sample SQL to Insert Test Tasks
```sql
-- Insert frontend task
INSERT INTO tasks (
  task_id, title, role, status, assignee, depends_on, 
  description, steps, task_order
) VALUES (
  'task_101',
  'Implement login page UI',
  'frontend',
  'pending',
  NULL,
  '[]',
  'Create the main login component using React and Tailwind.',
  '["Create Login.jsx component", "Add email and password input fields", "Add Login button", "Style with Tailwind CSS"]',
  1
);

-- Insert backend task
INSERT INTO tasks (
  task_id, title, role, status, assignee, depends_on,
  description, steps, task_order
) VALUES (
  'task_102',
  'Create authentication API',
  'backend',
  'pending',
  NULL,
  '[]',
  'Build login and register API endpoints.',
  '["Set up Express routes", "Create user model", "Implement JWT", "Add validation"]',
  2
);
```

---

## Schema Validation

All code has been updated to use **only** these fields:
- ✅ No references to non-existent fields
- ✅ All queries use correct column names
- ✅ Type safety maintained
- ✅ Mock data matches real schema
- ✅ Linter errors cleared

---

**Last Updated**: After schema clarification
**Schema Version**: 1.0 (Production)

