'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react';
import mermaid from 'mermaid';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createClient } from '@supabase/supabase-js'; 
import { useRouter, useSearchParams, usePathname } from 'next/navigation'; // Added for URL management
import { 
  Mic, ChevronRight, Share, Settings, Layout, Code2, Columns, 
  Volume2, VolumeX, Eye, Table as TableIcon, List, GitGraph, 
  Terminal, Cpu, AlertCircle, Loader2, Plus, MessageSquare, Menu, X,
  LogOut, User as UserIcon, Lock
} from 'lucide-react';

// --- External Imports (Preserved) ---
import { TalkingHead } from "../../lib/modules/talkinghead.mjs"; 
import { HeadTTS } from "../../lib/modules/headtts.mjs";
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
type VisualType = 'ARRAY' | 'TABLE' | 'KEY_VALUE' | 'MERMAID_FLOWCHART';

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

mermaid.initialize({ 
  startOnLoad: false, 
  theme: 'dark', 
  securityLevel: 'loose',
  fontFamily: 'monospace',
});

// --- SUB-COMPONENTS ---

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Check your email for confirmation!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose(); 
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-[#111] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
            
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-cyan-900/30 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                <Lock size={24} />
              </div>
              <h2 className="text-2xl font-light text-white">Authentication Required</h2>
              <p className="text-sm text-gray-400 mt-2">Sign in to access the Neural Interface</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {error && <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-200 text-xs">{error}</div>}
              
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-500">Email</label>
                <input 
                  type="email" required 
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-500">Password</label>
                <input 
                  type="password" required 
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 mt-4"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={20}/> : (isSignUp ? "Create Account" : "Access System")}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              >
                {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
              </button>
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
      setError(null);
      const id = `${MERMAID_ID_PREFIX}${Date.now()}`;
      try {
        const { svg } = await mermaid.render(id, chart);
        if (mounted) setSvgContent(svg);
      } catch (err) {
        console.error("Mermaid Render Error:", err);
        if (mounted) setError("Diagram syntax error");
      }
    };
    renderChart();
    return () => { mounted = false; };
  }, [chart]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 space-y-2">
        <AlertCircle size={24} />
        <span className="text-xs font-mono">{error}</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center p-4 overflow-auto mermaid-container"
      dangerouslySetInnerHTML={{ __html: svgContent || '' }}
    />
  );
};


