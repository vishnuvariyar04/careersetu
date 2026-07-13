'use client';
import { useState } from 'react';

/* ================================================================
   DATA: ERD Tables
   ================================================================ */
const W = 270; // card width
const RH = 19; // row height
const HH = 26; // header height

interface Col { n: string; t: string; k?: string }
interface TDef { id: string; name: string; x: number; y: number; cols: Col[] }

const tables: TDef[] = [
  // ── Col 1: Student Domain ──
  { id:'students', name:'students', x:20, y:20, cols:[
    {n:'student_id',t:'uuid',k:'PK'},{n:'full_name',t:'text'},{n:'email',t:'text'},
    {n:'about',t:'text'},{n:'github_url',t:'text'},{n:'resume_url',t:'text'},{n:'created_at',t:'timestamptz'}
  ]},
  { id:'student_skills', name:'student_skills', x:20, y:195, cols:[
    {n:'id',t:'uuid',k:'PK'},{n:'student_id',t:'uuid',k:'FK'},{n:'skill_name',t:'text'},
    {n:'experience_level',t:'text'},{n:'repo_url',t:'text'},{n:'created_at',t:'timestamptz'}
  ]},
  { id:'experience', name:'experience', x:20, y:345, cols:[
    {n:'experience_id',t:'uuid',k:'PK'},{n:'student_id',t:'uuid',k:'FK'},{n:'company_name',t:'text'},
    {n:'role',t:'text'},{n:'exp_years',t:'interval'},{n:'technologies_used',t:'text[]'},
    {n:'description',t:'text'},{n:'created_at',t:'timestamptz'}
  ]},

  // ── Col 2: Environment Domain ──
  { id:'virtual_environments', name:'virtual_environments', x:310, y:20, cols:[
    {n:'environment_id',t:'uuid',k:'PK'},{n:'company_id',t:'uuid',k:'FK'},{n:'title',t:'text'},
    {n:'description',t:'text'},{n:'status',t:'text'},{n:'created_at',t:'timestamptz'},{n:'tech_stack',t:'text[]'}
  ]},
  { id:'environment_participants', name:'environment_participants', x:310, y:195, cols:[
    {n:'id',t:'uuid',k:'PK'},{n:'environment_id',t:'uuid',k:'FK'},{n:'student_id',t:'uuid',k:'FK'},
    {n:'joined_at',t:'timestamptz'}
  ]},
  { id:'tasks', name:'tasks', x:310, y:310, cols:[
    {n:'task_id',t:'uuid',k:'PK'},{n:'environment_id',t:'uuid',k:'FK'},{n:'title',t:'text'},
    {n:'description',t:'text'},{n:'task_order',t:'integer'},{n:'created_at',t:'timestamptz'}
  ]},

  // ── Col 3: Company + Progress ──
  { id:'companies', name:'companies', x:600, y:20, cols:[
    {n:'company_id',t:'uuid',k:'PK'},{n:'name',t:'text'},{n:'description',t:'text'},
    {n:'industry',t:'text'},{n:'created_at',t:'timestamptz'},{n:'mission',t:'text'},
    {n:'vision',t:'text'},{n:'employee_count',t:'integer'},{n:'evaluation_metrics',t:'text[]'},
    {n:'policies',t:'jsonb'},{n:'onboarding_advanced',t:'jsonb'}
  ]},
  { id:'task_progress', name:'task_progress', x:600, y:270, cols:[
    {n:'id',t:'uuid',k:'PK'},{n:'task_id',t:'uuid',k:'FK'},{n:'student_id',t:'uuid',k:'FK'},
    {n:'status',t:'text'},{n:'submission_url',t:'text'},{n:'feedback',t:'text'},{n:'updated_at',t:'timestamptz'}
  ]},
  { id:'pr_reviews', name:'pr_reviews', x:600, y:440, cols:[
    {n:'id',t:'uuid',k:'PK'},{n:'task_id',t:'uuid',k:'FK'},{n:'student_id',t:'uuid',k:'FK'},
    {n:'pr_url',t:'text'},{n:'ai_score',t:'integer'},{n:'created_at',t:'timestamptz'},
    {n:'repo_name',t:'text'},{n:'pr_number',t:'integer'},{n:'pr_title',t:'text'},
    {n:'ai_verdict',t:'text'},{n:'ai_summary',t:'text'},{n:'ai_issues',t:'jsonb'}
  ]},

  // ── Col 4: Repos + PM Agent ──
  { id:'supervisors', name:'supervisors', x:890, y:20, cols:[
    {n:'supervisor_id',t:'uuid',k:'PK'},{n:'company_id',t:'uuid',k:'FK'},{n:'full_name',t:'text'},
    {n:'designation',t:'text'},{n:'created_at',t:'timestamptz'}
  ]},
  { id:'github_repos', name:'github_repos', x:890, y:152, cols:[
    {n:'id',t:'uuid',k:'PK'},{n:'student_id',t:'uuid',k:'FK'},{n:'environment_id',t:'uuid',k:'FK'},
    {n:'repo_url',t:'text'},{n:'created_at',t:'timestamptz'}
  ]},
  { id:'pm_agent_sessions', name:'pm_agent_sessions', x:890, y:284, cols:[
    {n:'session_id',t:'uuid',k:'PK'},{n:'environment_id',t:'uuid',k:'FK'},{n:'student_id',t:'uuid',k:'FK'},
    {n:'created_at',t:'timestamptz'}
  ]},
  { id:'pm_agent_messages', name:'pm_agent_messages', x:890, y:393, cols:[
    {n:'id',t:'uuid',k:'PK'},{n:'session_id',t:'uuid',k:'FK'},{n:'role',t:'text'},
    {n:'content',t:'text'},{n:'created_at',t:'timestamptz'}
  ]},

  // ── Col 5: Learning Agent ──
  { id:'learning_sessions', name:'learning_sessions', x:1180, y:20, cols:[
    {n:'session_id',t:'uuid',k:'PK'},{n:'student_id',t:'uuid',k:'FK'},{n:'environment_id',t:'uuid',k:'FK'},
    {n:'context_type',t:'text'},{n:'title',t:'text'},{n:'created_at',t:'timestamptz'}
  ]},
  { id:'learning_messages', name:'learning_messages', x:1180, y:175, cols:[
    {n:'id',t:'uuid',k:'PK'},{n:'session_id',t:'uuid',k:'FK'},{n:'role',t:'text'},
    {n:'content',t:'text'},{n:'created_at',t:'timestamptz'}
  ]},
  { id:'learning_resources', name:'learning_resources', x:1180, y:310, cols:[
    {n:'id',t:'uuid',k:'PK'},{n:'student_id',t:'uuid',k:'FK'},{n:'environment_id',t:'uuid',k:'FK'},
    {n:'task_id',t:'uuid',k:'FK'},{n:'company_id',t:'uuid',k:'FK'},{n:'title',t:'text'},
    {n:'metadata',t:'jsonb'},{n:'created_at',t:'timestamptz'},{n:'updated_at',t:'timestamptz'}
  ]},

  // ── Bottom Row: Jobs + Analytics ──
  { id:'job_openings', name:'job_openings', x:20, y:730, cols:[
    {n:'id',t:'uuid',k:'PK'},{n:'company_id',t:'uuid',k:'FK'},{n:'title',t:'text'},
    {n:'description',t:'text'},{n:'required_skills',t:'text[]'},{n:'min_experience_level',t:'text'},
    {n:'job_type',t:'text'},{n:'location',t:'text'},{n:'status',t:'text'},
    {n:'created_at',t:'timestamptz'},{n:'updated_at',t:'timestamptz'}
  ]},
  { id:'job_applications', name:'job_applications', x:310, y:730, cols:[
    {n:'id',t:'uuid',k:'PK'},{n:'job_id',t:'uuid',k:'FK'},{n:'student_id',t:'uuid',k:'FK'},
    {n:'status',t:'text'},{n:'match_score',t:'integer'},{n:'match_reasons',t:'jsonb'},
    {n:'cover_letter',t:'text'},{n:'created_at',t:'timestamptz'},{n:'updated_at',t:'timestamptz'}
  ]},
  { id:'student_analytics_cache', name:'student_analytics_cache', x:600, y:730, cols:[
    {n:'id',t:'uuid',k:'PK'},{n:'student_id',t:'uuid',k:'FK'},{n:'environment_id',t:'uuid',k:'FK'},
    {n:'tasks_completed',t:'integer'},{n:'tasks_total',t:'integer'},{n:'avg_pr_score',t:'numeric(5,2)'},
    {n:'completion_rate',t:'numeric(5,2)'},{n:'overall_score',t:'numeric(5,2)'},{n:'rank',t:'integer'},
    {n:'top_skills',t:'text[]'},{n:'computed_at',t:'timestamptz'}
  ]},
];

