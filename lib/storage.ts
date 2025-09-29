export interface Student {
  id: string
  name: string
  email: string
  avatar: string
  skills: string[]
  projects: Project[]
  overallScore: number
  totalProjects: number
  completedProjects: number
  activeProjects: number
  companiesJoined: string[]
  skillsLearned: number
  rank: number
  joinedDate: string
}

export interface Company {
  id: string
  name: string
  logo: string
  description: string
  projects: Project[]
  teams: Team[]
  requiredSkills: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  rating: number
  totalProjects: number
  activeProjects: number
}

export interface Project {
  id: string
  title: string
  description: string
  companyId: string
  teams: Team[]
  requiredSkills: string[]
  difficulty: "Easy" | "Medium" | "Hard"
  duration: string
  status: "active" | "completed" | "archived"
  maxTeamSize: number
}

export interface Team {
  id: string
  name: string
  projectId: string
  companyId: string
  members: TeamMember[]
  maxMembers: number
  requiredSkills: string[]
  status: "recruiting" | "active" | "completed"
}

export interface TeamMember {
  studentId: string
  role: string
  joinedDate: string
  status: "active" | "left"
  score?: number
}

export interface StudentProgress {
  studentId: string
  companyId: string
  projectId: string
  teamId?: string
  status: "joined" | "active" | "completed" | "left"
  score?: number
  role?: string
  joinedDate: string
  completedDate?: string
}

class StorageManager {
  private static instance: StorageManager

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  // Initialize with sample data
  initializeData(): void {
    if (typeof window === "undefined") return

    if (!localStorage.getItem("devflow_initialized")) {
      this.createSampleData()
      localStorage.setItem("devflow_initialized", "true")
    }
  }

