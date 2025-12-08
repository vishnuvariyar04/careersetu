'use client'
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  ChevronRight, 
  Share, 
  Settings, 
  Layout, 
  Code2, 
  Columns, 
  Volume2, 
  VolumeX,
  Eye,       
  Table,     
  List,
  GitGraph
} from 'lucide-react';

import { TalkingHead } from "../../lib/modules/talkinghead.mjs"; 
import { HeadTTS } from "../../lib/modules/headtts.mjs";

// --- TYPES ---
type LayoutMode = 'CONCEPT_MODE' | 'SPLIT_MODE' | 'FOCUS_MODE' | 'VISUAL_MODE';
type VisualType = 'ARRAY' | 'TABLE' | 'KEY_VALUE' | 'MERMAID_FLOWCHART';

type VisualState = {
  type: VisualType;
  payload: any;
  caption: string;
} | null;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string; 
};

type PlaybackAction = 
  | { type: 'SPEAK'; text: string }
  | { type: 'LAYOUT'; mode: LayoutMode }
  | { type: 'CODE'; code: string }
  | { type: 'CONCEPT'; title: string; text: string }
  | { type: 'VISUAL'; state: VisualState } 
  | { type: 'HIGHLIGHT'; code_to_highlight: string } 
  | { type: 'WAIT'; ms: number };

const COLORS = {
  bg: 'bg-[#050505]',        
  panelBg: 'bg-[#080808]',   
  cardBg: 'bg-[#0e0e0e]',    
  border: 'border-white/10',
  cyanText: 'text-cyan-400',
  cyanBg: 'bg-cyan-500',
  textMain: 'text-gray-300',
};

// --- VISUAL RENDERER COMPONENTS ---