function tH(t: TDef) { return HH + t.cols.length * RH + 4; }
function colY(t: TDef, ci: number) { return t.y + HH + ci * RH + RH / 2; }

/* ================================================================
   DATA: ERD Relationships
   ================================================================ */
interface Rel { from: string; fi: number; to: string; ti: number; label?: string }

const rels: Rel[] = [
  // student domain
  { from:'student_skills', fi:1, to:'students', ti:0 },
  { from:'experience', fi:1, to:'students', ti:0 },
  // environment domain
  { from:'virtual_environments', fi:1, to:'companies', ti:0 },
  { from:'environment_participants', fi:1, to:'virtual_environments', ti:0 },
  { from:'environment_participants', fi:2, to:'students', ti:0 },
  { from:'tasks', fi:1, to:'virtual_environments', ti:0 },
  // progress
  { from:'task_progress', fi:1, to:'tasks', ti:0 },
  { from:'task_progress', fi:2, to:'students', ti:0 },
  // repos
  { from:'github_repos', fi:1, to:'students', ti:0 },
  { from:'github_repos', fi:2, to:'virtual_environments', ti:0 },
  // reviews
  { from:'pr_reviews', fi:1, to:'tasks', ti:0 },
  { from:'pr_reviews', fi:2, to:'students', ti:0 },
  // supervisors
  { from:'supervisors', fi:1, to:'companies', ti:0 },
  // PM agent
  { from:'pm_agent_sessions', fi:1, to:'virtual_environments', ti:0 },
  { from:'pm_agent_sessions', fi:2, to:'students', ti:0 },
  { from:'pm_agent_messages', fi:1, to:'pm_agent_sessions', ti:0 },
  // learning agent
  { from:'learning_sessions', fi:1, to:'students', ti:0 },
  { from:'learning_sessions', fi:2, to:'virtual_environments', ti:0 },
  { from:'learning_messages', fi:1, to:'learning_sessions', ti:0 },
  { from:'learning_resources', fi:1, to:'students', ti:0 },
  { from:'learning_resources', fi:2, to:'virtual_environments', ti:0 },
  { from:'learning_resources', fi:3, to:'tasks', ti:0 },
  { from:'learning_resources', fi:4, to:'companies', ti:0 },
  // jobs
  { from:'job_openings', fi:1, to:'companies', ti:0 },
  { from:'job_applications', fi:1, to:'job_openings', ti:0 },
  { from:'job_applications', fi:2, to:'students', ti:0 },
  // analytics
  { from:'student_analytics_cache', fi:1, to:'students', ti:0 },
  { from:'student_analytics_cache', fi:2, to:'virtual_environments', ti:0 },
];