  private createSampleData(): void {
    // Sample students
    const students: Student[] = [
      {
        id: "student_1",
        name: "Alex Johnson",
        email: "alex@example.com",
        avatar: "AJ",
        skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
        overallScore: 4.7,
        totalProjects: 8,
        completedProjects: 5,
        activeProjects: 3,
        companiesJoined: ["company_1", "company_2", "company_3"],
        skillsLearned: 12,
        rank: 15,
        joinedDate: "2024-11-01",
      },
      {
        id: "student_2",
        name: "Sarah Chen",
        email: "sarah@example.com",
        avatar: "SC",
        skills: ["Next.js", "Python", "MongoDB"],
        overallScore: 4.5,
        totalProjects: 6,
        completedProjects: 4,
        activeProjects: 2,
        companiesJoined: ["company_1", "company_2"],
        skillsLearned: 10,
        rank: 23,
        joinedDate: "2024-11-15",
      },
    ]

    // Sample companies
    const companies: Company[] = [
      {
        id: "company_1",
        name: "TechCorp Solutions",
        logo: "TC",
        description: "Leading fintech company building next-gen payment solutions",
        projects: [],
        teams: [],
        requiredSkills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
        difficulty: "Intermediate",
        rating: 4.8,
        totalProjects: 12,
        activeProjects: 8,
      },
      {
        id: "company_2",
        name: "InnovateLabs",
        logo: "IL",
        description: "AI-first startup creating intelligent automation tools",
        projects: [],
        teams: [],
        requiredSkills: ["Next.js", "Python", "AI/ML", "MongoDB"],
        difficulty: "Advanced",
        rating: 4.6,
        totalProjects: 8,
        activeProjects: 5,
      },
      {
        id: "company_3",
        name: "StartupHub",
        logo: "SH",
        description: "Early-stage company building social commerce platform",
        projects: [],
        teams: [],
        requiredSkills: ["React", "Express", "JavaScript", "MySQL"],
        difficulty: "Beginner",
        rating: 4.7,
        totalProjects: 6,
        activeProjects: 4,
      },
    ]

    // Sample projects
    const projects: Project[] = [
      {
        id: "project_1",
        title: "E-commerce Platform",
        description: "Build a modern e-commerce platform with React and Node.js",
        companyId: "company_1",
        teams: [],
        requiredSkills: ["React", "Node.js", "PostgreSQL"],
        difficulty: "Medium",
        duration: "6 weeks",
        status: "active",
        maxTeamSize: 4,
      },
      {
        id: "project_2",
        title: "Analytics Dashboard",
        description: "Create a real-time analytics dashboard with data visualization",
        companyId: "company_2",
        teams: [],
        requiredSkills: ["Next.js", "TypeScript", "D3.js"],
        difficulty: "Hard",
        duration: "8 weeks",
        status: "active",
        maxTeamSize: 3,
      },
      {
        id: "project_3",
        title: "Task Management Tool",
        description: "Develop a collaborative task management application",
        companyId: "company_3",
        teams: [],
        requiredSkills: ["React", "Express", "MongoDB"],
        difficulty: "Easy",
        duration: "4 weeks",
        status: "completed",
        maxTeamSize: 2,
      },
    ]

    // Sample teams
    const teams: Team[] = [
      {
        id: "team_1",
        name: "Alpha Squad",
        projectId: "project_1",
        companyId: "company_1",
        members: [
          {
            studentId: "student_1",
            role: "Backend Developer",
            joinedDate: "2024-12-01",
            status: "active",
            score: 4.8,
          },
        ],
        maxMembers: 4,
        requiredSkills: ["React", "Node.js"],
        status: "active",
      },
      {
        id: "team_2",
        name: "Beta Squad",
        projectId: "project_2",
        companyId: "company_2",
        members: [
          {
            studentId: "student_1",
            role: "Full Stack Developer",
            joinedDate: "2024-12-05",
            status: "active",
            score: 4.6,
          },
        ],
        maxMembers: 3,
        requiredSkills: ["Next.js", "TypeScript"],
        status: "active",
      },
    ]

    // Sample progress
    const progress: StudentProgress[] = [
      {
        studentId: "student_1",
        companyId: "company_1",
        projectId: "project_1",
        teamId: "team_1",
        status: "active",
        role: "Backend Developer",
        joinedDate: "2024-12-01",
        score: 4.8,
      },
      {
        studentId: "student_1",
        companyId: "company_2",
        projectId: "project_2",
        teamId: "team_2",
        status: "active",
        role: "Full Stack Developer",
        joinedDate: "2024-12-05",
        score: 4.6,
      },
    ]

    // Store in localStorage
    localStorage.setItem("devflow_students", JSON.stringify(students))
    localStorage.setItem("devflow_companies", JSON.stringify(companies))
    localStorage.setItem("devflow_projects", JSON.stringify(projects))
    localStorage.setItem("devflow_teams", JSON.stringify(teams))
    localStorage.setItem("devflow_progress", JSON.stringify(progress))
  }

  // Student methods
  getStudent(id: string): Student | null {
    if (typeof window === "undefined") return null
    const students = JSON.parse(localStorage.getItem("devflow_students") || "[]")
    return students.find((s: Student) => s.id === id) || null
  }

