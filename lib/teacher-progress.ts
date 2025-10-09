export type LessonStatus = "not_started" | "in_progress" | "done"

export type Lesson = {
  id: string
  title: string
  status: LessonStatus
}

export type Quiz = {
  passed: boolean
  attempts: number
}

export type Module = {
  id: string
  title: string
  status: LessonStatus
  lessons: Lesson[]
  quiz: Quiz
}

export type SkillProgress = {
  skill: string
  modules: Module[]
  updatedAt: number
}

export type TeacherProgress = Record<string, SkillProgress>

function getKey(studentId: string, companyId: string) {
  return `teacherAgent.progress.${studentId}.${companyId}`
}

export function getProgress(studentId: string, companyId: string): TeacherProgress {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(getKey(studentId, companyId))
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function saveProgress(studentId: string, companyId: string, data: TeacherProgress) {
  if (typeof window === "undefined") return
  const stamped: TeacherProgress = Object.fromEntries(
    Object.entries(data).map(([skill, sp]) => [skill, { ...sp, updatedAt: Date.now() }])
  )
  localStorage.setItem(getKey(studentId, companyId), JSON.stringify(stamped))
}

export function getDefaultCurriculumForSkill(skill: string): Module[] {
  const s = (skill || "").toLowerCase()
  if (s === "react") {
    return [
      {
        id: "react_foundations",
        title: "Foundations",
        status: "not_started",
        lessons: [
          { id: "what_is_react", title: "What is React?", status: "not_started" },
          { id: "jsx", title: "JSX Basics", status: "not_started" },
        ],
        quiz: { passed: false, attempts: 0 },
      },
      {
        id: "components_state",
        title: "Components & State",
        status: "not_started",
        lessons: [
          { id: "components", title: "Functional Components", status: "not_started" },
          { id: "state", title: "State & Props", status: "not_started" },
        ],
        quiz: { passed: false, attempts: 0 },
      },
      {
        id: "hooks",
        title: "Core Hooks",
        status: "not_started",
        lessons: [
          { id: "use_state", title: "useState", status: "not_started" },
          { id: "use_effect", title: "useEffect", status: "not_started" },
        ],
        quiz: { passed: false, attempts: 0 },
      },
      {
        id: "patterns",
        title: "Patterns",
        status: "not_started",
        lessons: [
          { id: "lifting_state", title: "Lifting State", status: "not_started" },
          { id: "composition", title: "Composition", status: "not_started" },
        ],
        quiz: { passed: false, attempts: 0 },
      },
      {
        id: "capstone",
        title: "Capstone",
        status: "not_started",
        lessons: [
          { id: "build_app", title: "Build a Mini App", status: "not_started" },
        ],
        quiz: { passed: false, attempts: 0 },
      },
    ]
  }
  // Generic default
  return [
    {
      id: `${s}_foundations`,
      title: "Foundations",
      status: "not_started",
      lessons: [
        { id: `${s}_intro`, title: "Introduction", status: "not_started" },
        { id: `${s}_basics`, title: "Basics", status: "not_started" },
      ],
      quiz: { passed: false, attempts: 0 },
    },
    {
      id: `${s}_advanced`,
      title: "Advanced",
      status: "not_started",
      lessons: [
        { id: `${s}_patterns`, title: "Patterns", status: "not_started" },
        { id: `${s}_project`, title: "Mini Project", status: "not_started" },
      ],
      quiz: { passed: false, attempts: 0 },
    },
  ]
}

export function ensureSkillInitialized(
  studentId: string,
  companyId: string,
  skill: string
): { progress: TeacherProgress; modules: Module[] } {
  const current = getProgress(studentId, companyId)
  if (current[skill]) return { progress: current, modules: current[skill].modules }
  const modules = getDefaultCurriculumForSkill(skill)
  const next: TeacherProgress = {
    ...current,
    [skill]: { skill, modules, updatedAt: Date.now() },
  }
  saveProgress(studentId, companyId, next)
  return { progress: next, modules }
}

export function updateLesson(
  studentId: string,
  companyId: string,
  skill: string,
  moduleId: string,
  lessonId: string,
  status: LessonStatus
) {
  const current = getProgress(studentId, companyId)
  const sp = current[skill]
  if (!sp) return
  const modules = sp.modules.map((m) => {
    if (m.id !== moduleId) return m
    const lessons = m.lessons.map((l) => (l.id === lessonId ? { ...l, status } : l))
    const moduleStatus: LessonStatus = lessons.every((l) => l.status === "done")
      ? "done"
      : lessons.some((l) => l.status !== "not_started")
        ? "in_progress"
        : "not_started"
    return { ...m, lessons, status: moduleStatus }
  })
  saveProgress(studentId, companyId, { ...current, [skill]: { ...sp, modules, updatedAt: Date.now() } })
}

export function markQuiz(
  studentId: string,
  companyId: string,
  skill: string,
  moduleId: string,
  passed: boolean
) {
  const current = getProgress(studentId, companyId)
  const sp = current[skill]
  if (!sp) return
  const modules = sp.modules.map((m) =>
    m.id === moduleId ? { ...m, quiz: { passed, attempts: m.quiz.attempts + 1 } } : m
  )
  saveProgress(studentId, companyId, { ...current, [skill]: { ...sp, modules, updatedAt: Date.now() } })
}

export function computeReadiness(progress: TeacherProgress, requiredSkills: string[]): number {
  if (!requiredSkills || requiredSkills.length === 0) return 0
  let totalModules = 0
  let doneModules = 0
  for (const skill of requiredSkills) {
    const sp = progress[skill]
    if (!sp) continue
    for (const m of sp.modules) {
      totalModules += 1
      if (m.status === "done" && m.quiz.passed) doneModules += 1
    }
  }
  if (totalModules === 0) return 0
  return Math.round((doneModules / totalModules) * 100)
}