const detectLanguage = (code: string): 'python' | 'javascript' => {
  if (!code) return 'python'; // Default
  
  // Simple heuristics
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
    <div className="flex flex-col items-center justify-center w-full overflow-x-auto py-12 px-4 scrollbar-hide">
      <div className="flex gap-4">
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
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ 
                  opacity: isDimmed ? 0.3 : 1, 
                  scale: isHighlighted ? 1.1 : 1,
                  y: 0,
                  filter: isDimmed ? 'blur(2px)' : 'blur(0px)'
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={ANIMATION_SPRING}
                key={`item-${idx}`} 
                className="relative flex flex-col items-center group"
              >
                {/* Pointers Section */}
                <div className="h-8 w-full absolute -top-10 flex flex-col-reverse items-center">
                  <AnimatePresence>
                    {activePointers.map((p: string) => (
                      <motion.div 
                        key={p}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex flex-col items-center"
                      >
                         <span className="text-[10px] font-bold font-mono text-cyan-400 bg-cyan-950/50 px-1.5 rounded uppercase tracking-wider mb-1">
                          {p}
                        </span>
                        <div className="w-0.5 h-3 bg-cyan-400" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Memory Block */}
                <div className={cn(
                  "w-16 h-16 flex items-center justify-center rounded-xl border-2 text-xl font-bold font-mono shadow-lg transition-colors duration-300 backdrop-blur-sm",
                  isHighlighted 
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-50 shadow-[0_0_30px_rgba(6,182,212,0.3)] z-10" 
                    : "bg-[#1a1a1a]/80 border-white/10 text-gray-400"
                )}>
                  {val}
                </div>

                {/* Index */}
                <span className="mt-3 text-[10px] text-gray-600 font-mono group-hover:text-gray-400 transition-colors">
                  index: {idx}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TableVisualizer = ({ payload }: { payload: any }) => {
  const headers = payload?.headers || [];
  const rows = payload?.rows || [];
  const highlight_row = payload?.highlight_row ?? -1;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-gray-400 uppercase font-mono text-xs tracking-wider">
            <tr>{headers.map((h: string, i: number) => <th key={i} className="px-6 py-4 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row: any[], i: number) => (
              <motion.tr 
                key={i} 
                initial={{ backgroundColor: 'transparent' }}
                animate={{ 
                  backgroundColor: highlight_row === i ? 'rgba(6,182,212, 0.15)' : 'transparent',
                }}
                className="transition-colors hover:bg-white/5"
              >
                 {row.map((cell: any, j: number) => (
                   <td key={j} className={cn("px-6 py-4 font-mono text-gray-300", highlight_row === i && "text-cyan-200")}>
                     {cell}
                   </td>
                 ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CodeViewer = ({ code, highlightQuery }: { code: string, highlightQuery: string | null }) => {
  const language = detectLanguage(code);
  const codeLines = code.split('\n');

  return (
    <div className="text-sm font-mono h-full w-full">
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
          color: '#6e7681', // VS Code gutter color
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
              style.marginLeft = '-3px'; // Fix border offset
            }
          }
          return { style };
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

// --- MAIN COMPONENT ---

const ImmersiveLearningPlatform: React.FC = () => {
  // Navigation Hooks
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // State
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [layoutMode, setLayoutMode] = useState<LayoutMode>('SPLIT_MODE');
  const [activeCode, setActiveCode] = useState("");
  const [highlightQuery, setHighlightQuery] = useState<string | null>(null);
  
  const [conceptData, setConceptData] = useState({ title: "Initializing System", text: "Establishing secure connection..." });
  const [visualData, setVisualData] = useState<VisualState>(null);
  const [subtitles, setSubtitles] = useState("");
  
  // --- SESSION MANAGEMENT STATE ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  // Initial state is null to prevent hydration mismatch, syncs with URL in effect
  const [activeSessionId, setActiveSessionId] = useState<string>(""); 
  
  // Sessions fetched from DB
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Local message history
  const [sessionHistories, setSessionHistories] = useState<Record<string, Message[]>>({});
  const [messages, setMessages] = useState<Message[]>([{ id: 'init', role: 'assistant', content: "System Online. Ready for input.", timestamp: Date.now() }]);

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); 
  const [isPlaying, setIsPlaying] = useState(false);        
  const [isTTSActive, setIsTTSActive] = useState(true);     
  const [avatarStatus, setAvatarStatus] = useState("Initializing...");

  // Refs
  const avatarRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const headTTSRef = useRef<any>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const audioResolverRef = useRef<(() => void) | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const commandQueueRef = useRef<PlaybackAction[]>([]);
  const isExecutingRef = useRef(false);
  const onEndCountRef = useRef(0);
  const totalPartsRef = useRef(0);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIC: Fetch Sessions & Init ---
  const fetchSessionsAndInit = async (userId: string) => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return;
    } 

    const userSessions = data || [];
    setSessions(userSessions);

    // URL Logic: Check if ID exists in URL
    const urlSessionId = searchParams.get('session_id');

    if (urlSessionId) {
      // Logic: If URL has ID, we try to use it.
      // Even if it's not in the DB list (maybe new or cache delay), we respect the URL.
      setActiveSessionId(urlSessionId);
      
      // If it's a valid old session, maybe load history? (Skipped for now per instructions)
      if (!sessionHistories[urlSessionId]) {
         setMessages([{ id: 'init', role: 'assistant', content: "Session loaded. (History is ephemeral)", timestamp: Date.now() }]);
      }
    } else {
      // Logic: No ID in URL -> Create NEW session automatically
      await createNewSessionForUser(userId, userSessions);
    }
  };

  const createNewSessionForUser = async (userId: string, currentSessions: Session[]) => {
      const newId = `session_${Date.now()}`;
      const newTitle = `Session ${currentSessions.length + 1}`;
      
      // Update local state first
      const newSession: Session = { 
          session_id: newId, 
          title: newTitle, 
          created_at: new Date().toISOString() 
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newId);
      
      // Update URL without reload
      router.push(`?session_id=${newId}`);

      // Persist
      await supabase.from('chat_sessions').insert({
          session_id: newId,
          user_id: userId,
          title: newTitle
      });

      // Reset View
      const initMsg: Message = { id: 'init', role: 'assistant', content: "New session started. How can I assist?", timestamp: Date.now() };
      setMessages([initMsg]);
      setSessionHistories(prev => ({ ...prev, [newId]: [initMsg] }));
      setActiveCode("");
      setConceptData({ title: "Ready", text: "Awaiting input..." });
      setVisualData(null);
  };

  // --- LOGIC: Auth Check ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthChecking(false);
      if (session?.user) {
         fetchSessionsAndInit(session.user.id);
      } else {
         // Guest Mode: If URL has session, keep it? Or force new local session?
         // For now, if guest, we just generate a local ID if none exists
         const urlId = searchParams.get('session_id');
         if (!urlId) {
            const newId = `session_${Date.now()}`;
            setActiveSessionId(newId);
            router.replace(`?session_id=${newId}`);
         } else {
            setActiveSessionId(urlId);
         }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setShowAuthModal(false);
        fetchSessionsAndInit(session.user.id);
      } else {
        setSessions([]); 
        // Force new session ID for guest on logout
        const newId = `session_${Date.now()}`;
        setActiveSessionId(newId);
        router.push(`?session_id=${newId}`);
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
  };

  // --- LOGIC: Sync Messages to History ---
  useEffect(() => {
    if(activeSessionId) {
        setSessionHistories(prev => ({
            ...prev,
            [activeSessionId]: messages
        }));
    }
  }, [messages, activeSessionId]);

  // --- LOGIC: Session Switching ---
  const handleSwitchSession = (sessionId: string) => {
      if (isProcessing || isPlaying) return; 
      
      setActiveSessionId(sessionId);
      router.push(`?session_id=${sessionId}`); // Update URL
      
      const history = sessionHistories[sessionId] || [];
      if (history.length === 0) {
          setMessages([{ id: Date.now().toString(), role: 'assistant', content: "Session loaded from database.", timestamp: Date.now() }]);
      } else {
          setMessages(history);
      }
      
      setActiveCode("");
      setConceptData({ title: "Session Resumed", text: "Context restored." });
      setVisualData(null);
  };

  const handleCreateSessionClick = async () => {
      if (!requireAuth()) return;
      if (isProcessing || isPlaying) return;
      await createNewSessionForUser(user.id, sessions);
  };


  // --- LOGIC: Scrolling & Highlights ---
  useEffect(() => {
    if (highlightQuery && codeContainerRef.current) {
      const highlightedElement = codeContainerRef.current.querySelector('.highlight-active');
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightQuery, activeCode]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, subtitles]);

  // --- LOGIC: Avatar Setup ---
  useEffect(() => {
    if (headRef.current) return;
    const initAvatar = async () => {
      try {
        const head = new TalkingHead(avatarRef.current, {
          ttsEndpoint: "N/A", cameraView: "upper", mixerGainSpeech: 3, cameraRotateEnable: false
        });
        headRef.current = head;
        const headtts = new HeadTTS({
          endpoints: ["webgpu", "wasm"],
          languages: ["en-us"],
          voices: ["af_bella", "am_fenrir"], 
          voiceURL: window.location.origin + "/voices", 
          workerModule: window.location.origin + "/modules/worker-tts.mjs",
          dictionaryURL: window.location.origin + "/dictionaries",
          audioCtx: head.audioCtx,
        });
        headTTSRef.current = headtts;
        
        headtts.onmessage = (message: any) => {
              if (message.type === "audio") {
                kickWatchdog();
                const { partsTotal } = message.metaData || { partsTotal: 1 };
                if (partsTotal > 0) totalPartsRef.current = partsTotal;
                
                head.speakAudio(message.data, { volume: 1 }, 
                    (word: string) => setSubtitles(prev => prev.length > 80 ? "..." + word : prev + word),
                    () => {
                        onEndCountRef.current += 1;
                        if (totalPartsRef.current > 0 && onEndCountRef.current >= totalPartsRef.current) {
                            if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
                            audioResolverRef.current?.();
                            audioResolverRef.current = null;
                            setTimeout(() => setSubtitles(""), 1000);
                        } else {
                            kickWatchdog();
                        }
                    }
                );
            }
        };

        try {
            await Promise.all([
                 head.showAvatar({ url: "/avatars/david.glb", body: "F", avatarMood: "neutral" }),
                 headtts.connect()
            ]);
            head.setView(head.viewName, { cameraY: 0 });
            headtts.setup({ voice: "am_fenrir", language: "en-us", speed: 1.1, audioEncoding: "wav" });
            head.start();
            setAvatarStatus("Online");
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

  // --- LOGIC: Execution Queue ---
  const kickWatchdog = () => {
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = setTimeout(() => {
          audioResolverRef.current?.();
          audioResolverRef.current = null;
      }, 60000); 
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
          
          if (isTTSActive && headTTSRef.current && avatarStatus !== "Offline") {
             setSubtitles("");
             onEndCountRef.current = 0;
             totalPartsRef.current = 0;
             if (headRef.current?.audioCtx?.state === 'suspended') await headRef.current.audioCtx.resume();
             kickWatchdog();
             await new Promise<void>((resolve) => {
                 audioResolverRef.current = resolve;
                 try { headTTSRef.current.synthesize({ input: action.text }); } 
                 catch (e) { resolve(); }
             });
          } else {
            // Fallback reading time
            await new Promise(resolve => setTimeout(resolve, action.text.length * 50)); 
          }
          break;
      }
      // Small buffer between actions
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

  const handleSendMessage = async () => {
    if (!requireAuth()) return;
    if (!input.trim() || isProcessing) return;
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() }]);
    const currentInput = input;
    setInput('');
    setIsProcessing(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: '', timestamp: Date.now() }]);

    try {
      // UPDATED: Using activeSessionId from state (which is synced with URL)
      const response = await fetch('https://avatar-tutor-6uih.onrender.com/api/chat', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, session_id: activeSessionId })
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
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "Connection to core disrupted. Please verify local server.", timestamp: Date.now() }]);
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

  const renderVisualContent = () => {
    if (!visualData) return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4">
        <Cpu size={48} className="opacity-20" />
        <span className="text-xs font-mono uppercase tracking-widest opacity-50">Awaiting visual input data</span>
      </div>
    );

    return (
       <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.5 }}
         className="w-full h-full flex flex-col"
       >
          <div className="flex-1 flex items-center justify-center p-6 bg-[#0a0a0a] rounded-xl border border-white/10 relative overflow-hidden shadow-inner group">
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
             <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white"><Share size={14}/></button>
             </div>
             
             <div className="relative z-10 w-full h-full flex justify-center items-center">
                {visualData.type === 'ARRAY' && <ArrayVisualizer payload={visualData.payload} />}
                {visualData.type === 'TABLE' && <TableVisualizer payload={visualData.payload} />}
                {visualData.type === 'KEY_VALUE' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                     {visualData.payload?.items?.map((item: any, i: number) => (
                       <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-[#151515] p-5 rounded-lg border border-white/5 flex justify-between items-center hover:border-cyan-500/30 transition-colors">
                          <span className="text-gray-500 font-mono text-xs uppercase tracking-wider">{item.key}</span>
                          <span className="text-cyan-400 font-mono font-bold text-lg">{item.value}</span>
                       </motion.div>
                     ))}
                   </div>
                )}
                {visualData.type === 'MERMAID_FLOWCHART' && (
                  <div className="w-full h-full flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-4 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                         <GitGraph size={14} className="text-cyan-500" />
                         <span className="text-[10px] text-gray-400 font-mono uppercase">Flowchart Visualization</span>
                      </div>
                      <MermaidChart chart={visualData.payload.chart} />
                  </div>
                )}
             </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-1"
          >
             <div className="flex items-center gap-2 mb-1">
                {visualData.type === 'ARRAY' && <List size={14} className="text-cyan-400" />}
                {visualData.type === 'TABLE' && <TableIcon size={14} className="text-cyan-400" />}
                <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">{visualData.type} VIEW</span>
             </div>
             <p className="text-sm text-gray-400 font-light">{visualData.caption}</p>
          </motion.div>
       </motion.div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] text-gray-300 font-sans overflow-hidden selection:bg-cyan-500/30 selection:text-white">
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* --- LEFT MENU BAR (SESSIONS) --- */}
      <motion.div 
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: isSidebarOpen ? 240 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex flex-col border-r border-white/5 bg-[#030303] relative z-30 overflow-hidden whitespace-nowrap"
      >
        
        {/* New Chat Button */}
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

        {/* Sessions List */}
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

        {/* User / Footer */}
        <div className="p-4 border-t border-white/5 bg-[#050505]">
            {user ? (
               <div className="flex flex-col gap-3">
                   <div className="flex items-center gap-3 px-1">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-900 to-purple-900 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
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
        className="w-[30%] min-w-[340px] max-w-[450px] flex flex-col border-r border-white/5 relative z-20 bg-[#080808]/80 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="h-16 px-6 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
            {/* TOGGLE BUTTON */}
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
           
           {/* Subtitles Overlay */}
           <AnimatePresence>
             {subtitles && (
               <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-4 left-0 right-0 flex justify-center px-4 pointer-events-none z-50"
               >
                  <span className="bg-black/60 text-cyan-50 px-3 py-1.5 rounded-lg text-sm shadow-xl backdrop-blur-md border border-white/10 text-center">
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
              initial={{ opacity: 0, x: msg.role === 'assistant' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}
            >
              <div className={cn(
                "max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed border",
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
        
        {/* Navigation / Toolbar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-[#080808]/50 backdrop-blur z-30">
          <div className="flex gap-1 bg-[#111] p-1 rounded-lg border border-white/5">
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
                   "px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all",
                   layoutMode === m.id 
                    ? "bg-[#222] text-white shadow-sm ring-1 ring-white/10" 
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                 )}
               >
                 <m.icon size={14} />
                 {m.label}
               </button>
            ))}
          </div>
          <div className="flex gap-4 text-gray-600">
             <Settings size={18} className="hover:text-white transition-colors cursor-pointer" />
          </div>
        </header>

        {/* Dynamic Panels */}
        <main className="flex-1 relative p-6 flex gap-6 overflow-hidden">
          <LayoutGroup>
            
            {/* CONCEPT CARD */}
            {(layoutMode === 'CONCEPT_MODE' || layoutMode === 'SPLIT_MODE') && (
              <motion.div 
                layoutId="panel-concept"
                className={cn(
                  "relative flex flex-col bg-[#0e0e0e] border border-white/5 rounded-2xl overflow-hidden shadow-2xl",
                  layoutMode === 'CONCEPT_MODE' ? "flex-1" : "w-[40%] min-w-[400px]"
                )}
              >
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-50" />
                 <div className="p-10 flex flex-col h-full justify-center">
                    <motion.div 
                      key={conceptData.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <h1 className="text-4xl font-light text-white tracking-tight">
                        {conceptData.title}
                        <span className="text-cyan-500 block text-lg font-mono font-normal mt-2 tracking-widest uppercase opacity-70">Core Concept</span>
                      </h1>
                      <p className="text-gray-400 leading-relaxed text-lg font-light max-w-2xl border-l-2 border-white/10 pl-6">
                        {conceptData.text}
                      </p>
                    </motion.div>
                 </div>
              </motion.div>
            )}

            {/* CODE EDITOR */}
            {(layoutMode === 'SPLIT_MODE' || layoutMode === 'FOCUS_MODE') && (
              <motion.div 
                layoutId="panel-code"
                className={cn(
                  "relative flex flex-col bg-[#1e1e1e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl",
                  layoutMode === 'FOCUS_MODE' ? "flex-1" : "flex-1"
                )}
              >
                  {/* Dynamic Header */}
                  {(() => {
                    const lang = detectLanguage(activeCode);
                    const ext = lang === 'javascript' ? 'js' : 'py';
                    const label = lang === 'javascript' ? 'JavaScript' : 'Python 3.11';
                    
                    return (
                      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-black/20 select-none">
                        <div className="flex items-center gap-3">
                           {/* Traffic Lights */}
                           <div className="flex gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                             <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                             <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                             <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                           </div>
                           
                           {/* File Tab */}
                           <div className="flex items-center gap-2 bg-[#1e1e1e] px-3 py-1 rounded-t-md border-t border-x border-white/5 relative top-1">
                             {lang === 'javascript' 
                                ? <span className="text-yellow-400 font-bold text-xs">JS</span> 
                                : <span className="text-blue-400 font-bold text-xs">Py</span>
                             }
                             <span className="text-xs font-mono text-gray-300">script.{ext}</span>
                             <span className="w-2 h-2 rounded-full bg-white/10 ml-2 hover:bg-white/30 cursor-pointer text-[8px] flex items-center justify-center">x</span>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-mono text-gray-500">{label}</span>
                           <span className="text-[10px] font-mono text-cyan-500/50 uppercase border border-cyan-500/20 px-1.5 rounded">Read Only</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Code Viewer Body */}
                  <div ref={codeContainerRef} className="flex-1 overflow-auto custom-scrollbar relative">
                     <CodeViewer code={activeCode} highlightQuery={highlightQuery} />
                  </div>
              </motion.div>
            )}

            {/* VISUALIZER */}
            {(layoutMode === 'VISUAL_MODE') && (
              <motion.div 
                layoutId="panel-visual"
                className="flex-1 flex flex-col bg-[#0e0e0e] border border-white/5 rounded-2xl overflow-hidden shadow-2xl p-6"
              >
                 {renderVisualContent()}
              </motion.div>
            )}

          </LayoutGroup>
        </main>

        {/* Input Area */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-40 px-4 pointer-events-none">
          <div className="pointer-events-auto bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 flex items-center shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-2xl group focus-within:border-cyan-500/50 transition-colors">
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
              className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-gray-500"
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={18} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImmersiveLearningPlatform;