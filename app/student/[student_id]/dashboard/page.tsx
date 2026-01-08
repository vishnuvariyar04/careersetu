"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Building2, 
  Search, 
  User, 
  LogOut, 
  LayoutGrid, 
  ArrowRight,
  Terminal,
  Activity,
  Code2,
  GitBranch,
  Filter,
  ChevronRight
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { storage, type StudentProgress } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import { signOut } from "@/lib/auth-helpers"
import { useStudentAuth } from "@/hooks/use-student-auth"

// --- 0. Professional Engineering Styles ---
const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    
    body {
      font-family: 'Inter', sans-serif;
      background-color: #171a1a;
      color: #e4e4e7;
    }
    
    .mono {
      font-family: 'JetBrains Mono', monospace;
    }
    
    /* --- TABLE STYLES UPDATED --- */
    th {
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 10px;
      color: #71717a; /* zinc-500 */
      
      /* INCREASED HEIGHT HERE */
      padding-top: 18px;    /* Added top padding */
      padding-bottom: 18px; /* Increased bottom padding */
      
      text-align: left;
      border-bottom: 1px solid rgba(255,255,255,0.05); /* Added separator for header */
    }
    
    td {
      padding-top: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      font-size: 13px;
      color: #d4d4d8; /* zinc-300 */
    }

    tr:last-child td {
      border-bottom: none;
    }
    
    tr:hover td {
      background-color: rgba(255,255,255,0.02);
    }
  `}</style>
)

// --- 1. UI Atoms ---

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-200 ${
      active 
        ? "bg-white/5 text-white border border-white/5" 
        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
)

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    inactive: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
    pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  }
  const s = status.toLowerCase() as keyof typeof styles
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wide ${styles[s] || styles.inactive}`}>
      {status}
    </span>
  )
}

