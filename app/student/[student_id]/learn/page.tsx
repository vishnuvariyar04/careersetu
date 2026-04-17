'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import dagre from 'dagre';
import arrayRegistry from '../../../../public/PRIMITIVES/array.json';
import graphRegistry from '../../../../public/PRIMITIVES/graph.json';
import linkedListRegistry from '../../../../public/PRIMITIVES/linked-list.json';
import flowchartRegistry from '../../../../public/PRIMITIVES/flowchart.json';
import matrixRegistry from '../../../../public/PRIMITIVES/matrix.json';
import cartesianGraphRegistry from '../../../../public/PRIMITIVES/cartesian-graph.json';
import sequenceDiagramRegistry from '../../../../public/PRIMITIVES/sequence-diagram.json';
import { PromptInputBox } from '@/components/ai-prompt-box';
import { MenuIcon, XIcon, PauseIcon, PlayIcon, SquareIcon, MinusIcon, HomeIcon, Clock, Compass, TrendingUp, Users, Settings, HelpCircle, Sparkles, ArrowRight, Bell, UserCircle, PanelLeft, Award, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// ══════════════════════════════════════════════════════════════
// Types & Constants
// ══════════════════════════════════════════════════════════════

interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; timestamp: number; }
interface CanvasPage { id: string; title?: string; }
interface D3PlaybackStep { instruction: any; index: number; visual_id?: string; }
interface CodePlaybackStep { instruction: any; visual_id?: string; }
interface PlaybackItem { d3Steps: D3PlaybackStep[]; codeSteps: CodePlaybackStep[]; contentBlocks: string[]; ttsChunks: string[]; }

const RAW_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

function resolveWsUrl(baseUrl: string): string {
    const trimmed = baseUrl.trim();
    if (!trimmed) return 'ws://localhost:8000/ws';
    if (trimmed.startsWith('ws://') || trimmed.startsWith('wss://')) return trimmed;
    if (trimmed.startsWith('http://')) return `ws://${trimmed.slice('http://'.length).replace(/\/$/, '')}/ws`;
    if (trimmed.startsWith('https://')) return `wss://${trimmed.slice('https://'.length).replace(/\/$/, '')}/ws`;
    return trimmed;
}

const WS_URL = resolveWsUrl(RAW_WS_URL);

console.log('WS_URL', WS_URL);

const PRIMITIVES: Record<string, any> = {
    ARRAY_V1_PRO: arrayRegistry,
    GRAPH_V2: graphRegistry,
    LINKED_LIST_V1: linkedListRegistry,
    FLOWCHART_V1: flowchartRegistry,
    MATRIX_V1: matrixRegistry,
    CARTESIAN_GRAPH_V1: cartesianGraphRegistry,
    SEQUENCE_DIAGRAM_V1: sequenceDiagramRegistry,
};

/** Map from function name → array of { code, registry } (one per primitive that defines it). */
function buildFunctionLookup(): Record<string, { code: string; registry: any }[]> {
    const lookup: Record<string, { code: string; registry: any }[]> = {};
    for (const [, reg] of Object.entries(PRIMITIVES)) {
        if (reg.functions) {
            for (const [fnName, fnDef] of Object.entries(reg.functions as Record<string, any>)) {
                if (!lookup[fnName]) lookup[fnName] = [];
                lookup[fnName].push({ code: fnDef.code, registry: reg });
            }
        }
    }
    return lookup;
}
const FUNCTION_LOOKUP = buildFunctionLookup();

/** Map from base function name → its primitive registry (used to pin the active primitive). */
const BASE_TO_REGISTRY: Record<string, any> = {};
for (const [, reg] of Object.entries(PRIMITIVES)) {
    if (reg.functions) {
        for (const fnName of Object.keys(reg.functions as Record<string, any>)) {
            if (fnName.startsWith('render') && fnName.endsWith('Base')) {
                BASE_TO_REGISTRY[fnName] = reg;
            }
        }
    }
}

let _idCounter = 0;
function genId(): string { return `id_${Date.now()}_${++_idCounter}`; }

/** Escape HTML then wrap highlighted substrings in <mark> tags. */
function _escapeAndHighlight(code: string, highlights: string[]): string {
    let escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    for (const h of highlights) {
        if (!h) continue;
        const escapedH = h.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeRe = escapedH.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        escaped = escaped.replace(
            new RegExp(safeRe, 'g'),
            '<mark style="background:rgba(250,200,50,0.28);border-radius:2px;padding:0 2px;color:inherit;">$&</mark>'
        );
    }
    return escaped;
}

/** Functions that create a new visual (require a fresh inline SVG) */
const BASE_FUNCTIONS = new Set([
    'renderBase',
    'renderGraphBase',
    'renderArrayBase',
    'renderLinkedListBase',
    'renderDoublyLinkedListBase',
    'renderCircularLinkedListBase',
    'renderFlowchartBase',
    'renderMatrixBase',
    'renderMatrixSetBase',
    'renderCartesianBase',
    'renderSequenceBase',
]);

// ══════════════════════════════════════════════════════════════
// Dashboard — Mock Data
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
// DB helpers — session lifecycle (frontend-owned writes)
// ══════════════════════════════════════════════════════════════

interface RecentSession { id: string; title: string; primitiveType: string; messageCount: number; createdAt: string; }

const PRIMITIVE_ID_TO_TYPE: Record<string, string> = {
    ARRAY_V1_PRO: 'array',
    GRAPH_V2: 'graph',
    LINKED_LIST_V1: 'linked-list',
    FLOWCHART_V1: 'flowchart',
    MATRIX_V1: 'matrix',
    CARTESIAN_GRAPH_V1: 'cartesian-graph',
    SEQUENCE_DIAGRAM_V1: 'sequence-diagram',
};

const RENDER_BASE_TO_PRIMITIVE_ID: Record<string, string> = {
    renderArrayBase: 'ARRAY_V1_PRO',
    renderGraphBase: 'GRAPH_V2',
    renderLinkedListBase: 'LINKED_LIST_V1',
    renderFlowchartBase: 'FLOWCHART_V1',
    renderMatrixBase: 'MATRIX_V1',
    renderCartesianBase: 'CARTESIAN_GRAPH_V1',
    renderSequenceBase: 'SEQUENCE_DIAGRAM_V1',
};

function getPrimitiveIdFromSteps(steps: any[]): string | null {
    for (const step of steps) {
        const fn = step?.fn;
        if (fn && RENDER_BASE_TO_PRIMITIVE_ID[fn]) return RENDER_BASE_TO_PRIMITIVE_ID[fn];
    }
    return null;
}

function getPrimitiveTypeFromIds(ids: string[]): string {
    if (!ids?.length) return 'flowchart';
    return PRIMITIVE_ID_TO_TYPE[ids[0]] ?? 'flowchart';
}

function formatSessionDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function dbCreateSession(sessionId: string, userId: string, title: string): Promise<void> {
    await supabase.from('sessions').insert({
        id: sessionId,
        user_id: userId,
        status: 'active',
        title,
        llm_history: [],
        primitives_used: [],
        message_count: 0,
    });
}

async function dbWriteChatMessage(
    sessionId: string, role: string, content: string,
    seqIndex: number, hasVisual: boolean,
): Promise<string> {
    const { data } = await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role,
        content,
        sequence_index: seqIndex,
        has_visual: hasVisual,
    }).select('id').single();
    return (data as any)?.id ?? '';
}

async function dbWritePlaybackItem(
    sessionId: string, chatMessageId: string, seqIndex: number,
    primitiveId: string, d3Steps: any[], codeSteps: any[], narrationBlocks: string[], contentBlocks: string[],
): Promise<void> {
    await supabase.from('playback_items').insert({
        session_id: sessionId,
        chat_message_id: chatMessageId,
        sequence_index: seqIndex,
        primitive_id: primitiveId,
        d3_steps: d3Steps,
        code_steps: codeSteps,
        narration_blocks: narrationBlocks,
        content_blocks: contentBlocks,
    });
}

async function dbFinalizeSession(sessionId: string, hadMessages: boolean, messageCount?: number): Promise<void> {
    if (hadMessages) {
        const patch: Record<string, unknown> = { status: 'completed' };
        if (messageCount !== undefined) patch.message_count = messageCount;
        await supabase.from('sessions').update(patch).eq('id', sessionId);
    } else {
        await supabase.from('sessions').delete().eq('id', sessionId);
    }
}

const TEMPLATES = [
    { label: 'Binary Search', prompt: 'Explain binary search algorithm with a visual step-by-step example' },
    { label: 'Linked Lists', prompt: 'Explain linked list insertion, deletion, and traversal with visuals' },
    { label: 'Graph DFS', prompt: 'Explain depth-first search on a graph with step-by-step visuals' },
    { label: 'Merge Sort', prompt: 'Explain merge sort algorithm with visual step-by-step animation' },
    { label: 'How TCP Works', prompt: 'Explain TCP handshake and reliable data transfer visually' },
    { label: 'Hash Tables', prompt: 'Explain hash tables, hash functions and collision resolution' },
    { label: 'Binary Trees', prompt: 'Explain binary search trees with insert and search operations' },
    { label: "Dijkstra's Algorithm", prompt: "Explain Dijkstra's shortest path algorithm with a visual graph" },
];

// ══════════════════════════════════════════════════════════════
// Dashboard — SVG Background Patterns
// ══════════════════════════════════════════════════════════════

function SvgPatternArray() {
    const bars = [40, 72, 55, 90, 65, 82, 48, 76, 60, 88, 52, 70];
    return (
        <svg viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
            {bars.map((h, i) => (
                <rect key={i} x={i * 26 + 8} y={120 - h} width={18} height={h} fill="rgba(125,184,242,0.13)" rx={3} />
            ))}
        </svg>
    );
}

function SvgPatternGraph() {
    const nodes: [number, number][] = [[60,70],[130,35],[130,105],[200,70],[255,40],[255,100],[305,70]];
    const edges: [number, number][] = [[0,1],[0,2],[1,3],[2,3],[3,4],[3,5],[4,6],[5,6]];
    return (
        <svg viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
            {edges.map(([a, b], i) => (
                <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="rgba(125,184,242,0.12)" strokeWidth="1.5" />
            ))}
            {nodes.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={9} fill="rgba(125,184,242,0.17)" />
            ))}
        </svg>
    );
}

function SvgPatternFlowchart() {
    return (
        <svg viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
            <rect x="110" y="8" width="100" height="28" rx={4} fill="rgba(125,184,242,0.12)" />
            <line x1="160" y1="36" x2="160" y2="54" stroke="rgba(125,184,242,0.12)" strokeWidth="1.5" />
            <polygon points="138,54 182,54 160,76" fill="rgba(125,184,242,0.12)" />
            <line x1="138" y1="65" x2="76" y2="92" stroke="rgba(125,184,242,0.12)" strokeWidth="1.5" />
            <line x1="182" y1="65" x2="244" y2="92" stroke="rgba(125,184,242,0.12)" strokeWidth="1.5" />
            <rect x="38" y="92" width="76" height="28" rx={4} fill="rgba(125,184,242,0.12)" />
            <rect x="206" y="92" width="76" height="28" rx={4} fill="rgba(125,184,242,0.12)" />
        </svg>
    );
}

function SvgPatternLinkedList() {
    const boxes = [10, 82, 154, 226];
    return (
        <svg viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
            <defs>
                <marker id="ll-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="rgba(125,184,242,0.22)" />
                </marker>
            </defs>
            {boxes.map((x, i) => (
                <g key={i}>
                    <rect x={x} y={55} width={58} height={30} rx={4} fill="rgba(125,184,242,0.12)" />
                    {i < boxes.length - 1 && (
                        <line x1={x + 58} y1={70} x2={x + 74} y2={70} stroke="rgba(125,184,242,0.18)" strokeWidth="1.5" markerEnd="url(#ll-arrow)" />
                    )}
                </g>
            ))}
        </svg>
    );
}

const PATTERN_MAP: Record<string, React.FC> = {
    array: SvgPatternArray,
    graph: SvgPatternGraph,
    flowchart: SvgPatternFlowchart,
    'linked-list': SvgPatternLinkedList,
};

// ══════════════════════════════════════════════════════════════
// Dashboard — types
// ══════════════════════════════════════════════════════════════

// MockSession replaced by RecentSession (defined above with DB helpers)

// ══════════════════════════════════════════════════════════════
// Dashboard — Sidebar nav config
// ══════════════════════════════════════════════════════════════

const SIDEBAR_NAV_TOP = [
    { id: 'home',      label: 'Home',      Icon: HomeIcon,   comingSoon: false },
    { id: 'sessions',  label: 'Sessions',  Icon: Clock,      comingSoon: false },
    { id: 'explore',   label: 'Explore',   Icon: Compass,    comingSoon: true  },
    { id: 'progress',  label: 'Progress',  Icon: TrendingUp, comingSoon: true  },
    { id: 'community', label: 'Community', Icon: Users,      comingSoon: true  },
];