/* ================================================================
   DATA: Use Case Diagram (Overview)
   ================================================================ */
interface Actor { id: string; label: string; x: number; y: number }
interface UC { id: string; label: string; x: number; y: number; w?: number }
interface Conn { actor: string; uc: string }

const ucActors: Actor[] = [
  { id:'student', label:'Student', x:70, y:340 },
  { id:'company', label:'Company', x:1130, y:340 },
];

const aiAgents: Actor[] = [
  { id:'cr_agent', label:'Code Reviewer\nAgent', x:440, y:710 },
  { id:'pm_agent', label:'PM Agent', x:600, y:710 },
  { id:'learn_agent', label:'Learning\nAgent', x:760, y:710 },
];

const ucUseCases: UC[] = [
  // Student-side
  { id:'auth', label:'Authenticate via GitHub', x:290, y:80 },
  { id:'env', label:'Browse & Join Environments', x:290, y:160 },
  { id:'tasks', label:'Work on Tasks', x:290, y:240 },
  { id:'pr', label:'Submit Pull Request', x:290, y:320 },
  { id:'mentor', label:'Chat with AI Mentor', x:290, y:400 },
  { id:'learn', label:'Learn with AI Tutor', x:290, y:480 },
  { id:'jobs_s', label:'Browse & Apply for Jobs', x:290, y:560 },
  // Company-side
  { id:'onboard', label:'Register & Onboard', x:900, y:80 },
  { id:'create_env', label:'Create & Publish Environments', x:900, y:160 },
  { id:'monitor', label:'Monitor Student Progress', x:900, y:240 },
  { id:'analytics', label:'View Analytics Dashboard', x:900, y:320 },
  { id:'jobs_c', label:'Post Jobs & Review Applicants', x:900, y:400 },
  // Shared / AI-driven (center)
  { id:'review_code', label:'Review & Score Code', x:600, y:250 },
  { id:'guide', label:'Guide Task Progression', x:600, y:370 },
  { id:'teach', label:'Provide Learning Content', x:600, y:490 },
];

