'use client'

import React, { useState, useRef, useEffect } from 'react';
import mermaid from 'mermaid';
import { motion, AnimatePresence, LayoutGroup, Variants } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createClient } from '@supabase/supabase-js'; 
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
// ... existing imports
// import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic'; // <--- ADD THIS

// ... existing imports

// --- DYNAMIC IMPORT FOR GRAPH ---
const ForceGraph = dynamic(() => import('@/components/ForceGraph'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-cyan-500 font-mono text-xs">INITIALIZING PHYSICS ENGINE...</div>
});
import { 
  Mic, ChevronRight, Share, Settings, Layout, Code2, Columns, 
  Volume2, VolumeX, Eye, Table as TableIcon, List, GitGraph, 
  Terminal, Cpu, AlertCircle, Loader2, Plus, MessageSquare, Menu, X,
  LogOut, User as UserIcon, Lock
} from 'lucide-react';

// --- External Imports ---
import { TalkingHead } from "../../lib/modules/talkinghead.mjs"; 
import { KokoroAdapter } from "../../lib/modules/KokoroAdapter.js"; 

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- SUPABASE SETUP ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- TYPES ---
type LayoutMode = 'CONCEPT_MODE' | 'SPLIT_MODE' | 'FOCUS_MODE' | 'VISUAL_MODE';
type VisualType = 'ARRAY' | 'TABLE' | 'KEY_VALUE' | 'MERMAID_FLOWCHART' | "NETWORK";

interface VisualState {
  type: VisualType;
  payload: any;
  caption: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string; 
  timestamp: number;
}

interface Session {
  session_id: string;
  title: string;
  created_at?: string;
}

type PlaybackAction = 
  | { type: 'SPEAK'; text: string }
  | { type: 'LAYOUT'; mode: LayoutMode }
  | { type: 'CODE'; code: string }
  | { type: 'CONCEPT'; title: string; text: string }
  | { type: 'VISUAL'; state: VisualState } 
  | { type: 'HIGHLIGHT'; code_to_highlight: string } 
  | { type: 'WAIT'; ms: number };

// --- CONFIGURATION ---
const ANIMATION_SPRING = { type: "spring", stiffness: 300, damping: 30 };
const MERMAID_ID_PREFIX = 'immersive-mermaid-';

// UI Animation Variants
const PANEL_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.98, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { opacity: 0, scale: 0.98, filter: "blur(10px)", transition: { duration: 0.2 } }
};

const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }
};

mermaid.initialize({ 
  startOnLoad: false, 
  theme: 'dark', 
  securityLevel: 'loose',
  fontFamily: 'monospace',
});