  getAllStudents(): Student[] {
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem("devflow_students") || "[]")
  }

  updateStudent(student: Student): void {
    if (typeof window === "undefined") return
    const students = this.getAllStudents()
    const index = students.findIndex((s) => s.id === student.id)
    if (index !== -1) {
      students[index] = student
      localStorage.setItem("devflow_students", JSON.stringify(students))
    }
  }

  // Company methods
  getCompany(id: string): Company | null {
    if (typeof window === "undefined") return null
    const companies = JSON.parse(localStorage.getItem("devflow_companies") || "[]")
    return companies.find((c: Company) => c.id === id) || null
  }

  getAllCompanies(): Company[] {
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem("devflow_companies") || "[]")
  }

  getStudentCompanies(studentId: string): Company[] {
    const student = this.getStudent(studentId)
    if (!student) return []

    const companies = this.getAllCompanies()
    return companies.filter((c) => student.companiesJoined.includes(c.id))
  }

  // Project methods
  getProject(id: string): Project | null {
    if (typeof window === "undefined") return null
    const projects = JSON.parse(localStorage.getItem("devflow_projects") || "[]")
    return projects.find((p: Project) => p.id === id) || null
  }

  getCompanyProjects(companyId: string): Project[] {
    if (typeof window === "undefined") return []
    const projects = JSON.parse(localStorage.getItem("devflow_projects") || "[]")
    return projects.filter((p: Project) => p.companyId === companyId)
  }

  // Team methods
  getTeam(id: string): Team | null {
    if (typeof window === "undefined") return null
    const teams = JSON.parse(localStorage.getItem("devflow_teams") || "[]")
    return teams.find((t: Team) => t.id === id) || null
  }

  getProjectTeams(projectId: string): Team[] {
    if (typeof window === "undefined") return []
    const teams = JSON.parse(localStorage.getItem("devflow_teams") || "[]")
    return teams.filter((t: Team) => t.projectId === projectId)
  }

  joinTeam(studentId: string, teamId: string, role: string): boolean {
    if (typeof window === "undefined") return false

    const teams = JSON.parse(localStorage.getItem("devflow_teams") || "[]")
    const teamIndex = teams.findIndex((t: Team) => t.id === teamId)

    if (teamIndex === -1) return false

    const team = teams[teamIndex]
    if (team.members.length >= team.maxMembers) return false

    // Check if student is already in team
    if (team.members.some((m: TeamMember) => m.studentId === studentId)) return false

    team.members.push({
      studentId,
      role,
      joinedDate: new Date().toISOString(),
      status: "active",
    })

    teams[teamIndex] = team
    localStorage.setItem("devflow_teams", JSON.stringify(teams))

    // Update progress
    const progress = this.getStudentProgress()
    progress.push({
      studentId,
      companyId: team.companyId,
      projectId: team.projectId,
      teamId: team.id,
      status: "active",
      role,
      joinedDate: new Date().toISOString(),
    })
    localStorage.setItem("devflow_progress", JSON.stringify(progress))

    return true
  }

  leaveTeam(studentId: string, teamId: string): boolean {
    if (typeof window === "undefined") return false

    const teams = JSON.parse(localStorage.getItem("devflow_teams") || "[]")
    const teamIndex = teams.findIndex((t: Team) => t.id === teamId)

    if (teamIndex === -1) return false

    const team = teams[teamIndex]
    const memberIndex = team.members.findIndex((m: TeamMember) => m.studentId === studentId)

    if (memberIndex === -1) return false

    team.members[memberIndex].status = "left"
    teams[teamIndex] = team
    localStorage.setItem("devflow_teams", JSON.stringify(teams))

    // Update progress
    const progress = this.getStudentProgress()
    const progressIndex = progress.findIndex((p: StudentProgress) => p.studentId === studentId && p.teamId === teamId)

    if (progressIndex !== -1) {
      progress[progressIndex].status = "left"
      localStorage.setItem("devflow_progress", JSON.stringify(progress))
    }

    return true
  }

  // Progress methods
  getStudentProgress(): StudentProgress[] {
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem("devflow_progress") || "[]")
  }

  getStudentProjectProgress(studentId: string): StudentProgress[] {
    const progress = this.getStudentProgress()
    return progress.filter((p: StudentProgress) => p.studentId === studentId)
  }

  getStudentTeam(studentId: string, projectId: string): string | null {
    const progress = this.getStudentProgress()
    const studentProgress = progress.find(
      (p: StudentProgress) => p.studentId === studentId && p.projectId === projectId && p.status === "active",
    )
    return studentProgress?.teamId || null
  }

  // Current user session
  setCurrentUser(studentId: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem("devflow_current_user", studentId)
  }

  getCurrentUser(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("devflow_current_user")
  }
}

export const storage = StorageManager.getInstance()