const ArrayVisualizer = ({ payload }: { payload: any }) => {
  const data = payload?.data || [];
  const highlights = payload?.highlights || [];
  const pointers = payload?.pointers || {};
  const dimmed_indices = payload?.dimmed_indices || []; 
  
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 w-full overflow-x-auto">
      <div className="flex gap-3">
        {data.map((val: any, idx: number) => {
          const isHighlighted = highlights.includes(idx);
          const isDimmed = dimmed_indices.includes(idx);
          const activePointers = Object.entries(pointers)
            .filter(([_, ptrIdx]) => ptrIdx === idx)
            .map(([name]) => name);

          return (
            <div key={idx} className={`relative flex flex-col items-center transition-all duration-500 ${isDimmed ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}>
              <div className="h-8 relative w-full flex justify-center">
                {activePointers.map((p: string, i: number) => (
                   <span key={p} className="absolute bottom-0 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>
                     {p} ↓
                   </span>
                ))}
              </div>
              <div className={`
                w-16 h-16 flex items-center justify-center rounded-lg border-2 text-xl font-bold font-mono shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300
                ${isHighlighted ? 'bg-cyan-500/20 border-cyan-400 text-cyan-50 scale-110 z-10' : 'bg-[#1a1a1a] border-white/10 text-gray-400'}
              `}>
                {val}
              </div>
              <span className="mt-2 text-[10px] text-gray-600 font-mono">{idx}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TableVisualizer = ({ payload }: { payload: any }) => {
  const headers = payload?.headers || [];
  const rows = payload?.rows || [];
  const highlight_row = payload?.highlight_row ?? -1;

  return (
    <div className="w-full overflow-hidden rounded-lg border border-white/10">
      <table className="w-full text-sm text-left">
        <thead className="bg-white/5 text-gray-400 uppercase font-mono text-xs">
          <tr>{headers.map((h: string, i: number) => <th key={i} className="px-6 py-3">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row: any[], i: number) => (
            <tr key={i} className={`transition-colors duration-300 ${highlight_row === i ? 'bg-cyan-500/20' : 'bg-transparent'}`}>
               {row.map((cell: any, j: number) => <td key={j} className="px-6 py-4 font-mono text-gray-300">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const KeyValueVisualizer = ({ payload }: { payload: any }) => {
  const items = payload?.items || [];
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
       {items.map((item: any, i: number) => (
         <div key={i} className="bg-[#1a1a1a] p-4 rounded-lg border border-white/10 flex justify-between items-center">
            <span className="text-gray-500 font-mono text-xs uppercase">{item.key}</span>
            <span className="text-cyan-400 font-mono font-bold">{item.value}</span>
         </div>
       ))}
    </div>
  );
};

// --- MAIN COMPONENT ---

const ImmersiveLearningPlatform: React.FC = () => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('SPLIT_MODE');
  const [activeCode, setActiveCode] = useState("");
  const [highlightQuery, setHighlightQuery] = useState<string | null>(null);
  
  const [conceptData, setConceptData] = useState({ title: "Initializing...", text: "Waiting for session..." });
  const [visualData, setVisualData] = useState<VisualState>(null);
  const [subtitles, setSubtitles] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: 'init', role: 'assistant', content: "Welcome back." }]);
  
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); 
  const [isPlaying, setIsPlaying] = useState(false);        
  const [isTTSActive, setIsTTSActive] = useState(true);     
  
  const avatarRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const headTTSRef = useRef<any>(null);
  const [avatarStatus, setAvatarStatus] = useState("Initializing...");
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const audioResolverRef = useRef<(() => void) | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const commandQueueRef = useRef<PlaybackAction[]>([]);
  const isExecutingRef = useRef(false);
  const onEndCountRef = useRef(0);
  const totalPartsRef = useRef(0);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  const kickWatchdog = () => {
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = setTimeout(() => {
          if (audioResolverRef.current) {
              audioResolverRef.current();
              audioResolverRef.current = null;
          }
      }, 15000); 
  };

  useEffect(() => {
    if (highlightQuery && codeContainerRef.current) {
      const highlightedElement = codeContainerRef.current.querySelector('.border-cyan-400');
      if (highlightedElement) highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightQuery, activeCode]);

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
                            if (audioResolverRef.current) {
                                audioResolverRef.current();
                                audioResolverRef.current = null;
                            }
                            setTimeout(() => setSubtitles(""), 1000);
                        } else {
                            kickWatchdog();
                        }
                    }
                );
            }
        };
        await Promise.all([
             head.showAvatar({ url: "/avatars/david.glb", body: "F", avatarMood: "neutral" }),
             headtts.connect()
        ]);
        head.setView(head.viewName, { cameraY: 0 });
        headtts.setup({ voice: "am_fenrir", language: "en-us", speed: 1.1, audioEncoding: "wav" });
        head.start();
        setAvatarStatus("Online");
      } catch (err: any) {
        setAvatarStatus("Error: " + err.message);
      }
    };
    initAvatar();
    return () => { if (headRef.current) headRef.current.stop(); };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
              return [...prev, { id: Date.now().toString(), role: 'assistant', content: action.text }];
            }
          });
          if (isTTSActive && headTTSRef.current && headRef.current && avatarStatus === "Online") {
             setSubtitles("");
             onEndCountRef.current = 0;
             totalPartsRef.current = 0;
             if (headRef.current.audioCtx.state === 'suspended') await headRef.current.audioCtx.resume();
             kickWatchdog();
             await new Promise<void>((resolve) => {
                 audioResolverRef.current = resolve;
                 try { headTTSRef.current.synthesize({ input: action.text }); } 
                 catch (e) { resolve(); }
             });
          } else {
            await new Promise(resolve => setTimeout(resolve, action.text.length * 50)); 
          }
          break;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    setIsPlaying(false);
    isExecutingRef.current = false;
  };

  const parseAndEnqueue = (line: string) => {
    if (!line.trim()) return;
    try {
      const cleanLine = line.replace(/^data: /, '');
      const data = JSON.parse(cleanLine);
      let action: PlaybackAction | null = null;
      if (data.type === 'speak') action = { type: 'SPEAK', text: data.text };
      else if (data.type === 'layout') action = { type: 'LAYOUT', mode: data.mode };
      else if (data.type === 'code') action = { type: 'CODE', code: data.content };
      else if (data.type === 'concept') action = { type: 'CONCEPT', title: data.title, text: data.text };
      else if (data.type === 'visual') action = { type: 'VISUAL', state: data.state };
      else if (data.type === 'highlight') action = { type: 'HIGHLIGHT', code_to_highlight: data.code_to_highlight };
      if (action) {
        commandQueueRef.current.push(action);
        processQueue(); 
      }
    } catch (e) { console.warn("Parse Error:", line); }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: input }]);
    const currentInput = input;
    setInput('');
    setIsProcessing(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: '' }]);
    try {
      const response = await fetch('http://localhost:5000/api/chat', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput })
      });
      if (!response.body) throw new Error('No body');
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
    } catch (error) { console.error(error); } finally { setIsProcessing(false); }
  };

  const renderCode = () => {
    return activeCode.split('\n').map((line, i) => {
        const lineNumber = i + 1;
        let isHighlighted = false;
        if (highlightQuery) {
            const cleanLine = line.trim();
            const cleanQuery = highlightQuery.trim();
            if (cleanLine && cleanQuery && cleanLine.includes(cleanQuery)) isHighlighted = true;
        }
        return (
            <div key={i} className={`px-6 py-0.5 transition-colors duration-200 ${isHighlighted ? 'bg-[#1a2c33] border-l-2 border-cyan-400' : 'bg-transparent border-l-2 border-transparent'}`}>
                <span className="inline-block w-6 text-gray-700 text-[10px] select-none mr-2">{lineNumber}</span>
                <code className="font-mono text-gray-400 whitespace-pre">{line}</code>
            </div>
        );
    });
  };

  const renderVisualContent = () => {
    if (!visualData) return <div className="text-gray-600">No active visualization</div>;
    return (
       <div className="w-full h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-6 bg-[#121212] rounded-xl border border-white/5 relative overflow-hidden">
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
             <div className="relative z-10 w-full flex justify-center">
                {visualData.type === 'ARRAY' && <ArrayVisualizer payload={visualData.payload} />}
                {visualData.type === 'TABLE' && <TableVisualizer payload={visualData.payload} />}
                {visualData.type === 'KEY_VALUE' && <KeyValueVisualizer payload={visualData.payload} />}
                {visualData.type === 'MERMAID_FLOWCHART' && (
                    <div className="text-center">
                        <GitGraph size={48} className="mx-auto text-cyan-500 mb-4" />
                        <pre className="text-xs text-gray-500 font-mono bg-black/50 p-4 rounded">{visualData.payload.chart}</pre>
                    </div>
                )}
             </div>
          </div>
          <div className="mt-4 px-2">
             <div className="flex items-center gap-2 mb-2">
                {visualData.type === 'ARRAY' && <List size={14} className="text-cyan-400" />}
                {visualData.type === 'TABLE' && <Table size={14} className="text-cyan-400" />}
                <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">{visualData.type} VIEW</span>
             </div>
             <p className="text-sm text-gray-300">{visualData.caption}</p>
          </div>
       </div>
    );
  };

  return (
    <div className={`flex h-screen w-full ${COLORS.bg} ${COLORS.textMain} font-sans overflow-hidden`}>
      <div className={`w-[30%] min-w-[340px] flex flex-col border-r ${COLORS.border} relative z-20 bg-black/40 backdrop-blur-sm`}>
        <div className="p-8 flex justify-between items-center text-[10px] font-mono tracking-[0.2em] text-gray-600">
          <span>SESSION: #8492-A</span>
          <button onClick={() => setIsTTSActive(!isTTSActive)} className="hover:text-white transition-colors">
              {isTTSActive ? <Volume2 size={14} className="text-cyan-500" /> : <VolumeX size={14} />}
          </button>
        </div>
        <div className="flex-none h-[350px] flex flex-col justify-center items-center relative overflow-hidden bg-black/20">
          {avatarStatus !== "Online" && (
             <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
                <span className="text-xs font-mono text-cyan-500 animate-pulse uppercase tracking-widest">{avatarStatus}</span>
             </div>
          )}
          <div ref={avatarRef} className="w-full h-full relative z-10" style={{ minHeight: '350px' }} />
          <div className="absolute top-4 left-0 right-0 text-center px-4 pointer-events-none">
             <span className="bg-black/50 text-white px-2 py-1 rounded text-sm shadow-lg backdrop-blur-md transition-all duration-200">{subtitles}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-10 pb-32 space-y-6 custom-scrollbar scroll-smooth mask-image-b">
          <span className="font-mono text-[10px] text-gray-600 mb-2 block tracking-widest sticky top-0 bg-[#050505]/95 backdrop-blur py-2 z-10">[TRANSCRIPT]</span>
          {messages.map((msg, idx) => (
            <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {msg.role === 'assistant' ? (
                <div className="relative">
                  <div className="absolute -left-4 top-1.5 w-1 h-1 bg-cyan-500 rounded-full" />
                  <p className="text-lg font-light text-white leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              ) : (
                <div className="flex justify-end mt-4 mb-4">
                  <p className="text-gray-500 font-light text-sm italic border-r-2 border-gray-700 pr-4 text-right max-w-[80%]">"{msg.content}"</p>
                </div>
              )}
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${COLORS.panelBg} relative overflow-hidden transition-all duration-500`}>
        <header className={`h-16 border-b ${COLORS.border} flex items-center justify-between px-8 bg-[#080808]/90 backdrop-blur z-30`}>
          <div className="flex gap-8">
            {['CONCEPT_MODE', 'SPLIT_MODE', 'FOCUS_MODE', 'VISUAL_MODE'].map((mode) => (
                <div key={mode} className={`relative py-5 text-xs font-medium tracking-wider uppercase flex items-center gap-2 transition-colors duration-300 ${layoutMode === mode ? 'text-white' : 'text-gray-600'}`}>
                    {mode === 'CONCEPT_MODE' && <Layout size={14} />}
                    {mode === 'SPLIT_MODE' && <Columns size={14} />}
                    {mode === 'FOCUS_MODE' && <Code2 size={14} />}
                    {mode === 'VISUAL_MODE' && <Eye size={14} />}
                    {mode.replace('_MODE', '')}
                    {layoutMode === mode && <span className={`absolute bottom-0 left-0 w-full h-0.5 ${COLORS.cyanBg} shadow-[0_0_10px_rgba(6,182,212,0.8)]`} />}
                </div>
            ))}
          </div>
          <div className="flex gap-4 text-gray-600">
             <Share size={16} /> <Settings size={16} />
          </div>
        </header>

        <main className="flex-1 relative p-8 flex gap-6 overflow-hidden">
          
          {/* 1. CONCEPT CARD (LEFT IN SPLIT) */}
          <div className={`
             relative flex flex-col ${COLORS.cardBg} border ${COLORS.border} rounded-2xl overflow-hidden transition-all duration-700 ease-in-out
             ${layoutMode === 'CONCEPT_MODE' ? 'flex-[100%] opacity-100 translate-x-0' : ''}
             ${layoutMode === 'SPLIT_MODE' ? 'flex-[40%] opacity-100 translate-x-0' : ''} 
             ${layoutMode === 'FOCUS_MODE' || layoutMode === 'VISUAL_MODE' ? 'flex-[0%] opacity-0 -translate-x-10 w-0 border-0 p-0 pointer-events-none' : ''}
          `}>
            <div className="p-8 min-w-[400px]">
              <h1 className="text-3xl font-light text-white tracking-tight mb-2">Concept <span className="text-gray-500">View</span></h1>
              <div className={`w-12 h-0.5 ${COLORS.cyanBg} mb-8`} />
              <h2 className={`text-xl font-medium mb-4 ${COLORS.cyanText}`}>{conceptData.title}</h2>
              <p className="text-gray-300 leading-relaxed text-sm max-w-xl">{conceptData.text}</p>
            </div>
          </div>

          {/* 2. CODE EDITOR (RIGHT IN SPLIT, FULL IN FOCUS) */}
          <div className={`
             relative flex flex-col ${COLORS.cardBg} border ${COLORS.border} rounded-2xl overflow-hidden transition-all duration-700 ease-in-out
             ${layoutMode === 'CONCEPT_MODE' || layoutMode === 'VISUAL_MODE' ? 'flex-[0%] opacity-0 translate-x-10 w-0 border-0 p-0 pointer-events-none' : ''}
             ${layoutMode === 'SPLIT_MODE' ? 'flex-[60%] opacity-100 translate-x-0' : ''}
             ${layoutMode === 'FOCUS_MODE' ? 'flex-[100%] opacity-100 translate-x-0' : ''}
          `}>
             <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#121212]">
                <span className="text-xs font-mono text-gray-500">live_script.py</span>
                <span className="text-xs font-mono text-gray-600">Python</span>
             </div>
             <div ref={codeContainerRef} className="flex-1 font-mono text-xs leading-6 overflow-auto relative bg-[#0B0B0B] custom-scrollbar py-4">
                {renderCode()}
             </div>
          </div>

          {/* 3. VISUAL / CONTEXT PANEL (FULL IN VISUAL, HIDDEN IN SPLIT) */}
          <div className={`
             relative flex flex-col ${COLORS.cardBg} border ${COLORS.border} rounded-2xl overflow-hidden transition-all duration-700 ease-in-out
             ${layoutMode === 'CONCEPT_MODE' || layoutMode === 'FOCUS_MODE' || layoutMode === 'SPLIT_MODE' ? 'flex-[0%] opacity-0 translate-x-10 w-0 border-0 p-0 pointer-events-none' : ''}
             ${layoutMode === 'VISUAL_MODE' ? 'flex-[100%] opacity-100 translate-x-0' : ''}
          `}>
              <div className="flex-1 p-6 flex flex-col">
                  {visualData ? renderVisualContent() : (
                      <div className="p-4">
                          <h2 className={`text-xl font-medium mb-4 ${COLORS.cyanText}`}>{conceptData.title}</h2>
                          <p className="text-gray-300 leading-relaxed text-sm">{conceptData.text}</p>
                      </div>
                  )}
              </div>
          </div>

        </main>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-40 px-4">
          <div className={`bg-[#121212]/80 backdrop-blur-md border ${isProcessing || isPlaying ? 'border-cyan-500/30' : 'border-white/10'} rounded-full p-1.5 pl-5 flex items-center shadow-2xl transition-all duration-300`}>
            <Mic size={16} className={`mr-3 ${isProcessing ? 'text-cyan-500 animate-pulse' : 'text-gray-500'}`} />
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isProcessing}
              placeholder={isProcessing ? "Reasoning..." : isPlaying ? "Explaining..." : "Ask about the code..."}
              className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-600 flex-1 h-9 font-light"
            />
            <button onClick={handleSendMessage} disabled={!input.trim()} className="h-8 w-8 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10">
              {isProcessing ? <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" /> : <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImmersiveLearningPlatform;