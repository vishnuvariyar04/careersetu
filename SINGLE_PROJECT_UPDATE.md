# Single Project Update Summary

## Changes Made

Updated the code to work with a **single project** assumption where the `tasks` table has no `project_id` field.

---

## ✅ What Changed

### 1. **Removed `project_id` Filter**

**Before:**
```typescript
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('project_id', projectId)  // ❌ Field doesn't exist
  .order('task_order', { ascending: true })
```

**After:**
```typescript
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .order('task_order', { ascending: true })  // ✅ Fetch all tasks
```

### 2. **Simplified `fetchProjectTasks()`**

**Before:**
```typescript
const fetchProjectTasks = async (projectId: string) => {
  // ... fetch with project_id filter
}
```

**After:**
```typescript
const fetchProjectTasks = async () => {
  // ... fetch all tasks (no parameter needed)
}
```

### 3. **Updated `handleStartProject()`**

Removed `selectedProject` check and `project_id` filter:

```typescript
const handleStartProject = async () => {
  // No longer needs selectedProject
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'pending')
    .is('assignee', null)
    .in('role', roleFilter)
    .order('task_order', { ascending: true })
    .limit(1)
}
```

### 4. **Simplified useEffect Hook**

**Before:**
```typescript
useEffect(() => {
  if (selectedProject && mode === "project") {
    fetchProjectTasks(selectedProject)
  }
}, [selectedProject, mode])
```

**After:**
```typescript
useEffect(() => {
  if (mode === "project") {
    fetchProjectTasks()  // No project parameter
  }
}, [mode])
```

### 5. **Updated API Request Payload**

Removed `project_id` from learning resource generation request:

```typescript
const requestPayload = {
  student_id: params.student_id,
  company_id: params.company_id,
  // project_id: removed ❌
  task_id: activeTask.task_id,
  // ...
}
```

---

## 📊 Current Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
  idx SERIAL,
  task_id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  role VARCHAR NOT NULL,  -- 'frontend' or 'backend'
  status VARCHAR NOT NULL, -- 'pending', 'in_progress', 'completed'
  assignee VARCHAR,        -- student_id or NULL
  depends_on TEXT,         -- JSON string: "[]"
  description TEXT,
  steps TEXT,              -- JSON string array
  created_at TIMESTAMP,
  task_order INTEGER       -- 1, 2, 3...
);
```

**Key Points:**
- ✅ No `project_id` field
- ✅ All tasks belong to one project (E-Commerce Platform)
- ✅ Ordered by `task_order`

---

## 🎯 How It Works Now

### 1. **Initial Load**
```
User navigates to page
       ↓
Switches to "Project" mode
       ↓
Fetches ALL tasks from database
       ↓
Filters to show only assigned tasks in right panel
```

### 2. **Start Project Flow**
```
User clicks "Start Project"
       ↓
Query: Find first pending task for student's role
       ↓
Assign task to student (task_101)
       ↓
Update status to "in_progress"
       ↓
Refresh all tasks
       ↓
Show assigned task in right panel
```

### 3. **Task Display**
```
Right Panel shows:
- Only tasks where assignee = current student
- Ordered by task_order
- Shows title, role, status badges
```

---

## 📦 Example Data Flow

### Tasks in Database
```json
[
  {
    "task_id": "task_101",
    "title": "Implement login page UI",
    "role": "frontend",
    "status": "pending",
    "assignee": null,
    "task_order": 1
  },
  {
    "task_id": "task_102",
    "title": "Create authentication API",
    "role": "backend",
    "status": "pending",
    "assignee": null,
    "task_order": 2
  }
]
```

### After Frontend Student Clicks "Start Project"
```json
[
  {
    "task_id": "task_101",
    "title": "Implement login page UI",
    "role": "frontend",
    "status": "in_progress",     // ✅ Changed
    "assignee": "student_123",   // ✅ Changed
    "task_order": 1
  },
  {
    "task_id": "task_102",
    "title": "Create authentication API",
    "role": "backend",
    "status": "pending",
    "assignee": null,
    "task_order": 2
  }
]
```

### Right Panel Shows
```
Your Tasks:
✅ Implement login page UI
   [frontend] [in_progress]
```

---

## 🔄 Complete User Journey

1. **Page Load**
   - Shows E-Commerce Project in left sidebar
   - Click project → Switch to project mode

2. **Project Mode Activated**
   - Fetch all tasks from database
   - Check if student has any assigned tasks
   - No assigned tasks? → Show onboarding

3. **Onboarding Screen**
   ```
   Welcome to E-Commerce Platform
   [Features: Task-based | AI-Powered | Practice]
   
   Your role: Frontend
   
   [Start Project Button]
   ```

4. **Click "Start Project"**
   - Query: First pending task for "frontend" role
   - Found: task_101
   - Update: assignee = student_id, status = in_progress
   - Refresh tasks

5. **Task Assigned**
   - Right panel shows: "Implement login page UI"
   - Center shows: Task title + description
   - Bottom shows: Input bar for questions

6. **Learning Flow**
   - Student asks: "How do I create a login form?"
   - API generates learning content
   - Content appears in center panel
   - Click to view full explanation

---

## 🧪 Testing Instructions

### 1. Reset Database
```sql
-- Clear all assignments
UPDATE tasks SET assignee = NULL, status = 'pending';
```

### 2. Test Frontend Student
1. Navigate to page
2. Switch to "Project" mode
3. Verify onboarding shows
4. Click "Start Project"
5. Verify task_101 appears (first frontend task)

### 3. Test Backend Student
1. Change student role to "backend"
2. Reset tasks
3. Click "Start Project"
4. Verify task_102 appears (first backend task)

### 4. Test Fullstack Student
1. Change student role to "fullstack"
2. Reset tasks
3. Click "Start Project"
4. Verify EITHER task_101 OR task_102 appears (whichever has lower task_order)

---

## ⚠️ Important Notes

### Task Ordering
- Tasks are assigned in order of `task_order` field
- First available task with lowest `task_order` is assigned
- If task_order is same, database order determines which is first

### Role Filtering
- **Frontend student:** Gets only `role: "frontend"` tasks
- **Backend student:** Gets only `role: "backend"` tasks
- **Fullstack student:** Gets both frontend AND backend tasks

### Single Project Assumption
- All tasks in database belong to "E-Commerce Platform"
- No need to filter by project
- Future: Add `project_id` field when multiple projects needed

---

## 📝 API Request Changes

### Learning Resource Generation

**Removed field:**
```typescript
project_id: selectedProject  // ❌ Removed
```

**Request now sends:**
```json
{
  "student_id": "...",
  "company_id": "...",
  "task_id": "task_101",
  "task_title": "Implement login page UI",
  "task_description": "Create the main login component...",
  "question": "How do I create a login form?",
  "context": {
    "project_title": "E-Commerce Platform",
    "project_description": "...",
    "existing_topics": [],
    "tech_stack": ["React", "Node.js", ...]
  }
}
```

---

## ✅ Status

- [x] Removed all `project_id` references
- [x] Updated queries to fetch all tasks
- [x] Simplified task fetching logic
- [x] Updated API request payload
- [x] Updated documentation
- [x] No linter errors
- [x] Ready for testing

---

**Summary:** The code now works with a single project where all tasks in the database belong to the E-Commerce Platform. No `project_id` filtering is needed!