// --- 2. Main Page Component ---

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState("companies")
  const [student, setStudent] = useState<any>()
  const [joinedCompanies, setJoinedCompanies] = useState<any[]>([])
  const [availableCompanies, setAvailableCompanies] = useState<any[]>([])
  const [exploreQuery, setExploreQuery] = useState("")
  
  const params = useParams()
  const router = useRouter()
  const studentId = params.student_id as string
  const isAuthorized = useStudentAuth(studentId)

  // --- Data Fetching Logic ---
  useEffect(() => {
    if (isAuthorized !== true) return
    ;(async () => {
      const { data: studentRow, error: studentError } = await supabase
        .from("students").select("*").eq("student_id", studentId).single()
      setStudent(studentRow)
      
      if (!studentError) {
        const joinedCompanyIds: string[] = studentRow?.companies_joined || []
        if (joinedCompanyIds.length > 0) {
          const { data: companiesData } = await supabase.from("companies").select("*").in("company_id", joinedCompanyIds)
          setJoinedCompanies(companiesData || [])
        } else { setJoinedCompanies([]) }
      }

      const { data: allCompanies } = await supabase.from('companies').select('*')
      if (allCompanies) {
        const joinedIds = Array.isArray(studentRow?.companies_joined) ? studentRow.companies_joined : []
        setAvailableCompanies(allCompanies.filter((c) => !joinedIds.includes(c.company_id || c.id)))
      }
    })()
  }, [studentId, isAuthorized])

  // --- Actions ---
  const handleJoinCompany = (companyId: string) => {
    (async () => {
      const { data: studentRow } = await supabase.from("students").select("companies_joined").eq("student_id", studentId).single();
      const currentCompanies = Array.isArray(studentRow?.companies_joined) ? studentRow.companies_joined : [];
      if (!currentCompanies.includes(companyId)) {
        await supabase.from("students").update({ companies_joined: [...currentCompanies, companyId] }).eq("student_id", studentId);
      }
    })();
    router.push(`/student/${studentId}/company/${companyId}/details`)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  // --- Filters ---
  const studentSkills: string[] = Array.isArray(student?.skills) ? student.skills : []
  const filteredCompanies = availableCompanies.filter((company) => {
    const q = exploreQuery.trim().toLowerCase()
    return q ? String(company?.name).toLowerCase().includes(q) : true
  })

  // Loading State
  if (isAuthorized === null || !student) return <div className="min-h-screen bg-[#171a1a]" />
  if (isAuthorized === false) return null

  return (
    <div className="min-h-screen flex bg-[#171a1a]">
      <GlobalStyles />

      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-white/5 bg-[#171a1a] flex flex-col fixed inset-y-0 z-50">
        <div className="h-14 flex items-center px-5 border-b border-white/5">
          <div className="flex items-center gap-3">
           
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Welcome, {student.name}</h3>
            </div>
          </div>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1">
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Main</span>
          </div>
          <NavItem 
            icon={Building2} 
            label="Virtual Companies" 
            active={activeTab === "companies"} 
            onClick={() => setActiveTab("companies")} 
          />
          <NavItem 
            icon={LayoutGrid} 
            label="Directory" 
            active={activeTab === "explore"} 
            onClick={() => setActiveTab("explore")} 
          />
          <div className="px-3 mt-6 mb-2">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Account</span>
          </div>
          <NavItem 
            icon={User} 
            label="Preferences" 
            active={activeTab === "profile"} 
            onClick={() => setActiveTab("profile")} 
          />
        </div>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleSignOut} className="flex items-center gap-2 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors w-full px-2 py-1">
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-[1600px] mx-auto p-8">
          
          {/* Header Area */}
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/5">
            <div>
              <h1 className="text-xl font-medium text-white mb-1">
                {activeTab === "companies" && "Your Virtual Companies"}
                {activeTab === "explore" && "Company Directory"}
                {activeTab === "profile" && "Account Settings"}
              </h1>
              <p className="text-xs text-zinc-500 mono">
                {activeTab === "companies" && `VIEWING ${joinedCompanies.length} ACTIVE ENVIRONMENTS`}
                {activeTab === "explore" && "AVAILABLE SIMULATIONS"}
                {activeTab === "profile" && `USER ID: ${studentId}`}
              </p>
            </div>
            
            {activeTab === "explore" && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <Input 
                  value={exploreQuery}
                  onChange={(e) => setExploreQuery(e.target.value)}
                  placeholder="Filter by name..." 
                  className="pl-9 bg-[#1c2020] border-white/5 text-xs w-64 h-8 rounded text-zinc-300 focus:border-white/20 placeholder:text-zinc-700"
                />
              </div>
            )}
          </div>

          {/* --- TAB: VIRTUAL COMPANIES (TABLE VIEW) --- */}
          {activeTab === "companies" && (
            <div className="w-full">
              {joinedCompanies.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-white/5 rounded bg-white/[0.01]">
                  <Terminal className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm mb-4">No virtual companies initialized.</p>
                  <Button onClick={() => setActiveTab("explore")} variant="outline" className="text-xs h-8 bg-transparent border-zinc-700 text-zinc-300 hover:bg-white/5">
                    Go to Directory
                  </Button>
                </div>
              ) : (
                <div className="w-full overflow-hidden rounded border border-white/5">
                  <table className="w-full">
                    <thead className="bg-[#1c2020]">
                      <tr>
                        <th className="pl-6">Company Name</th>
                        <th>Role / Stack</th>
                        <th>Status</th>
                        <th>Difficulty</th>
                        <th>Projects</th>
                        <th className="text-right pr-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#171a1a]">
                      {joinedCompanies.map((company) => (
                        <tr key={company.company_id} className="group cursor-pointer" onClick={() => router.push(`/student/${studentId}/company/${company.company_id}/details#project`)}>
                          <td className="pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-zinc-900 border border-white/5 rounded flex items-center justify-center text-xs font-bold text-zinc-400">
                                {company.logo}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                                  {company.name}
                                </div>
                                <div className="text-[10px] text-zinc-600 mono">ID: {company.company_id.slice(0,8)}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(company.requiredSkills) && company.requiredSkills.slice(0, 2).map((tech: any) => (
                                <span key={tech} className="text-[10px] bg-white/5 text-zinc-400 px-1.5 py-0.5 rounded mono border border-white/5">
                                  {tech}
                                </span>
                              ))}
                              {Array.isArray(company.requiredSkills) && company.requiredSkills.length > 2 && (
                                <span className="text-[10px] text-zinc-600 px-1 py-0.5 font-medium">+{company.requiredSkills.length - 2}</span>
                              )}
                            </div>
                          </td>
                          <td><StatusBadge status="Active" /></td>
                          <td className="text-zinc-400 text-xs capitalize">{company.difficulty}</td>
                          <td className="text-zinc-400 mono text-xs">{company.totalProjects || 0}</td>
                          <td className="text-right pr-6">
                            <button className="text-[11px] text-blue-400 hover:text-blue-300 font-medium uppercase tracking-wider flex items-center gap-1 justify-end">
                              Access <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* --- TAB: EXPLORE (TABLE VIEW) --- */}
          {activeTab === "explore" && (
            <div className="w-full overflow-hidden rounded border border-white/5">
              <table className="w-full">
                <thead className="bg-[#1c2020]">
                  <tr>
                    <th className="pl-6">Company</th>
                    <th>Required Stack</th>
                    <th>Match Score</th>
                    <th>Difficulty</th>
                    <th className="text-right pr-6">Initialize</th>
                  </tr>
                </thead>
                <tbody className="bg-[#171a1a]">
                  {filteredCompanies.map((company) => (
                    <tr key={company.company_id}>
                      <td className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-900 border border-white/5 rounded flex items-center justify-center text-xs font-bold text-zinc-500">
                            {company.logo}
                          </div>
                          <span className="text-sm font-medium text-white">{company.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {Array.isArray(company.requiredSkills) && company.requiredSkills.slice(0, 3).map((tech: any) => (
                            <span key={tech} className="text-[10px] text-zinc-500 mono">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600" style={{ width: '60%' }}></div>
                        </div>
                      </td>
                      <td className="text-xs text-zinc-400">{company.difficulty}</td>
                      <td className="text-right pr-6">
                        <Button 
                          onClick={() => handleJoinCompany(company.company_id)}
                          size="sm" 
                          variant="ghost"
                          className="h-7 text-[10px] bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10 uppercase tracking-wide"
                        >
                          Join
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* --- TAB: PROFILE (DEFINITION LIST) --- */}
          {activeTab === "profile" && (
            <div className="max-w-3xl">
              <div className="border border-white/5 rounded bg-[#171a1a]">
                <div className="px-6 py-4 bg-[#1c2020] border-b border-white/5">
                  <h3 className="text-sm font-medium text-white">Developer Profile</h3>
                </div>
                <div className="p-0">
                  <div className="grid grid-cols-3 border-b border-white/5">
                    <div className="col-span-1 p-6 border-r border-white/5 bg-[#1a1d1d]">
                      <span className="text-xs text-zinc-500 font-medium">FULL NAME</span>
                    </div>
                    <div className="col-span-2 p-6">
                      <span className="text-sm text-zinc-200">{student.name}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 border-b border-white/5">
                    <div className="col-span-1 p-6 border-r border-white/5 bg-[#1a1d1d]">
                      <span className="text-xs text-zinc-500 font-medium">EMAIL IDENTIFIER</span>
                    </div>
                    <div className="col-span-2 p-6">
                      <span className="text-sm text-zinc-200 mono">{student.email}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3">
                    <div className="col-span-1 p-6 border-r border-white/5 bg-[#1a1d1d]">
                      <span className="text-xs text-zinc-500 font-medium">TECHNICAL STACK</span>
                    </div>
                    <div className="col-span-2 p-6">
                      <div className="flex flex-wrap gap-2">
                        {studentSkills.map((s) => (
                          <span key={s} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] mono rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}