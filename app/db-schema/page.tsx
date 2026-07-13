"use client"

import { useState, useMemo, useRef, useCallback, useEffect } from "react"
import {
  Database,
  Table2,
  Key,
  Link2,
  Search,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Shield,
  Layers,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  List,
  FileJson,
  Clock,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  GripVertical,
  LayoutGrid,
  GitBranch,
} from "lucide-react"

// ─── Schema Data ────────────────────────────────────────────────────────────

interface Column {
  name: string
  type: string
  nullable: boolean
  default?: string
  constraint?: string
  fk_target?: string
  check?: string
}

interface TableDef {
  name: string
  columns: Column[]
  notes?: string[]
  group: string
}

const TABLES: TableDef[] = [
  {
    name: "companies",
    group: "Core Identity",
    columns: [
      { name: "company_id", type: "uuid", nullable: false, constraint: "PK", fk_target: "auth.users(id)" },
      { name: "name", type: "text", nullable: false },
      { name: "description", type: "text", nullable: true },
      { name: "industry", type: "text", nullable: true },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
      { name: "mission", type: "text", nullable: true },
      { name: "vision", type: "text", nullable: true },
      { name: "employee_count", type: "integer", nullable: true },
      { name: "evaluation_metrics", type: "text[]", nullable: true, default: "'{}'" },
      { name: "policies", type: "jsonb", nullable: true },
      { name: "onboarding_advanced", type: "jsonb", nullable: true },
    ],
  },
  {
    name: "students",
    group: "Core Identity",
    columns: [
      { name: "student_id", type: "uuid", nullable: false, constraint: "PK", fk_target: "auth.users(id)" },
      { name: "full_name", type: "text", nullable: false },
      { name: "email", type: "text", nullable: false, constraint: "UNIQUE" },
      { name: "about", type: "text", nullable: true },
      { name: "github_url", type: "text", nullable: true },
      { name: "resume_url", type: "text", nullable: true },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
  {
    name: "supervisors",
    group: "Core Identity",
    columns: [
      { name: "supervisor_id", type: "uuid", nullable: false, constraint: "PK", fk_target: "auth.users(id)" },
      { name: "company_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "companies(company_id)" },
      { name: "full_name", type: "text", nullable: false },
      { name: "designation", type: "text", nullable: true },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
  {
    name: "student_skills",
    group: "Core Identity",
    columns: [
      { name: "id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "student_id", type: "uuid", nullable: false, constraint: "FK", fk_target: "students(student_id)" },
      { name: "skill_name", type: "text", nullable: false },
      { name: "experience_level", type: "text", nullable: true, default: "'beginner'", check: "beginner | intermediate | advanced" },
      { name: "repo_url", type: "text", nullable: true },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
  {
    name: "experience",
    group: "Core Identity",
    columns: [
      { name: "experience_id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "student_id", type: "uuid", nullable: false, constraint: "FK", fk_target: "students(student_id)" },
      { name: "company_name", type: "text", nullable: false },
      { name: "role", type: "text", nullable: false },
      { name: "exp_years", type: "interval", nullable: true },
      { name: "technologies_used", type: "text[]", nullable: true },
      { name: "description", type: "text", nullable: true },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
  {
    name: "virtual_environments",
    group: "Projects & Tasks",
    columns: [
      { name: "environment_id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "company_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "companies(company_id)" },
      { name: "title", type: "text", nullable: false },
      { name: "description", type: "text", nullable: true },
      { name: "status", type: "text", nullable: true, default: "'open'", check: "open | in_progress | completed" },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
      { name: "tech_stack", type: "text[]", nullable: true, default: "'{}'" },
    ],
  },
  {
    name: "environment_participants",
    group: "Projects & Tasks",
    columns: [
      { name: "id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "environment_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "virtual_environments(environment_id)" },
      { name: "student_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "students(student_id)" },
      { name: "joined_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
    notes: ["⚠ UNIQUE(environment_id) allows only one row per environment globally — likely unintended."],
  },
  {
    name: "tasks",
    group: "Projects & Tasks",
    columns: [
      { name: "task_id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "environment_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "virtual_environments(environment_id)" },
      { name: "title", type: "text", nullable: false },
      { name: "description", type: "text", nullable: true },
      { name: "task_order", type: "integer", nullable: false },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
  {
    name: "task_progress",
    group: "Projects & Tasks",
    columns: [
      { name: "id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "task_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "tasks(task_id)" },
      { name: "student_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "students(student_id)" },
      { name: "status", type: "text", nullable: true, default: "'locked'", check: "locked | unlocked | in_progress | submitted | approved" },
      { name: "submission_url", type: "text", nullable: true },
      { name: "feedback", type: "text", nullable: true },
      { name: "updated_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
  {
    name: "github_repos",
    group: "Projects & Tasks",
    columns: [
      { name: "id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "student_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "students(student_id)" },
      { name: "environment_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "virtual_environments(environment_id)" },
      { name: "repo_url", type: "text", nullable: true },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
  {
    name: "pr_reviews",
    group: "Code Reviews",
    columns: [
      { name: "id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "task_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "tasks(task_id)" },
      { name: "student_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "students(student_id)" },
      { name: "pr_url", type: "text", nullable: true },
      { name: "ai_score", type: "integer", nullable: true },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
      { name: "repo_name", type: "text", nullable: true },
      { name: "pr_number", type: "integer", nullable: true },
      { name: "pr_title", type: "text", nullable: true },
      { name: "ai_verdict", type: "text", nullable: true, check: "approved | changes_requested | rejected" },
      { name: "ai_summary", type: "text", nullable: true },
      { name: "ai_issues", type: "jsonb", nullable: true },
    ],
  },
  {
    name: "learning_sessions",
    group: "Learning",
    columns: [
      { name: "session_id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "student_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "students(student_id)" },
      { name: "environment_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "virtual_environments(environment_id)" },
      { name: "context_type", type: "text", nullable: false, check: "global | environment" },
      { name: "title", type: "text", nullable: true, default: "'New Session'" },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
  {
    name: "learning_messages",
    group: "Learning",
    columns: [
      { name: "id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "session_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "learning_sessions(session_id)" },
      { name: "role", type: "text", nullable: false, check: "student | agent | system" },
      { name: "content", type: "text", nullable: false },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
  {
    name: "learning_resources",
    group: "Learning",
    columns: [
      { name: "id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "student_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "students(student_id)" },
      { name: "environment_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "virtual_environments(environment_id)" },
      { name: "task_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "tasks(task_id)" },
      { name: "company_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "companies(company_id)" },
      { name: "title", type: "text", nullable: false },
      { name: "metadata", type: "jsonb", nullable: true, default: "'{}'" },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
      { name: "updated_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
  {
    name: "pm_agent_sessions",
    group: "PM Agent",
    columns: [
      { name: "session_id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "environment_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "virtual_environments(environment_id)" },
      { name: "student_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "students(student_id)" },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
  {
    name: "pm_agent_messages",
    group: "PM Agent",
    columns: [
      { name: "id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "session_id", type: "uuid", nullable: true, constraint: "FK", fk_target: "pm_agent_sessions(session_id)" },
      { name: "role", type: "text", nullable: false, check: "student | agent | system" },
      { name: "content", type: "text", nullable: false },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
  {
    name: "job_openings",
    group: "Recruitment",
    columns: [
      { name: "id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "company_id", type: "uuid", nullable: false, constraint: "FK", fk_target: "companies(company_id)" },
      { name: "title", type: "text", nullable: false },
      { name: "description", type: "text", nullable: true },
      { name: "required_skills", type: "text[]", nullable: true, default: "'{}'" },
      { name: "min_experience_level", type: "text", nullable: true, default: "'beginner'", check: "beginner | intermediate | advanced" },
      { name: "job_type", type: "text", nullable: true, default: "'internship'", check: "internship | full_time | part_time | contract" },
      { name: "location", type: "text", nullable: true },
      { name: "status", type: "text", nullable: true, default: "'open'", check: "open | closed | filled" },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
      { name: "updated_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
  {
    name: "job_applications",
    group: "Recruitment",
    columns: [
      { name: "id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "job_id", type: "uuid", nullable: false, constraint: "FK", fk_target: "job_openings(id)" },
      { name: "student_id", type: "uuid", nullable: false, constraint: "FK", fk_target: "students(student_id)" },
      { name: "status", type: "text", nullable: true, default: "'matched'", check: "matched | applied | shortlisted | interviewed | offered | rejected" },
      { name: "match_score", type: "integer", nullable: true },
      { name: "match_reasons", type: "jsonb", nullable: true, default: "'[]'" },
      { name: "cover_letter", type: "text", nullable: true },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
      { name: "updated_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
  {
    name: "student_analytics_cache",
    group: "Analytics",
    columns: [
      { name: "id", type: "uuid", nullable: false, constraint: "PK", default: "gen_random_uuid()" },
      { name: "student_id", type: "uuid", nullable: false, constraint: "FK", fk_target: "students(student_id)" },
      { name: "environment_id", type: "uuid", nullable: false, constraint: "FK", fk_target: "virtual_environments(environment_id)" },
      { name: "tasks_completed", type: "integer", nullable: true, default: "0" },
      { name: "tasks_total", type: "integer", nullable: true, default: "0" },
      { name: "avg_pr_score", type: "numeric(5,2)", nullable: true },
      { name: "completion_rate", type: "numeric(5,2)", nullable: true },
      { name: "overall_score", type: "numeric(5,2)", nullable: true },
      { name: "rank", type: "integer", nullable: true },
      { name: "top_skills", type: "text[]", nullable: true, default: "'{}'" },
      { name: "computed_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
  },
]

// ─── Relationship extraction ──────────────────────────────────────────

interface Relationship {
  from: string
  fromCol: string
  to: string
  toCol: string
}

function extractRelationships(): Relationship[] {
  const rels: Relationship[] = []
  for (const table of TABLES) {
    for (const col of table.columns) {
      if (col.constraint === "FK" && col.fk_target) {
        const match = col.fk_target.match(/(?:.*\.)?(\w+)\((\w+)\)/)
        if (match) {
          rels.push({ from: table.name, fromCol: col.name, to: match[1], toCol: match[2] })
        }
      }
    }
  }
  return rels
}

// ─── Color config ─────────────────────────────────────────────────────

const GROUP_COLORS: Record<string, { border: string; bg: string; text: string; badge: string; icon: string; hex: string; headerHex: string }> = {
  "Core Identity":    { border: "border-violet-500/30", bg: "bg-violet-500/5", text: "text-violet-400", badge: "bg-violet-500/20 text-violet-300", icon: "text-violet-400", hex: "#8b5cf6", headerHex: "#8b5cf620" },
  "Projects & Tasks": { border: "border-blue-500/30",   bg: "bg-blue-500/5",   text: "text-blue-400",   badge: "bg-blue-500/20 text-blue-300",   icon: "text-blue-400", hex: "#3b82f6", headerHex: "#3b82f620" },
  "Code Reviews":     { border: "border-amber-500/30",  bg: "bg-amber-500/5",  text: "text-amber-400",  badge: "bg-amber-500/20 text-amber-300", icon: "text-amber-400", hex: "#f59e0b", headerHex: "#f59e0b20" },
  "Learning":         { border: "border-emerald-500/30", bg: "bg-emerald-500/5", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300", icon: "text-emerald-400", hex: "#10b981", headerHex: "#10b98120" },
  "PM Agent":         { border: "border-cyan-500/30",   bg: "bg-cyan-500/5",   text: "text-cyan-400",   badge: "bg-cyan-500/20 text-cyan-300",   icon: "text-cyan-400", hex: "#06b6d4", headerHex: "#06b6d420" },
  "Recruitment":      { border: "border-rose-500/30",   bg: "bg-rose-500/5",   text: "text-rose-400",   badge: "bg-rose-500/20 text-rose-300",   icon: "text-rose-400", hex: "#f43f5e", headerHex: "#f43f5e20" },
  "Analytics":        { border: "border-orange-500/30", bg: "bg-orange-500/5", text: "text-orange-400", badge: "bg-orange-500/20 text-orange-300", icon: "text-orange-400", hex: "#f97316", headerHex: "#f9731620" },
}

function typeIcon(type: string) {
  if (type === "uuid") return <Key className="w-3 h-3" />
  if (type.includes("text")) return <Type className="w-3 h-3" />
  if (type.includes("integer") || type.includes("numeric")) return <Hash className="w-3 h-3" />
  if (type.includes("timestamp") || type.includes("interval")) return <Calendar className="w-3 h-3" />
  if (type.includes("boolean")) return <ToggleLeft className="w-3 h-3" />
  if (type.includes("[]")) return <List className="w-3 h-3" />
  if (type.includes("jsonb")) return <FileJson className="w-3 h-3" />
  return <Type className="w-3 h-3" />
}

// ─── Initial layout positions for the ER diagram ─────────────────────

const TABLE_W = 220
const ROW_H = 20
const HEADER_H = 36

function getTableHeight(t: TableDef) {
  return HEADER_H + t.columns.length * ROW_H + 8
}

// Hand-tuned layout that produces a clean ER diagram
function getInitialPositions(): Record<string, { x: number; y: number }> {
  return {
    // Row 1 — Core Identity (top)
    companies:                { x: 60,   y: 40 },
    students:                 { x: 360,  y: 40 },
    supervisors:              { x: 60,   y: 360 },
    student_skills:           { x: 360,  y: 310 },
    experience:               { x: 360,  y: 510 },

    // Row 2 — Projects & Tasks (middle)
    virtual_environments:     { x: 680,  y: 40 },
    environment_participants: { x: 680,  y: 280 },
    tasks:                    { x: 960,  y: 40 },
    task_progress:            { x: 960,  y: 280 },
    github_repos:             { x: 680,  y: 470 },

    // Row 3 — Code Reviews
    pr_reviews:               { x: 1240, y: 40 },

    // Row 4 — Learning (bottom-left)
    learning_sessions:        { x: 60,   y: 640 },
    learning_messages:        { x: 60,   y: 870 },
    learning_resources:       { x: 360,  y: 720 },

    // Row 5 — PM Agent (bottom-center)
    pm_agent_sessions:        { x: 680,  y: 680 },
    pm_agent_messages:        { x: 680,  y: 870 },

    // Row 6 — Recruitment (right)
    job_openings:             { x: 1240, y: 340 },
    job_applications:         { x: 1240, y: 640 },

    // Analytics
    student_analytics_cache:  { x: 960,  y: 520 },
  }
}

// ════════════════════════════════════════════════════════════════
// ER Diagram Component
// ════════════════════════════════════════════════════════════════

function ERDiagram({ tables, relationships }: { tables: TableDef[]; relationships: Relationship[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(getInitialPositions)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(0.7)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [hoveredTable, setHoveredTable] = useState<string | null>(null)
  const [hoveredRel, setHoveredRel] = useState<number | null>(null)

  // Filter relationships to only those between existing (visible) tables
  const tableNames = useMemo(() => new Set(tables.map(t => t.name)), [tables])
  const visibleRels = useMemo(
    () => relationships.filter(r => tableNames.has(r.from) && tableNames.has(r.to)),
    [relationships, tableNames]
  )

  // Canvas dimensions
  const canvasW = 1600
  const canvasH = 1200

  // Mouse handlers for dragging tables
  const handleTableMouseDown = useCallback((e: React.MouseEvent, tableName: string) => {
    e.stopPropagation()
    e.preventDefault()
    const pos = positions[tableName]
    if (!pos) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = (e.clientX - rect.left - pan.x) / zoom
    const my = (e.clientY - rect.top - pan.y) / zoom
    setDragOffset({ x: mx - pos.x, y: my - pos.y })
    setDragging(tableName)
  }, [positions, pan, zoom])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const mx = (e.clientX - rect.left - pan.x) / zoom
      const my = (e.clientY - rect.top - pan.y) / zoom
      setPositions(prev => ({ ...prev, [dragging]: { x: mx - dragOffset.x, y: my - dragOffset.y } }))
    } else if (isPanning) {
      const dx = e.clientX - panStart.x
      const dy = e.clientY - panStart.y
      setPanStart({ x: e.clientX, y: e.clientY })
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
    }
  }, [dragging, dragOffset, isPanning, panStart, pan, zoom])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
    setIsPanning(false)
  }, [])

  // Pan on background drag
  const handleBackgroundMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === "svg") {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [])

  // Zoom on wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.05 : 0.05
    setZoom(prev => Math.max(0.2, Math.min(2, prev + delta)))
  }, [])

  // Connection line computation
  const getConnectionPoints = useCallback((fromTable: string, toTable: string) => {
    const fromPos = positions[fromTable]
    const toPos = positions[toTable]
    if (!fromPos || !toPos) return null

    const fromDef = tables.find(t => t.name === fromTable)
    const toDef = tables.find(t => t.name === toTable)
    if (!fromDef || !toDef) return null

    const fromH = getTableHeight(fromDef)
    const toH = getTableHeight(toDef)

    // Center points
    const fromCx = fromPos.x + TABLE_W / 2
    const fromCy = fromPos.y + fromH / 2
    const toCx = toPos.x + TABLE_W / 2
    const toCy = toPos.y + toH / 2

    // Determine best exit/entry sides
    let x1: number, y1: number, x2: number, y2: number

    const dx = toCx - fromCx
    const dy = toCy - fromCy

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal connection
      if (dx > 0) {
        x1 = fromPos.x + TABLE_W; y1 = fromCy
        x2 = toPos.x; y2 = toCy
      } else {
        x1 = fromPos.x; y1 = fromCy
        x2 = toPos.x + TABLE_W; y2 = toCy
      }
    } else {
      // Vertical connection
      if (dy > 0) {
        x1 = fromCx; y1 = fromPos.y + fromH
        x2 = toCx; y2 = toPos.y
      } else {
        x1 = fromCx; y1 = fromPos.y
        x2 = toCx; y2 = toPos.y + toH
      }
    }

    return { x1, y1, x2, y2 }
  }, [positions, tables])

  const zoomIn = () => setZoom(prev => Math.min(2, prev + 0.15))
  const zoomOut = () => setZoom(prev => Math.max(0.2, prev - 0.15))
  const fitToView = () => { setZoom(0.7); setPan({ x: 0, y: 0 }) }

  // Tables related to the hovered table
  const relatedTables = useMemo(() => {
    if (!hoveredTable) return new Set<string>()
    const set = new Set<string>()
    for (const rel of visibleRels) {
      if (rel.from === hoveredTable) set.add(rel.to)
      if (rel.to === hoveredTable) set.add(rel.from)
    }
    return set
  }, [hoveredTable, visibleRels])

  return (
    <div className="relative w-full rounded-xl border border-white/10 bg-[#080b10] overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
        <button onClick={zoomIn} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={zoomOut} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={fitToView} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="mt-1 text-center text-[10px] text-white/30 font-mono">{Math.round(zoom * 100)}%</div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
        {Object.entries(GROUP_COLORS).map(([group, gc]) => (
          <div key={group} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: gc.hex }} />
            <span className="text-[10px] text-white/60">{group}</span>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleBackgroundMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ overflow: "hidden" }}
      >
        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0", width: canvasW, height: canvasH, position: "relative" }}>
          {/* SVG Connection Lines */}
          <svg
            width={canvasW}
            height={canvasH}
            style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.3)" />
              </marker>
              <marker id="arrowhead-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="rgba(139,92,246,0.8)" />
              </marker>
              <marker id="dot" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <circle cx="3" cy="3" r="2.5" fill="rgba(255,255,255,0.3)" />
              </marker>
              <marker id="dot-active" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <circle cx="3" cy="3" r="2.5" fill="rgba(139,92,246,0.8)" />
              </marker>
            </defs>
            {visibleRels.map((rel, i) => {
              const pts = getConnectionPoints(rel.from, rel.to)
              if (!pts) return null
              const { x1, y1, x2, y2 } = pts

              const isHighlighted = hoveredTable && (rel.from === hoveredTable || rel.to === hoveredTable)
              const isHoveredLine = hoveredRel === i
              const isDimmed = hoveredTable && !isHighlighted

              // Bezier control points
              const midX = (x1 + x2) / 2
              const midY = (y1 + y2) / 2
              const dx = Math.abs(x2 - x1)
              const dy = Math.abs(y2 - y1)
              let cp1x: number, cp1y: number, cp2x: number, cp2y: number

              if (dx > dy) {
                cp1x = x1 + (x2 - x1) * 0.4; cp1y = y1
                cp2x = x1 + (x2 - x1) * 0.6; cp2y = y2
              } else {
                cp1x = x1; cp1y = y1 + (y2 - y1) * 0.4
                cp2x = x2; cp2y = y1 + (y2 - y1) * 0.6
              }

              const path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`

              return (
                <g key={i}>
                  {/* Invisible fat hit area */}
                  <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={12}
                    style={{ pointerEvents: "stroke", cursor: "pointer" }}
                    onMouseEnter={() => setHoveredRel(i)}
                    onMouseLeave={() => setHoveredRel(null)}
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke={isHighlighted || isHoveredLine ? "rgba(139,92,246,0.6)" : isDimmed ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)"}
                    strokeWidth={isHighlighted || isHoveredLine ? 2.5 : 1.5}
                    strokeDasharray={isHighlighted || isHoveredLine ? "none" : "6 4"}
                    markerEnd={isHighlighted || isHoveredLine ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                    markerStart={isHighlighted || isHoveredLine ? "url(#dot-active)" : "url(#dot)"}
                    style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
                  />
                  {/* Label on hover */}
                  {isHoveredLine && (
                    <g>
                      <rect x={midX - 70} y={midY - 14} width={140} height={28} rx={6} fill="#1a1f2e" stroke="rgba(139,92,246,0.4)" strokeWidth={1} />
                      <text x={midX} y={midY + 4} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={10} fontFamily="monospace">
                        {rel.fromCol} → {rel.toCol}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Table Boxes */}
          {tables.map(table => {
            const pos = positions[table.name]
            if (!pos) return null
            const gc = GROUP_COLORS[table.group] || GROUP_COLORS["Core Identity"]
            const h = getTableHeight(table)
            const isHovered = hoveredTable === table.name
            const isRelated = relatedTables.has(table.name)
            const isDimmed = hoveredTable && !isHovered && !isRelated

            return (
              <div
                key={table.name}
                onMouseDown={(e) => handleTableMouseDown(e, table.name)}
                onMouseEnter={() => setHoveredTable(table.name)}
                onMouseLeave={() => setHoveredTable(null)}
                style={{
                  position: "absolute",
                  left: pos.x,
                  top: pos.y,
                  width: TABLE_W,
                  height: h,
                  opacity: isDimmed ? 0.2 : 1,
                  transition: dragging === table.name ? "none" : "opacity 0.2s, box-shadow 0.2s",
                  zIndex: dragging === table.name ? 100 : isHovered ? 50 : 1,
                }}
                className={`rounded-lg border select-none ${
                  isHovered ? "border-white/40 shadow-xl shadow-black/40" : isRelated ? "border-violet-500/40" : "border-white/15"
                } bg-[#0d1117] overflow-hidden cursor-grab active:cursor-grabbing`}
              >
                {/* Table header */}
                <div
                  className="flex items-center gap-2 px-3 h-[36px] border-b border-white/10"
                  style={{ backgroundColor: gc.headerHex }}
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: gc.hex }} />
                  <span className="text-[11px] font-bold text-white truncate flex-1">{table.name}</span>
                  <GripVertical className="w-3 h-3 text-white/20 shrink-0" />
                </div>

                {/* Columns */}
                <div className="px-1 py-1">
                  {table.columns.map(col => (
                    <div
                      key={col.name}
                      className="flex items-center gap-1.5 px-2 py-[3px] text-[10px] rounded hover:bg-white/5"
                    >
                      <span className="w-3 flex justify-center shrink-0">
                        {col.constraint === "PK" && <Key className="w-2.5 h-2.5 text-amber-400" />}
                        {col.constraint === "FK" && <Link2 className="w-2.5 h-2.5 text-blue-400" />}
                        {col.constraint === "UNIQUE" && <Shield className="w-2.5 h-2.5 text-violet-400" />}
                        {!col.constraint && <span className="w-2.5" />}
                      </span>
                      <span className={`font-mono truncate flex-1 ${
                        col.constraint === "PK" ? "text-amber-300 font-semibold" :
                        col.constraint === "FK" ? "text-blue-300" :
                        "text-white/70"
                      }`}>
                        {col.name}
                      </span>
                      <span className="font-mono text-[9px] text-white/30 shrink-0">{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40">
        <span>🖱 Drag tables to rearrange</span>
        <span>⇧ Scroll to zoom</span>
        <span>🖐 Drag background to pan</span>
        <span>Hover table to highlight connections</span>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// Card View (Original)
// ════════════════════════════════════════════════════════════════

function CardView({
  tables,
  relationships,
  search,
  setSearch,
  activeGroup,
  setActiveGroup,
  groups,
}: {
  tables: TableDef[]
  relationships: Relationship[]
  search: string
  setSearch: (s: string) => void
  activeGroup: string | null
  setActiveGroup: (g: string | null) => void
  groups: string[]
}) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set(TABLES.map(t => t.name)))
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  const filteredTables = useMemo(() => {
    let t = tables
    if (activeGroup) t = t.filter(x => x.group === activeGroup)
    if (search.trim()) {
      const q = search.toLowerCase()
      t = t.filter(x => x.name.toLowerCase().includes(q) || x.columns.some(c => c.name.toLowerCase().includes(q)))
    }
    return t
  }, [tables, search, activeGroup])

  const selectedTableData = useMemo(() => TABLES.find(t => t.name === selectedTable), [selectedTable])
  const selectedTableRels = useMemo(() => {
    if (!selectedTable) return []
    return relationships.filter(r => r.from === selectedTable || r.to === selectedTable)
  }, [selectedTable, relationships])

  const toggleExpand = (name: string) => {
    setExpandedTables(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <>
      {/* Group Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveGroup(null)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
            !activeGroup ? "bg-white/10 border-white/30 text-white" : "bg-transparent border-white/10 text-white/50 hover:text-white hover:border-white/20"
          }`}
        >All Tables</button>
        {groups.map(g => {
          const gc = GROUP_COLORS[g] || GROUP_COLORS["Core Identity"]
          return (
            <button key={g} onClick={() => setActiveGroup(activeGroup === g ? null : g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                activeGroup === g ? `${gc.badge} ${gc.border}` : "bg-transparent border-white/10 text-white/50 hover:text-white hover:border-white/20"
              }`}
            >{g}</button>
          )
        })}
      </div>

      <div className="flex gap-6">
        <div className={`flex-1 transition-all ${selectedTable ? 'max-w-[60%]' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTables.map(table => {
              const gc = GROUP_COLORS[table.group] || GROUP_COLORS["Core Identity"]
              const isExpanded = expandedTables.has(table.name)
              const isSelected = selectedTable === table.name
              const fkCount = table.columns.filter(c => c.constraint === "FK").length

              return (
                <div key={table.name} className={`rounded-xl border transition-all cursor-pointer hover:shadow-lg ${
                  isSelected ? `${gc.border} ${gc.bg} shadow-lg ring-1 ring-offset-0 ring-white/10` : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`} onClick={() => setSelectedTable(isSelected ? null : table.name)}>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <Table2 className={`w-4 h-4 ${gc.icon}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{table.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${gc.badge}`}>{table.group}</span>
                          <span className="text-[10px] text-white/40">{table.columns.length} cols</span>
                          {fkCount > 0 && <span className="text-[10px] text-white/40 flex items-center gap-0.5"><Link2 className="w-2.5 h-2.5" />{fkCount} FK</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleExpand(table.name) }} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-white/5 px-2 pb-2">
                      <div className="divide-y divide-white/5">
                        {table.columns.map(col => (
                          <div key={col.name} className="flex items-center gap-2 px-2 py-1.5 text-[12px]">
                            <span className="w-4 flex justify-center shrink-0">
                              {col.constraint === "PK" && <Key className="w-3 h-3 text-amber-400" />}
                              {col.constraint === "FK" && <Link2 className="w-3 h-3 text-blue-400" />}
                              {col.constraint === "UNIQUE" && <Shield className="w-3 h-3 text-violet-400" />}
                              {!col.constraint && <span className="w-3 h-3" />}
                            </span>
                            <span className={`font-mono flex-1 min-w-0 truncate ${
                              col.constraint === "PK" ? "text-amber-300 font-semibold" : col.constraint === "FK" ? "text-blue-300" : "text-white/80"
                            }`}>{col.name}</span>
                            <span className="flex items-center gap-1 text-white/40 shrink-0">
                              {typeIcon(col.type)}
                              <span className="font-mono text-[10px]">{col.type}</span>
                            </span>
                            {col.nullable && <span className="text-[9px] text-white/20 shrink-0">NULL</span>}
                          </div>
                        ))}
                      </div>
                      {table.notes?.map((note, i) => (
                        <div key={i} className="mx-2 mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 leading-relaxed">{note}</div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {filteredTables.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
              <Search className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No tables match your search.</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedTable && selectedTableData && (
          <div className="w-[40%] shrink-0 sticky top-24 self-start">
            <div className={`rounded-xl border ${(GROUP_COLORS[selectedTableData.group] || GROUP_COLORS["Core Identity"]).border} bg-[#0d1117] overflow-hidden`}>
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Table2 className={`w-5 h-5 ${(GROUP_COLORS[selectedTableData.group] || GROUP_COLORS["Core Identity"]).icon}`} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">{selectedTableData.name}</h2>
                    <p className="text-xs text-white/50">{selectedTableData.columns.length} columns · {selectedTableData.group}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTable(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto">
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Columns</h3>
                <div className="space-y-1">
                  {selectedTableData.columns.map(col => (
                    <div key={col.name} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors">
                      <span className="w-5 flex justify-center pt-0.5 shrink-0">
                        {col.constraint === "PK" && <Key className="w-3.5 h-3.5 text-amber-400" />}
                        {col.constraint === "FK" && <Link2 className="w-3.5 h-3.5 text-blue-400" />}
                        {col.constraint === "UNIQUE" && <Shield className="w-3.5 h-3.5 text-violet-400" />}
                        {!col.constraint && typeIcon(col.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[13px] text-white font-medium">{col.name}</span>
                          <span className="font-mono text-[11px] text-white/40">{col.type}</span>
                          {col.constraint && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                              col.constraint === "PK" ? "bg-amber-500/20 text-amber-300" :
                              col.constraint === "FK" ? "bg-blue-500/20 text-blue-300" :
                              col.constraint === "UNIQUE" ? "bg-violet-500/20 text-violet-300" :
                              "bg-white/10 text-white/60"
                            }`}>{col.constraint}</span>
                          )}
                          {!col.nullable && <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">NOT NULL</span>}
                        </div>
                        {col.default && <p className="text-[10px] text-white/30 mt-0.5 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Default: <span className="font-mono">{col.default}</span></p>}
                        {col.fk_target && <p className="text-[10px] text-blue-400/70 mt-0.5 flex items-center gap-1"><ArrowRight className="w-2.5 h-2.5" /> → {col.fk_target}</p>}
                        {col.check && <p className="text-[10px] text-emerald-400/70 mt-0.5 flex items-center gap-1"><Shield className="w-2.5 h-2.5" /> CHECK: {col.check}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedTableRels.length > 0 && (
                <div className="p-4 border-t border-white/10">
                  <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Relationships ({selectedTableRels.length})</h3>
                  <div className="space-y-2">
                    {selectedTableRels.map((rel, i) => {
                      const isOutgoing = rel.from === selectedTable
                      return (
                        <button key={i} onClick={(e) => { e.stopPropagation(); setSelectedTable(isOutgoing ? rel.to : rel.from) }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left">
                          <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${isOutgoing ? "bg-blue-500/10" : "bg-emerald-500/10"}`}>
                            <ArrowRight className={`w-3.5 h-3.5 ${isOutgoing ? "text-blue-400" : "text-emerald-400 rotate-180"}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] text-white font-medium truncate">{isOutgoing ? rel.to : rel.from}</p>
                            <p className="text-[10px] text-white/40 font-mono">{rel.fromCol} → {rel.toCol}</p>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${isOutgoing ? "bg-blue-500/20 text-blue-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                            {isOutgoing ? "references" : "referenced by"}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ════════════════════════════════════════════════════════════════
// Main Page
// ════════════════════════════════════════════════════════════════

export default function DbSchemaPage() {
  const [viewMode, setViewMode] = useState<"diagram" | "cards">("diagram")
  const [search, setSearch] = useState("")
  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  const relationships = useMemo(() => extractRelationships(), [])
  const groups = useMemo(() => Array.from(new Set(TABLES.map(t => t.group))), [])

  const stats = useMemo(() => ({
    tables: TABLES.length,
    columns: TABLES.reduce((sum, t) => sum + t.columns.length, 0),
    relationships: relationships.length,
    groups: groups.length,
  }), [relationships, groups])

  return (
    <div className="min-h-screen bg-[#0a0e14] text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0e14]/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">CareerSetu — Database Schema</h1>
              <p className="text-xs text-white/50">
                Supabase PostgreSQL · {stats.tables} tables · {stats.columns} columns · {stats.relationships} foreign keys
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg bg-white/5 border border-white/10 p-0.5">
              <button
                onClick={() => setViewMode("diagram")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "diagram" ? "bg-violet-500/20 text-violet-300 shadow-sm" : "text-white/50 hover:text-white"
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                Schema Diagram
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "cards" ? "bg-violet-500/20 text-violet-300 shadow-sm" : "text-white/50 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Card View
              </button>
            </div>

            {/* Search (cards only) */}
            {viewMode === "cards" && (
              <div className="relative w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tables or columns..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Tables", value: stats.tables, icon: Table2, color: "text-violet-400" },
            { label: "Columns", value: stats.columns, icon: Layers, color: "text-blue-400" },
            { label: "Foreign Keys", value: stats.relationships, icon: Link2, color: "text-amber-400" },
            { label: "Domains", value: stats.groups, icon: Shield, color: "text-emerald-400" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-white/50">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        {viewMode === "diagram" ? (
          <ERDiagram tables={TABLES} relationships={relationships} />
        ) : (
          <CardView
            tables={TABLES}
            relationships={relationships}
            search={search}
            setSearch={setSearch}
            activeGroup={activeGroup}
            setActiveGroup={setActiveGroup}
            groups={groups}
          />
        )}

        {/* Footer */}
        <div className="mt-8 pb-8 text-center">
          <p className="text-[11px] text-white/30">
            Auto-generated from <span className="font-mono">current_supabase_tables.txt</span> · {TABLES.length} tables · {relationships.length} relationships
          </p>
        </div>
      </div>
    </div>
  )
}
