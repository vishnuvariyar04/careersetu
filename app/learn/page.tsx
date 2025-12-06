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
  VolumeX
} from 'lucide-react';

import { TalkingHead } from "../../lib/modules/talkinghead.mjs"; 
import { HeadTTS } from "../../lib/modules/headtts.mjs";

// --- TYPES ---
type LayoutMode = 'CONCEPT_MODE' | 'SPLIT_MODE' | 'FOCUS_MODE';

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

const INITIAL_CODE = `# Waiting for session data...
def initial_state():
    return "Ready"`;

// --- UTILITIES ---
const cleanCodeSnippet = (rawCode: string) => {
    let clean = rawCode.replace(/\t/g, '  '); 
    clean = clean.replace(/\u00A0/g, ' ');
    return clean.trim();
};

const ImmersiveLearningPlatform: React.FC = () => {
  // UI State
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('SPLIT_MODE');
  const [activeCode, setActiveCode] = useState(INITIAL_CODE);
  const [highlightQuery, setHighlightQuery] = useState<string | null>(null);
  const [conceptData, setConceptData] = useState({ title: "Waiting...", text: "Initializing session..." });
  const [subtitles, setSubtitles] = useState("");
  
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); 
  const [isPlaying, setIsPlaying] = useState(false);        
  const [isTTSActive, setIsTTSActive] = useState(true);     
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'assistant', content: "Welcome back. I am ready to assist." }
  ]);
  
  // Refs
  const avatarRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const headTTSRef = useRef<any>(null);
  const [avatarStatus, setAvatarStatus] = useState("Initializing...");

  // --- SYNC ENGINE REFS ---
  const audioResolverRef = useRef<(() => void) | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const commandQueueRef = useRef<PlaybackAction[]>([]);
  const isExecutingRef = useRef(false);

  // Counters & Watchdog
  const onEndCountRef = useRef(0);
  const totalPartsRef = useRef(0);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addDebug = (msg: string) => {
      console.log(`[SYNC] ${msg}`);
  };

  // [RESTORED] WATCHDOG FUNCTION
  const kickWatchdog = () => {
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      
      // If we don't hear anything for 5 seconds, assume we are stuck and unlock.
      watchdogTimerRef.current = setTimeout(() => {
          addDebug("🚨 WATCHDOG EXPIRED (5s Silence). Forcing Unlock.");
          if (audioResolverRef.current) {
              audioResolverRef.current();
              audioResolverRef.current = null;
          }
      }, 20000); 
  };

  // --- 1. INITIALIZE AVATAR ---
  useEffect(() => {
    if (headRef.current) return;

    const initAvatar = async () => {
      try {
        const head = new TalkingHead(avatarRef.current, {
          ttsEndpoint: "N/A",
          cameraView: "upper",
          mixerGainSpeech: 3,
          cameraRotateEnable: false
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
          trace: 0,
        });
        headTTSRef.current = headtts;

        // --- GLOBAL EVENT LISTENER ---
        headtts.onmessage = (message: any) => {
            if (message.type === "audio") {
                // WE GOT DATA: EXTEND LIFE
                kickWatchdog();

                const { partsTotal } = message.metaData || { partsTotal: 1 };
                if (partsTotal > 0) totalPartsRef.current = partsTotal;

                try {
                    head.speakAudio(
                        message.data, 
                        { volume: 1 }, 
                        
                        // A. ON WORD
                        (word: string) => {
                            setSubtitles(prev => prev.length > 80 ? "..." + word : prev + word);
                        },

                        // B. ON END
                        () => {
                            onEndCountRef.current += 1;
                            addDebug(`Callback Fired. Count: ${onEndCountRef.current} / Total Expected: ${totalPartsRef.current}`);

                            // CHECK COMPLETION
                            if (totalPartsRef.current > 0 && onEndCountRef.current >= totalPartsRef.current) {
                                addDebug("✅ All chunks finished. Releasing Lock.");
                                
                                // CLEAR WATCHDOG (We are done successfully)
                                if (watchdogTimerRef.current) {
                                    clearTimeout(watchdogTimerRef.current);
                                    watchdogTimerRef.current = null;
                                }

                                if (audioResolverRef.current) {
                                    audioResolverRef.current();
                                    audioResolverRef.current = null;
                                }
                                setTimeout(() => setSubtitles(""), 1000);
                            } else {
                                // WE FINISHED A CHUNK, BUT NOT ALL. EXTEND LIFE.
                                kickWatchdog();
                            }
                        }
                    );
                } catch (e) {
                    console.error("Playback error", e);
                    // Force unlock on error
                    if (audioResolverRef.current) {
                        audioResolverRef.current();
                        audioResolverRef.current = null;
                    }
                }
            } else if (message.type === "error") {
                console.error("TTS Error", message.data);
                if (audioResolverRef.current) {
                    audioResolverRef.current();
                    audioResolverRef.current = null;
                }
            }
        };

        const personConfig = {
             avatar: { url: "/avatars/david.glb", body: "F", avatarMood: "neutral" },
             view: { cameraY: 0 },
             setup: { voice: "am_fenrir", language: "en-us", speed: 1.1, audioEncoding: "wav" }
        };

        setAvatarStatus("Loading Model...");
        await Promise.all([
             head.showAvatar(personConfig.avatar),
             headtts.connect()
        ]);
        
        head.setView(head.viewName, personConfig.view);
        head.cameraClock = 999;
        headtts.setup(personConfig.setup);
        head.start();
        setAvatarStatus("Online");

      } catch (err: any) {
        console.error("Avatar Init Failed:", err);
        setAvatarStatus("Error: " + err.message);
      }
    };

    initAvatar();
    return () => { if (headRef.current) headRef.current.stop(); };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- 2. DIRECTOR ---
  const processQueue = async () => {
    if (isExecutingRef.current) return; 
    isExecutingRef.current = true;
    setIsPlaying(true);

    while (commandQueueRef.current.length > 0) {
      const action = commandQueueRef.current.shift(); 
      if (!action) break;

      switch (action.type) {
        case 'LAYOUT':
          addDebug(`Executing LAYOUT: ${action.mode}`);
          setLayoutMode(action.mode);
          setHighlightQuery(null); 
          break;
        
        case 'CODE':
          addDebug(`Executing CODE`);
          setActiveCode(cleanCodeSnippet(action.code));
          setHighlightQuery(null); 
          break;

        case 'CONCEPT':
          setConceptData({ title: action.title, text: action.text });
          break;

        case 'HIGHLIGHT':
          addDebug(`Executing HIGHLIGHT`);
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
             addDebug(`SPEAK LOCK: "${action.text.substring(0, 15)}..."`);

             // RESET COUNTERS
             onEndCountRef.current = 0;
             totalPartsRef.current = 0;

             if (headRef.current.audioCtx.state === 'suspended') {
                 await headRef.current.audioCtx.resume();
             }

             // START INITIAL WATCHDOG
             // Give the engine 5 seconds to send the FIRST chunk of data.
             kickWatchdog();

             // THE LOCK
             await new Promise<void>((resolve) => {
                 audioResolverRef.current = resolve;

                 try {
                    headTTSRef.current.synthesize({ input: action.text });
                 } catch (e) {
                    console.error("Synthesize Error", e);
                    resolve(); 
                 }
                 
                 // Relies on kickWatchdog() to resolve or timeout
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

  // --- 3. PRODUCER ---
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
      else if (data.type === 'highlight') action = { type: 'HIGHLIGHT', code_to_highlight: data.code_to_highlight };

      if (action) {
        commandQueueRef.current.push(action);
        processQueue(); 
      }
    } catch (e) {
      console.warn("Parse Error:", line);
    }
  };

  // --- 4. API HANDLER (Restored) ---
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
        if (!done) buffer = lines.pop() || ""; 
        else buffer = "";

        for (const line of lines) parseAndEnqueue(line);
        if (done) break;
      }
      
      if (buffer.trim()) parseAndEnqueue(buffer);

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "Error connecting to server." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCode = () => {
    return activeCode.split('\n').map((line, i) => {
        const lineNumber = i + 1;
        let isHighlighted = false;
        if (highlightQuery) {
            const normalizedLine = cleanCodeSnippet(line).trim();
            const normalizedQuery = cleanCodeSnippet(highlightQuery).trim();
            if (normalizedLine && normalizedQuery && normalizedLine.includes(normalizedQuery)) {
                isHighlighted = true;
            }
        }
        return (
            <div key={i} className={`px-6 py-0.5 transition-colors duration-200 ${isHighlighted ? 'bg-[#1a2c33] border-l-2 border-cyan-400' : 'bg-transparent border-l-2 border-transparent'}`}>
                <span className="inline-block w-6 text-gray-700 text-[10px] select-none mr-2">{lineNumber}</span>
                <code className="font-mono text-gray-400 whitespace-pre">{line}</code>
            </div>
        );
    });
  };

  return (
    <div className={`flex h-screen w-full ${COLORS.bg} ${COLORS.textMain} font-sans overflow-hidden`}>
      {/* Sidebar */}
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

      {/* Right Canvas */}
      <div className={`flex-1 flex flex-col ${COLORS.panelBg} relative overflow-hidden transition-all duration-500`}>
        <header className={`h-16 border-b ${COLORS.border} flex items-center justify-between px-8 bg-[#080808]/90 backdrop-blur z-30`}>
          <div className="flex gap-8">
            {['CONCEPT_MODE', 'SPLIT_MODE', 'FOCUS_MODE'].map((mode) => (
                <div key={mode} className={`relative py-5 text-xs font-medium tracking-wider uppercase flex items-center gap-2 transition-colors duration-300 ${layoutMode === mode ? 'text-white' : 'text-gray-600'}`}>
                    {mode === 'CONCEPT_MODE' && <Layout size={14} />}
                    {mode === 'SPLIT_MODE' && <Columns size={14} />}
                    {mode === 'FOCUS_MODE' && <Code2 size={14} />}
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
          <div className={`relative flex flex-col ${COLORS.cardBg} border ${COLORS.border} rounded-2xl overflow-hidden transition-all duration-700 ease-in-out ${layoutMode === 'CONCEPT_MODE' ? 'flex-[100%] opacity-100 translate-x-0' : ''} ${layoutMode === 'SPLIT_MODE' ? 'flex-[45%] opacity-100 translate-x-0' : ''} ${layoutMode === 'FOCUS_MODE' ? 'flex-[0%] opacity-0 -translate-x-10 w-0 border-0 p-0 pointer-events-none' : ''}`}>
            <div className="p-8 min-w-[400px] animate-in fade-in duration-700">
              <h1 className="text-3xl font-light text-white tracking-tight mb-2">Concept <span className="text-gray-500">View</span></h1>
              <div className={`w-12 h-0.5 ${COLORS.cyanBg} mb-8`} />
              <div key={conceptData.title} className="animate-in slide-in-from-right-4 duration-500">
                 <h2 className={`text-xl font-medium mb-4 ${COLORS.cyanText}`}>{conceptData.title}</h2>
                 <p className="text-gray-300 leading-relaxed text-sm max-w-xl">{conceptData.text}</p>
              </div>
            </div>
          </div>

          <div className={`relative flex flex-col ${COLORS.cardBg} border ${COLORS.border} rounded-2xl overflow-hidden transition-all duration-700 ease-in-out ${layoutMode === 'CONCEPT_MODE' ? 'flex-[0%] opacity-0 translate-x-10 w-0 border-0 p-0 pointer-events-none' : ''} ${layoutMode === 'SPLIT_MODE' ? 'flex-[55%] opacity-100 translate-x-0' : ''} ${layoutMode === 'FOCUS_MODE' ? 'flex-[100%] opacity-100 translate-x-0' : ''}`}>
             <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#121212]">
                <span className="text-xs font-mono text-gray-500">live_script.jsx</span>
                <span className="text-xs font-mono text-gray-600">JavaScript / React</span>
             </div>
             <div className="flex-1 font-mono text-xs leading-6 overflow-auto relative bg-[#0B0B0B] custom-scrollbar py-4">
                {renderCode()}
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