const SIDEBAR_NAV_BOTTOM = [
    { id: 'settings', label: 'Settings', Icon: Settings,   comingSoon: true },
    { id: 'help',     label: 'Help',     Icon: HelpCircle, comingSoon: true },
];

// ══════════════════════════════════════════════════════════════
// Dashboard — Home View
// ══════════════════════════════════════════════════════════════

function DashboardHome({ onStartSession, onResumeSession, isDarkMode, toggleDarkMode, inputValue, setInputValue, user, onSignOut, onSignIn, recentSessions, sessionsLoading }: { onStartSession: (prompt: string, title?: string) => void, onResumeSession: (session: RecentSession) => void, isDarkMode: boolean, toggleDarkMode: () => void, inputValue: string, setInputValue: (v: string) => void, user: User | null, onSignOut: () => void, onSignIn: () => void, recentSessions: RecentSession[], sessionsLoading: boolean }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [dashboardView, setDashboardView] = useState<'home' | 'sessions'>('home');
    const [allSessions, setAllSessions] = useState<RecentSession[]>([]);
    const [allSessionsLoading, setAllSessionsLoading] = useState(false);
    const [sessionSearch, setSessionSearch] = useState('');
    const [showComingSoon, setShowComingSoon] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [seenNotifIds, setSeenNotifIds] = useState<Set<string>>(() => {
        if (typeof window === 'undefined') return new Set();
        const raw = localStorage.getItem('outlrn_seen_notifs') ?? '';
        return new Set(raw ? raw.split(',') : []);
    });

    const handleSubmit = () => { if (inputValue.trim()) onStartSession(inputValue.trim()); };

    // Trial days computed from account creation date
    const trialDaysUsed = useMemo(() => {
        if (!user?.created_at) return 0;
        const created = new Date(user.created_at);
        const now = new Date();
        const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return Math.min(diff, 14);
    }, [user]);
    const trialPct = Math.round((trialDaysUsed / 14) * 100);

    // Milestone notifications derived from real user data
    const computedNotifications = useMemo(() => {
        const items: { id: string; title: string; desc: string }[] = [];
        if (recentSessions.length >= 1)  items.push({ id: 'first_session',  title: 'You started your first session! 🚀', desc: 'The journey begins — keep exploring.' });
        if (recentSessions.length >= 5)  items.push({ id: 'five_sessions',  title: '5 sessions completed! 🧠',           desc: "You're building a real learning habit." });
        if (recentSessions.length >= 10) items.push({ id: 'ten_sessions',   title: '10 sessions in! 🎯',                 desc: "Incredible consistency — you're on a roll." });
        if (trialDaysUsed >= 7)          items.push({ id: 'week_member',    title: 'One week with Outlrn! ✨',            desc: 'Seven days of visual learning — impressive.' });
        return items;
    }, [recentSessions, trialDaysUsed]);

    const unreadCount = useMemo(
        () => computedNotifications.filter(n => !seenNotifIds.has(n.id)).length,
        [computedNotifications, seenNotifIds]
    );

    // Mark all as seen when dropdown opens
    const handleOpenNotifications = () => {
        setShowNotifications(v => {
            if (!v) {
                const allIds = computedNotifications.map(n => n.id);
                const updated = new Set([...seenNotifIds, ...allIds]);
                setSeenNotifIds(updated);
                localStorage.setItem('outlrn_seen_notifs', [...updated].join(','));
            }
            return !v;
        });
    };

    // Sidebar nav handler
    const handleNavClick = (id: string, comingSoon: boolean) => {
        if (comingSoon) {
            setShowComingSoon(id);
            setTimeout(() => setShowComingSoon(null), 2500);
            return;
        }
        setDashboardView(id as 'home' | 'sessions');
    };

    // Load all sessions when switching to sessions view
    useEffect(() => {
        if (dashboardView !== 'sessions' || !user) return;
        setAllSessionsLoading(true);
        supabase
            .from('sessions')
            .select('id, title, created_at, primitives_used, message_count')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100)
            .then(({ data }) => {
                setAllSessions((data ?? []).map((s: any) => ({
                    id: s.id,
                    title: s.title ?? 'Untitled session',
                    primitiveType: getPrimitiveTypeFromIds(s.primitives_used ?? []),
                    messageCount: s.message_count ?? 0,
                    createdAt: s.created_at,
                })));
                setAllSessionsLoading(false);
            });
    }, [dashboardView, user]);

    const filteredSessions = useMemo(() => {
        const q = sessionSearch.trim().toLowerCase();
        if (!q) return allSessions;
        return allSessions.filter(s => s.title.toLowerCase().includes(q));
    }, [allSessions, sessionSearch]);

    const colors = isDarkMode ? {
        bg: '#09090b',
        card: '#111118',
        border: '#2a2a36',
        textMain: '#ffffff',
        textMuted: '#a0a0a0',
        textFaint: '#808080',
        logo: 'invert(1)',
        hover: 'rgba(255,255,255,0.04)',
        hoverCard: '#1a1a24',
        shadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
        hoverShadow: 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
    } : {
        bg: '#f5f4f0',
        card: '#ffffff',
        border: '#e8e2db',
        textMain: '#1a1918',
        textMuted: '#5a5248',
        textFaint: '#b0a99f',
        logo: 'invert(0.1)',
        hover: 'rgba(0,0,0,0.04)',
        hoverCard: '#faf9f8',
        shadow: 'shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
        hoverShadow: 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
    };

    return (
        <div
            className="h-full w-full min-w-0 flex flex-col overflow-hidden transition-colors duration-300"
            style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: colors.bg }}
        >
            {/* ══ TOP BAR ══ */}
            <div className="flex-shrink-0 flex items-center justify-between px-3 sm:px-5 h-12 relative z-50 transition-colors duration-300" style={{ background: colors.bg }}>
                <button className="hidden lg:flex w-8 h-8 items-center justify-center rounded-md transition-colors hover:bg-black/[0.06] dark:hover:bg-white/[0.06]">
                    <PanelLeft className="w-5 h-5" style={{ color: colors.textMain }} />
                </button>
                <div className="flex items-center gap-1 relative">
                    <div className="relative group">
                        {/*
                        Legacy interactive theme toggle (kept intentionally; do not remove):
                        <button
                            onClick={toggleDarkMode}
                            className="w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-black/[0.06] dark:hover:bg-white/[0.06]"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" style={{ color: colors.textMain }} /> : <Moon className="w-5 h-5" style={{ color: colors.textMain }} />}
                        </button>
                        */}
                        <button
                            onClick={(e) => e.preventDefault()}
                            disabled
                            className="w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-not-allowed opacity-55 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                            title="Theme switch (coming soon)"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" style={{ color: colors.textMain }} /> : <Moon className="w-5 h-5" style={{ color: colors.textMain }} />}
                        </button>
                        <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: isDarkMode ? '#2a2a36' : '#1a1918', color: isDarkMode ? '#e0e0e0' : '#f5f4f0' }}>
                            Theme switch (coming soon)
                        </span>
                    </div>
                    <button
                        onClick={handleOpenNotifications}
                        className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-md transition-colors relative",
                            showNotifications ? (isDarkMode ? "bg-white/[0.1]" : "bg-black/[0.06]") : (isDarkMode ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.06]")
                        )}
                    >
                        <Bell className="w-5 h-5" style={{ color: colors.textMain }} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-[7px] h-[7px] bg-red-500 rounded-full border border-[var(--bg)]" style={{ ['--bg' as any]: colors.bg }} />
                        )}
                    </button>
                    <button
                        onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-all overflow-hidden hover:ring-2 hover:ring-white/20"
                    >
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            <UserCircle className="w-[23px] h-[23px]" style={{ color: colors.textMain }} />
                        )}
                    </button>

                    {/* Profile Dropdown */}
                    <AnimatePresence>
                        {showProfile && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="absolute top-[48px] right-0 w-[min(280px,calc(100vw-24px))] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border overflow-hidden"
                                style={{ background: colors.card, borderColor: colors.border }}
                            >
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: colors.border }}>
                                            {user.user_metadata?.avatar_url ? (
                                                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-10 h-10 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: isDarkMode ? 'rgba(99,102,241,0.2)' : 'rgba(79,70,229,0.1)' }}>
                                                    <UserCircle className="w-6 h-6" style={{ color: isDarkMode ? '#a5b4fc' : '#4f46e5' }} />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-[14px] font-semibold truncate" style={{ color: colors.textMain }}>
                                                    {user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
                                                </p>
                                                <p className="text-[12px] truncate" style={{ color: colors.textMuted }}>
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-2">
                                            <button
                                                onClick={() => { setShowProfile(false); onSignOut(); }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors text-left"
                                                style={{ color: '#ef4444' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDarkMode ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="px-4 py-3">
                                        <button
                                            onClick={() => { setShowProfile(false); onSignIn(); }}
                                            className="w-full py-2 rounded-lg text-[13.5px] font-semibold transition-opacity"
                                            style={{ background: isDarkMode ? '#6366f1' : '#4f46e5', color: '#fff' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                                        >
                                            Sign in
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Notifications Dropdown */}
                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute top-[48px] right-0 w-[min(420px,calc(100vw-24px))] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border overflow-hidden flex flex-col"
                                style={{ background: colors.card, borderColor: colors.border }}
                            >
                                <div className="px-5 py-4 border-b" style={{ borderColor: colors.border }}>
                                    <h3 className="font-semibold text-[15px]" style={{ color: colors.textMain }}>Notifications</h3>
                                </div>
                                <div className="max-h-[460px] overflow-y-auto">
                                    {computedNotifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                                            <Bell className="w-8 h-8 opacity-20" style={{ color: colors.textMuted }} />
                                            <p className="text-[13.5px]" style={{ color: colors.textFaint }}>No milestones yet — start a session!</p>
                                        </div>
                                    ) : (
                                        computedNotifications.map((notif) => (
                                            <div key={notif.id} className="flex gap-4 px-5 py-4 transition-colors cursor-default border-b last:border-0"
                                                style={{ borderColor: colors.border }}
                                                onMouseEnter={e => { e.currentTarget.style.background = colors.hoverCard; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#f4eefe] flex items-center justify-center mt-0.5">
                                                    <Award className="w-5 h-5 text-[#8b5cf6]" strokeWidth={2.5} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-[14.5px] font-semibold leading-snug" style={{ color: colors.textMain }}>{notif.title}</p>
                                                    <p className="text-[13.5px] leading-relaxed" style={{ color: colors.textMuted }}>{notif.desc}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ══ SIDEBAR + CONTENT ROW ══ */}
        <div
            className="flex flex-1 min-w-0 overflow-hidden"
            style={{ padding: '0 10px 10px 0', gap: '0' }}
        >

            {/* ══ LEFT SIDEBAR — transparent, blends into background ══ */}
            <div className="hidden lg:flex w-[220px] flex-shrink-0 flex-col relative">

                {/* Logo */}
                <div className="px-6 pt-6 pb-6">
                    <div className="flex items-center gap-1.8">
                        <img src="/images/logo.png" alt="Setu" className="w-28 transition-all duration-300" style={{ filter: colors.logo }} />
                        <span className="text-[13px] mt-1 min-w-fit font-semibold px-2.5 py-0.5 bg-purple-200 rounded-md text-black" >Pro Trial</span>
                    </div>
                </div>

                {/* Top nav */}
                <nav className="flex-1 px-3 flex flex-col gap-1">
                    {SIDEBAR_NAV_TOP.map(({ id, label, Icon, comingSoon }) => {
                        const active = dashboardView === id;
                        return (
                            <div key={id} className="relative">
                                <button
                                    onClick={() => handleNavClick(id, comingSoon)}
                                    className="w-full flex items-center gap-3 px-4 py-[10px] rounded-lg text-[14.5px] font-medium transition-colors text-left"
                                    style={{
                                        background: active ? (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)') : 'transparent',
                                        color: active ? colors.textMain : colors.textMuted,
                                    }}
                                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = colors.hover; }}
                                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                                >
                                    <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ opacity: active ? 0.75 : 0.5 }} />
                                    <span className="flex-1">{label}</span>
                                    {comingSoon && (
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
                                            Soon
                                        </span>
                                    )}
                                </button>
                                <AnimatePresence>
                                    {showComingSoon === id && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -4 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -4 }}
                                            transition={{ duration: 0.12 }}
                                            className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap shadow-lg pointer-events-none"
                                            style={{ background: isDarkMode ? '#2a2a36' : '#1a1918', color: isDarkMode ? '#e0e0e0' : '#f5f4f0', zIndex: 200 }}
                                        >
                                            Coming soon ✨
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>

                {/* Pro Trial Card */}
                <div className="px-4 mb-4">
                    <div className={`p-4 rounded-2xl ${colors.shadow} transition-shadow duration-200`} style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
                        <h3 className="font-semibold text-[14px] mb-2" style={{ color: colors.textMain }}>careersetu Pro Trial <span className="text-[13px] ml-0.5">💫</span></h3>
                        <p className="text-[13px] font-medium mb-2" style={{ color: colors.textMain }}>{trialDaysUsed} of 14 days used</p>

                        {/* Progress bar */}
                        <div className="w-full h-[6px] rounded-full mb-3 overflow-hidden" style={{ background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}>
                            <div className="h-full bg-[#8b5cf6] rounded-full transition-all duration-500" style={{ width: `${trialPct}%` }}></div>
                        </div>

                        <p className="text-[12px] leading-[1.5] mb-4" style={{ color: colors.textMuted }}>
                            Upgrade to career setu Pro to keep unlimited access
                        </p>
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="w-full py-2 px-4 rounded-[10px] text-[13px] font-semibold transition-all duration-200"
                            style={{ background: isDarkMode ? '#2a2a36' : '#f0ece6', color: colors.textMain }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDarkMode ? '#3a3a46' : '#e4dfd9'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isDarkMode ? '#2a2a36' : '#f0ece6'; }}
                        >
                            Upgrade to Pro
                        </button>
                    </div>
                </div>

                {/* Bottom nav */}
                <div className="px-3 pb-5 flex flex-col gap-1">
                    {SIDEBAR_NAV_BOTTOM.map(({ id, label, Icon, comingSoon }) => (
                        <div key={id} className="relative">
                            <button
                                onClick={() => handleNavClick(id, comingSoon)}
                                className="w-full flex items-center gap-3 px-4 py-[10px] rounded-lg text-[14.5px] font-medium transition-colors text-left"
                                style={{ color: colors.textMuted }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = colors.hover; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                            >
                                <Icon className="w-[18px] h-[18px] flex-shrink-0 opacity-50" />
                                <span className="flex-1">{label}</span>
                                {comingSoon && (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
                                        Soon
                                    </span>
                                )}
                            </button>
                            <AnimatePresence>
                                {showComingSoon === id && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -4 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -4 }}
                                        transition={{ duration: 0.12 }}
                                        className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap shadow-lg pointer-events-none"
                                        style={{ background: isDarkMode ? '#2a2a36' : '#1a1918', color: isDarkMode ? '#e0e0e0' : '#f5f4f0', zIndex: 200 }}
                                    >
                                        Coming soon ✨
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══ WHITE CARD — main content floats on the off-white bg ══ */}
            <div
                className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto transition-colors duration-300"
                style={{ background: colors.card, borderRadius: '16px', minHeight: 0 }}
            >
                {dashboardView === 'home' ? (
                    <div className="max-w-[760px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12">

                        {/* ── 1. Header row ── */}
                        <div className="flex items-center justify-between mb-10">
                            <h1 className="text-[26px] font-medium tracking-tight" style={{ color: colors.textMain }}>
                                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || 'there'}!
                            </h1>
                            <div className="flex items-center gap-4">
                                <span className="text-[14px] font-medium" style={{ color: colors.textMuted }}>📚 {recentSessions.length} session{recentSessions.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>

                        {/* ── 2. Chat input (hero) ── */}
                        <div className="mb-4 dashboard-prompt-wrapper">
                            <PromptInputBox
                                value={inputValue}
                                onChange={setInputValue}
                                onSend={(message: string) => {
                                    if (message.trim()) {
                                        onStartSession(message.trim());
                                    }
                                }}
                                isLoading={false}
                                placeholder="Ask anything to visualize — algorithms, systems, concepts..."
                                className={`w-full transition-all duration-300 ${colors.shadow} ${colors.hoverShadow}`}
                            />
                        </div>

                        {/* ── 3. Template chips — right below input ── */}
                        <div className="mb-10">
                            <p className="text-[11.5px] font-bold uppercase tracking-widest mb-3 px-1" style={{ color: colors.textFaint }}>Suggested topics</p>
                            <div className="flex flex-wrap gap-2 px-1">
                                {TEMPLATES.map(t => (
                                    <button
                                        key={t.label}
                                        onClick={() => setInputValue(t.prompt)}
                                        className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${colors.shadow} ${colors.hoverShadow} hover:-translate-y-[1px]`}
                                        style={{ background: colors.card, color: colors.textMuted, border: `1px solid ${colors.border}`, fontFamily: 'inherit' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = colors.hoverCard; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = colors.card; }}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── 4. Recent sessions — timeline ── */}
                        <div className="mb-12">
                            <p className="text-[11.5px] font-bold uppercase tracking-widest mb-3 px-1" style={{ color: colors.textFaint }}>Recent sessions</p>
                            <div className="flex flex-col gap-1">
                                {sessionsLoading && (
                                    <p className="text-[13px] px-4 py-3" style={{ color: colors.textFaint }}>Loading…</p>
                                )}
                                {!sessionsLoading && recentSessions.length === 0 && (
                                    <p className="text-[13px] px-4 py-3" style={{ color: colors.textFaint }}>No sessions yet — start learning below!</p>
                                )}
                                {!sessionsLoading && recentSessions.map(session => (
                                    <button
                                        key={session.id}
                                        onClick={() => onResumeSession(session)}
                                        className="flex items-center gap-6 px-4 py-3.5 rounded-xl text-left group transition-colors duration-200"
                                        style={{ background: 'transparent' }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = colors.hover; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                                    >
                                        <span className="text-[12.5px] w-[80px] flex-shrink-0 tabular-nums" style={{ color: colors.textFaint }}>{formatSessionDate(session.createdAt)}</span>
                                        <span className="flex-1 text-[15px] font-medium truncate" style={{ color: colors.textMain }}>{session.title}</span>
                                        <span className="text-[12.5px] flex-shrink-0" style={{ color: colors.textFaint }}>{session.messageCount > 0 ? `${Math.ceil(session.messageCount / 2)} exchanges` : 'No messages'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                ) : (
                    /* ══ SESSIONS VIEW ══ */
                    <div className="max-w-[760px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12">

                        {/* Header */}
                        <div className="flex items-center gap-4 mb-10">
                            <button
                                onClick={() => { setDashboardView('home'); setSessionSearch(''); }}
                                className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors flex-shrink-0"
                                style={{ background: colors.hover, color: colors.textMuted }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = colors.hover; }}
                            >
                                <ArrowRight className="w-4 h-4 rotate-180" />
                            </button>
                            <h1 className="text-[26px] font-medium tracking-tight" style={{ color: colors.textMain }}>Your Sessions</h1>
                            <span className="text-[13px] font-medium ml-auto" style={{ color: colors.textFaint }}>{allSessions.length} total</span>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <input
                                type="text"
                                value={sessionSearch}
                                onChange={e => setSessionSearch(e.target.value)}
                                placeholder="Search sessions…"
                                className="w-full px-4 py-2.5 rounded-xl text-[14px] outline-none transition-all"
                                style={{
                                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                    border: `1px solid ${colors.border}`,
                                    color: colors.textMain,
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        {/* Sessions list */}
                        <div className="flex flex-col gap-1">
                            {allSessionsLoading && (
                                <p className="text-[13px] px-4 py-3" style={{ color: colors.textFaint }}>Loading…</p>
                            )}
                            {!allSessionsLoading && filteredSessions.length === 0 && (
                                <p className="text-[13px] px-4 py-3" style={{ color: colors.textFaint }}>
                                    {sessionSearch ? 'No sessions match your search.' : 'No sessions yet — start learning!'}
                                </p>
                            )}
                            {!allSessionsLoading && filteredSessions.map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => onResumeSession(session)}
                                    className="flex items-center gap-6 px-4 py-3.5 rounded-xl text-left group transition-colors duration-200"
                                    style={{ background: 'transparent' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = colors.hover; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                                >
                                    <span className="text-[12.5px] w-[80px] flex-shrink-0 tabular-nums" style={{ color: colors.textFaint }}>{formatSessionDate(session.createdAt)}</span>
                                    <span className="flex-1 text-[15px] font-medium truncate" style={{ color: colors.textMain }}>{session.title}</span>
                                    <span className="text-[12.5px] flex-shrink-0" style={{ color: colors.textFaint }}>{session.messageCount > 0 ? `${Math.ceil(session.messageCount / 2)} exchanges` : 'No messages'}</span>
                                </button>
                            ))}
                        </div>

                    </div>
                )}
            </div>
        </div>

        {/* ══ UPGRADE TO PRO MODAL ══ */}
        <AnimatePresence>
            {showUpgradeModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.45)' }}
                    onClick={() => setShowUpgradeModal(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 12 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="w-[380px] rounded-2xl p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                        style={{ background: colors.card, border: `1px solid ${colors.border}` }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-[40px] mb-4">🚀</div>
                        <h2 className="text-[20px] font-semibold mb-2" style={{ color: colors.textMain }}>Pro is coming soon</h2>
                        <p className="text-[14px] leading-relaxed mb-6" style={{ color: colors.textMuted }}>
                            Unlimited sessions, priority rendering, and advanced visualizations — all launching very soon.
                        </p>
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            className="w-full py-2.5 px-4 rounded-[10px] text-[14px] font-semibold transition-all duration-200"
                            style={{ background: '#8b5cf6', color: '#ffffff' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#7c3aed'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#8b5cf6'; }}
                        >
                            Got it
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// Simple Markdown → HTML
// ══════════════════════════════════════════════════════════════

function renderMarkdownToHtml(md: string): string {
    // First, extract fenced code blocks before escaping HTML
    const codeBlocks: string[] = [];
    let processed = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
        const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const langLabel = lang ? `<span class="md-code-lang">${lang}</span>` : '';
        codeBlocks.push(
            `<div class="md-code-block">${langLabel}<pre class="md-pre"><code class="md-block-code">${escaped.replace(/\n$/, '')}</code></pre></div>`
        );
        return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // Escape HTML in remaining text
    processed = processed.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Blockquotes
    processed = processed.replace(/^&gt; (.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>');

    // Headings
    processed = processed.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
    processed = processed.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>');
    processed = processed.replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>');

    // Horizontal rule
    processed = processed.replace(/^---$/gm, '<hr class="md-hr" />');

    // Inline formatting
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
    processed = processed.replace(/`([^`]+)`/g, '<code class="md-code">$1</code>');

    // Lists
    processed = processed.replace(/^[-•] (.+)$/gm, '<li class="md-li">$1</li>');
    processed = processed.replace(/((?:<li class="md-li">.*<\/li>\n?)+)/g, '<ul class="md-ul">$1</ul>');
    processed = processed.replace(/^\d+\. (.+)$/gm, '<li class="md-oli">$1</li>');
    processed = processed.replace(/((?:<li class="md-oli">.*<\/li>\n?)+)/g, '<ol class="md-ol">$1</ol>');

    // Paragraphs (lines that aren't already wrapped)
    processed = processed.replace(/^(?!<[hulo]|<li|<div|<pre|<code|<block|<hr|<strong|<em|__CODE|\s*$)(.+)$/gm, '<p class="md-p">$1</p>');

    // Restore code blocks
    codeBlocks.forEach((block, i) => {
        processed = processed.replace(`__CODE_BLOCK_${i}__`, block);
    });

    return processed;
}

// ══════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════

export default function RealtimeTutor() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const [isConnected, setIsConnected] = useState(false);
    const [statusText, setStatusText] = useState('Disconnected');
    const [pages, setPages] = useState<CanvasPage[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [assistantPartial, setAssistantPartial] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isResponseLoading, setIsResponseLoading] = useState(false);
    const [pipelineStatus, setPipelineStatus] = useState<null | 'planning' | 'generating'>(null);
    const [ackTranscription, setAckTranscription] = useState('');
    const [displayedAck, setDisplayedAck] = useState('');

    useEffect(() => {
        if (!ackTranscription) {
            setDisplayedAck('');
            return;
        }
        let i = 0;
        const interval = setInterval(() => {
            setDisplayedAck(ackTranscription.slice(0, i + 1));
            i++;
            if (i >= ackTranscription.length) clearInterval(interval);
        }, 30);
        return () => clearInterval(interval);
    }, [ackTranscription]);

    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const stepIndexFallbackRef = useRef(0);

    // Column refs: each page has a left and right column div
    const leftColRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
    const rightColRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());

    // Active placement tracking
    const currentPageIdRef = useRef<string | null>(null);
    const activeSideRef = useRef<'left' | 'right'>('left');
    const canvasColumnsRef = useRef<Set<string>>(new Set()); // locked canvas-mode columns, key: `${pageId}:${side}`
    // The most recently created inline SVG for visual instructions
    const currentInlineSvgRef = useRef<SVGSVGElement | null>(null);
    // The active primitive registry for the current inline SVG (set by base functions)
    const activePrimitiveRegistryRef = useRef<any>(null);
    // The most recently created code panel element (for highlightMatch calls)
    const currentCodePanelRef = useRef<HTMLElement | null>(null);
    // visual_id routing: maps backend-assigned ID → specific DOM target for stacked visuals
    const visualIdSvgMapRef = useRef<Map<string, SVGSVGElement>>(new Map());
    const visualIdCodePanelMapRef = useRef<Map<string, HTMLElement>>(new Map());
    const visualIdRegistryMapRef = useRef<Map<string, any>>(new Map());

    // Playback queue
    const playbackQueueRef = useRef<PlaybackItem[]>([]);
    const isProcessingQueueRef = useRef(false);
    const currentTtsAudioRef = useRef<HTMLAudioElement | null>(null);
    const ttsAudioFormatRef = useRef<string>('mp3');
    const pendingTtsChunksRef = useRef<string[]>([]);
    const pendingD3StepsRef = useRef<D3PlaybackStep[]>([]);
    const pendingCodeStepsRef = useRef<CodePlaybackStep[]>([]);
    const pendingContentBlocksRef = useRef<string[]>([]);

    // Pause / Stop
    const isPausedRef = useRef(false);
    const [isPausedState, setIsPausedState] = useState(false);
    const completedPlaybackCountRef = useRef(0);
    const ttsResolveRef = useRef<(() => void) | null>(null);
    const currentPlayingTtsChunksRef = useRef<string[]>([]);
    const pausedTtsChunksRef = useRef<string[] | null>(null);
    const [isPlayingContent, setIsPlayingContent] = useState(false);

    // Dashboard / Canvas overlay state
    const [isCanvasActive, setIsCanvasActive] = useState(true);
    const [isCanvasMinimized, setIsCanvasMinimized] = useState(false);
    const [activeSessionTitle, setActiveSessionTitle] = useState('');
    const pendingPromptRef = useRef<string | null>(null);
    const sessionIdRef = useRef<string | null>(null);
    // When true, the WS connect will pass is_new=1 so the backend skips db.get_session.
    // Set to true for brand-new sessions, false for resumes.
    const isNewSessionRef = useRef(false);
    // When true, ws.onclose will schedule an automatic reconnect instead of staying disconnected.
    // Set to false only when the user intentionally ends the session via handleCloseCanvas.
    const autoReconnectRef = useRef(false);
    const fatalWsFailureRef = useRef(false);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Dashboard input (lifted so we can pre-fill after sign-in)
    const [dashboardInput, setDashboardInput] = useState('');

    // Recent sessions (loaded from Supabase)
    const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    // DB write state — frontend owns these counters now
    const messageCountRef = useRef(0);       // sequence_index for chat_messages
    const playbackSeqRef = useRef(0);        // sequence_index for playback_items
    const hadMessagesRef = useRef(false);    // whether any messages were sent this session

    // Per-turn accumulators for DB writes (cleared on narration_done)
    const turnD3StepsRef = useRef<any[]>([]);
    const turnCodeStepsRef = useRef<any[]>([]);
    const turnContentBlocksRef = useRef<string[]>([]);
    const turnNarrationPartsRef = useRef<string[]>([]);

    // Auth state
    const [user, setUser] = useState<User | null>(null);
    const accessTokenRef = useRef<string>('');  // always holds the latest Supabase access token
    const wsStrategyIndexRef = useRef(0);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authPendingPrompt, setAuthPendingPrompt] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);

    const resetCanvasUiState = useCallback(() => {
        setPages([]);
        setChatMessages([]);
        setAssistantPartial('');
        setAckTranscription('');
        setDisplayedAck('');
        setPipelineStatus(null);
        setIsPlayingContent(false);
        setIsPausedState(false);

        currentPageIdRef.current = null;
        activeSideRef.current = 'left';
        leftColRefsMap.current.clear();
        rightColRefsMap.current.clear();
        canvasColumnsRef.current.clear();
        currentInlineSvgRef.current = null;
        activePrimitiveRegistryRef.current = null;
        currentCodePanelRef.current = null;
        visualIdSvgMapRef.current.clear();
        visualIdCodePanelMapRef.current.clear();
        visualIdRegistryMapRef.current.clear();

        playbackQueueRef.current = [];
        isProcessingQueueRef.current = false;
        pendingTtsChunksRef.current = [];
        pendingD3StepsRef.current = [];
        pendingCodeStepsRef.current = [];
        pendingContentBlocksRef.current = [];
        turnD3StepsRef.current = [];
        turnCodeStepsRef.current = [];
        turnContentBlocksRef.current = [];
        turnNarrationPartsRef.current = [];
        pausedTtsChunksRef.current = null;
        currentPlayingTtsChunksRef.current = [];
        completedPlaybackCountRef.current = 0;
        stepIndexFallbackRef.current = 0;

        if (currentTtsAudioRef.current) {
            currentTtsAudioRef.current.pause();
            currentTtsAudioRef.current = null;
        }
        if (ttsResolveRef.current) {
            ttsResolveRef.current();
            ttsResolveRef.current = null;
        }
        isPausedRef.current = false;
    }, []);

    const loadRecentSessions = useCallback(async (userId: string) => {
        setSessionsLoading(true);
        const { data } = await supabase
            .from('sessions')
            .select('id, title, primitives_used, message_count, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);
        if (data) setRecentSessions(data.map((s: any) => ({
            id: s.id,
            title: s.title || 'Untitled Session',
            primitiveType: getPrimitiveTypeFromIds(s.primitives_used ?? []),
            messageCount: s.message_count ?? 0,
            createdAt: s.created_at,
        })));
        setSessionsLoading(false);
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            accessTokenRef.current = session?.access_token ?? '';
            if (session?.user) loadRecentSessions(session.user.id);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            accessTokenRef.current = session?.access_token ?? '';
            if (session?.user) loadRecentSessions(session.user.id);
            else setRecentSessions([]);
        });
        return () => subscription.unsubscribe();
    }, [loadRecentSessions]);

    const handleSignOut = async () => { await supabase.auth.signOut(); };

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        if (authPendingPrompt) {
            sessionStorage.setItem('outlrn_pending_prompt', authPendingPrompt);
        }
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
    };

    // After sign-in redirect, restore the pending prompt into the input field
    useEffect(() => {
        if (user) {
            setShowAuthModal(false);
            const saved = sessionStorage.getItem('outlrn_pending_prompt');
            if (saved) {
                sessionStorage.removeItem('outlrn_pending_prompt');
                setDashboardInput(saved);
            }
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    // Load KaTeX
    useEffect(() => {
        if (typeof window !== 'undefined' && !document.getElementById('katex-css')) {
            const link = document.createElement('link');
            link.id = 'katex-css'; link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
            document.head.appendChild(link);
            const script = document.createElement('script');
            script.id = 'katex-js';
            script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
            document.head.appendChild(script);
        }
    }, []);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, assistantPartial]);

    // Auto-scroll canvas when new pages appear
    useEffect(() => {
        if (pages.length > 0 && canvasContainerRef.current) {
            setTimeout(() => {
                const c = canvasContainerRef.current;
                if (c) c.scrollTo({ left: c.scrollWidth - c.clientWidth, behavior: 'smooth' });
            }, 150);
        }
    }, [pages.length]);

    // ── Enable canvas (pan) mode on an overflowing column ──
    const enableCanvasMode = useCallback((outerColEl: HTMLDivElement, colKey: string) => {
        if (canvasColumnsRef.current.has(colKey)) return; // idempotent
        canvasColumnsRef.current.add(colKey);

        outerColEl.classList.remove('overflow-hidden');
        outerColEl.classList.add('canvas-col-mode');
        outerColEl.style.overflowY = 'auto';
        outerColEl.style.overflowX = 'auto';

        let startX = 0, startY = 0, startScrollLeft = 0, startScrollTop = 0, dragging = false;
        outerColEl.addEventListener('pointerdown', (e: PointerEvent) => {
            dragging = true;
            startX = e.clientX; startY = e.clientY;
            startScrollLeft = outerColEl.scrollLeft; startScrollTop = outerColEl.scrollTop;
            outerColEl.setPointerCapture(e.pointerId);
        });
        outerColEl.addEventListener('pointermove', (e: PointerEvent) => {
            if (dragging) {
                outerColEl.scrollLeft = startScrollLeft + (startX - e.clientX);
                outerColEl.scrollTop = startScrollTop + (startY - e.clientY);
            }
        });
        outerColEl.addEventListener('pointerup', () => { dragging = false; });
        outerColEl.addEventListener('pointercancel', () => { dragging = false; });
    }, []);

    // ── Get the active column DOM element ──
    // Canvas-mode columns are still writable — they just have scroll enabled.
    // We only skip a column when we explicitly want to start fresh (e.g., content blocks that don't fit).
    const getActiveColumn = useCallback((): HTMLDivElement | null => {
        if (!currentPageIdRef.current) return null;
        const pId = currentPageIdRef.current!;
        const side = activeSideRef.current;
        return (side === 'left' ? leftColRefsMap : rightColRefsMap).current.get(pId) || null;
    }, []);

    // ── Check and move elements if they overflow the active column ──
    const checkAndMoveOverflow = useCallback((el: HTMLElement) => {
        if (typeof window === 'undefined' || el.dataset.moving) return;

        const colEl = el.parentElement;
        const outerCol = colEl?.parentElement as HTMLDivElement | null;

        // ── Check for horizontal overflow (visual wider than column) ──
        if (colEl && outerCol) {
            const colWidth = outerCol.clientWidth;
            if (el.scrollWidth > colWidth) {
                const pageId = currentPageIdRef.current!;
                const side = activeSideRef.current;
                const colKey = `${pageId}:${side}`;
                enableCanvasMode(outerCol, colKey);
            }
        }

        const rect = el.getBoundingClientRect();
        if (rect.bottom <= window.innerHeight - 40) return;

        // ── Visual block: enable canvas scrolling on column, but DON'T advance cursor ──
        // Annotations and subsequent content belonging to this visual should stay in the same column.
        if (el.classList.contains('visual-block')) {
            const pageId = currentPageIdRef.current!;
            const side = activeSideRef.current;
            const colKey = `${pageId}:${side}`;
            if (outerCol) enableCanvasMode(outerCol, colKey);

            // Auto-scroll the column to show the latest content
            if (outerCol) {
                requestAnimationFrame(() => {
                    outerCol.scrollTop = outerCol.scrollHeight;
                });
            }
            return; // el stays in place, cursor stays in this column
        }

        // ── Content block: move to next column/page ──
        {
            let newSide = activeSideRef.current === 'left' ? 'right' : 'left';
            let newPageId = currentPageIdRef.current;

            if (newSide === 'left') {
                newPageId = genId();
                setPages(prev => [...prev, { id: newPageId! }]);
            }

            activeSideRef.current = newSide as 'left' | 'right';
            if (newPageId) currentPageIdRef.current = newPageId;

            // Reset inline SVG when moving to a new column so future visuals start fresh
            currentInlineSvgRef.current = null;
            activePrimitiveRegistryRef.current = null;

            el.dataset.moving = "true";

            const map = newSide === 'left' ? leftColRefsMap.current : rightColRefsMap.current;
            const immediateCol = map.get(newPageId!);

            if (immediateCol) {
                immediateCol.appendChild(el);
                delete el.dataset.moving;
                if (newSide === 'left' && canvasContainerRef.current) {
                    canvasContainerRef.current.scrollTo({
                        left: canvasContainerRef.current.scrollWidth - canvasContainerRef.current.clientWidth,
                        behavior: 'smooth',
                    });
                }
            } else {
                const moveWhenReady = () => {
                    const nextCol = map.get(newPageId!);
                    if (nextCol) {
                        nextCol.appendChild(el);
                        delete el.dataset.moving;
                        if (newSide === 'left' && canvasContainerRef.current) {
                            canvasContainerRef.current.scrollTo({
                                left: canvasContainerRef.current.scrollWidth - canvasContainerRef.current.clientWidth,
                                behavior: 'smooth',
                            });
                        }
                    } else {
                        requestAnimationFrame(moveWhenReady);
                    }
                };
                requestAnimationFrame(moveWhenReady);
            }
        }
    }, [enableCanvasMode]);

    // ── Ensure a page exists ──
    const ensurePage = useCallback((): string => {
        if (currentPageIdRef.current) return currentPageIdRef.current;
        const id = genId();
        currentPageIdRef.current = id;
        activeSideRef.current = 'left';
        currentInlineSvgRef.current = null;
        activePrimitiveRegistryRef.current = null;
        setPages(prev => [...prev, { id }]);
        return id;
    }, []);

    // Functions whose D3 transitions must finish before the next step runs
    const ANIMATED_FUNCTIONS = new Set(['swap', 'movePointer', 'setRangeDull', 'setBracket', 'setNodeHighlight', 'setEdgeHighlight', 'clearHighlights', 'setFocus', 'setGhost', 'addNode']);

    // ── Execute a primitive function on an SVG ──
    // Returns a Promise that resolves after any D3 transition completes.
    // Pass fast=true to skip the animation settle wait (used during session restore).
    const executePrimitiveFunction = useCallback((svgEl: SVGSVGElement, instruction: any, stepIndex: number, fast = false): Promise<void> => {
        if (!instruction || typeof instruction !== 'object') return Promise.resolve();
        const { fn, args } = instruction;
        if (!fn) return Promise.resolve();
        const entries = FUNCTION_LOOKUP[fn];
        if (!entries || entries.length === 0) { console.warn(`[Primitive] Unknown function: ${fn}`); return Promise.resolve(); }

        // If this is a base function, pin the active primitive registry
        if (BASE_TO_REGISTRY[fn]) {
            activePrimitiveRegistryRef.current = BASE_TO_REGISTRY[fn];
        }

        // Pick the implementation that matches the active primitive registry.
        // This prevents e.g. linked-list's movePointer from running on an array SVG.
        let entry = entries[0]; // default to first
        if (activePrimitiveRegistryRef.current) {
            const match = entries.find(e => e.registry === activePrimitiveRegistryRef.current);
            if (match) entry = match;
        }

        try {
            const svg = d3.select(svgEl);
            const mergedArgs = { ...(args && typeof args === 'object' ? args : {}), _stepIndex: stepIndex, _fast: fast };

            // Temporary patch for D3 transition duration in fast mode
            let origDuration: any;
            if (fast && d3.selection.prototype.transition) {
                const dummy = d3.select(document.createElement('div')).transition();
                const TransitionProto = (dummy as any).constructor.prototype;
                origDuration = TransitionProto.duration;
                TransitionProto.duration = function() {
                    return origDuration.call(this, 0); // Force all durations to 0
                };
            }

            const runner = new Function('d3', 'svg', 'args', 'registry', 'dagre', entry.code);
            runner(d3, svg, mergedArgs, entry.registry, dagre);

            if (fast && origDuration) {
                const dummy = d3.select(document.createElement('div')).transition();
                (dummy as any).constructor.prototype.duration = origDuration;
            }
        } catch (err) { console.error(`[Primitive] Error executing ${fn}:`, err); return Promise.resolve(); }

        // In normal playback mode wait for D3 transitions to complete.
        if (ANIMATED_FUNCTIONS.has(fn)) {
            if (fast) {
                // Wait briefly for duration(0) transitions to fire their on('end') callbacks before the next step
                return new Promise<void>(resolve => { setTimeout(resolve, 20); });
            } else {
                return new Promise<void>(resolve => { setTimeout(resolve, 650); });
            }
        }
        return Promise.resolve();
    }, []);

    // ── Append a markdown content block to the active column ──
    const appendContent = useCallback((markdown: string) => {
        const waitAndAppend = () => {
            const col = getActiveColumn();
            if (!col) { requestAnimationFrame(waitAndAppend); return; }

            const block = document.createElement('div');
            block.className = 'content-block animate-in fade-in duration-500';
            block.innerHTML = renderMarkdownToHtml(markdown);
            col.appendChild(block);

            // Extract title from first heading
            const titleMatch = markdown.match(/^#+\s+(.+)$/m);
            if (titleMatch) {
                const pageId = currentPageIdRef.current;
                setPages(prev => prev.map(p =>
                    p.id === pageId && !p.title ? { ...p, title: titleMatch[1] } : p
                ));
            }

            checkAndMoveOverflow(block);
        };

        const col = getActiveColumn();
        if (!col) requestAnimationFrame(waitAndAppend);
        else waitAndAppend();
    }, [getActiveColumn, checkAndMoveOverflow]);

    // ── Execute a D3 visual step inline in the active column ──
    // Pass fast=true during session restore to skip animation waits.
    // visualId routes to a specific stacked visual when the backend provides one.
    const executeVisualStep = useCallback(async (instruction: any, stepIndex: number, fast = false, visualId?: string) => {
        if (!instruction || typeof instruction !== 'object') return;
        const fn = instruction.fn;

        // Wait for the active column to be ready
        const col = await new Promise<HTMLElement>(resolve => {
            const check = () => {
                const c = getActiveColumn();
                if (c) resolve(c);
                else requestAnimationFrame(check);
            };
            check();
        });

        let wrapper: HTMLElement;
        let targetSvg: SVGSVGElement;

        if (BASE_FUNCTIONS.has(fn) || !currentInlineSvgRef.current) {
            const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgEl.style.width = '100%';
            svgEl.style.display = 'block';
            svgEl.style.overflow = 'visible';

            wrapper = document.createElement('div');
            wrapper.className = 'visual-block animate-in fade-in duration-500';
            wrapper.style.marginTop = '12px';
            wrapper.style.marginBottom = '24px';

            wrapper.appendChild(svgEl);
            col.appendChild(wrapper);

            currentInlineSvgRef.current = svgEl;
            targetSvg = svgEl;

            if (visualId) {
                visualIdSvgMapRef.current.set(visualId, svgEl);
            }
        } else if (visualId && visualIdSvgMapRef.current.has(visualId)) {
            targetSvg = visualIdSvgMapRef.current.get(visualId)!;
            wrapper = targetSvg.closest('.visual-block') as HTMLElement;
        } else {
            if (visualId) {
                console.warn(`[visual_id] Unknown visual_id "${visualId}" for fn "${fn}", falling back to latest`);
            }
            targetSvg = currentInlineSvgRef.current;
            wrapper = currentInlineSvgRef.current.closest('.visual-block') as HTMLElement;
        }

        // Temporarily swap registry when targeting a mapped visual so the correct implementation is picked
        const prevRegistry = activePrimitiveRegistryRef.current;
        if (visualId && !BASE_FUNCTIONS.has(fn) && visualIdRegistryMapRef.current.has(visualId)) {
            activePrimitiveRegistryRef.current = visualIdRegistryMapRef.current.get(visualId);
        }

        await executePrimitiveFunction(targetSvg, instruction, stepIndex, fast);

        // After base execution, snapshot the registry that was pinned for this visual_id
        if (visualId && BASE_TO_REGISTRY[fn]) {
            visualIdRegistryMapRef.current.set(visualId, activePrimitiveRegistryRef.current);
        }

        // Restore registry after a non-base step that targeted a different visual
        if (visualId && !BASE_FUNCTIONS.has(fn) && visualIdRegistryMapRef.current.has(visualId)) {
            activePrimitiveRegistryRef.current = prevRegistry;
        }

        // Auto-size SVG to fit actual content (both width and height),
        // including flowchart annotation callouts that can sit outside node bounds.
        try {
            const bbox = targetSvg.getBBox();
            if (bbox.width > 0 && bbox.height > 0) {
                const pad = 12;
                let rightBound = bbox.x + bbox.width;
                let bottomBound = bbox.y + bbox.height;

                // Annotation bubbles are rendered as <g id="fc-annot-*"> with a <rect>.
                // Use their explicit rect bounds so canvas sizing follows callout placement.
                targetSvg.querySelectorAll('[id^="fc-annot-"] rect').forEach((el) => {
                    const rect = el as SVGRectElement;
                    const x = Number(rect.getAttribute('x') ?? 0);
                    const y = Number(rect.getAttribute('y') ?? 0);
                    const w = Number(rect.getAttribute('width') ?? 0);
                    const h = Number(rect.getAttribute('height') ?? 0);
                    rightBound = Math.max(rightBound, x + w);
                    bottomBound = Math.max(bottomBound, y + h);
                });

                targetSvg.style.height = `${bottomBound + pad}px`;

                const outerCol = wrapper?.parentElement?.parentElement as HTMLDivElement | null;
                if (outerCol) {
                    const colWidth = outerCol.clientWidth - 48;
                    const contentWidth = rightBound + pad;
                    if (contentWidth > colWidth) {
                        targetSvg.style.width = `${contentWidth}px`;
                        targetSvg.style.minWidth = `${contentWidth}px`;
                        const pageId = currentPageIdRef.current!;
                        const side = activeSideRef.current;
                        const colKey = `${pageId}:${side}`;
                        enableCanvasMode(outerCol, colKey);
                    }
                }

                if (wrapper) checkAndMoveOverflow(wrapper);
            }
        } catch { /* getBBox can throw if SVG is empty */ }
    }, [getActiveColumn, executePrimitiveFunction, checkAndMoveOverflow, enableCanvasMode]);

    // ── Execute a code panel step ──────────────────────────────────────────
    // visualId routes to a specific stacked code panel when the backend provides one.
    const executeCodeStep = useCallback(async (instruction: any, visualId?: string) => {
        if (!instruction || typeof instruction !== 'object') return;
        const fn = instruction.fn;
        const args = instruction.args ?? {};

        if (fn === 'renderCodeBase') {
            // Create a fresh code panel and insert it into the active column
            const col = await new Promise<HTMLElement>(resolve => {
                const check = () => { const c = getActiveColumn(); if (c) resolve(c); else requestAnimationFrame(check); };
                check();
            });

            const language: string = args.language ?? '';
            const code: string = args.code ?? '';

            const panel = document.createElement('div');
            panel.className = 'code-panel-block visual-block animate-in fade-in duration-500';
            panel.style.cssText = 'margin-top:12px;margin-bottom:24px;border-radius:8px;overflow:hidden;background:#1e1e2e;border:1px solid rgba(255,255,255,0.08);';
            panel.dataset.rawCode = code;
            panel.dataset.language = language;
            panel.dataset.highlights = '[]';

            const header = document.createElement('div');
            header.style.cssText = 'padding:6px 12px;background:rgba(255,255,255,0.05);font-size:11px;font-family:monospace;color:rgba(255,255,255,0.4);letter-spacing:0.05em;text-transform:uppercase;';
            header.textContent = language || 'code';

            const pre = document.createElement('pre');
            pre.style.cssText = 'margin:0;padding:16px;overflow-x:auto;font-size:13px;line-height:1.6;font-family:"Fira Code","Cascadia Code","JetBrains Mono",monospace;color:#cdd6f4;';

            const codeEl = document.createElement('code');
            codeEl.innerHTML = _escapeAndHighlight(code, []);

            pre.appendChild(codeEl);
            panel.appendChild(header);
            panel.appendChild(pre);
            col.appendChild(panel);
            requestAnimationFrame(() => checkAndMoveOverflow(panel));

            currentCodePanelRef.current = panel;
            if (visualId) {
                visualIdCodePanelMapRef.current.set(visualId, panel);
            }

        } else if (fn === 'highlightMatch') {
            let panel: HTMLElement | null = null;
            if (visualId && visualIdCodePanelMapRef.current.has(visualId)) {
                panel = visualIdCodePanelMapRef.current.get(visualId)!;
            } else {
                if (visualId) {
                    console.warn(`[visual_id] Unknown visual_id "${visualId}" for highlightMatch, falling back to latest`);
                }
                panel = currentCodePanelRef.current;
            }
            if (!panel) return;

            const text: string = args.text ?? '';
            const active: boolean = args.active !== false;

            let highlights: string[] = JSON.parse(panel.dataset.highlights ?? '[]');
            if (active) {
                if (!highlights.includes(text)) highlights = [...highlights, text];
            } else {
                highlights = highlights.filter(h => h !== text);
            }
            panel.dataset.highlights = JSON.stringify(highlights);

            const rawCode = panel.dataset.rawCode ?? '';
            const codeEl = panel.querySelector('code');
            if (codeEl) codeEl.innerHTML = _escapeAndHighlight(rawCode, highlights);
        }
    }, [getActiveColumn, checkAndMoveOverflow]);

    // ── WebSocket ──
    const connectWs = useCallback(async (strategyIndex = 0) => {
        if (fatalWsFailureRef.current && strategyIndex === 0) {
            setIsConnected(false);
            setStatusText('WebSocket unavailable');
            return;
        }
        if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
            if (pendingPromptRef.current) {
                const prompt = pendingPromptRef.current;
                pendingPromptRef.current = null;
                sendText(prompt);
            }
            return;
        }
        // Clear any pending reconnect timer before opening a new connection
        if (reconnectTimerRef.current) { clearTimeout(reconnectTimerRef.current); reconnectTimerRef.current = null; }

        if (!accessTokenRef.current) {
            const { data: { session } } = await supabase.auth.getSession();
            accessTokenRef.current = session?.access_token ?? '';
            if (!user && session?.user) setUser(session.user);
        }

        // Build safer handshake strategies.
        // Important: avoid sending user_id without token because backend may reject it.
        const strategyParams: Array<() => URLSearchParams> = [];

        if (accessTokenRef.current && user?.id) {
            strategyParams.push(() => {
                const params = new URLSearchParams();
                params.set('token', accessTokenRef.current);
                params.set('user_id', user.id);
                if (sessionIdRef.current) params.set('session_id', sessionIdRef.current);
                if (isNewSessionRef.current) params.set('is_new', '1');
                return params;
            });
        }

        strategyParams.push(() => {
            const params = new URLSearchParams();
            if (sessionIdRef.current) params.set('session_id', sessionIdRef.current);
            if (isNewSessionRef.current) params.set('is_new', '1');
            return params;
        });

        strategyParams.push(() => new URLSearchParams());

        const resolvedStrategy = Math.min(strategyIndex, strategyParams.length - 1);
        wsStrategyIndexRef.current = resolvedStrategy;
        const params = strategyParams[resolvedStrategy]();
        const url = params.toString() ? `${WS_URL}?${params.toString()}` : WS_URL;
        const ws = new WebSocket(url);
        wsRef.current = ws;
        let opened = false;

        ws.onopen = () => {
            opened = true;
            fatalWsFailureRef.current = false;
            setIsConnected(true);
            setStatusText('Online');
            wsStrategyIndexRef.current = 0;
            if (pendingPromptRef.current) {
                const prompt = pendingPromptRef.current;
                pendingPromptRef.current = null;
                sendText(prompt);
            }
        };

        ws.onclose = (event: CloseEvent) => {
            setIsConnected(false);
            const hasFallback = !opened && resolvedStrategy < strategyParams.length - 1;
            setStatusText(
                hasFallback
                    ? 'Retrying connection…'
                    : (event.code === 1006 ? `WebSocket rejected (${event.code})` : 'Disconnected')
            );
            wsRef.current = null;
            if (hasFallback) {
                reconnectTimerRef.current = setTimeout(() => connectWs(resolvedStrategy + 1), 400);
                return;
            }
            if (!opened) {
                fatalWsFailureRef.current = true;
                autoReconnectRef.current = false;
                setStatusText('WebSocket unavailable');
                return;
            }
            // Auto-reconnect if the canvas is still active (i.e. user didn't intentionally end)
            if (autoReconnectRef.current) {
                reconnectTimerRef.current = setTimeout(() => connectWs(0), 3000);
            }
        };

        ws.onerror = () => { setStatusText('Connection error'); };
        ws.onmessage = (event: MessageEvent) => {
            try { handleServerMessage(JSON.parse(event.data)); } catch { /* ignore */ }
        };
    }, [user]); // sendText is stable (empty deps) — safe to omit from deps array

    // Only called when the user intentionally ends the session — stops auto-reconnect.
    const disconnectWs = useCallback(() => {
        autoReconnectRef.current = false;
        fatalWsFailureRef.current = false;
        if (reconnectTimerRef.current) { clearTimeout(reconnectTimerRef.current); reconnectTimerRef.current = null; }
        if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
        setIsConnected(false);
        setStatusText('Disconnected');
    }, []);

    // ── TTS ──
    const playOneTtsItem = useCallback((chunks: string[]): Promise<void> => {
        return new Promise((resolve) => {
            if (chunks.length === 0) { resolve(); return; }
            currentPlayingTtsChunksRef.current = chunks;
            ttsResolveRef.current = resolve;
            const done = () => { currentPlayingTtsChunksRef.current = []; ttsResolveRef.current = null; resolve(); };
            try {
                const parts = chunks.map((c: string) => {
                    const raw = atob(c);
                    const bytes = new Uint8Array(raw.length);
                    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
                    return bytes;
                });
                const mimeType = ttsAudioFormatRef.current === 'wav' ? 'audio/wav' : 'audio/mpeg';
                const blob = new Blob(parts, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                currentTtsAudioRef.current = audio;
                audio.onended = () => { URL.revokeObjectURL(url); currentTtsAudioRef.current = null; done(); };
                audio.onerror = () => { URL.revokeObjectURL(url); currentTtsAudioRef.current = null; done(); };
                audio.play().catch(() => done());
            } catch { done(); }
        });
    }, []);

    // ── Playback Queue ──
    const processPlaybackQueue = useCallback(async () => {
        if (isProcessingQueueRef.current) return;
        isProcessingQueueRef.current = true;
        setIsPlayingContent(true);

        // Replay TTS chunk that was interrupted by pause
        if (pausedTtsChunksRef.current && !isPausedRef.current) {
            const chunks = pausedTtsChunksRef.current;
            pausedTtsChunksRef.current = null;
            await playOneTtsItem(chunks);
        }

        while (playbackQueueRef.current.length > 0) {
            if (isPausedRef.current) break;
            const item = playbackQueueRef.current.shift()!;

            // 1. Render content blocks (text → active column)
            for (const md of item.contentBlocks) { appendContent(md); }

            // 2. Execute D3 visual steps (SVG → active column), awaiting animations
            for (const step of item.d3Steps) { await executeVisualStep(step.instruction, step.index, false, step.visual_id); }

            // 3. Execute code panel steps (renderCodeBase / highlightMatch)
            for (const step of item.codeSteps) { await executeCodeStep(step.instruction, step.visual_id); }

            // 4. Scroll to latest page
            if ((item.d3Steps.length > 0 || item.codeSteps.length > 0 || item.contentBlocks.length > 0) && canvasContainerRef.current) {
                canvasContainerRef.current.scrollTo({
                    left: canvasContainerRef.current.scrollWidth - canvasContainerRef.current.clientWidth,
                    behavior: 'smooth',
                });
            }

            // 4. Play TTS
            if (item.ttsChunks.length > 0) { await playOneTtsItem(item.ttsChunks); }

            if (!isPausedRef.current) { completedPlaybackCountRef.current += 1; }
        }

        isProcessingQueueRef.current = false;
        if (playbackQueueRef.current.length === 0 && !isPausedRef.current) { setIsPlayingContent(false); }
    }, [playOneTtsItem, appendContent, executeVisualStep, executeCodeStep]);

    const enqueuePlayback = useCallback((item: PlaybackItem) => {
        playbackQueueRef.current.push(item);
        processPlaybackQueue();
    }, [processPlaybackQueue]);

    // ── Send ──
    const sendText = useCallback((text: string) => {
        if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        // Flush all stale state from any previous generation
        if (currentTtsAudioRef.current) { currentTtsAudioRef.current.pause(); currentTtsAudioRef.current = null; }
        if (ttsResolveRef.current) { ttsResolveRef.current(); ttsResolveRef.current = null; }
        pausedTtsChunksRef.current = null;
        playbackQueueRef.current = [];
        isProcessingQueueRef.current = false;
        pendingTtsChunksRef.current = [];
        pendingD3StepsRef.current = [];
        pendingCodeStepsRef.current = [];
        pendingContentBlocksRef.current = [];
        visualIdSvgMapRef.current.clear();
        visualIdCodePanelMapRef.current.clear();
        visualIdRegistryMapRef.current.clear();
        if (isPausedRef.current) { isPausedRef.current = false; setIsPausedState(false); }
        setIsResponseLoading(true);
        const firstName = user?.user_metadata?.full_name?.split(' ')[0]
            || user?.user_metadata?.name?.split(' ')[0]
            || '';
        wsRef.current.send(JSON.stringify({ type: 'text', content: text.trim(), user_name: firstName }));
        setChatMessages(prev => [...prev, { id: genId(), role: 'user', content: text.trim(), timestamp: Date.now() }]);
        // Fire-and-forget: write user message to DB
        if (sessionIdRef.current) {
            hadMessagesRef.current = true;
            dbWriteChatMessage(sessionIdRef.current, 'user', text.trim(), messageCountRef.current, false);
            messageCountRef.current++;
        }
    }, [user]);

    // ── Pause / Resume / Stop ──
    const handlePause = useCallback(() => {
        isPausedRef.current = true; setIsPausedState(true);
        if (currentTtsAudioRef.current) { currentTtsAudioRef.current.pause(); currentTtsAudioRef.current = null; }
        // Unblock the queue loop if it is awaiting TTS playback; save chunks to replay on resume
        if (ttsResolveRef.current) {
            if (currentPlayingTtsChunksRef.current.length > 0)
                pausedTtsChunksRef.current = currentPlayingTtsChunksRef.current;
            ttsResolveRef.current();
            ttsResolveRef.current = null;
        }
        if (wsRef.current?.readyState === WebSocket.OPEN)
            wsRef.current.send(JSON.stringify({ type: 'pause', lastCompletedStep: completedPlaybackCountRef.current }));
    }, []);

    const handleResume = useCallback(() => {
        isPausedRef.current = false; setIsPausedState(false);
        if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify({ type: 'resume' }));
        processPlaybackQueue();
    }, [processPlaybackQueue]);

    const handleStop = useCallback(() => {
        isPausedRef.current = true; setIsPausedState(false);
        if (currentTtsAudioRef.current) { currentTtsAudioRef.current.pause(); currentTtsAudioRef.current = null; }
        playbackQueueRef.current = []; isProcessingQueueRef.current = false; pausedTtsChunksRef.current = null;
        setIsPlayingContent(false); setIsResponseLoading(false);
        if (wsRef.current?.readyState === WebSocket.OPEN)
            wsRef.current.send(JSON.stringify({ type: 'stop', lastCompletedStep: completedPlaybackCountRef.current }));
        isPausedRef.current = false; completedPlaybackCountRef.current = 0;
    }, []);

    // ── Dashboard session handlers ──
    const handleStartSession = useCallback((prompt: string, title?: string) => {
        const label = title || (prompt.length > 42 ? prompt.slice(0, 42) + '…' : prompt) || 'New Session';

        resetCanvasUiState();

        // Generate session ID and create row in DB (fire-and-forget — backend gets the ID via query param)
        const newSessionId = crypto.randomUUID();
        sessionIdRef.current = newSessionId;
        isNewSessionRef.current = true; // brand-new session → backend skips db.get_session
        messageCountRef.current = 0;
        playbackSeqRef.current = 0;
        hadMessagesRef.current = false;
        turnD3StepsRef.current = [];
        turnContentBlocksRef.current = [];
        turnNarrationPartsRef.current = [];
        autoReconnectRef.current = true; // enable auto-reconnect while canvas is live
        fatalWsFailureRef.current = false;
        if (user?.id) dbCreateSession(newSessionId, user.id, label.slice(0, 50));

        setIsCanvasActive(true);
        setIsCanvasMinimized(false);
        setActiveSessionTitle(label);
        if (!prompt.trim()) {
            connectWs();
            return;
        }
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            sendText(prompt);
        } else {
            pendingPromptRef.current = prompt;
            connectWs();
        }
    }, [connectWs, resetCanvasUiState, sendText, user]);

    // ── Resume an existing session ──
    // Loads chat history + canvas visuals from the DB and reconnects to the backend,
    // which restores LLM history automatically via session_id query param.
    // No prompt is auto-sent — the user types the next message as normal.
    const handleResumeSession = useCallback(async (session: RecentSession) => {
        if (!user) return;

        resetCanvasUiState();

        // Reset all per-session state
        sessionIdRef.current = session.id;
        hadMessagesRef.current = true; // already has messages
        isNewSessionRef.current = false; // resuming → backend must run db.get_session to restore history
        messageCountRef.current = 0;
        playbackSeqRef.current = 0;
        turnD3StepsRef.current = [];
        turnCodeStepsRef.current = [];
        turnContentBlocksRef.current = [];
        turnNarrationPartsRef.current = [];
        autoReconnectRef.current = true; // enable auto-reconnect while canvas is live
        fatalWsFailureRef.current = false;

        // Load chat messages and playback items in parallel
        const [{ data: messages }, { data: items }] = await Promise.all([
            supabase
                .from('chat_messages')
                .select('id, role, content, sequence_index, created_at')
                .eq('session_id', session.id)
                .order('sequence_index', { ascending: true }),
            supabase
                .from('playback_items')
                .select('id, sequence_index, d3_steps, code_steps, content_blocks')
                .eq('session_id', session.id)
                .order('sequence_index', { ascending: true }),
        ]);

        // Sequence counters continue from where the session left off
        messageCountRef.current = messages?.length ?? 0;
        playbackSeqRef.current  = items?.length ?? 0;

        // Restore chat panel
        if (messages && messages.length > 0) {
            setChatMessages(messages.map((m: any) => ({
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content,
                timestamp: new Date(m.created_at).getTime(),
            })));
        }

        // Open canvas first so DOM columns are mounted before we render into them
        setIsCanvasActive(true);
        setIsCanvasMinimized(false);
        setActiveSessionTitle(session.title);

        // Restore canvas: replay all stored D3 steps without animation (fast mode).
        // Use rAF to give React one frame to mount the canvas DOM before appending.
        if (items && items.length > 0) {
            await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
            ensurePage();
            for (const item of items as any[]) {
                for (const md of (item.content_blocks as string[]) ?? []) {
                    appendContent(md);
                }
                for (let i = 0; i < ((item.d3_steps as any[]) ?? []).length; i++) {
                    const storedStep = item.d3_steps[i];
                    const vid = storedStep?._visual_id as string | undefined;
                    await executeVisualStep(storedStep, i, true /* fast */, vid);
                }
                for (const instruction of (item.code_steps as any[]) ?? []) {
                    const vid = instruction?._visual_id as string | undefined;
                    await executeCodeStep(instruction, vid);
                }
            }
        }

        // Connect to backend — session_id in query param tells backend to load
        // llm_history from DB so the AI continues the conversation from context.
        // pendingPromptRef is NOT set, so no message is auto-sent.
        connectWs();
    }, [user, resetCanvasUiState, setChatMessages, ensurePage, appendContent, executeVisualStep, executeCodeStep, connectWs]);

    const handleMinimizeCanvas = useCallback(() => {
        setIsCanvasMinimized(true);
        // Refresh the session list whenever the dashboard becomes visible so
        // previously completed sessions are always up to date.
        if (user) loadRecentSessions(user.id);
    }, [user, loadRecentSessions]);

    const handleRestoreCanvas = useCallback(() => {
        setIsCanvasMinimized(false);
    }, []);

    const handleCloseCanvas = useCallback(() => {
        handleStop();
        disconnectWs();

        // Finalize session in DB (frontend-side clean close)
        const closingSessionId = sessionIdRef.current;
        const hadMessages = hadMessagesRef.current;
        const finalMessageCount = messageCountRef.current;
        if (closingSessionId) {
            dbFinalizeSession(closingSessionId, hadMessages, finalMessageCount).then(() => {
                // Refresh session list after close so it appears immediately
                if (user) loadRecentSessions(user.id);
            });
        }

        setIsCanvasActive(true);
        setIsCanvasMinimized(false);
        setActiveSessionTitle('');
        resetCanvasUiState();
        sessionIdRef.current = null;
        isNewSessionRef.current = false;
        hadMessagesRef.current = false;
    }, [handleStop, disconnectWs, resetCanvasUiState, user, loadRecentSessions]);

    // ── Server Messages ──
    const handleServerMessage = useCallback((data: any) => {
        switch (data.type) {
            case 'connected': setIsConnected(true); setStatusText('Online'); if (data.session_id) sessionIdRef.current = data.session_id; break;

            case 'ack_text':
                setAckTranscription(data.text || '');
                break;

            case 'narration_delta':
                setPipelineStatus(null);
                setAckTranscription('');
                setIsResponseLoading(false);
                setAssistantPartial(prev => prev + data.text);
                if (data.text) turnNarrationPartsRef.current.push(data.text);
                break;

            case 'narration_done':
                setIsResponseLoading(false);
                if (data.text) {
                    setChatMessages(prev => [...prev, { id: genId(), role: 'assistant', content: data.text, timestamp: Date.now() }]);
                    // Write assistant message + playback item to DB
                    if (sessionIdRef.current) {
                        const sid = sessionIdRef.current;
                        const hasVisual = turnD3StepsRef.current.length > 0 || turnCodeStepsRef.current.length > 0;
                        const d3Snapshot = [...turnD3StepsRef.current];
                        const codeSnapshot = [...turnCodeStepsRef.current];
                        const narrationSnapshot = [...turnNarrationPartsRef.current];
                        const contentSnapshot = [...turnContentBlocksRef.current];
                        dbWriteChatMessage(sid, 'assistant', data.text, messageCountRef.current, hasVisual)
                            .then(msgId => {
                                messageCountRef.current++;
                                if (hasVisual && msgId) {
                                    const primitiveId = getPrimitiveIdFromSteps(d3Snapshot);
                                    if (primitiveId || codeSnapshot.length > 0) {
                                        dbWritePlaybackItem(sid, msgId, playbackSeqRef.current, primitiveId ?? 'code', d3Snapshot, codeSnapshot, narrationSnapshot, contentSnapshot);
                                        playbackSeqRef.current++;
                                    }
                                }
                            });
                    }
                }
                // Clear turn accumulators
                turnD3StepsRef.current = [];
                turnCodeStepsRef.current = [];
                turnNarrationPartsRef.current = [];
                turnContentBlocksRef.current = [];
                setAssistantPartial('');
                break;

            case 'tts_start': ttsAudioFormatRef.current = data.audio_format ?? 'mp3'; pendingTtsChunksRef.current = []; break;
            case 'tts_chunk': pendingTtsChunksRef.current.push(data.data); break;

            case 'tts_done': {
                enqueuePlayback({
                    d3Steps: [...pendingD3StepsRef.current],
                    codeSteps: [...pendingCodeStepsRef.current],
                    contentBlocks: [...pendingContentBlocksRef.current],
                    ttsChunks: [...pendingTtsChunksRef.current],
                });
                pendingTtsChunksRef.current = [];
                pendingD3StepsRef.current = [];
                pendingCodeStepsRef.current = [];
                pendingContentBlocksRef.current = [];
                break;
            }

            case 'status': setPipelineStatus(data.stage ?? null); break;

            case 'playback_reset': {
                setPipelineStatus(null);
                isProcessingQueueRef.current = false;
                playbackQueueRef.current = [];
                pendingD3StepsRef.current = [];
                pendingCodeStepsRef.current = [];
                pendingTtsChunksRef.current = [];
                pendingContentBlocksRef.current = [];
                completedPlaybackCountRef.current = 0;
                stepIndexFallbackRef.current = 0;
                isPausedRef.current = false;
                setIsPausedState(false);
                setIsPlayingContent(true);
                visualIdSvgMapRef.current.clear();
                visualIdCodePanelMapRef.current.clear();
                visualIdRegistryMapRef.current.clear();

                // Ensure at least one page exists, but do NOT force a new one
                ensurePage();
                break;
            }

            case 'paused': break;
            case 'resumed': break;
            case 'stopped': break;

            case 'content_block': {
                setPipelineStatus(null);
                setIsResponseLoading(false);
                ensurePage();
                pendingContentBlocksRef.current.push(data.content);
                turnContentBlocksRef.current.push(data.content);  // accumulate for DB write
                break;
            }

            case 'd3_step': {
                setPipelineStatus(null);
                setIsResponseLoading(false);
                const stepIdx = data.index != null ? Number(data.index) : stepIndexFallbackRef.current++;
                ensurePage();
                pendingD3StepsRef.current.push({ instruction: data.instruction, index: stepIdx, visual_id: data.visual_id });
                // Embed visual_id into the stored instruction so session replay can route correctly
                turnD3StepsRef.current.push(data.visual_id ? { ...data.instruction, _visual_id: data.visual_id } : data.instruction);
                break;
            }

            case 'code_step': {
                setIsResponseLoading(false);
                ensurePage();
                pendingCodeStepsRef.current.push({ instruction: data.instruction, visual_id: data.visual_id });
                turnCodeStepsRef.current.push(data.visual_id ? { ...data.instruction, _visual_id: data.visual_id } : data.instruction);
                break;
            }

            case 'error': setPipelineStatus(null); setIsResponseLoading(false); setStatusText(`Error: ${data.message}`); break;
            default: break;
        }
    }, [enqueuePlayback, ensurePage, executeCodeStep]);

    useEffect(() => { return () => { disconnectWs(); }; }, []);

    // ══════════════════════════════════════════════════════════════
    // Render
    // ══════════════════════════════════════════════════════════════

    const hasContent = pages.length > 0;
    const showCanvas = true;

    return (
        <div className={isDarkMode ? 'theme-dark' : 'theme-light'} style={{ height: '100%', width: '100%', background: isDarkMode ? '#09090b' : '#f5f4f0', color: isDarkMode ? '#ffffff' : '#1a1918', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", overflow: 'hidden', position: 'relative' }}>

            {/* ── Canvas overlay (spawned when session starts) ── */}
            <AnimatePresence>
                {showCanvas && (
                    <motion.div
                        key="canvas"
                        initial={{ opacity: 0, scale: 0.97, y: 14 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 14 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
                        className="absolute inset-0 z-20"
                    >
                        <main style={{ height: '100%', width: '100%', display: 'flex', overflow: 'hidden', position: 'relative' }}>

                            {/* Sidebar */}
                            <div className={cn("absolute top-0 bottom-0 z-50 w-[260px] backdrop-blur-2xl border-r shadow-2xl transition-all duration-300 ease-in-out flex flex-col", isSidebarOpen ? "left-0" : "-left-[260px]", isDarkMode ? "bg-[#0a0a0e]/95 border-white/10" : "bg-white/95 border-black/10")}>
                                <div className={cn("p-4 border-b flex justify-between items-center mt-2", isDarkMode ? "border-white/5" : "border-black/5")}>
                                    <h2 className={cn("text-sm font-medium px-2", isDarkMode ? "text-white/90" : "text-black/90")}>Pages</h2>
                                    <button onClick={() => setIsSidebarOpen(false)} className={cn("p-1.5 rounded-lg transition-colors", isDarkMode ? "hover:bg-white/10 text-zinc-400 hover:text-white" : "hover:bg-black/5 text-zinc-500 hover:text-black")}><XIcon className="w-4 h-4" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
                                    {pages.length === 0 && <div className={cn("text-[13px] px-3 py-4 text-center", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>No pages yet. Send a prompt to begin!</div>}
                                    {pages.map((page, i) => (
                                        <button key={page.id}
                                            onClick={() => {
                                                const section = document.querySelector(`[data-board-section="${i}"]`) as HTMLElement;
                                                const scrollRoot = document.getElementById('canvas-scroll-container');
                                                if (section && scrollRoot) scrollRoot.scrollTo({ left: section.offsetLeft, behavior: 'smooth' });
                                            }}
                                            className={cn("w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-colors truncate animate-in fade-in flex items-center gap-2", isDarkMode ? "hover:bg-white/5 text-zinc-300" : "hover:bg-black/5 text-zinc-600")}>
                                            <span className="text-blue-500 font-bold shrink-0">{i + 1}.</span>
                                            <span className="truncate">{page.title || `Page ${i + 1}`}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Canvas Area */}
                            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: isDarkMode ? '#09090b' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                                {/* Floating Header */}
                                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
                                    {/* Left: sidebar toggle */}
                                    <div className="flex items-center gap-3 pointer-events-auto">
                                        {!isSidebarOpen && (
                                            <button onClick={() => setIsSidebarOpen(true)} className={cn("w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-xl border shadow-lg transition-colors animate-in fade-in", isDarkMode ? "bg-[#0a0a0e]/60 border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white" : "bg-white/60 border-black/10 hover:bg-black/5 text-zinc-500 hover:text-black")}>
                                                <MenuIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Center: playback controls (pause/resume/stop) */}
                                    {(isPlayingContent || isPausedState) && (
                                        <div className={cn("flex items-center gap-1.5 pointer-events-auto backdrop-blur-xl py-1.5 px-3 rounded-full border shadow-lg animate-in fade-in duration-300", isDarkMode ? "bg-[#0a0a0e]/60 border-white/10" : "bg-white/60 border-black/10")}>
                                            {isPausedState ? (
                                                <button onClick={handleResume} className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all duration-200" title="Resume"><PlayIcon className="w-4 h-4" /></button>
                                            ) : (
                                                <button onClick={handlePause} className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all duration-200" title="Pause"><PauseIcon className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    )}

                                    {/* Right: reconnecting indicator (only when connection is lost) + nav buttons */}
                                    <div className="flex items-center gap-2 pointer-events-auto">
                                        {!isConnected && isCanvasActive && statusText === 'Retrying connection…' && (
                                            <div className={cn("flex items-center gap-2 backdrop-blur-xl py-2 px-3 rounded-full border shadow-lg animate-in fade-in", isDarkMode ? "bg-[#0a0a0e]/60 border-white/10" : "bg-white/60 border-black/10")}>
                                                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                                <span className={cn("text-[12px] font-medium", isDarkMode ? "text-white/60" : "text-black/60")}>Reconnecting…</span>
                                            </div>
                                        )}
                                        {!isConnected && isCanvasActive && statusText === 'WebSocket unavailable' && (
                                            <div className={cn("flex items-center gap-2 backdrop-blur-xl py-2 px-3 rounded-full border shadow-lg animate-in fade-in", isDarkMode ? "bg-[#2a0f12]/70 border-red-400/20" : "bg-red-50 border-red-200")}>
                                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                                <span className={cn("text-[12px] font-medium", isDarkMode ? "text-red-200/90" : "text-red-700")}>
                                                    {RAW_WS_URL.includes("localhost")
                                                        ? "Local websocket unavailable"
                                                        : "Hosted websocket rejected connection"}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        fatalWsFailureRef.current = false;
                                                        autoReconnectRef.current = true;
                                                        setStatusText("Retrying connection…");
                                                        connectWs(0);
                                                    }}
                                                    className={cn(
                                                        "ml-1 text-[11px] font-semibold px-2 py-1 rounded border transition-colors",
                                                        isDarkMode
                                                            ? "border-red-300/30 text-red-100 hover:bg-red-400/15"
                                                            : "border-red-300 text-red-700 hover:bg-red-100"
                                                    )}
                                                >
                                                    Retry
                                                </button>
                                            </div>
                                        )}
                                        <button onClick={handleCloseCanvas} title="End session" className={cn("w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-xl border shadow-lg transition-colors", isDarkMode ? "bg-[#0a0a0e]/60 border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white" : "bg-white/60 border-black/10 hover:bg-black/5 text-zinc-500 hover:text-black")}>
                                            <HomeIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Empty state */}
                                {!hasContent && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 opacity-80 animate-in fade-in duration-1000 z-10 pointer-events-none">
                                        <div className={cn("w-24 h-24 opacity-30 flex items-center justify-center animate-[float_6s_ease-in-out_infinite]", isDarkMode ? "grayscale" : "")}>
                                            <img src="/images/logo.png" alt="careersetu" className="w-full h-full object-contain drop-shadow-lg" />
                                        </div>
                                        <p className={cn("text-[16px] text-center max-w-[340px] leading-relaxed font-medium tracking-wide", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>
                                            What would you like to learn today?
                                        </p>
                                    </div>
                                )}

                                {/* Pipeline status badge */}
                                <AnimatePresence>
                                    {pipelineStatus && (
                                        <motion.div
                                            key={pipelineStatus}
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -6, scale: 0.95 }}
                                            transition={{ duration: 0.18, ease: 'easeOut' }}
                                            className="absolute bottom-[148px] left-1/2 -translate-x-1/2 z-40 pointer-events-none"
                                        >
                                            <div className={cn(
                                                "flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-xl border shadow-lg",
                                                isDarkMode ? "bg-[#0a0a0e]/70 border-white/[0.1]" : "bg-white/80 border-black/[0.08]"
                                            )}>
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full animate-pulse",
                                                    pipelineStatus === 'planning' ? "bg-violet-400" : "bg-blue-400"
                                                )} />
                                                <span className={cn("text-[12px] font-medium tracking-wide", isDarkMode ? "text-white/55" : "text-black/55")}>
                                                    {pipelineStatus === 'planning' ? 'Planning…' : 'Generating visuals…'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Ack Transcription */}
                                <AnimatePresence>
                                    {ackTranscription && (
                                        <motion.div
                                            key="ack-transcription"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className="absolute bottom-[200px] left-1/2 -translate-x-1/2 z-40 pointer-events-none max-w-lg w-full text-center"
                                        >
                                            <p className={cn(
                                                "text-[18px] italic font-light tracking-wide",
                                                isDarkMode ? "text-white/20" : "text-black/20"
                                            )}>
                                                "{displayedAck}"
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* ── Pages — unified sequential flow: left column fills first, then right ── */}
                                <div id="canvas-scroll-container" ref={canvasContainerRef}
                                    className="absolute inset-0 z-0 overflow-x-auto overflow-y-hidden scroll-smooth"
                                    style={{ display: 'flex', flexDirection: 'row' }}>
                                    {pages.map((page, pageIdx) => (
                                        <div key={`section-${page.id}`} data-board-section={pageIdx}
                                            className="flex-shrink-0 relative" style={{ width: '100%', height: '100%' }}>
                                            {pageIdx > 0 && <div className={cn("absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent to-transparent z-20", isDarkMode ? "via-white/15" : "via-black/10")} />}
                                            <div className={cn("absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent to-transparent pointer-events-none z-30 -translate-x-1/2", isDarkMode ? "via-white/20" : "via-black/15")} />

                                            <div className="flex flex-row w-full max-w-[95%] 2xl:max-w-[1700px] mx-auto relative z-10 items-stretch" style={{ height: '100%' }}>
                                                {/* LEFT column — content flows here first */}
                                                <div className="w-1/2 min-w-0 px-6 py-8 overflow-hidden" data-col-outer={`${page.id}:left`}>
                                                    <div ref={(el: HTMLDivElement | null) => { if (el) leftColRefsMap.current.set(page.id, el); }}
                                                        className="content-column space-y-1 w-full" />
                                                </div>
                                                {/* RIGHT column — content flows here when left is full */}
                                                <div className="w-1/2 min-w-0 px-6 py-8 overflow-hidden" data-col-outer={`${page.id}:right`}>
                                                    <div ref={(el: HTMLDivElement | null) => { if (el) rightColRefsMap.current.set(page.id, el); }}
                                                        className="content-column space-y-1 w-full" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Floating Text Input */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 z-50 group flex items-end justify-center pb-8 px-4">
                                    <div className={cn("w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                                        hasContent ? "translate-y-[150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100" : "translate-y-0 opacity-100"
                                    )}>
                                        <PromptInputBox
                                            onSend={(message: string) => {
                                                const trimmed = message.trim();
                                                if (!trimmed) return;
                                                if (wsRef.current?.readyState === WebSocket.OPEN && sessionIdRef.current) {
                                                    sendText(trimmed);
                                                    return;
                                                }
                                                handleStartSession(trimmed);
                                            }}
                                            isLoading={isResponseLoading}
                                            placeholder="What do you want to learn?"
                                        />
                                    </div>
                                    {hasContent && (
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 transition-opacity duration-300 opacity-100 group-hover:opacity-0 focus-within:opacity-0 flex items-center gap-2 text-[11px] font-medium tracking-wide pointer-events-none">
                                            <span className={isDarkMode ? "text-white/30" : "text-black/30"}>Hover here to type...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dashboard/PiP removed: learn opens directly in interface */}

            {/* ── Auth Modal ── */}
            <AnimatePresence>
                {showAuthModal && (
                    <motion.div
                        key="auth-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setShowAuthModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md mx-4 rounded-2xl border p-8"
                            style={{
                                background: isDarkMode ? '#111118' : '#ffffff',
                                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e8e2db',
                                boxShadow: isDarkMode ? '0 25px 60px rgba(0,0,0,0.6)' : '0 25px 60px rgba(0,0,0,0.15)',
                            }}
                        >
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                                style={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
                            >
                                <XIcon size={16} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                                    style={{ background: isDarkMode ? 'rgba(99,102,241,0.15)' : 'rgba(79,70,229,0.1)' }}>
                                    <Sparkles size={22} style={{ color: isDarkMode ? '#a5b4fc' : '#4f46e5' }} />
                                </div>

                                <h2 className="text-xl font-semibold mb-2" style={{ color: isDarkMode ? '#ffffff' : '#1a1918' }}>
                                    
                                </h2>
                                <p className="text-sm mb-8" style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : '#5a5248' }}>
                                    
                                </p>

                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={isSigningIn}
                                    className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 hover:-translate-y-[1px]"
                                    style={{
                                        background: isDarkMode ? '#ffffff' : '#1a1918',
                                        color: isDarkMode ? '#1a1918' : '#ffffff',
                                        opacity: isSigningIn ? 0.7 : 1,
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    {isSigningIn ? 'Redirecting...' : 'Continue with Google'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&family=Caveat:wght@400;500;600;700&display=swap');

        .content-column .content-block { margin-bottom: 16px; }
        .content-column .md-h1 { font-family: 'Caveat', cursive; font-size: 36px; font-weight: 700; margin: 0 0 10px 0; line-height: 1.2; letter-spacing: -0.01em; }
        .content-column .md-h2 { font-family: 'Caveat', cursive; font-size: 28px; font-weight: 600; margin: 12px 0 8px 0; line-height: 1.3; }
        .content-column .md-h3 { font-family: 'Caveat', cursive; font-size: 22px; font-weight: 600; margin: 10px 0 6px 0; line-height: 1.4; }
        .content-column .md-p { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 400; margin: 0 0 8px 0; line-height: 1.7; }
        .content-column .md-ul, .content-column .md-ol { margin: 4px 0 10px 0; padding-left: 22px; }
        .content-column .md-li, .content-column .md-oli { font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.7; margin-bottom: 3px; }
        .content-column .md-code { font-family: 'JetBrains Mono', monospace; font-size: 12px; padding: 1px 5px; border-radius: 3px; display: inline; box-decoration-break: clone; -webkit-box-decoration-break: clone; vertical-align: baseline; line-height: inherit; }
        .content-column strong { font-weight: 600; line-height: inherit; }
        .content-column em { font-style: italic; line-height: inherit; }
        .content-column .md-p .md-code, .content-column .md-li .md-code, .content-column .md-oli .md-code { font-size: 12px; padding: 1px 5px; margin: 0 1px; }
        .content-column .visual-block { border-radius: 8px; padding: 4px; }
        .canvas-col-mode { cursor: grab; -ms-overflow-style: none; scrollbar-width: none; }
        .canvas-col-mode::-webkit-scrollbar { display: none; }
        .canvas-col-mode:active { cursor: grabbing; }

        /* Theme Light overrides for PromptInputBox */
        .theme-light .dashboard-prompt-wrapper > div { background: #ffffff !important; border: 1px solid #e8e2db !important; box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important; }
        .theme-light .dashboard-prompt-wrapper textarea { color: #1a1918 !important; }
        .theme-light .dashboard-prompt-wrapper textarea::placeholder { color: #9e9a95 !important; }
        .theme-light .dashboard-prompt-wrapper button { color: #5a5248; }
        .theme-light .dashboard-prompt-wrapper button:hover { color: #1a1918; background: #faf9f8; }
        .theme-light .dashboard-prompt-wrapper .bg-white { background: #1a1918 !important; color: #ffffff !important; }
        .theme-light .dashboard-prompt-wrapper .bg-white:hover { background: #2e2c2a !important; color: #ffffff !important; }
        .theme-light .dashboard-prompt-wrapper .bg-white\/\\[0\\.2\\] { background: #f0ece6 !important; color: #9e9a95 !important; }
        .theme-light .dashboard-prompt-wrapper .bg-white\/\\[0\\.2\\]:hover { background: #e4dfd9 !important; color: #1a1918 !important; }
        .theme-light .dashboard-prompt-wrapper .bg-\\[\\#1F2023\\] { background: #ffffff !important; border-color: #e8e2db !important; }
        .theme-light .content-column .md-h1, .theme-light .content-column .md-h2, .theme-light .content-column .md-h3 { color: #3b82f6; }
        .theme-light .content-column .md-p { color: #5a5248; }
        .theme-light .content-column .md-li, .theme-light .content-column .md-oli { color: #6b6460; }
        .theme-light .content-column .md-li::marker, .theme-light .content-column .md-oli::marker { color: #4f46e5; }
        .theme-light .content-column .md-code { background: rgba(79, 70, 229, 0.1); color: #4f46e5; }
        .theme-light .content-column strong { color: #1a1918; }
        .theme-light .content-column em { color: #5a5248; }
        .theme-light .content-column .md-code-block { position: relative; margin: 10px 0 14px 0; border-radius: 10px; background: #faf9f8; border: 1px solid #e8e2db; overflow: hidden; }
        .theme-light .content-column .md-code-lang { display: block; padding: 6px 14px; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.08em; background: rgba(79, 70, 229, 0.05); border-bottom: 1px solid #e8e2db; }
        .theme-light .content-column .md-block-code { font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.7; color: #3f3f46; white-space: pre; tab-size: 4; }
        .theme-light .content-column .md-blockquote { border-left: 3px solid #4f46e5; padding: 8px 14px; margin: 8px 0; background: rgba(79, 70, 229, 0.03); border-radius: 0 6px 6px 0; font-family: 'Inter', sans-serif; font-size: 14px; color: #5a5248; font-style: italic; line-height: 1.6; }
        .theme-light .content-column .md-hr { border: none; height: 1px; background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent); margin: 16px 0; }

        /* Theme Dark */
        .theme-dark .content-column .md-h1, .theme-dark .content-column .md-h2, .theme-dark .content-column .md-h3 { color: #7db8f2; }
        .theme-dark .content-column .md-p { color: #b0b0c0; }
        .theme-dark .content-column .md-li, .theme-dark .content-column .md-oli { color: #a0a0b8; }
        .theme-dark .content-column .md-li::marker, .theme-dark .content-column .md-oli::marker { color: #6366f1; }
        .theme-dark .content-column .md-code { background: rgba(99, 102, 241, 0.15); color: #a5b4fc; }
        .theme-dark .content-column strong { color: #d0d0e0; }
        .theme-dark .content-column em { color: #9898b8; }
        .theme-dark .content-column .md-code-block { position: relative; margin: 10px 0 14px 0; border-radius: 10px; background: #111118; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
        .theme-dark .content-column .md-code-lang { display: block; padding: 6px 14px; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 0.08em; background: rgba(99, 102, 241, 0.06); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .theme-dark .content-column .md-block-code { font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.7; color: #c5c5e0; white-space: pre; tab-size: 4; }
        .theme-dark .content-column .md-blockquote { border-left: 3px solid #6366f1; padding: 8px 14px; margin: 8px 0; background: rgba(99, 102, 241, 0.05); border-radius: 0 6px 6px 0; font-family: 'Inter', sans-serif; font-size: 14px; color: #9898b8; font-style: italic; line-height: 1.6; }
        .theme-dark .content-column .md-hr { border: none; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); margin: 16px 0; }

        .cursor-blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        #canvas-scroll-container::-webkit-scrollbar { height: 0px; }
        .input-wrapper:focus-within { border-color: rgba(99,102,241,0.6) !important; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); background: rgba(255,255,255,0.06); }
        button.status-btn:hover:not(:disabled) { filter: brightness(1.2); }
        button:not(.status-btn):hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255, 255, 255, 0.08); }
        button:active:not(:disabled) { transform: translateY(1px) scale(0.98); }
        .formula-fo .katex-display { max-width: 100%; overflow-x: auto; overflow-y: hidden; margin: 0.5em 0; }
      `}</style>
        </div>
    );
}