// --- SUB-COMPONENTS ---

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_return_url', window.location.href);
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href, 
          queryParams: {
            access_type: 'offline', 
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative bg-[#09090b] border border-white/10 w-full max-w-[380px] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Background Gradient */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/5 z-20">
              <X size={16}/>
            </button>

            <div className="p-8 pt-10 flex flex-col items-center text-center relative z-10">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                <img src="/images/outlrn-fav.png" alt="Outlrn Logo" className="w-14 h-14 relative z-10 drop-shadow-lg"/>
              </div>
              <h2 className="text-xl font-medium text-white tracking-tight mb-2">Authentication Required</h2>
              <p className="text-sm text-zinc-400 px-4 mb-8 leading-relaxed">Sign in to synchronize your sessions and access the interface.</p>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium">
                  {error}
                </motion.div>
              )}
              
              <button 
                onClick={handleGoogleLogin} disabled={loading}
                className="group hover:cursor-pointer w-full relative flex items-center justify-center gap-3 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl font-semibold text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
              >
                {loading ? <Loader2 className="animate-spin text-zinc-600" size={18}/> : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
              <p className="mt-6 text-[10px] text-zinc-600">By continuing, you agree to our Terms of Service.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const MermaidChart = ({ chart }: { chart: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
  const renderChart = async () => {
  if (!chart || !containerRef.current) return;

  // 1. Remove markdown
  let cleanChart = chart.replace(/```mermaid/g, '').replace(/```/g, '');

  // 2. Replace Non-Breaking Spaces (Causes "Parse error on line 2")
  cleanChart = cleanChart.replace(/\u00A0/g, ' ');

  // 3. FIX: Quote the Node Labels manually using Regex
  // Matches: AnyWord[ContentWithParens] and wraps Content in " "
  cleanChart = cleanChart.replace(/(\w+)\[(.*?)\]/g, (match, id, content) => {
    // If it's already quoted, leave it alone
    if (content.startsWith('"') && content.endsWith('"')) return match;
    return `${id}["${content}"]`;
  });

  cleanChart = cleanChart.replace(/-->\|([^"\|]+?)\|/g, '-->|"$1"|');

  setError(null);
  const id = `${MERMAID_ID_PREFIX}${Date.now()}`;
  try {
    const { svg } = await mermaid.render(id, cleanChart.trim());
    if (mounted) setSvgContent(svg);
  } catch (err) {
    console.error("Mermaid Render Error:", err);
    // ... error handling
  }
};
    renderChart();
    return () => { mounted = false; };
  }, [chart]);

  if (error) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden text-red-400 space-y-2">
         <div className="absolute inset-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] [background-size:16px_16px]" />
        <AlertCircle size={24} className="relative z-10" />
        <span className="text-xs font-mono relative z-10">{error}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />
      
      <motion.div 
        key={svgContent ? 'loaded' : 'loading'}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        ref={containerRef} 
        className="relative  z-10 w-full h-full flex items-center justify-center p-4 overflow-auto mermaid-container"
        dangerouslySetInnerHTML={{ __html: svgContent || '' }}
      />
    </div>
  );
};


const detectLanguage = (code: string): 'python' | 'javascript' => {
  if (!code) return 'python'; 
  const jsIndicators = ['const ', 'let ', 'var ', 'function ', '=>', 'console.log', '===', 'import React'];
  const pyIndicators = ['def ', 'import ', 'print(', 'class ', 'elif ', 'None', 'True', 'False'];
  let jsScore = 0;
  let pyScore = 0;
  jsIndicators.forEach(i => { if (code.includes(i)) jsScore++; });
  pyIndicators.forEach(i => { if (code.includes(i)) pyScore++; });
  return jsScore > pyScore ? 'javascript' : 'python';
};

const ArrayVisualizer = ({ payload }: { payload: any }) => {
  const data = payload?.data || [];
  const highlights = payload?.highlights || [];
  const pointers = payload?.pointers || {};
  const dimmed_indices = payload?.dimmed_indices || []; 

  return (
    <div className="relative flex-1 w-full flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden">
      
      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />

      {/* CONTENT CONTAINER */}
      <div className="relative z-10 w-full overflow-x-auto py-20 px-4 flex justify-center scrollbar-hide">
        <div className="flex gap-6">
          <AnimatePresence mode='popLayout'>
            {data.map((val: any, idx: number) => {
              const isHighlighted = highlights.includes(idx);
              const isDimmed = dimmed_indices.includes(idx);
              const activePointers = Object.entries(pointers)
                .filter(([_, ptrIdx]) => ptrIdx === idx)
                .map(([name]) => name);

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.5, y: 50, filter: 'blur(10px)' }}
                  animate={{ 
                    opacity: isDimmed ? 0.3 : 1, 
                    scale: isHighlighted ? 1.1 : 1,
                    y: 0,
                    filter: isDimmed ? 'blur(2px)' : 'blur(0px)'
                  }}
                  exit={{ opacity: 0, scale: 0, filter: 'blur(10px)' }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  key={`item-${idx}`} 
                  className="relative flex flex-col items-center group"
                >
                  {/* Pointers Section (Top) */}
                  <div className="h-8 w-full absolute -top-12 flex flex-col-reverse items-center">
                    <AnimatePresence>
                      {activePointers.map((p: string) => (
                        <motion.div 
                          key={p}
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.8 }}
                          className="flex flex-col items-center"
                        >
                           <span className="text-[10px] font-bold font-mono text-cyan-400 bg-cyan-950/80 backdrop-blur px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 shadow-lg border border-cyan-500/30">
                            {p}
                          </span>
                          <div className="w-0.5 h-3 bg-cyan-400" />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Memory Block */}
                  <div className={cn(
                    "w-20 h-20 flex items-center justify-center rounded-2xl border text-2xl font-bold font-mono shadow-xl transition-all duration-300 backdrop-blur-md",
                    isHighlighted 
                      ? "bg-cyan-500/10 border-cyan-400 text-cyan-50 shadow-[0_0_40px_rgba(6,182,212,0.2)] z-10" 
                      : "bg-[#151515]/60 border-white/5 text-gray-400 hover:bg-[#202020] hover:border-white/10"
                  )}>
                    {val}
                  </div>

                  {/* Index (Bottom) */}
                  <span className="mt-4 text-[10px] text-gray-600 font-mono group-hover:text-gray-400 transition-colors">
                    INDEX {idx}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const TableVisualizer = ({ payload }: { payload: any }) => {
  const headers = payload?.headers || [];
  const rows = payload?.rows || [];
  const highlight_row = payload?.highlight_row ?? -1;

  return (
    <div className="w-full h-full flex items-center justify-center p-8 bg-[#0a0a0a] relative overflow-hidden">
       {/* GRID BACKGROUND for Table */}
       <div className="absolute inset-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] [background-size:20px_20px]" />
       
       <motion.div 
         initial="hidden" animate="visible" variants={PANEL_VARIANTS}
         className="w-full max-w-4xl overflow-hidden rounded-2xl border border-white/5 bg-[#0e0e0e]/80 backdrop-blur-xl relative z-10 shadow-2xl"
       >
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-gray-500 uppercase font-mono text-xs tracking-wider border-b border-white/5">
                <tr>{headers.map((h: string, i: number) => <th key={i} className="px-6 py-4 font-semibold">{h}</th>)}</tr>
            </thead>
            <motion.tbody 
              variants={STAGGER_CONTAINER}
              initial="hidden"
              animate="visible"
              className="divide-y divide-white/5"
            >
                {rows.map((row: any[], i: number) => (
                <motion.tr 
                    variants={FADE_UP}
                    key={i} 
                    animate={{ 
                        backgroundColor: highlight_row === i ? 'rgba(6,182,212, 0.1)' : 'transparent',
                    }}
                    className="transition-colors hover:bg-white/5"
                >
                    {row.map((cell: any, j: number) => (
                    <td key={j} className={cn("px-6 py-4 font-mono text-gray-400", highlight_row === i && "text-cyan-200 font-bold")}>
                        {cell}
                    </td>
                    ))}
                </motion.tr>
                ))}
            </motion.tbody>
            </table>
        </div>
       </motion.div>
    </div>
  );
};

const CodeViewer = ({ code, highlightQuery }: { code: string, highlightQuery: string | null }) => {
  const language = detectLanguage(code);
  const codeLines = code.split('\n');

  return (
    <motion.div 
      key={code} 
      initial={{ opacity: 0, filter: 'blur(5px)' }} 
      animate={{ opacity: 1, filter: 'blur(0px)' }} 
      transition={{ duration: 0.3 }}
      className="text-sm font-mono h-full w-full"
    >
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1.5rem',
          background: 'transparent',
          height: '100%',
          fontSize: '13px',
          lineHeight: '1.6',
        }}
        showLineNumbers={true}
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '1em',
          color: '#6e7681', 
          textAlign: 'right'
        }}
        wrapLines={true}
        lineProps={(lineNumber) => {
          const style: React.CSSProperties = { display: 'block', width: '100%' };
          // Check for highlighting match
          if (highlightQuery) {
            const lineContent = codeLines[lineNumber - 1] || '';
            if (lineContent.includes(highlightQuery.trim())) {
              style.backgroundColor = 'rgba(6, 182, 212, 0.15)'; 
              style.borderLeft = '3px solid #22d3ee';
              style.marginLeft = '-3px'; 
              style.boxShadow = 'inset 0 0 20px rgba(6, 182, 212, 0.05)';
            }
          }
          return { style };
        }}
      >
        {code}
      </SyntaxHighlighter>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---

const ImmersiveLearningPlatform: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Core UI State
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('SPLIT_MODE');
  const [activeCode, setActiveCode] = useState("");
  const [highlightQuery, setHighlightQuery] = useState<string | null>(null);
  const [conceptData, setConceptData] = useState({ title: "Initializing System", text: "Establishing secure connection..." });
  const [visualData, setVisualData] = useState<VisualState>(null);
  const [subtitles, setSubtitles] = useState("");
  
  // Session State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null); 
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionHistories, setSessionHistories] = useState<Record<string, Message[]>>({});
  const [messages, setMessages] = useState<Message[]>([{ id: 'init', role: 'assistant', content: "System Online. Ready for input.", timestamp: Date.now() }]);

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); 
  const [isPlaying, setIsPlaying] = useState(false);        
  const [isTTSActive, setIsTTSActive] = useState(true);     
  const [avatarStatus, setAvatarStatus] = useState("Initializing...");

  // Refs
  const hasInitializedRef = useRef(false); 
  const avatarRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  
  const adapterRef = useRef<any>(null); 
  const currentVoiceIdRef = useRef<string>("af_bella"); 

  const codeContainerRef = useRef<HTMLDivElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const commandQueueRef = useRef<PlaybackAction[]>([]);
  const isExecutingRef = useRef(false);
  const subtitleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIC: Initialize App ---
  const fetchSessionsAndInit = async (userId: string) => {
    // 1. Fetch existing sessions from DB
    const { data: userSessions, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return;
    } 

    const existingSessions = userSessions || [];
    setSessions(existingSessions);

    // 2. Check URL for session_id
    const urlSessionId = searchParams.get('session_id');

    if (urlSessionId) {
      // Case A: URL has ID. Check if it exists.
      const exists = existingSessions.find(s => s.session_id === urlSessionId);

      if (exists) {
        // A1: Exists in DB -> Load it
        setActiveSessionId(urlSessionId);
        if (!sessionHistories[urlSessionId] && messages.length <= 1) {
            setMessages([{ id: 'init', role: 'assistant', content: "Session loaded.", timestamp: Date.now() }]);
        }
      } else {
        // A2: ID in URL but NOT in DB (Adoption Case for Guest -> User)
        setActiveSessionId(urlSessionId);
      }
    } else {
      // Case B: No URL ID -> "New Chat" State
      setActiveSessionId(null);
      setMessages([{ id: 'init', role: 'assistant', content: "New session. History will save after your first message.", timestamp: Date.now() }]);
      setActiveCode("");
      setConceptData({ title: "Ready", text: "Awaiting input..." });
      setVisualData(null);
    }
  };

  // --- LOGIC: Auth Check ---
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // 1. Initial Auth Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
         fetchSessionsAndInit(session.user.id);
      } else {
         // Guest Logic: Keep URL ID if exists, else NULL
         const urlId = searchParams.get('session_id');
         if (urlId) setActiveSessionId(urlId);
         else setActiveSessionId(null);
      }
    });

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setShowAuthModal(false);
        
        // Clean Hash
        if (window.location.hash && window.location.hash.includes('access_token')) {
              const cleanUrl = window.location.pathname + window.location.search;
              window.history.replaceState(null, '', cleanUrl);
        }

        // Restore Deep Link
        const returnUrl = localStorage.getItem('auth_return_url');
        if (returnUrl) {
            localStorage.removeItem('auth_return_url'); 
            const currentPath = window.location.href.split('#')[0];
            const targetPath = returnUrl.split('#')[0];
            if (currentPath !== targetPath) {
                window.location.href = returnUrl; 
                return; 
            }
        }
        
        fetchSessionsAndInit(session.user.id);
      } else {
        // Logout -> Reset to New Chat
        setSessions([]); 
        setActiveSessionId(null);
        window.history.replaceState(null, '', window.location.pathname); 
        setMessages([{ id: 'init', role: 'assistant', content: "Signed out. System reset.", timestamp: Date.now() }]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const requireAuth = () => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsSidebarOpen(false);
    hasInitializedRef.current = false; 
    window.location.href = "/learn";
  };

  // --- LOGIC: Sync Messages ---
  useEffect(() => {
    if(activeSessionId) {
        setSessionHistories(prev => ({
            ...prev,
            [activeSessionId]: messages
        }));
    }
  }, [messages, activeSessionId]);

  // --- LOGIC: UI Interaction ---
  const handleSwitchSession = (sessionId: string) => {
      if (isProcessing || isPlaying) return; 
      
      setActiveSessionId(sessionId);
      const newPath = `${window.location.pathname}?session_id=${sessionId}`;
      window.history.pushState(null, '', newPath);
      
      const history = sessionHistories[sessionId] || [];
      if (history.length === 0) {
          setMessages([{ id: Date.now().toString(), role: 'assistant', content: "Session loaded.", timestamp: Date.now() }]);
      } else {
          setMessages(history);
      }
      
      setActiveCode("");
      setConceptData({ title: "Session Resumed", text: "Context restored." });
      setVisualData(null);
  };

  const handleCreateSessionClick = () => {
      // Just reset UI to "New Chat" mode. Do NOT create DB row yet.
      if (isProcessing || isPlaying) return;
      
      setActiveSessionId(null);
      setMessages([{ id: 'init', role: 'assistant', content: "New session started.", timestamp: Date.now() }]);
      setActiveCode("");
      setConceptData({ title: "Ready", text: "Awaiting input..." });
      setVisualData(null);
      
      // Clear URL
      window.history.replaceState(null, '', window.location.pathname);
  };

  // --- SUBTITLES HELPER ---
  const setSubtitleText = (text: string) => {
      setSubtitles(prev => prev.length > 80 ? "..." + text + " " : prev + text + " ");
      if (subtitleTimerRef.current) clearTimeout(subtitleTimerRef.current);
      subtitleTimerRef.current = setTimeout(() => setSubtitles(""), 2000);
  };

  // --- SCROLLING ---
  useEffect(() => {
    if (highlightQuery && codeContainerRef.current) {
      const highlightedElement = codeContainerRef.current.querySelector('.highlight-active');
      if (highlightedElement) highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightQuery, activeCode]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, subtitles]);

  // --- AVATAR INIT ---
  useEffect(() => {
    if (headRef.current) return;
    const initAvatar = async () => {
      try {
        const head = new TalkingHead(avatarRef.current, {
          ttsEndpoint: "N/A", cameraView: "upper", mixerGainSpeech: 3, cameraRotateEnable: false
        });
        headRef.current = head;

        const adapter = new KokoroAdapter("https://ocellar-inclusively-delsie.ngrok-free.dev");
        adapterRef.current = adapter;
        
        try {
            await head.showAvatar({ url: "/avatars/david.glb", body: "F", avatarMood: "neutral" });
            head.setView(head.viewName, { cameraY: 0 });
            head.start();
            setAvatarStatus("Online");
            currentVoiceIdRef.current = "am_fenrir"; 
        } catch (innerErr) {
             console.warn("Avatar assets missing, running in headless mode", innerErr);
             setAvatarStatus("Headless Mode");
        }
      } catch (err: any) {
        setAvatarStatus("Offline");
      }
    };
    initAvatar();
    return () => { if (headRef.current) headRef.current.stop(); };
  }, []);

  // --- VISUAL RENDER HELPER ---
  const renderVisualContent = () => {
      if (!visualData) return null;
      switch (visualData.type) {
          case 'ARRAY': return <ArrayVisualizer payload={visualData.payload} />;
          case 'TABLE': return <TableVisualizer payload={visualData.payload} />;
          case 'MERMAID_FLOWCHART': return <MermaidChart chart={visualData.payload.chart} />;
          case 'NETWORK': 
            // The backend sends { visual_graph_data: { nodes:[], links:[] } }
            // So we pass visualData.payload directly if you structure it right in server.py
            // Assuming server.py sends: payload = { "nodes": [...], "links": [...] }
            return <ForceGraph data={visualData.payload} />;
          default: return null;
      }
  };

  const processQueue = async () => {
    if (isExecutingRef.current) return; 
    isExecutingRef.current = true;
    setIsPlaying(true);
    
    while (commandQueueRef.current.length > 0) {
      const action = commandQueueRef.current.shift(); 
      if (!action) break;

      switch (action.type) {
        case 'LAYOUT':
          setLayoutMode(action.mode);
          if (action.mode !== 'SPLIT_MODE' && action.mode !== 'FOCUS_MODE') setHighlightQuery(null);
          break;
        case 'CODE':
          setActiveCode(action.code.trim());
          setHighlightQuery(null); 
          break;
        case 'CONCEPT':
          setConceptData({ title: action.title, text: action.text });
          break;
        case 'VISUAL': 
          setVisualData(action.state);
          break;
        case 'HIGHLIGHT':
          setHighlightQuery(action.code_to_highlight);
          break;
        case 'WAIT':
          await new Promise(resolve => setTimeout(resolve, action.ms));
          break;
        case 'SPEAK':
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last.role === 'assistant') {
              return [...prev.slice(0, -1), { ...last, content: last.content + " " + action.text }];
            } else {
              return [...prev, { id: Date.now().toString(), role: 'assistant', content: action.text, timestamp: Date.now() }];
            }
          });
          
          if (isTTSActive && adapterRef.current && avatarStatus !== "Offline") {
              setSubtitles("");
              
              // Ensure Audio Context is Running
              if (headRef.current?.audioCtx?.state === 'suspended') await headRef.current.audioCtx.resume();
              
              await new Promise<void>((resolve) => {
                  try {
                      adapterRef.current.streamToAvatar(
                          headRef.current,
                          action.text,
                          currentVoiceIdRef.current,
                          null, // onChunk
                          (word: string) => setSubtitleText(word), // onSubtitle
                          () => { // onAllFinished
                              setSubtitles("");
                              resolve();
                          }
                      );
                  } catch (e) {
                      console.error("TTS Error", e);
                      resolve();
                  }
              });
          } else {
            // Fallback delay if TTS is off
            await new Promise(resolve => setTimeout(resolve, action.text.length * 50)); 
          }
          break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setIsPlaying(false);
    isExecutingRef.current = false;
  };

  const parseAndEnqueue = (line: string) => {
    if (!line.trim()) return;
    try {
      const cleanLine = line.replace(/^data: /, '');
      const data = JSON.parse(cleanLine);
      const map: Record<string, PlaybackAction> = {
        'speak': { type: 'SPEAK', text: data.text },
        'layout': { type: 'LAYOUT', mode: data.mode },
        'code': { type: 'CODE', code: data.content },
        'concept': { type: 'CONCEPT', title: data.title, text: data.text },
        'visual': { type: 'VISUAL', state: data.state },
        'highlight': { type: 'HIGHLIGHT', code_to_highlight: data.code_to_highlight }
      };
      
      if (map[data.type]) {
        commandQueueRef.current.push(map[data.type]);
        processQueue(); 
      }
    } catch (e) { console.warn("Parse Error:", line); }
  };

  // --- SEND MESSAGE LOGIC (LAZY CREATION) ---
  const handleSendMessage = async () => {
    if (!requireAuth()) return;
    if (!input.trim() || isProcessing) return;
    
    // UI Update (Optimistic)
    const currentInput = input;
    setInput('');
    setIsProcessing(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: currentInput, timestamp: Date.now() }]);
    setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: '', timestamp: Date.now() }]);

    let targetSessionId = activeSessionId;

    // LAZY CREATION CHECK: If no active session, create one NOW.
    if (!targetSessionId) {
        const newId = `session_${Date.now()}`;
        const newTitle = currentInput.slice(0, 30) + (currentInput.length > 30 ? '...' : '');
        
        // 1. Set State
        targetSessionId = newId;
        setActiveSessionId(newId);
        
        // 2. Update Sessions List UI
        const newSession: Session = { session_id: newId, title: newTitle, created_at: new Date().toISOString() };
        setSessions(prev => [newSession, ...prev]);
        
        // 3. Update URL
        const newPath = `${window.location.pathname}?session_id=${newId}`;
        window.history.replaceState(null, '', newPath);

        // 4. Save to DB
        await supabase.from('chat_sessions').insert({
            session_id: newId,
            user_id: user.id,
            title: newTitle
        });
    }

    try {
      const response = await fetch('http://localhost:8000/api/chat', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, session_id: targetSessionId })
      });
      
      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (value) buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        if (!done) buffer = lines.pop() || ""; else buffer = "";
        
        for (const line of lines) parseAndEnqueue(line);
        if (done) break;
      }
      if (buffer.trim()) parseAndEnqueue(buffer);
    } catch (error) { 
      console.error(error);
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "Connection disrupted.", timestamp: Date.now() }]);
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleTestSpeech = () => {
    if (!requireAuth()) return;
    if (isPlaying || avatarStatus !== "Online") return;
    commandQueueRef.current.push({
      type: 'SPEAK',
      text: "Audio check. Synchronization complete. Ready for input."
    });
    processQueue();
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] text-gray-300 font-sans overflow-hidden selection:bg-cyan-500/30 selection:text-white">
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* --- LEFT MENU BAR (SESSIONS) --- */}
      <motion.div 
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: isSidebarOpen ? 240 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        className="flex flex-col border-r border-white/5 bg-[#030303] relative z-30 overflow-hidden whitespace-nowrap"
      >
        <div className="p-4 border-b border-white/5">
            <button 
                onClick={handleCreateSessionClick}
                disabled={isProcessing || isPlaying}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[#111] hover:bg-[#1a1a1a] border border-white/10 rounded-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div className="p-1 rounded bg-cyan-900/20 group-hover:bg-cyan-500 text-cyan-500 group-hover:text-black transition-colors">
                    <Plus size={16} />
                </div>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">New Chat</span>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            <div className="px-3 py-2 text-[10px] font-mono text-gray-600 uppercase tracking-widest">History</div>
            {sessions.map(session => (
                <button
                    key={session.session_id}
                    onClick={() => handleSwitchSession(session.session_id)}
                    disabled={isProcessing || isPlaying}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors text-sm",
                        activeSessionId === session.session_id 
                            ? "bg-[#111] text-cyan-400 border border-white/5" 
                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
                    )}
                >
                    <MessageSquare size={14} className={activeSessionId === session.session_id ? "text-cyan-500" : "text-gray-600"} />
                    <span className="truncate">{session.title}</span>
                </button>
            ))}
        </div>

        <div className="p-4 border-t border-white/5 bg-[#050505]">
            {user ? (
               <div className="flex flex-col gap-3">
                   <div className="flex items-center gap-3 px-1">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-900 to-purple-900 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                          {user.email?.[0].toUpperCase()}
                       </div>
                       <div className="flex flex-col overflow-hidden">
                           <span className="text-xs font-medium text-gray-300 truncate w-32">{user.email}</span>
                           <span className="text-[10px] text-green-500">Connected</span>
                       </div>
                   </div>
                   <button 
                     onClick={handleLogout}
                     className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 px-1 py-1 rounded transition-colors"
                   >
                     <LogOut size={12} /> Sign Out
                   </button>
               </div>
            ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded border border-white/5 transition-colors flex items-center justify-center gap-2"
                >
                  <UserIcon size={12}/> Sign In
                </button>
            )}
        </div>
      </motion.div>

      {/* --- SIDEBAR (CHAT) --- */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-[30%] min-w-[340px] max-w-[450px] flex flex-col border-r border-white/5 relative z-20 bg-[#080808]/90 backdrop-blur-xl"
      >
        <div className="h-16 px-6 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 hover:bg-white/10 rounded-md text-gray-500 hover:text-white transition-colors"
                title={isSidebarOpen ? "Close Menu" : "Open Menu"}
            >
                {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${avatarStatus === "Online" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"}`} />
                <span className="text-[10px] font-mono tracking-[0.2em] text-gray-500 uppercase">SYS_ONLINE</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
              <button 
               onClick={handleTestSpeech}
               disabled={avatarStatus !== "Online" || isPlaying}
               className="px-2 py-1 bg-white/5 hover:bg-cyan-500/20 border border-white/10 rounded text-[10px] font-mono text-cyan-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:border-cyan-500/50"
              >
               TEST_AUDIO
              </button>
            <button 
              onClick={() => setIsTTSActive(!isTTSActive)} 
              className="p-2 hover:bg-white/5 rounded-full transition-colors group"
              title={isTTSActive ? "Mute Voice" : "Enable Voice"}
            >
              {isTTSActive ? <Volume2 size={16} className="text-cyan-500 group-hover:text-cyan-400" /> : <VolumeX size={16} className="text-gray-600" />}
            </button>
          </div>
        </div>

        {/* 3D Avatar Stage */}
        <div className="flex-none h-[280px] relative overflow-hidden bg-gradient-to-b from-black/20 to-[#080808]">
           {avatarStatus !== "Online" && (
             <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
                <span className="text-xs font-mono text-cyan-500 animate-pulse uppercase tracking-widest">{avatarStatus}</span>
             </div>
           )}
           <div ref={avatarRef} className="w-full h-full relative z-10" />
           <AnimatePresence>
             {subtitles && (
               <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none z-50"
               >
                  <span className="bg-black/60 text-cyan-50 px-4 py-2 rounded-2xl text-sm shadow-2xl backdrop-blur-xl border border-white/10 text-center leading-relaxed">
                    {subtitles}
                  </span>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Chat Transcript */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar scroll-smooth">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, x: msg.role === 'assistant' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}
            >
              <div className={cn(
                "max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed border shadow-md",
                msg.role === 'assistant' 
                  ? "bg-[#111] border-white/5 text-gray-200 rounded-tl-none" 
                  : "bg-cyan-950/20 border-cyan-500/20 text-cyan-100 rounded-tr-none"
              )}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 opacity-50">
                    <Terminal size={10} />
                    <span className="text-[10px] font-mono uppercase">Assistant</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          <div ref={transcriptEndRef} className="h-4" />
        </div>
      </motion.div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
        
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-[#080808]/50 backdrop-blur z-30">
          <div className="flex gap-1 bg-[#111] p-1 rounded-lg border border-white/5 shadow-inner">
            {[
              { id: 'CONCEPT_MODE', icon: Layout, label: 'Concept' },
              { id: 'SPLIT_MODE', icon: Columns, label: 'Split' },
              { id: 'FOCUS_MODE', icon: Code2, label: 'Code' },
              { id: 'VISUAL_MODE', icon: Eye, label: 'Visual' }
            ].map((m) => (
               <button
                 key={m.id}
                 onClick={() => {
                   setLayoutMode(m.id as LayoutMode);
                   if (m.id !== 'SPLIT_MODE' && m.id !== 'FOCUS_MODE') setHighlightQuery(null);
                 }}
                 className={cn(
                   "px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all duration-200",
                   layoutMode === m.id 
                    ? "bg-[#222] text-white shadow-sm ring-1 ring-white/10 scale-100" 
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5 scale-95 hover:scale-100"
                 )}
               >
                 <m.icon size={14} />
                 {m.label}
               </button>
            ))}
          </div>
          <div className="flex gap-4 text-gray-600">
              {!user&&<button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded border border-white/5 transition-colors flex items-center justify-center gap-2"
                >
                  <UserIcon size={12}/> Sign In
                </button>}
          </div>
        </header>

        <main className="flex-1 relative p-6 flex gap-6 overflow-hidden">
          <LayoutGroup>
            <AnimatePresence mode="popLayout">
            
            {(layoutMode === 'CONCEPT_MODE' || layoutMode === 'SPLIT_MODE') && (
              <motion.div 
                key="concept-panel"
                variants={PANEL_VARIANTS}
                initial="hidden" animate="visible" exit="exit"
                layoutId="panel-concept"
                className={cn(
                  "relative flex flex-col bg-[#0e0e0e] border border-white/5 rounded-3xl overflow-hidden shadow-2xl",
                  layoutMode === 'CONCEPT_MODE' ? "flex-1" : "w-[40%] min-w-[400px]"
                )}
              >
                  {/* Subtle Gradient BG */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-900/10 blur-[100px] rounded-full pointer-events-none" />
                  
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-transparent opacity-50" />
                  
                  <div className="p-10 flex flex-col h-full justify-center relative z-10">
                     <AnimatePresence mode='wait'>
                        <motion.div 
                          key={conceptData.title}
                          initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                          transition={{ duration: 0.4 }}
                          className="space-y-8"
                        >
                          <motion.h1 
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                            className="text-5xl font-light text-white tracking-tight"
                          >
                            {conceptData.title}
                            <span className="text-cyan-500 block text-sm font-mono font-bold mt-4 tracking-[0.2em] uppercase opacity-70 flex items-center gap-2">
                               <div className="w-8 h-[1px] bg-cyan-500"></div> Core Concept
                            </span>
                          </motion.h1>
                          <motion.p 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                            className="text-gray-400 leading-relaxed text-lg font-light max-w-2xl border-l-2 border-white/10 pl-6"
                          >
                            {conceptData.text}
                          </motion.p>
                        </motion.div>
                     </AnimatePresence>
                  </div>
              </motion.div>
            )}

            {(layoutMode === 'SPLIT_MODE' || layoutMode === 'FOCUS_MODE') && (
              <motion.div 
                key="code-panel"
                variants={PANEL_VARIANTS}
                initial="hidden" animate="visible" exit="exit"
                layoutId="panel-code"
                className={cn(
                  "relative flex flex-col bg-[#1e1e1e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl",
                  layoutMode === 'FOCUS_MODE' ? "flex-1" : "flex-1"
                )}
              >
                  {(() => {
                    const lang = detectLanguage(activeCode);
                    const ext = lang === 'javascript' ? 'js' : 'py';
                    const label = lang === 'javascript' ? 'JavaScript' : 'Python 3.11';
                    
                    return (
                      <div className="flex items-center justify-between px-4 py-3 bg-[#252526]/90 backdrop-blur border-b border-black/20 select-none z-20">
                        <div className="flex items-center gap-4">
                           <div className="flex gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                             <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                             <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                             <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                           </div>
                           
                           <div className="flex items-center gap-2 bg-[#1e1e1e] px-4 py-1.5 rounded-t-lg border-t border-x border-white/5 relative top-1.5 shadow-sm">
                             {lang === 'javascript' 
                                ? <span className="text-yellow-400 font-bold text-xs">JS</span> 
                                : <span className="text-blue-400 font-bold text-xs">Py</span>
                             }
                             <span className="text-xs font-mono text-gray-300">script.{ext}</span>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-mono text-gray-500">{label}</span>
                           <span className="text-[10px] font-mono text-cyan-500/60 uppercase border border-cyan-500/20 px-1.5 rounded bg-cyan-500/5">Read Only</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div ref={codeContainerRef} className="flex-1 overflow-auto custom-scrollbar relative bg-[#1e1e1e]">
                      {/* Inner shadow for depth */}
                      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] z-10" />
                      <CodeViewer code={activeCode} highlightQuery={highlightQuery} />
                  </div>
              </motion.div>
            )}

            {(layoutMode === 'VISUAL_MODE') && (
              <motion.div 
                key="visual-panel"
                variants={PANEL_VARIANTS}
                initial="hidden" animate="visible" exit="exit"
                layoutId="panel-visual"
                className="flex-1 flex flex-col bg-[#0e0e0e] border border-white/5 rounded-3xl overflow-hidden shadow-2xl p-0"
              >
                  {renderVisualContent()}
              </motion.div>
            )}
            </AnimatePresence>
          </LayoutGroup>
        </main>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-40 px-4 pointer-events-none">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="pointer-events-auto bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 flex items-center shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-2xl group focus-within:border-cyan-500/50 focus-within:bg-[#121212] transition-all duration-300"
          >
            <Mic 
                size={18} 
                onClick={() => !user && setShowAuthModal(true)}
                className={cn("mr-4 transition-colors cursor-pointer", isProcessing ? "text-cyan-400 animate-pulse" : "text-gray-500")} 
            />
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              onClick={() => !user && setShowAuthModal(true)}
              disabled={isProcessing}
              placeholder={!user ? "Sign in to chat..." : isProcessing ? "Processing Neural Input..." : isPlaying ? "System explaining..." : "Ask a follow-up question..."}
              className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-600 flex-1 h-10 font-light tracking-wide disabled:cursor-not-allowed"
            />
            <button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isProcessing} 
              className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all transform active:scale-95 disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-gray-500 disabled:transform-none"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={18} />}
            </button>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default ImmersiveLearningPlatform;