const ucConns: Conn[] = [
  // Student → left use cases
  {actor:'student',uc:'auth'},{actor:'student',uc:'env'},{actor:'student',uc:'tasks'},
  {actor:'student',uc:'pr'},{actor:'student',uc:'mentor'},{actor:'student',uc:'learn'},
  {actor:'student',uc:'jobs_s'},
  // Student → shared center
  {actor:'student',uc:'review_code'},{actor:'student',uc:'guide'},{actor:'student',uc:'teach'},
  // Company → right use cases
  {actor:'company',uc:'onboard'},{actor:'company',uc:'create_env'},{actor:'company',uc:'monitor'},
  {actor:'company',uc:'analytics'},{actor:'company',uc:'jobs_c'},
  // Company → shared center
  {actor:'company',uc:'review_code'},{actor:'company',uc:'monitor'},
  // AI agents → shared center
  {actor:'cr_agent',uc:'review_code'},{actor:'pm_agent',uc:'guide'},{actor:'learn_agent',uc:'teach'},
];

/* ================================================================
   COMPONENT: ERD Table Card
   ================================================================ */
function TableCard({ t }: { t: TDef }) {
  const h = tH(t);
  return (
    <div style={{
      position:'absolute', left:t.x, top:t.y, width:W, height:h,
      border:'1.5px solid #000', background:'#fff', fontFamily:'Consolas, monospace', fontSize:11,
    }}>
      <div style={{
        height:HH, display:'flex', alignItems:'center', justifyContent:'center',
        fontWeight:700, fontSize:12, borderBottom:'1.5px solid #000', background:'#f0f0f0',
        letterSpacing:0.5,
      }}>
        {t.name}
      </div>
      {t.cols.map((c, i) => (
        <div key={i} style={{
          height:RH, display:'flex', alignItems:'center', paddingLeft:6, paddingRight:6,
          borderBottom: i < t.cols.length-1 ? '0.5px solid #ccc' : 'none',
        }}>
          <span style={{ width:28, fontWeight:600, fontSize:9, color:'#555' }}>
            {c.k || ''}
          </span>
          <span style={{ flex:1, fontWeight: c.k==='PK' ? 600 : 400 }}>{c.n}</span>
          <span style={{ color:'#666', fontSize:10 }}>{c.t}</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   COMPONENT: ERD Relationship Line (improved visibility)
   ================================================================ */
function RelLine({ r }: { r: Rel }) {
  const ft = tables.find(t => t.id === r.from)!;
  const tt = tables.find(t => t.id === r.to)!;
  const fy = colY(ft, r.fi);
  const ty = colY(tt, r.ti);

  const fCx = ft.x + W / 2;
  const tCx = tt.x + W / 2;

  let x1: number, x2: number;
  if (fCx > tCx + W/2) {
    x1 = ft.x; x2 = tt.x + W;
  } else if (fCx < tCx - W/2) {
    x1 = ft.x + W; x2 = tt.x;
  } else {
    x1 = ft.x; x2 = tt.x;
  }

  const dx = Math.abs(x2 - x1);
  const cp = Math.max(dx * 0.4, 35);
  const cx1 = x1 + (x2 > x1 ? cp : -cp);
  const cx2 = x2 + (x2 > x1 ? -cp : cp);

  // Direction unit vector at each end for markers
  const dir = x2 > x1 ? 1 : -1;

  return (
    <g>
      {/* Main line — thick and visible */}
      <path
        d={`M${x1},${fy} C${cx1},${fy} ${cx2},${ty} ${x2},${ty}`}
        fill="none" stroke="#000" strokeWidth={1.8} />

      {/* ── FK end (source): crow's foot (many) ── */}
      <line x1={x1} y1={fy - 7} x2={x1} y2={fy + 7}
        stroke="#000" strokeWidth={2.2} />
      <line x1={x1} y1={fy - 6} x2={x1 + dir * 10} y2={fy}
        stroke="#000" strokeWidth={1.8} />
      <line x1={x1} y1={fy + 6} x2={x1 + dir * 10} y2={fy}
        stroke="#000" strokeWidth={1.8} />

      {/* ── PK end (target): filled circle (one) ── */}
      <circle cx={x2} cy={ty} r={4.5} fill="#000" />
      <line x1={x2 - dir * 10} y1={ty - 7} x2={x2 - dir * 10} y2={ty + 7}
        stroke="#000" strokeWidth={2.2} />
    </g>
  );
}

/* ================================================================
   COMPONENT: ERD Diagram
   ================================================================ */
function ERDDiagram() {
  const cW = 1500;
  const cH = 1010;
  return (
    <div style={{ padding:30 }}>
      <h2 style={{
        textAlign:'center', fontFamily:'Georgia, serif', fontSize:22, fontWeight:700,
        marginBottom:4, color:'#000', letterSpacing:1,
      }}>
        CareerSETU — Database Entity-Relationship Diagram
      </h2>
      <p style={{ textAlign:'center', fontFamily:'Georgia, serif', fontSize:13, color:'#555', marginBottom:20 }}>
        18 tables · Supabase (PostgreSQL) · Foreign key relationships shown with connector lines
      </p>
      <div style={{
        position:'relative', width:cW, height:cH, margin:'0 auto',
        border:'1px solid #ccc', background:'#fff',
      }}>
        {/* SVG overlay for lines */}
        <svg width={cW} height={cH} style={{ position:'absolute', top:0, left:0, pointerEvents:'none' }}>
          {rels.map((r, i) => <RelLine key={i} r={r} />)}
        </svg>
        {/* Table cards */}
        {tables.map(t => <TableCard key={t.id} t={t} />)}
      </div>
      {/* Legend */}
      <div style={{
        display:'flex', gap:30, justifyContent:'center', marginTop:16,
        fontFamily:'Consolas, monospace', fontSize:12, color:'#333',
      }}>
        <span><strong>PK</strong> = Primary Key</span>
        <span><strong>FK</strong> = Foreign Key</span>
        <span>● = Referenced table (one side)</span>
        <span>| = Referencing table (many side)</span>
      </div>
    </div>
  );
}

/* ================================================================
   COMPONENT: Use Case Stick Figure (larger)
   ================================================================ */
function StickFigure({ a, scale = 1 }: { a: Actor; scale?: number }) {
  const lines = a.label.split('\n');
  const s = scale;
  return (
    <g>
      <circle cx={a.x} cy={a.y - 32*s} r={12*s} fill="none" stroke="#000" strokeWidth={2} />
      <line x1={a.x} y1={a.y - 20*s} x2={a.x} y2={a.y + 10*s} stroke="#000" strokeWidth={2} />
      <line x1={a.x - 18*s} y1={a.y - 8*s} x2={a.x + 18*s} y2={a.y - 8*s} stroke="#000" strokeWidth={2} />
      <line x1={a.x} y1={a.y + 10*s} x2={a.x - 15*s} y2={a.y + 30*s} stroke="#000" strokeWidth={2} />
      <line x1={a.x} y1={a.y + 10*s} x2={a.x + 15*s} y2={a.y + 30*s} stroke="#000" strokeWidth={2} />
      {lines.map((l, i) => (
        <text key={i} x={a.x} y={a.y + 48*s + i * 16} textAnchor="middle"
          fontFamily="Arial, sans-serif" fontSize={13} fontWeight={700} fill="#000">
          {l}
        </text>
      ))}
    </g>
  );
}

/* ================================================================
   COMPONENT: Use Case Oval (larger text)
   ================================================================ */
function UCOval({ uc }: { uc: UC }) {
  const rx = Math.max(uc.label.length * 5.5, 90);
  const ry = 22;
  return (
    <g>
      <ellipse cx={uc.x} cy={uc.y} rx={rx} ry={ry}
        fill="#fff" stroke="#000" strokeWidth={1.5} />
      <text x={uc.x} y={uc.y + 5} textAnchor="middle"
        fontFamily="Arial, sans-serif" fontSize={13} fill="#000">
        {uc.label}
      </text>
    </g>
  );
}

/* ================================================================
   COMPONENT: Use Case Diagram (Overview)
   ================================================================ */
function UseCaseDiagram() {
  const svgW = 1200;
  const svgH = 800;

  const allActors = [...ucActors, ...aiAgents];

  return (
    <div style={{ padding:30 }}>
      <h2 style={{
        textAlign:'center', fontFamily:'Georgia, serif', fontSize:22, fontWeight:700,
        marginBottom:4, color:'#000', letterSpacing:1,
      }}>
        CareerSETU — Use Case Diagram
      </h2>
      <p style={{ textAlign:'center', fontFamily:'Georgia, serif', fontSize:13, color:'#555', marginBottom:20 }}>
        5 actors · 15 use cases · UML 2.0 notation
      </p>
      <div style={{ width: svgW + 20, margin: '0 auto', border:'1px solid #ccc', background:'#fff', padding:10 }}>
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>

          {/* ── System boundary ── */}
          <rect x={155} y={30} width={890} height={590} rx={10}
            fill="none" stroke="#000" strokeWidth={2} strokeDasharray="10,5" />
          <text x={600} y={58} textAnchor="middle"
            fontFamily="Georgia, serif" fontSize={18} fontWeight={700} fill="#000">
            CareerSETU Platform
          </text>

          {/* ── AI System box (bottom center) ── */}
          <rect x={350} y={640} width={500} height={150} rx={8}
            fill="none" stroke="#000" strokeWidth={1.8} strokeDasharray="6,3" />
          <text x={600} y={660} textAnchor="middle"
            fontFamily="Georgia, serif" fontSize={14} fontWeight={700} fill="#000">
            AI System
          </text>

          {/* ── Connection lines ── */}
          {ucConns.map((c, i) => {
            const a = allActors.find(ac => ac.id === c.actor)!;
            const u = ucUseCases.find(uc => uc.id === c.uc)!;
            let ax: number, ay: number;
            if (a.y > 600) {
              // AI agent — connect upward from head
              ax = a.x;
              ay = a.y - 45;
            } else {
              ax = a.x < 600 ? a.x + 20 : a.x - 20;
              ay = a.y - 5;
            }
            const ucRx = Math.max(u.label.length * 5.5, 90);
            let ux: number, uy: number;
            if (a.y > 600) {
              ux = u.x;
              uy = u.y + 22;
            } else if (a.x < 600) {
              ux = u.x - ucRx;
              uy = u.y;
            } else {
              ux = u.x + ucRx;
              uy = u.y;
            }
            return (
              <line key={i} x1={ax} y1={ay} x2={ux} y2={uy}
                stroke="#555" strokeWidth={1.2} />
            );
          })}

          {/* ── Use case ovals ── */}
          {ucUseCases.map(uc => <UCOval key={uc.id} uc={uc} />)}

          {/* ── Human actors (Student & Company) ── */}
          {ucActors.map(a => <StickFigure key={a.id} a={a} />)}

          {/* ── AI agent actors (inside AI box) ── */}
          {aiAgents.map(a => <StickFigure key={a.id} a={a} scale={0.85} />)}

        </svg>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function DiagramsPage() {
  const [tab, setTab] = useState<'erd' | 'usecase'>('erd');

  return (
    <div style={{ minHeight:'100vh', background:'#fff', color:'#000' }}>
      {/* Navigation */}
      <nav style={{
        display:'flex', justifyContent:'center', gap:0,
        borderBottom:'2px solid #000', padding:'16px 0 0 0', background:'#fff',
        position:'sticky', top:0, zIndex:10,
      }}>
        {(['erd', 'usecase'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'10px 32px', fontFamily:'Georgia, serif', fontSize:15,
            fontWeight: tab === t ? 700 : 400, cursor:'pointer',
            background: tab === t ? '#000' : '#fff',
            color: tab === t ? '#fff' : '#000',
            border:'2px solid #000', borderBottom:'none',
            borderRadius:'6px 6px 0 0', marginBottom:-2,
          }}>
            {t === 'erd' ? 'Entity-Relationship Diagram' : 'Use Case Diagram'}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div style={{ overflow:'auto', padding:'20px 0' }}>
        {tab === 'erd' ? <ERDDiagram /> : <UseCaseDiagram />}
      </div>
    </div>
  );
}
