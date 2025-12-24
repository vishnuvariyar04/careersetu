'use client'
import React, { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion"
import packageJson from "../package.json"
import { 
  ArrowRight, 
  Menu, 
  X,
  Code2, 
  Terminal, 
  Check,
  Brain,
  Target,
  Zap,
  BarChart,
  Rocket,
  MessageSquare,
  Clock,
  Plus,
  Minus,
  Star,
  GitBranch,
  Twitter,
  Github,
  Linkedin,
  Send,
  PlayCircle,
  AlertTriangle,
  Sparkles,
  GraduationCap,
  MonitorPlay,
  HelpCircle,
  Lightbulb,
  TrendingUp
} from "lucide-react"

// --- 0. Font & Global Styles ---
const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    
    * {
      scroll-behavior: smooth;
    }
    
    body {
      font-family: 'Space Grotesk', sans-serif;
      background-color: #0b0f14; 
      color: white;
      overflow-x: hidden;
      /* Performance optimizations */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    
    html {
      scroll-behavior: smooth;
      scroll-padding-top: 100px;
    }
    
    /* GPU acceleration and performance optimizations */
    [data-scroll-container] {
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
    }
    
    /* Optimize scroll performance */
    @media (prefers-reduced-motion: no-preference) {
      * {
        scroll-behavior: smooth;
      }
    }
    
    /* Force GPU acceleration for animated elements */
    [class*="motion-"], [data-framer-component] {
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
      will-change: transform, opacity;
    }
    
    /* Optimize fixed elements */
    [style*="position: fixed"] {
      will-change: transform;
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
    }
    
    /* Reduce repaints on scroll */
    body {
      -webkit-overflow-scrolling: touch;
    }
    
    /* Optimize images */
    img {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
    
    /* Custom scrollbar for premium feel */
    ::-webkit-scrollbar {
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: #0b0f14;
    }
    
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #2563eb 0%, #1e3a5f 100%);
    }
    
    /* Smooth transitions for all interactive elements */
    a, button {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `}</style>
)
// --- 6. OPTIMIZED: Modern Comparison Component ---

const ComparisonRow = ({ feature, traditional, outlrn, delay }:any) => {
    const shouldReduceMotion = useReducedMotion()
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ 
                delay: shouldReduceMotion ? 0 : delay, 
                duration: 0.3,
                ease: "easeOut"
            }}
            style={{ 
                willChange: "transform, opacity",
                backfaceVisibility: "hidden"
            }}
            className="grid grid-cols-3 gap-6 py-6 border-b border-white/5 last:border-0 items-center hover:bg-white/[0.02] transition-colors px-6 -mx-6"
        >
        {/* Feature Name */}
        <div className="text-zinc-400 font-medium text-sm flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            {feature}
        </div>

        {/* Traditional (Negative) */}
        <div className="text-zinc-500 font-medium text-sm flex items-center gap-2">
            <X className="w-4 h-4 text-red-500/50 shrink-0" /> 
            <span className="line-through decoration-red-500/30 decoration-2">{traditional}</span>
        </div>

        {/* Outlrn (Positive) */}
        <div className="text-white font-bold text-sm flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-blue-400" />
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                {outlrn}
            </span>
        </div>
        </motion.div>
    )
}

const ComparisonSection = () => {
    const shouldReduceMotion = useReducedMotion()
    
    // Simplified animation variants for better performance
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.05,
                delayChildren: shouldReduceMotion ? 0 : 0.1
            }
        }
    }
    
    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.3, 
                ease: "easeOut"
            }
        }
    }

    return (
        <section className="py-32 px-6 relative z-10 bg-[#0b0f15]" style={{ contain: "layout style paint" }}>
            
            {/* Simplified Background Glow - Reduced blur for performance */}
            {!shouldReduceMotion && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                    style={{ 
                        willChange: "opacity",
                        transform: "translate3d(-50%, -50%, 0)"
                    }}
                    className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" 
                />
            )}

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="container mx-auto max-w-5xl relative z-10"
            >
                
                {/* Header with optimized animations */}
                <motion.div variants={itemVariants} className="text-center mb-20">
                    <div 
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-6"
                    >
                        <BarChart className="w-3.5 h-3.5" />
                        VS Video Courses
                    </div>
                    <h2 
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Why choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Outlrn?</span>
                    </h2>
                    <p className="text-zinc-400 text-lg">
                        Stop watching. Start learning interactively.
                    </p>
                </motion.div>
                
                {/* Main Comparison Table Card - Reduced backdrop-blur */}
                <motion.div 
                    variants={itemVariants}
                    style={{ 
                        willChange: "transform, opacity",
                        backfaceVisibility: "hidden"
                    }}
                    className="relative rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] bg-[#0c1117]/80 border border-white/10 p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl overflow-hidden hover:border-white/20 transition-colors duration-300"
                >
                    
                    {/* Top Gradient Highlight */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-60" />
                    
                    {/* Grid Header - Simplified, no animation */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-4 sm:pb-6">
                        <div className="text-left">Feature</div>
                        <div className="text-center sm:text-left">Traditional</div>
                        <div className="text-blue-400 flex items-center gap-1 sm:gap-1.5 justify-end sm:justify-start">
                            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">The Outlrn Way</span>
                            <span className="sm:hidden">Outlrn</span>
                        </div>
                    </div>

                    {/* Rows - Reduced delays for faster animation */}
                    <div className="flex flex-col">
                        <ComparisonRow 
                            feature="Learning Style" 
                            traditional="Watching long videos" 
                            outlrn="Live AI avatar teaching" 
                            delay={0}
                        />
                        <ComparisonRow 
                            feature="Interaction" 
                            traditional="Pause, rewind, guess" 
                            outlrn="Ask questions instantly" 
                            delay={0.05}
                        />
                        <ComparisonRow 
                            feature="Explanations" 
                            traditional="One-size-fits-all" 
                            outlrn="Personalized to you" 
                            delay={0.1}
                        />
                        <ComparisonRow 
                            feature="Visual Learning" 
                            traditional="Slides or none" 
                            outlrn="Diagrams, flowcharts, code" 
                            delay={0.15}
                        />
                        <ComparisonRow 
                            feature="Learning Speed" 
                            traditional="Slow and passive" 
                            outlrn="Fast and interactive" 
                            delay={0.2}
                        />
                    </div>

                </motion.div>
            </motion.div>
        </section>
    )
}

// --- PRICING SECTION COMPONENT ---
const PricingCard = ({ plan, price, period, description, features, buttonText, buttonLink, isPro = false, delay = 0 }: any) => {
    const shouldReduceMotion = useReducedMotion()
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            whileHover={!shouldReduceMotion ? { y: -8, transition: { duration: 0.3 } } : {}}
            style={{ 
                willChange: "transform, opacity",
                backfaceVisibility: "hidden"
            }}
            className={`relative group h-full ${isPro ? 'md:scale-105' : ''}`}
        >
            {/* Outer stroke gradient */}
            <div 
                className="rounded-[32px] md:rounded-[32px] rounded-b-[20px] md:rounded-b-[24px] p-[1px] h-full"
                style={{
                    background: isPro 
                        ? 'linear-gradient(147deg, rgba(59, 130, 246, 0.3) 4%, rgba(59, 130, 246, 0.1) 61%)'
                        : 'linear-gradient(147deg, rgba(255, 255, 255, 0.1) 4%, rgba(255, 255, 255, 0) 61%)'
                }}
            >
                {/* Main card */}
                <div className="relative rounded-[32px] md:rounded-[32px] rounded-b-[20px] md:rounded-b-[20px] bg-[#1c2026] overflow-hidden h-full flex flex-col">
                    {/* Pro plan background image effect */}
                    {isPro && (
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent" />
                        </div>
                    )}
                    
                    {/* Top gradient highlight */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                    
                    <div className="relative p-4 sm:p-6 md:p-8 flex flex-col flex-grow z-10">
                        {/* Price badge */}
                        <div className="mb-6 flex justify-center">
                            <div className="relative inline-block">
                                {/* Outer stroke for badge */}
                                <div 
                                    className="rounded-[24px] p-[1px]"
                                    style={{
                                        background: isPro
                                            ? 'linear-gradient(124deg, rgb(231, 248, 255) 0%, rgba(172, 232, 255, 0.5) 100%)'
                                            : 'linear-gradient(124deg, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)'
                                    }}
                                >
                                    {/* Badge inner */}
                                    <div 
                                        className={`rounded-[24px] px-4 py-2 ${
                                            isPro 
                                                ? 'bg-gradient-to-br from-blue-100 to-cyan-100' 
                                                : 'bg-gradient-to-br from-[#2c2e31] to-[#1e2024]'
                                        }`}
                                        style={{ backdropFilter: 'blur(3px)' }}
                                    >
                                        <p className={`text-sm font-medium tracking-tight text-center ${
                                            isPro ? 'text-blue-900' : 'text-white'
                                        }`}>
                                            {plan}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Price */}
                        <div className="mb-3 sm:mb-4 text-center">
                            <div className="flex items-baseline justify-center gap-1.5 sm:gap-2">
                                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                                    {price}
                                </span>
                                <span className="text-xs sm:text-sm text-zinc-400 font-normal">
                                    /{period}
                                </span>
                            </div>
                        </div>
                        
                        {/* Description */}
                        <p className="text-xs sm:text-sm text-white font-medium mb-6 sm:mb-8 text-center leading-relaxed px-2">
                            {description}
                        </p>
                        
                        {/* Features */}
                        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                            {features.map((feature: string, index: number) => (
                                <div key={index} className="flex items-start sm:items-center gap-2 sm:gap-3">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-white font-medium tracking-tight leading-relaxed">
                                        {feature}
                                    </p>
                                </div>
                            ))}
                        </div>
                        
                        {/* CTA Button */}
                        <a
                            href={buttonLink}
                            className={`block w-full rounded-lg sm:rounded-xl md:rounded-[18px] py-2.5 sm:py-3.5 px-4 sm:px-6 text-center text-xs sm:text-sm font-medium transition-all duration-300 ${
                                isPro
                                    ? 'bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50'
                                    : 'bg-gradient-to-b from-[#1c2026] to-[#12161c] border border-white/10 hover:border-white/20 text-white hover:bg-white/5'
                            }`}
                            style={{
                                boxShadow: isPro 
                                    ? 'rgba(255, 255, 255, 0.25) 2px 2px 8px 0px inset, rgba(0, 0, 0, 0.15) -2px -2px 7px 0px inset'
                                    : 'rgba(255, 255, 255, 0.05) 2px 2px 4px 0px inset, rgba(0, 0, 0, 0.15) -2px -2px 6px 0px inset'
                            }}
                        >
                            {buttonText}
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// --- QUICKSTART SECTION COMPONENT ---
const QuickstartSection = () => {
    const shouldReduceMotion = useReducedMotion()
    const [activeTab, setActiveTab] = useState<'typescript' | 'python' | 'curl'>('typescript')
    
    const codeSnippets = {
        typescript: `// Start learning with Outlrn

import { Outlrn } from '@outlrn/sdk';


// Initialize the Outlrn client

const outlrn = new Outlrn({
  apiKey: process.env.OUTLRN_API_KEY
});


// Ask any topic and get interactive learning

const session = await outlrn.learn({
  topic: "React Hooks",
  level: "intermediate"
});


// Get real-time AI avatar teaching

session.onMessage((message) => {
  console.log(message.content);
  // Visual diagrams, code examples, and explanations
});`,
        python: `# Start learning with Outlrn

from outlrn import Outlrn


# Initialize the Outlrn client

outlrn = Outlrn(
    api_key=os.getenv("OUTLRN_API_KEY")
)


# Ask any topic and get interactive learning

session = outlrn.learn(
    topic="Python Decorators",
    level="beginner"
)


# Get real-time AI avatar teaching

for message in session.stream():
    print(message.content)
    # Visual diagrams, code examples, and explanations`,
        curl: `# Start a learning session

curl -X POST https://api.outlrn.ai/v1/learn \\
  -H "Authorization: Bearer $OUTLRN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "JavaScript Promises",
    "level": "intermediate"
  }'


# Response includes interactive AI avatar
# with visuals, diagrams, and code examples`
    }
    
    return (
        <section id="quickstart" className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 relative z-10 bg-[#0b0f14] overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[300px] sm:h-[450px] md:h-[600px] bg-blue-900/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="container mx-auto max-w-7xl relative z-10">
                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Column - Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="order-2 lg:order-1"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-4 sm:mb-6"
                        >
                            <Code2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            Quickstart
                        </motion.div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                            Start learning interactively <br className="hidden sm:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                in minutes
                            </span>
                        </h2>
                        <p className="text-base sm:text-lg text-zinc-400 mb-6 sm:mb-8 leading-relaxed">
                            Get started with Outlrn and experience interactive AI-powered learning. Ask any computer science or web development topic, and get real-time teaching with visuals, diagrams, and code examples.
                        </p>
                        
                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                        >
                            <motion.a
                                href="/auth"
                                whileHover={!shouldReduceMotion ? { scale: 1.02 } : {}}
                                whileTap={!shouldReduceMotion ? { scale: 0.98 } : {}}
                                className="relative rounded-[12px] sm:rounded-[18px] overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 rounded-[12px] sm:rounded-[18px] text-white font-medium text-sm sm:text-base shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all"
                                    style={{
                                        boxShadow: 'rgba(255, 255, 255, 0.25) 2px 2px 8px 0px inset, rgba(0, 0, 0, 0.15) -2px -2px 7px 0px inset'
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        Get Started Free
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </motion.a>
                            <motion.a
                                href="/docs"
                                whileHover={!shouldReduceMotion ? { scale: 1.02 } : {}}
                                whileTap={!shouldReduceMotion ? { scale: 0.98 } : {}}
                                className="px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 rounded-[12px] sm:rounded-[16px] border border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white font-medium text-sm sm:text-base transition-all backdrop-blur-sm"
                            >
                                View Documentation
                            </motion.a>
                        </motion.div>
                    </motion.div>
                    
                    {/* Right Column - Code Block */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="order-1 lg:order-2"
                    >
                        <div className="relative rounded-[16px] sm:rounded-[20px] bg-[#16171b] border border-[#2b2b2b] overflow-hidden">
                            {/* Tab Bar */}
                            <div className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-[#16171b] border-b border-[#2b2b2b]">
                                {(['typescript', 'python', 'curl'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`relative px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                            activeTab === tab
                                                ? 'text-blue-400 font-bold'
                                                : 'text-zinc-400 hover:text-zinc-300'
                                        }`}
                                    >
                                        {tab === 'typescript' ? 'TypeScript' : tab === 'python' ? 'Python' : 'cURL'}
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Code Content */}
                            <div className="bg-[#0b0c0e] p-4 sm:p-6 overflow-x-auto">
                                <pre className="text-[11px] sm:text-xs md:text-sm font-mono text-zinc-300 leading-relaxed">
                                    <code className="block whitespace-pre-wrap">
                                        {codeSnippets[activeTab].split('\n').map((line, lineIndex) => {
                                    if (!line.trim()) {
                                        return <span key={lineIndex} className="block h-3" />
                                    }
                                    
                                    // Comments (green)
                                    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
                                        return <span key={lineIndex} className="block text-green-500">{line}</span>
                                    }
                                    
                                    // Simple highlighting - split and highlight patterns
                                    const highlightCode = (text: string): (string | JSX.Element)[] => {
                                        const parts: (string | JSX.Element)[] = []
                                        let remaining = text
                                        
                                        // Find all matches with their positions
                                        const matches: Array<{start: number, end: number, type: 'string' | 'keyword' | 'identifier', content: string}> = []
                                        
                                        // Strings
                                        const stringRegex = /"([^"]+)"/g
                                        let stringMatch: RegExpExecArray | null
                                        while ((stringMatch = stringRegex.exec(text)) !== null) {
                                            matches.push({ start: stringMatch.index, end: stringMatch.index + stringMatch[0].length, type: 'string' as const, content: stringMatch[0] })
                                        }
                                        
                                        // Keywords
                                        const keywordRegex = /\b(import|from|export|const|let|var|new|class|function|return|if|else|async|await|def|npm|pip|curl|install|POST|GET)\b/g
                                        let keywordMatch: RegExpExecArray | null
                                        while ((keywordMatch = keywordRegex.exec(text)) !== null) {
                                            // Check if not already matched as string
                                            const isInString = matches.some(m => keywordMatch!.index! >= m.start && keywordMatch!.index! < m.end)
                                            if (!isInString) {
                                                matches.push({ start: keywordMatch.index!, end: keywordMatch.index! + keywordMatch[0].length, type: 'keyword' as const, content: keywordMatch[0] })
                                            }
                                        }
                                        
                                        // Identifiers
                                        const idRegex = /\b(Outlrn|outlrn|session|apiKey|api_key|process|env|os|getenv|OUTLRN_API_KEY|learn|onMessage|stream)\b/g
                                        let idMatch: RegExpExecArray | null
                                        while ((idMatch = idRegex.exec(text)) !== null) {
                                            const isInString = matches.some(m => idMatch!.index! >= m.start && idMatch!.index! < m.end)
                                            if (!isInString) {
                                                matches.push({ start: idMatch.index!, end: idMatch.index! + idMatch[0].length, type: 'identifier' as const, content: idMatch[0] })
                                            }
                                        }
                                        
                                        // Sort matches by position
                                        matches.sort((a, b) => a.start - b.start)
                                        
                                        // Build parts
                                        let lastIndex = 0
                                        matches.forEach((m, i) => {
                                            if (m.start > lastIndex) {
                                                parts.push(text.substring(lastIndex, m.start))
                                            }
                                            const className = m.type === 'string' ? 'text-orange-400' : 
                                                           m.type === 'keyword' ? 'text-blue-400' : 'text-cyan-300'
                                            parts.push(<span key={`${m.type}-${i}`} className={className}>{m.content}</span>)
                                            lastIndex = m.end
                                        })
                                        
                                        if (lastIndex < text.length) {
                                            parts.push(text.substring(lastIndex))
                                        }
                                        
                                        return parts.length > 0 ? parts : [text]
                                    }
                                    
                                            const highlighted = highlightCode(line)
                                            return <span key={lineIndex} className="block">{highlighted}</span>
                                        })}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

const PricingSection = () => {
    const shouldReduceMotion = useReducedMotion()
    
    const pricingPlans = [
        {
            plan: "Free",
            price: "$0",
            period: "month",
            description: "Perfect for getting started with interactive learning.",
            features: [
                "10 learning sessions per month",
                "Basic AI avatar teaching",
                "Community support",
                "Access to core topics"
            ],
            buttonText: "Get Started",
            buttonLink: "/auth",
            isPro: false
        },
        {
            plan: "Pro",
            price: "$19",
            period: "month",
            description: "Memory for power users and quick moving teams.",
            features: [
                "Unlimited learning sessions",
                "Advanced AI avatar with visuals",
                "Priority support",
                "Advanced analytics",
                "All topics unlocked"
            ],
            buttonText: "Get started with Pro →",
            buttonLink: "/auth",
            isPro: true
        },
        {
            plan: "Scale",
            price: "$99",
            period: "month",
            description: "Enterprise-grade learning for large organizations with dedicated support.",
            features: [
                "Everything in Pro",
                "Team collaboration features",
                "Dedicated support",
                "Custom integrations",
                "Advanced reporting"
            ],
            buttonText: "Get started with Scale →",
            buttonLink: "/auth",
            isPro: false
        }
    ]
    
    return (
        <section id="pricing" className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 relative z-10 bg-[#0b0f14] overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[300px] sm:h-[450px] md:h-[600px] bg-blue-900/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="container mx-auto max-w-7xl relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10 sm:mb-12 md:mb-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-4 sm:mb-6"
                    >
                        <BarChart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Pricing
                    </motion.div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-2">
                        The fastest learning layer, <br className="hidden sm:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                            at a fraction of the cost
                        </span>
                    </h2>
                    <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto px-4">
                        Start free, experiment fast, and only pay when learning becomes your advantage. No hidden fees.
                    </p>
                </motion.div>
                
                {/* Pricing Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
                    {pricingPlans.map((plan, index) => (
                        <PricingCard
                            key={plan.plan}
                            {...plan}
                            delay={shouldReduceMotion ? 0 : index * 0.1}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

// --- 1. OPTIMIZED: Logo Component ---
const Logo = () => (
  <img 
    src="/images/outlrn-cropped.png" 
    className="w-40" 
    alt="Outlrn"
    loading="eager"
    decoding="async"
    style={{ willChange: "auto" }}
  />
)

// --- 2. Custom Icons ---
const VSCodeIcon = () => (
  <div className="w-10 h-10 bg-[#007ACC] rounded-lg flex items-center justify-center shrink-0 shadow-lg">
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M23.15 2.587l-9.854 4.103L4.856 2.016 1.08 4.29l10.939 7.667L1.13 19.648l3.774 2.274 8.438-4.673 9.856 4.104.24-.012.762-.312V2.94l-.762-.312-.288-.041z" /></svg>
  </div>
)
const ReactIcon = () => (
  <div className="w-10 h-10 bg-[#20232a] rounded-lg flex items-center justify-center shrink-0 border border-white/10 shadow-lg"><svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#61dafb]"><circle cx="12" cy="12" r="2" /><g stroke="currentColor" strokeWidth="1" fill="none"><ellipse rx="10" ry="4.5" cx="12" cy="12" /><ellipse rx="10" ry="4.5" cx="12" cy="12" transform="rotate(60 12 12)" /><ellipse rx="10" ry="4.5" cx="12" cy="12" transform="rotate(120 12 12)" /></g></svg></div>
)
const GitIcon = () => (
  <div className="w-10 h-10 bg-[#F05032] rounded-lg flex items-center justify-center shrink-0 shadow-lg"><svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2" fill="white"/><path d="M12 10v-4" stroke="white" /><path d="M12 14v4" stroke="white" /><circle cx="12" cy="6" r="1" fill="white"/></svg></div>
)
// --- 3. UI Components ---

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const rafRef = useRef<number | null>(null)
    const lastScrollY = useRef(0)

    useEffect(() => {
        const handleScroll = () => {
            // Cancel previous RAF if it exists
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
            }
            
            // Use requestAnimationFrame for smooth, throttled updates
            rafRef.current = requestAnimationFrame(() => {
                const currentScrollY = window.scrollY
                // Only update if scroll position changed significantly (reduces re-renders)
                if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
                    setIsScrolled(currentScrollY > 50)
                    lastScrollY.current = currentScrollY
                }
            })
        }
        
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => {
            window.removeEventListener("scroll", handleScroll)
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
            }
        }
    }, [])

    return (
        <>
            <motion.nav 
                initial={false}
                animate={isScrolled ? "scrolled" : "top"}
                variants={{
                    top: { 
                        width: "100%", 
                        top: 0, 
                        borderRadius: "0px", 
                        backgroundColor: "rgba(11, 15, 20, 0)", 
                        borderColor: "rgba(255, 255, 255, 0)",
                        paddingTop: "1.5rem",
                        paddingBottom: "1.5rem"
                    },
                    scrolled: { 
                        width: "min(90%, 1200px)", 
                        top: 20, 
                        borderRadius: "9999px", 
                        backgroundColor: "rgba(11, 15, 20, 0.75)",
                        borderColor: "rgba(255, 255, 255, 0.08)",
                        paddingTop: "0.75rem",
                        paddingBottom: "0.75rem"
                    }
                }}
                transition={{ 
                    type: "spring",
                    stiffness: 400,
                    damping: 40,
                    mass: 0.5
                }}
                style={{ 
                    position: "fixed", 
                    left: "50%", 
                    x: "-50%",
                    zIndex: 50,
                    // Reduced blur for better performance
                    backdropFilter: isScrolled ? "blur(12px) saturate(150%)" : "blur(0px)",
                    WebkitBackdropFilter: isScrolled ? "blur(12px) saturate(150%)" : "blur(0px)",
                    willChange: "transform, backdrop-filter",
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden"
                }}
                className="flex items-center justify-between px-6 border shadow-xl shadow-black/5"
            >
                {/* 1. Logo Section */}
                <motion.div 
                    className="flex items-center gap-3 shrink-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Logo /> 
                    <motion.div
                        animate={{ 
                            opacity: isScrolled ? 0 : 1,
                            width: isScrolled ? 0 : "auto",
                            marginLeft: isScrolled ? 0 : "0.5rem"
                        }}
                        transition={{ duration: 0.2 }}
                        style={{ willChange: "transform, opacity" }}
                        className="overflow-hidden"
                    >
                        <span className="bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
                            v{packageJson.version}
                        </span>
                    </motion.div>
                </motion.div>

                {/* 2. Navigation Links (Desktop) - Centered */}
                <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                    {['Features', 'How it Works', 'Pricing', 'FAQ'].map((item, i) => (
                        <motion.a 
                            key={item}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            href={`#${item.toLowerCase().replace(/\s/g, '-')}`} 
                            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-all duration-300 relative group whitespace-nowrap rounded-full hover:bg-white/5"
                        >
                            {item}
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 group-hover:w-1/2 rounded-full" />
                        </motion.a>
                    ))}
                </div>

                {/* 3. Right Actions */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="hidden md:flex items-center gap-3 shrink-0"
                >
                    <button className="px-4 py-2 text-zinc-400 hover:text-white text-sm font-medium transition-all duration-300 hover:bg-white/5 rounded-full whitespace-nowrap">
                        Sign In
                    </button>
                    
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border border-blue-400/20 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] flex items-center gap-2 whitespace-nowrap"
                    >
                        Get Started <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                </motion.div>

                {/* Mobile Menu Toggle */}
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    className="md:hidden text-white ml-auto p-2 rounded-full hover:bg-white/10 transition-colors" 
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.button>
            </motion.nav>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-40 bg-[#0b0f14]/95 backdrop-blur-xl pt-24 px-6 md:hidden"
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="flex flex-col gap-2"
                        >
                            {['Features', 'How it Works', 'Pricing', 'FAQ'].map((item, i) => (
                                <motion.a 
                                    key={item} 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                                    href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                                    onClick={() => setIsOpen(false)} 
                                    className="text-xl font-medium text-zinc-300 hover:text-white py-4 px-4 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    {item}
                                </motion.a>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.4 }}
                                className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3"
                            >
                                <button className="w-full py-3 text-zinc-300 hover:text-white font-medium transition-colors">
                                    Sign In
                                </button>
                                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
                                    Get Started
                                </button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
// --- 4. OPTIMIZED: Premium Step Card with Glassmorphism ---
const StepCard = ({ step, tag, title, desc, color, imgUrl }:any) => {
    const shouldReduceMotion = useReducedMotion()
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ 
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)"
            }}
            className="group relative w-full max-w-[500px] mx-auto mb-16 sm:mb-20 md:mb-24 last:mb-0"
        >
            
            {/* Card Structure: Two layers for the double-border effect */}
            
            {/* Layer 1: Outer Ring with gradient border */}
            <div className="relative rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] p-[1px] bg-gradient-to-b from-white/15 via-white/5 to-transparent hover:from-white/25 hover:via-white/10 transition-all duration-300">
                
                {/* Layer 2: Inner Dark Body - Reduced backdrop-blur for performance */}
                <div className="relative h-full rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-b from-[#151a22] to-[#0f141a] overflow-hidden">
                    
                    {/* Top Gradient Highlight (The sharp colored line) */}
                    <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${color} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* Content Padding */}
                    <div className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-0 relative z-20">
                        
                        {/* Header: Tag with enhanced styling - Simplified animation */}
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs sm:text-sm">
                                {step}
                            </span>
                            <span className="text-blue-400 font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.1em] sm:tracking-[0.15em] uppercase">
                                {tag}
                            </span>
                        </div>

                        {/* Headline */}
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-3 sm:mb-4 leading-tight tracking-tight">
                            {title}
                        </h3>

                        {/* Description */}
                        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-sm mb-6 sm:mb-8">
                            {desc}
                        </p>
                    </div>

                    {/* Visual Area (Integrated Bottom Section) */}
                    <div className="relative w-full h-[240px] sm:h-[280px] md:h-[320px] flex items-end justify-center overflow-hidden">
                        
                        {/* Blue Radial Glow - Reduced blur and simplified animation */}
                        {!shouldReduceMotion && (
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.05, 1],
                                    opacity: [0.2, 0.35, 0.2]
                                }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                style={{ 
                                    willChange: "transform, opacity",
                                    transform: "translate3d(-50%, 0, 0)"
                                }}
                                className="absolute bottom-[-20%] left-1/2 w-72 h-72 bg-blue-600/30 rounded-full blur-[60px]" 
                            />
                        )}
                        
                        {/* Tech Grid Pattern - more subtle */}
                        <div className="absolute inset-0 opacity-10" 
                             style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
                        />

                        {/* Image/Visual - Optimized hover */}
                        <motion.img 
                            src={imgUrl}
                            alt={title}
                            whileHover={!shouldReduceMotion ? { scale: 1.03, y: -3 } : {}}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            style={{ 
                                willChange: "transform",
                                backfaceVisibility: "hidden"
                            }}
                            className="relative z-10 w-[75%] sm:w-[70%] object-contain object-bottom drop-shadow-2xl"
                            loading="lazy"
                        />
                        
                        {/* Fade to Black at bottom to merge with border */}
                        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0f141a] via-[#0f141a]/80 to-transparent z-20" />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// --- 5. OPTIMIZED: How To Use Section with Premium Styling ---
const HowToUseSection = () => {
    const shouldReduceMotion = useReducedMotion()
    
    // Gradient definitions for top borders
    const gradients = [
        "from-blue-500 via-cyan-400 to-transparent",
        "from-cyan-500 via-teal-400 to-transparent",
        "from-indigo-500 via-purple-400 to-transparent",
        "from-orange-500 via-amber-400 to-transparent",
        "from-emerald-500 via-green-400 to-transparent"
    ]

    return (
        <section id="features" className="relative bg-[#0b0f15] py-20 sm:py-24 md:py-32 px-4 sm:px-6" style={{ contain: "layout style paint" }}>
            
            {/* --- SIMPLIFIED BACKGROUND - Minimal Aurora for performance --- */}
            {!shouldReduceMotion && (
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {/* Simplified single glow instead of complex AuroraFlare */}
                    <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-[#115ca3] blur-[80px] mix-blend-screen opacity-20"
                        style={{ 
                            transform: "translate3d(-50%, -50%, 0)",
                            willChange: "opacity"
                        }}
                    />
                    
                    {/* --- BLEND MASKS (Top & Bottom) --- */}
                    <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#0b0f15] to-transparent z-10" />
                    <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-[#0b0f15] to-transparent z-10" />
                </div>
            )}

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 md:gap-16 items-start">
                    
                    {/* --- LEFT COLUMN: STICKY HEADER - Optimized --- */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5 }}
                        style={{ 
                            willChange: "transform, opacity",
                            backfaceVisibility: "hidden"
                        }}
                        className="w-full lg:w-5/12 lg:sticky lg:top-32 lg:h-fit py-6 sm:py-10"
                    >
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 w-fit mb-6 sm:mb-8">
                            <Lightbulb className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            How it works
                        </div>
                        
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-4 sm:mb-6 leading-[1.1] tracking-tight">
                            How to use <br className="hidden sm:block"/> 
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                                Outlrn platform
                            </span>
                        </h2>
                        
                        <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-md mb-6 sm:mb-8">
                            Type any topic, get a live AI avatar that teaches with visuals, diagrams, and code — adapting to how you learn.
                        </p>

                        <motion.button 
                            whileHover={!shouldReduceMotion ? { scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" } : {}}
                            whileTap={!shouldReduceMotion ? { scale: 0.98 } : {}}
                            style={{ willChange: "transform" }}
                            className="group flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-white/20 text-white text-sm sm:text-base font-medium hover:border-white/30 transition-all w-fit"
                        >
                            <span>See how it works</span>
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </motion.div>

                    {/* --- RIGHT COLUMN: SCROLLING CARDS - Optimized --- */}
                    <div className="w-full lg:w-7/12 flex flex-col pt-6 sm:pt-10 pb-20 sm:pb-32 relative" style={{ willChange: "auto" }}>
                        
                        <StepCard 
                            step="1"
                            tag="ASK"
                            title="Type What You Want to Learn"
                            desc="Ask any computer science or web development concept just like ChatGPT. No syllabus, no fixed order."
                            color={gradients[0]}
                            imgUrl="/images/ask.png"
                        />

                        <StepCard 
                            step="2"
                            tag="TEACH"
                            title="AI Avatar Teaches Live"
                            desc="A real-time AI avatar explains concepts using diagrams, flowcharts, tables, and code walkthroughs."
                            color={gradients[1]}
                            imgUrl="/images/learning.png"
                        />

                        <StepCard 
                            step="3"
                            tag="INTERACT"
                            title="Ask Follow-Up Questions"
                            desc="Interrupt anytime. Ask for another example, simpler explanation, or submit your own code to understand it better."
                            color={gradients[2]}
                            imgUrl="/images/followup.png"
                        />

                        <StepCard 
                            step="4"
                            tag="PERSONALIZE"
                            title="Get Personalized Explanations"
                            desc="The avatar adapts explanations based on your understanding and the way you ask questions."
                            color={gradients[3]}
                            imgUrl="/images/tut.png"
                        />

                        <StepCard 
                            step="5"
                            tag="LEARN"
                            title="Understand Faster, Not Longer"
                            desc="No long videos. No unnecessary theory. Learn only what you need with visual, interactive teaching."
                            color={gradients[4]}
                            imgUrl="/images/result.png"
                        />

                    </div>
                </div>
            </div>
        </section>
    )
}
// --- OPTIMIZED: Aurora Component ---
const Aurora = ({ colorStops, blend, amplitude, speed }:any) => {
  const shouldReduceMotion = useReducedMotion()
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {!shouldReduceMotion && colorStops.map((color:any, index:any) => (
        <motion.div
          key={index}
          className="absolute rounded-[100%] mix-blend-screen opacity-40 blur-[60px]"
          style={{
            backgroundColor: color,
            width: '50vw',
            height: '50vh',
            left: index === 0 ? '-10%' : index === 1 ? '30%' : '50%',
            bottom: '-20%',
            willChange: "transform, opacity",
            transform: "translate3d(0,0,0)",
            backfaceVisibility: "hidden"
          }}
          animate={{
            y: [0, -30 * amplitude, 0],
            x: [0, 15 * amplitude, 0],
            scale: [1, 1.1 * amplitude, 1],
            opacity: [0.25, 0.5 * blend, 0.25],
          }}
          transition={{
            duration: 12 / speed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 2,
          }}
        />
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0b0f14] via-[#0b0f14]/60 to-transparent" />
    </div>
  )
}

const ConnectorLines = () => (
    <svg 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20 z-0 hidden lg:block"
        style={{ willChange: "auto" }}
    >
        <defs>
            <linearGradient id="lineGradLeft" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="lineGradRight" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="transparent" />
            </linearGradient>
        </defs>
        <path d="M 50% 55% C 40% 55%, 25% 65%, 15% 30%" stroke="url(#lineGradLeft)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
        <path d="M 50% 55% C 40% 55%, 25% 65%, 20% 80%" stroke="url(#lineGradLeft)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
        <path d="M 50% 55% C 60% 55%, 75% 65%, 85% 30%" stroke="url(#lineGradRight)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
        <path d="M 50% 55% C 60% 55%, 75% 65%, 80% 80%" stroke="url(#lineGradRight)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
    </svg>
)

// --- 3. UI Components ---

// ... (Other components)

const TrustedBy = () => {
    const brands = [
        'Composio', 'ASU', 'Github', 'Cluely', 'Montra', 'Mixus', 
        'Google', 'Spotify', 'Amazon', 'Meta', 'Netflix'
    ];
    
    return (
        <section className="py-16 bg-[#0b0f14] relative z-20 overflow-hidden border-y border-white/5">
            
            {/* Inline styles for the scrolling animation */}
            <style jsx>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 60s linear infinite;
                }
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
                .fade-mask {
                    mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
                }
            `}</style>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="container mx-auto px-4 sm:px-6 text-center"
            >
                <p className="text-zinc-500 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-8 md:mb-10">Trusted by innovative companies worldwide</p>
                
                {/* Scroll Container with Fade Mask */}
                <div className="relative w-full max-w-6xl mx-auto fade-mask overflow-hidden">
                    <div className="flex w-max animate-scroll gap-20 items-center py-4">
                        {/* We render the list twice to create the infinite loop effect */}
                        {[...brands, ...brands].map((brand, i) => (
                            <div 
                                key={i} 
                                className="text-xl font-bold text-zinc-600 hover:text-white transition-all duration-500 cursor-default select-none flex items-center gap-2 hover:scale-110"
                            >
                                <span>{brand}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
const FeatureItem = ({ imageUrl, title, desc, linkText = "Learn more" }:any) => (
    /* 1. Outer Bezel/Frame */
    <div className="group relative h-full rounded-[2.5rem] bg-gradient-to-b from-white/10 via-white/5 to-transparent p-[1px] hover:from-blue-500/30 hover:via-blue-500/10 hover:to-transparent transition-all duration-500">
        
        {/* 2. Main Card Body */}
        <div className="relative h-full flex flex-col bg-[#0b0f14] rounded-[2.5rem] overflow-hidden">
            
            {/* Background Noise/Texture (Kept subtle for texture) */}
            <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            
            {/* 3. Top Section: Pure Image Area */}
            {/* Removed: Glows, Hexagons, Inner Containers, Lines */}
            <div className="relative h-56 w-full overflow-hidden bg-[#171a1a]">
                <img 
                    src={imageUrl} 
                    alt={title} 
                    className="w-full h-full object-contain transform transition-transform duration-700 group-hover:scale-105" 
                />
                
                {/* Optional: Very subtle gradient at the bottom to blend image into the dark card body smoothly */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0b0f14] to-transparent" />
            </div>

            {/* 4. Bottom Section: Content */}
            <div className="relative flex flex-col flex-grow px-8 pb-8 pt-6">
                <h4 className="text-xl font-bold text-white mb-3 tracking-tight relative z-10">
                    {title}
                </h4>
                
                <p className="text-sm text-zinc-400 leading-relaxed mb-8 flex-grow relative z-10">
                    {desc}
                </p>

                {/* Link */}
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium cursor-pointer group/link hover:text-blue-300 transition-colors relative z-10">
                    <span>{linkText}</span>
                    <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                </div>
            </div>
        </div>
    </div>
)

// const ComparisonRow = ({ feature, traditional, outlrn }) => (
//     <div className="grid grid-cols-3 gap-4 py-5 border-b border-white/5 text-sm items-center">
//         <div className="text-zinc-300 font-medium">{feature}</div>
//         <div className="text-zinc-500 flex items-center gap-2"><X className="w-4 h-4 text-red-500/50" /> {traditional}</div>
//         <div className="text-white flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> {outlrn}</div>
//     </div>
// )

const TestimonialCard = ({ quote, author, role, delay = 0 }:any) => (
    <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ y: -5, transition: { duration: 0.3 } }}
        className="p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-b from-[#0f1419]/80 to-[#0a0f16]/60 border border-white/5 hover:border-blue-500/30 transition-all duration-500 backdrop-blur-sm relative group overflow-hidden"
    >
        {/* Hover glow effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/0 group-hover:via-blue-500/50 to-transparent transition-all duration-500" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-full blur-3xl transition-all duration-500 pointer-events-none" />
        
        <div className="relative z-10">
            <div className="flex gap-0.5 sm:gap-1 text-blue-500 mb-4 sm:mb-6">
                {[1,2,3,4,5].map(s => (
                    <motion.div
                        key={s}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: delay + s * 0.05, duration: 0.3 }}
                        viewport={{ once: true }}
                    >
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                    </motion.div>
                ))}
            </div>
            <p className="text-zinc-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">"{quote}"</p>
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-900/50 to-blue-800/30 flex items-center justify-center text-blue-300 font-bold text-xs sm:text-sm border border-blue-500/20 group-hover:border-blue-400/40 transition-colors duration-300">
                    {author[0]}
                </div>
                <div>
                    <p className="text-white text-xs sm:text-sm font-bold">{author}</p>
                    <p className="text-zinc-500 text-[10px] sm:text-xs uppercase tracking-wide">{role}</p>
                </div>
            </div>
        </div>
    </motion.div>
)

const FAQItem = ({ q, a, index = 0 }:any) => {
    const [open, setOpen] = useState(false)
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="border-b border-white/5 group"
        >
            <button 
                className="w-full py-4 sm:py-5 md:py-6 text-left flex items-center justify-between text-zinc-300 hover:text-white transition-all duration-300" 
                onClick={() => setOpen(!open)}
            >
                <span className="font-medium text-base sm:text-lg pr-3 sm:pr-4">{q}</span>
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${open ? 'bg-blue-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}
                >
                    {open ? <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" /> : <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </motion.div>
            </button>
            <AnimatePresence mode="wait">
                {open && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                    >
                        <p className="pb-4 sm:pb-5 md:pb-6 text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-2xl">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// --- NEW SCROLL-BASED HOW IT WORKS SECTION ---

// --- 1. OPTIMIZED: High-Intensity Aurora Flare ---
const AuroraFlare = ({ opacity }:any) => {
    return (
        <motion.div 
            style={{ 
                opacity,
                willChange: "opacity",
                transform: "translate3d(0,0,0)"
            }}
            className="absolute bottom-0 left-0 right-0 h-[130vh] w-full pointer-events-none z-0 overflow-visible"
        >
            {/* Gradient Mask to fade top edge smoothly */}
            <div 
                className="absolute inset-0 w-full h-full"
                style={{
                    maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to top, black 40%, transparent 100%)",
                    willChange: "auto"
                }}
            >
                {/* 1. The Core Blaze - Reduced blur for performance */}
                <motion.div 
                    animate={{ scaleY: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ 
                        willChange: "transform, opacity", 
                        transform: "translate3d(0,0,0)",
                        backfaceVisibility: "hidden"
                    }}
                    className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[40%] h-[60%] bg-[#115ca3] blur-[60px] mix-blend-screen"
                />

                {/* 2. Wide Glow - Reduced blur */}
                <motion.div 
                    animate={{ scale: [1, 1.01, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    style={{ 
                        willChange: "transform, opacity", 
                        transform: "translate3d(0,0,0)",
                        backfaceVisibility: "hidden"
                    }}
                    className="absolute bottom-[-20%] left-[15%] right-[15%] h-[70%] bg-[#0f2dbf] blur-[70px] mix-blend-screen"
                />

                {/* 3. Rising Light Pillars - Simplified animation */}
                <motion.div 
                    animate={{ 
                        y: [0, -30, 0],
                        opacity: [0.4, 0.6, 0.4]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    style={{ 
                        willChange: "transform, opacity", 
                        transform: "translate3d(0,0,0)",
                        backfaceVisibility: "hidden"
                    }}
                    className="absolute bottom-[-10%] left-[30%] w-[40%] h-[90%] bg-gradient-to-t from-white via-blue-400 to-transparent blur-[40px] mix-blend-overlay"
                />
            </div>
        </motion.div>
    )
}


// --- 1. OPTIMIZED: Floating Particles Background Effect ---
const FloatingParticles = ({ opacity, color = "blue" }:any) => {
    // Reduced particle count from 8 to 4 for better performance
    const particles = useMemo(() => Array.from({ length: 4 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 3,
        duration: 10 + Math.random() * 4, // Slower animations
        size: 3 + Math.random() * 3,
    })), [])

    const colorClasses: Record<string, string> = {
        blue: "bg-blue-500",
        cyan: "bg-cyan-400",
        purple: "bg-purple-500",
        emerald: "bg-emerald-400"
    }

    return (
        <motion.div 
            style={{ 
                opacity,
                willChange: "opacity"
            }} 
            className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        >
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className={`absolute rounded-full ${colorClasses[color]}`}
                    style={{ 
                        left: particle.left, 
                        top: particle.top,
                        width: particle.size,
                        height: particle.size,
                        willChange: "transform, opacity",
                        transform: "translate3d(0,0,0)",
                        backfaceVisibility: "hidden"
                    }}
                    animate={{ 
                        y: [0, -25, 0],
                        x: [0, 10, 0],
                        opacity: [0.15, 0.5, 0.15],
                        scale: [1, 1.15, 1]
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </motion.div>
    )
}

// --- 2. ULTRA-OPTIMIZED: Professional Story Card with Icon ---
const StoryCard = ({ icon: Icon, iconColor, title, desc, style }:any) => {
    return (
        <motion.div 
            style={{ 
                y: style?.y,
                scale: style?.scale,
                opacity: style?.opacity,
                zIndex: style?.zIndex,
                willChange: "transform, opacity",
                backfaceVisibility: "hidden"
            }}
            className="absolute top-0 left-0 right-0 w-full max-w-xl mx-auto px-2 sm:px-4"
        >
            <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden group shadow-2xl">
                {/* Layered background for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] opacity-95" />
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                
                {/* Border and top highlight */}
                <div className="absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 group-hover:border-white/20 transition-colors duration-500" />
                <div className="absolute top-0 inset-x-8 sm:inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

                <div className="relative p-4 sm:p-6 md:p-8 flex flex-row items-center gap-3 sm:gap-4 md:gap-6 z-10 text-left">
                    {/* Icon container - removed expensive blur glow */}
                    <div className="shrink-0 relative">
                        <div className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:scale-105 transition-transform duration-500`}>
                            <Icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${iconColor.replace('bg-', 'text-').replace('/20', '')}`} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-200/50">{title}</span>
                        </h3>
                        <p className="text-blue-200/60 text-xs sm:text-sm md:text-base leading-relaxed font-medium">{desc}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// --- 3. ULTRA-OPTIMIZED: Main HowItWorks Component ---
const HowItWorksSection = () => {
    const targetRef = useRef(null)
    const shouldReduceMotion = useReducedMotion()
    
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"],
        layoutEffect: false // Disable layout effect for better performance
    })

    // --- ULTRA-OPTIMIZED SPRING - Minimal calculations for performance ---
    // Use direct scroll progress if reduced motion, otherwise use spring
    const smoothProgress = shouldReduceMotion 
        ? scrollYProgress 
        : useSpring(scrollYProgress, { 
            damping: 40, 
            stiffness: 150, 
            mass: 0.3,
            restDelta: 0.002 
        })

    // --- A. GLOBAL ANIMATIONS ---
    const flareOpacity = useTransform(smoothProgress, [0, 0.08], [0, 1])
    const headerOpacity = useTransform(smoothProgress, [0, 0.08, 0.12, 0.15], [0, 1, 1, 0])
    const headerY = useTransform(smoothProgress, [0, 0.08, 0.12, 0.15], [40, 0, 0, -40])
    const headerScale = useTransform(smoothProgress, [0, 0.08, 0.12, 0.15], [0.9, 1, 1, 0.95])

    // --- B. PARTICLE OPACITY TRIGGERS - Disabled for performance ---
    // Particles removed for better scroll performance
    const particles1Op = useTransform(smoothProgress, [0, 1], [0, 0])
    const particles2Op = useTransform(smoothProgress, [0, 1], [0, 0])
    const particles3Op = useTransform(smoothProgress, [0, 1], [0, 0])
    const particles4Op = useTransform(smoothProgress, [0, 1], [0, 0])

    // --- C. SEQUENTIAL CARD LOGIC - Restored vh units for centered positioning ---

    // CARD 1: The Old Way
    const c1Op = useTransform(smoothProgress, [0.08, 0.15, 0.25, 0.32], [0, 1, 1, 0]) 
    const c1Y = useTransform(smoothProgress, [0.08, 0.15, 0.25, 0.32], ["30vh", "0vh", "0vh", "-30vh"]) 
    const c1Scale = useTransform(smoothProgress, [0.08, 0.15, 0.25, 0.32], [0.85, 1, 1, 0.85]) 

    // CARD 2: The Problem
    const c2Op = useTransform(smoothProgress, [0.28, 0.35, 0.45, 0.52], [0, 1, 1, 0])
    const c2Y = useTransform(smoothProgress, [0.28, 0.35, 0.45, 0.52], ["30vh", "0vh", "0vh", "-30vh"]) 
    const c2Scale = useTransform(smoothProgress, [0.28, 0.35, 0.45, 0.52], [0.85, 1, 1, 0.85])

    // CARD 3: The Outlrn Way
    const c3Op = useTransform(smoothProgress, [0.48, 0.55, 0.65, 0.72], [0, 1, 1, 0])
    const c3Y = useTransform(smoothProgress, [0.48, 0.55, 0.65, 0.72], ["30vh", "0vh", "0vh", "-30vh"]) 
    const c3Scale = useTransform(smoothProgress, [0.48, 0.55, 0.65, 0.72], [0.85, 1, 1, 0.85])
    
    // CARD 4: True Understanding
    const c4Op = useTransform(smoothProgress, [0.68, 0.75, 0.95], [0, 1, 1])
    const c4Y = useTransform(smoothProgress, [0.68, 0.75, 0.95], ["30vh", "0vh", "0vh"])
    const c4Scale = useTransform(smoothProgress, [0.68, 0.75, 0.95], [0.85, 1, 1])

    return (
        <section ref={targetRef} id="how-it-works" className="relative h-[400vh] bg-[#0b0f14]">
            {/* Sticky Viewport - Optimized with CSS containment */}
            <div 
                className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center"
                style={{ 
                    willChange: "transform",
                    contain: "layout style paint",
                    transform: "translateZ(0)"
                }}
            >
                
                {/* 1. Simplified Background - Minimal Aurora for performance */}
                {!shouldReduceMotion && (
                    <motion.div 
                        style={{ 
                            opacity: flareOpacity, 
                            transformOrigin: "bottom center", 
                            willChange: "opacity",
                            transform: "translate3d(0,0,0)"
                        }}
                        className="absolute inset-0 z-0 flex items-end justify-center pointer-events-none"
                    >
                        {/* Simplified single glow instead of complex AuroraFlare */}
                        <div 
                            className="absolute bottom-0 left-1/2 w-[60%] h-[50%] bg-[#115ca3] blur-[60px] mix-blend-screen opacity-30"
                            style={{ 
                                transform: "translate3d(-50%, 0, 0)",
                                willChange: "opacity"
                            }}
                        />
                    </motion.div>
                )}

                {/* --- Particles Disabled for Performance --- */}

                {/* --- Ultra-Smooth Bottom Gradient --- */}
                <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-[#0b0f14] via-[#0b0f14]/80 to-transparent z-10 pointer-events-none" />

                {/* 2. Content Layer */}
                <div className="container mx-auto max-w-4xl relative z-10 px-6 h-full flex flex-col items-center justify-center">
                    
                    {/* Header with optimized animations */}
                    <motion.div 
                        style={{ 
                            opacity: headerOpacity, 
                            y: headerY, 
                            scale: headerScale, 
                            willChange: "transform, opacity",
                            backfaceVisibility: "hidden",
                            transform: "translateZ(0)"
                        }}
                        className="text-center absolute top-[15%] w-full z-20"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-zinc-300 mb-6">
                            <MonitorPlay className="w-4 h-4" />
                            The Problem with Video Courses
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white drop-shadow-2xl px-2">
                            Why Video Learning <br className="hidden sm:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">Doesn't Work</span>
                        </h2>
                        {!shouldReduceMotion && (
                            <motion.div
                                animate={{ y: [0, 6, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                className="flex items-center justify-center gap-2 text-blue-100/70 text-lg mt-4"
                                style={{ willChange: "transform", transform: "translateZ(0)" }}
                            >
                                <span>Scroll to discover</span>
                                <ArrowRight className="w-4 h-4 rotate-90" />
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Cards Container - Ultra-optimized with GPU acceleration */}
                    <div 
                        className="absolute top-1/2 left-1/2 w-full max-w-xl flex items-center justify-center" 
                        style={{ 
                            willChange: "transform",
                            transform: "translate3d(-50%, -50%, 0)",
                            backfaceVisibility: "hidden"
                        }}
                    >
                        
                        <StoryCard 
                            style={{ 
                                y: c1Y,
                                scale: c1Scale,
                                opacity: c1Op, 
                                zIndex: 10 
                            }}
                            icon={MonitorPlay}
                            iconColor="bg-red-500/20"
                            title="The Old Way: Video Courses"
                            desc="Watching hours of videos. Pausing, rewinding, hoping something sticks."
                        />

                        <StoryCard 
                            style={{ 
                                y: c2Y,
                                scale: c2Scale,
                                opacity: c2Op, 
                                zIndex: 20 
                            }}
                            icon={HelpCircle}
                            iconColor="bg-amber-500/20"
                            title="The Problem"
                            desc="You can't ask questions. The explanations don't fit how you think. You're lost and alone."
                        />

                        <StoryCard 
                            style={{ 
                                y: c3Y,
                                scale: c3Scale,
                                opacity: c3Op, 
                                zIndex: 30 
                            }}
                            icon={Sparkles}
                            iconColor="bg-blue-500/20"
                            title="The Outlrn Way"
                            desc="Type any topic. A live AI avatar teaches you with visuals, diagrams, and code. Ask follow-ups anytime."
                        />

                        <StoryCard 
                            style={{ 
                                y: c4Y,
                                scale: c4Scale,
                                opacity: c4Op, 
                                zIndex: 40 
                            }}
                            icon={TrendingUp}
                            iconColor="bg-emerald-500/20"
                            title="True Understanding"
                            desc="No more guessing. Concepts explained in a way that finally makes sense — personalized to you."
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
export default function LandingPage() {
    const shouldReduceMotion = useReducedMotion()
    
    return (
        <div 
            className="min-h-screen bg-[#0b0f15] text-white selection:bg-blue-500/30 relative font-['Space_Grotesk']"
            style={{ 
                willChange: "auto",
                transform: "translateZ(0)"
            }}
        >
            <GlobalStyles />
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section 
                className="relative pt-20 md:pt-24 pb-20 md:pb-32 px-4 sm:px-6 flex flex-col items-center text-center z-10 max-w-[100vw] overflow-hidden min-h-screen"
                style={{ contain: "layout style paint" }}
            >
                {/* Base Background Image */}
                <div 
                    className="absolute inset-0 w-full h-full opacity-10 z-0"
                    style={{
                        backgroundImage: 'url(/images/bg.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
                
                {/* Gradient Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f15]/60 via-[#0b0f15]/40 to-[#0b0f15]/60 z-[1]" />

                {/* Interconnected Background Images - Lower Half in Boat Shape */}
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-[2]">
                    {/* SVG Container for Web-like Boat Shape Connections */}
                    {!shouldReduceMotion && (
                        <svg 
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ willChange: "auto" }}
                        >
                            <defs>
                                <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                                    <stop offset="50%" stopColor="rgba(59, 130, 246, 0.6)" />
                                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0.4)" />
                                </linearGradient>
                                <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                                    <stop offset="50%" stopColor="rgba(59, 130, 246, 0.5)" />
                                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
                                </linearGradient>
                            </defs>
                            
                            {/* Boat-shaped web connections */}
                            {/* Top horizontal line (wider - boat top) */}
                            <motion.line
                                x1="20%"
                                y1="75%"
                                x2="80%"
                                y2="75%"
                                stroke="url(#lineGrad1)"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                                animate={{ opacity: [0.4, 0.6, 0.4] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />
                            
                            {/* Bottom horizontal line (narrower - boat bottom) */}
                            <motion.line
                                x1="35%"
                                y1="88%"
                                x2="65%"
                                y2="88%"
                                stroke="url(#lineGrad1)"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                                animate={{ opacity: [0.4, 0.6, 0.4] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            />
                            
                            {/* Left side connection (im1 to im3) */}
                            <motion.line
                                x1="20%"
                                y1="75%"
                                x2="35%"
                                y2="88%"
                                stroke="url(#lineGrad2)"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                                animate={{ opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            />
                            
                            {/* Right side connection (im2 to im4) */}
                            <motion.line
                                x1="80%"
                                y1="75%"
                                x2="65%"
                                y2="88%"
                                stroke="url(#lineGrad2)"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                                animate={{ opacity: [0.3, 0.5, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                            />
                            
                            {/* Diagonal connections for web effect */}
                            {/* Top-left to bottom-left */}
                            <motion.line
                                x1="20%"
                                y1="75%"
                                x2="35%"
                                y2="88%"
                                stroke="url(#lineGrad2)"
                                strokeWidth="0.5"
                                strokeDasharray="2 2"
                                opacity="0.2"
                            />
                            
                            {/* Top-right to bottom-right */}
                            <motion.line
                                x1="80%"
                                y1="75%"
                                x2="65%"
                                y2="88%"
                                stroke="url(#lineGrad2)"
                                strokeWidth="0.5"
                                strokeDasharray="2 2"
                                opacity="0.2"
                            />
                            
                            {/* Cross connection (im1 to im4) */}
                            <motion.line
                                x1="20%"
                                y1="75%"
                                x2="65%"
                                y2="88%"
                                stroke="url(#lineGrad2)"
                                strokeWidth="0.5"
                                strokeDasharray="2 2"
                                animate={{ opacity: [0.2, 0.35, 0.2] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            />
                            
                            {/* Cross connection (im2 to im3) */}
                            <motion.line
                                x1="80%"
                                y1="75%"
                                x2="35%"
                                y2="88%"
                                stroke="url(#lineGrad2)"
                                strokeWidth="0.5"
                                strokeDasharray="2 2"
                                animate={{ opacity: [0.2, 0.35, 0.2] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                            />
                        </svg>
                    )}

                    {/* Image 1 - Top Left (Below Get Started Button) */}
                    <motion.div
                        initial={{ opacity: 1, scale: 0.8, x: -50, y: 50 }}
                        animate={!shouldReduceMotion ? { 
                            scale: [1, 1.03, 1],
                            x: [0, 8, 0],
                            y: [0, -8, 0]
                        } : {}}
                        transition={{ 
                            duration: 8, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 0
                        }}
                        className="absolute top-[70%] left-[15%] md:left-[18%]"
                        style={{ willChange: "transform", opacity: 1 }}
                    >
                        <img 
                            src="/images/im1.png" 
                            alt="" 
                            className="w-32 md:w-40 lg:w-48 h-auto object-contain"
                            loading="eager"
                            style={{ 
                                filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))',
                                opacity: 1
                            }}
                        />
                    </motion.div>

                    {/* Image 2 - Top Right (Below Get Started Button) */}
                    <motion.div
                        initial={{ opacity: 1, scale: 0.8, x: 50, y: 50 }}
                        animate={!shouldReduceMotion ? { 
                            scale: [1, 1.03, 1],
                            x: [0, -8, 0],
                            y: [0, -8, 0]
                        } : {}}
                        transition={{ 
                            duration: 8, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 2
                        }}
                        className="absolute top-[70%] right-[15%] md:right-[18%]"
                        style={{ willChange: "transform", opacity: 1 }}
                    >
                        <img 
                            src="/images/im2.png" 
                            alt="" 
                            className="w-32 md:w-40 lg:w-48 h-auto object-contain"
                            loading="eager"
                            style={{ 
                                filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))',
                                opacity: 1
                            }}
                        />
                    </motion.div>

                    {/* Image 3 - Bottom Left (Below Get Started Button) */}
                    <motion.div
                        initial={{ opacity: 1, scale: 0.8, x: -50, y: 50 }}
                        animate={!shouldReduceMotion ? { 
                            scale: [1, 1.03, 1],
                            x: [0, 8, 0],
                            y: [0, 8, 0]
                        } : {}}
                        transition={{ 
                            duration: 8, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 4
                        }}
                        className="absolute bottom-[10%] left-[30%] md:left-[32%]"
                        style={{ willChange: "transform", opacity: 1 }}
                    >
                        <img 
                            src="/images/im3.png" 
                            alt="" 
                            className="w-32 md:w-40 lg:w-48 h-auto object-contain"
                            loading="eager"
                            style={{ 
                                filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))',
                                opacity: 1
                            }}
                        />
                    </motion.div>

                    {/* Image 4 - Bottom Right (Below Get Started Button) */}
                    <motion.div
                        initial={{ opacity: 1, scale: 0.8, x: 50, y: 50 }}
                        animate={!shouldReduceMotion ? { 
                            scale: [1, 1.03, 1],
                            x: [0, -8, 0],
                            y: [0, 8, 0]
                        } : {}}
                        transition={{ 
                            duration: 8, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: 6
                        }}
                        className="absolute bottom-[10%] right-[30%] md:right-[32%]"
                        style={{ willChange: "transform", opacity: 1 }}
                    >
                        <img 
                            src="/images/im4.png" 
                            alt="" 
                            className="w-32 md:w-40 lg:w-48 h-auto object-contain"
                            loading="eager"
                            style={{ 
                                filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))',
                                opacity: 1
                            }}
                        />
                    </motion.div>
                </div>

                {!shouldReduceMotion && (
                    <>
                        <Aurora 
                          colorStops={["#0029FF", "#2E9AFF", "#0055FF"]} 
                          blend={0.4} 
                          amplitude={1.0} 
                          speed={1.0} 
                        />
                        <ConnectorLines />
                    </>
                )}
                
                {/* Animated Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative z-30 mb-8"
                    style={{ willChange: "transform, opacity" }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-zinc-300">
                        {!shouldReduceMotion && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ willChange: "transform" }}
                                className="w-2 h-2 rounded-full bg-emerald-400"
                            />
                        )}
                        Now in Beta
                    </div>
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-medium tracking-tight leading-[1.1] mb-4 md:mb-6 max-w-5xl text-white relative z-30 px-2"
                >
                    Learn by having a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300">conversation</span>
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="text-base sm:text-lg md:text-xl leading-6 sm:leading-7 text-zinc-300 max-w-2xl mb-6 md:mb-10 font-normal relative z-30 px-4"
                >
                    An interactive AI avatar that teaches Computer Science and Web Development using visuals, diagrams, and code.
                </motion.p>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-20 md:mb-32 relative z-30 w-full px-4"
                >
                    <motion.button 
                        onClick={()=>window.location.href = '/auth'} 
                        whileHover={{ scale: 1.02, boxShadow: "0 0 40px -5px rgba(37,99,235,0.7)" }}
                        whileTap={{ scale: 0.98 }}
                        className="h-12 sm:h-14 hover:cursor-pointer px-6 sm:px-8 rounded-xl bg-gradient-to-b from-[#1d4ed8] to-[#1e40af] text-white font-bold text-sm sm:text-base shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] border border-blue-400/30 transition-all flex items-center gap-2 group w-full sm:w-auto"
                    >
                        Get Started 
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        className="h-12 sm:h-14 px-6 sm:px-8 rounded-full bg-transparent border border-white/20 text-white hover:border-white/40 transition-all font-bold text-sm sm:text-base flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <Terminal className="w-4 h-4 text-zinc-400" /> <span className="hidden sm:inline">Explore Learning Goals</span><span className="sm:hidden">Explore Goals</span>
                    </motion.button>
                </motion.div>  
            </section>

            {/* --- TRUSTED BY --- */}
            <TrustedBy />

            {/* --- HOW IT WORKS (REPLACED WITH STICKY SCROLL) --- */}
            <HowItWorksSection />
<div className="h-28 bg-[#0b0f15]"></div>
            <HowToUseSection />

            {/* --- FEATURES --- */}
            {/* <section id="features" className="py-32 px-6 relative z-10 bg-[#0b0f14]">
                <div className="container mx-auto max-w-7xl">
                    <div className="mb-20 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Agents and Features</h2>
                    </div>
                   <div className="grid md:grid-cols-4 gap-6">

    <FeatureItem 
        imageUrl={"/images/code.png"} 
        title="AI Code Reviewer Agent" 
        desc="Automatically reviews your code, points out issues, suggests fixes, and even merges your PRs when the quality meets industry standards." 
    />

    <FeatureItem 
        imageUrl={"/images/image.png"} 
        title="AI Teacher Agent" 
        desc="Breaks down any task you’re working on and teaches it step-by-step with examples, explanations, and guided implementation." 
    />

    <FeatureItem 
        imageUrl={"/images/code.png"} 
        title="Personalized Learning Engine" 
        desc="Builds a custom learning path based on your goals, current level, strengths, and areas where you need improvement." 
    />

    <FeatureItem 
        imageUrl={"/images/image.png"} 
        title="Context-Aware Teaching" 
        desc="The AI adapts your learning to the project's context — teaching you exactly what’s needed for that environment, stack, and task." 
    />

    
</div>

                </div>
            </section> */}

           <ComparisonSection />

            {/* --- PRICING SECTION --- */}
            <PricingSection />

            {/* --- QUICKSTART SECTION --- */}
            <QuickstartSection />

            {/* --- TESTIMONIALS --- */}
            <section className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 relative z-10 bg-[#0b0f14] overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute top-1/2 left-1/4 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-blue-900/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 w-[250px] sm:w-[300px] md:w-[400px] h-[250px] sm:h-[300px] md:h-[400px] bg-purple-900/5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="container mx-auto max-w-7xl relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12 sm:mb-16 md:mb-20"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-4 sm:mb-6"
                        >
                            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-blue-400" />
                            Testimonials
                        </motion.div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold px-2">Loved by ambitious developers</h2>
                    </motion.div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        <TestimonialCard 
                            quote="Outlrn taught me React in 2 weeks — because it only made me learn what I actually needed. No fluff, just code."
                            author="Sarah Jenkins"
                            role="Frontend Developer"
                            delay={0}
                        />
                        <TestimonialCard 
                            quote="The AI explains concepts better than YouTube videos I've watched for hours. It feels like a senior dev is sitting next to me."
                            author="David Chen"
                            role="CS Student"
                            delay={0.15}
                        />
                        <TestimonialCard 
                            quote="I finally understand backend architecture. This is honestly the future of learning. I landed my first internship last week!"
                            author="Marcus Johnson"
                            role="Fullstack Aspirant"
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* --- FAQ --- */}
            <section id="faq" className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 relative z-10 bg-[#0b0f14]">
                <div className="container mx-auto max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-10 sm:mb-12 md:mb-16"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-4 sm:mb-6"
                        >
                            <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            FAQ
                        </motion.div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold px-2">Frequently Asked Questions</h2>
                    </motion.div>
                    <div className="flex flex-col gap-2 rounded-xl sm:rounded-2xl bg-[#0a0f16]/50 border border-white/5 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
                        <FAQItem index={0} q="Is this a video course?" a="No. Outlrn is not video-based. You interact with a live AI avatar that teaches concepts in real time and adapts based on your questions." />
                        <FAQItem index={1} q="What can I learn on Outlrn?" a="Outlrn is focused on computer science and web development concepts including programming, data structures, frontend, backend, and system fundamentals." />
                        <FAQItem index={2} q="Can I ask follow-up questions?" a="Yes. You can ask follow-up questions, request another example, or give your own code and ask the avatar to explain it." />
                        <FAQItem index={3} q="Do I need to know coding basics?" a="It helps, but isn't strictly necessary. The AI avatar adapts to your level and can explain concepts from fundamentals to advanced topics." />
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="py-24 sm:py-32 md:py-40 px-4 sm:px-6 relative z-10 text-center bg-[#0b0f14] overflow-hidden">
                 <Aurora 
                  colorStops={["#0029FF", "#2E9AFF", "#0055FF"]} 
                  blend={0.8} 
                  amplitude={1.2} 
                  speed={1.2}
                />
                 
                 <motion.div 
                     initial={{ opacity: 0, y: 40 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.8 }}
                     className="container mx-auto max-w-4xl relative z-20"
                 >
                     <motion.div
                         initial={{ opacity: 0, scale: 0.9 }}
                         whileInView={{ opacity: 1, scale: 1 }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.5 }}
                         className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-300 mb-6 sm:mb-8"
                     >
                         <Rocket className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                         <span className="hidden sm:inline">Ready to Transform Your Learning?</span>
                         <span className="sm:hidden">Ready to Start?</span>
                     </motion.div>
                     
                     <motion.h2 
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.6, delay: 0.1 }}
                         className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 tracking-tight text-white px-2"
                     >
                         Stop watching videos. <br className="hidden sm:block"/> 
                         <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400">
                             Start learning interactively.
                         </span>
                     </motion.h2>
                     
                     <motion.p 
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.6, delay: 0.2 }}
                         className="text-base sm:text-lg md:text-xl text-zinc-400 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4"
                     >
                         Type any CS or Web Dev topic and learn from a live AI avatar that adapts to you in real time.
                     </motion.p>
                     
                     <motion.div 
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.6, delay: 0.3 }}
                         className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 w-full px-4"
                     >
                        <motion.button 
                            whileHover={{ scale: 1.03, boxShadow: "0 0 50px -5px rgba(37,99,235,0.7)" }}
                            whileTap={{ scale: 0.98 }}
                            className="h-12 sm:h-14 px-6 sm:px-8 md:px-10 rounded-lg sm:rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold text-sm sm:text-base md:text-lg shadow-[0_0_40px_-5px_rgba(37,99,235,0.5)] transition-all border border-blue-400/20 flex items-center gap-2 group w-full sm:w-auto"
                        >
                            Start Learning Now 
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            className="h-12 sm:h-14 px-6 sm:px-8 md:px-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white font-medium transition-all text-sm sm:text-base md:text-lg backdrop-blur-sm w-full sm:w-auto"
                        >
                            Try It Free
                        </motion.button>
                     </motion.div>
                 </motion.div>
            </section>


            <footer className="relative bg-[#0b0f14] pt-20 pb-10 overflow-hidden border-t border-white/5">
      
      {/* 1. Background Effects */}
      <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" 
      />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{ 
               backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', 
               backgroundSize: '48px 48px' 
           }} 
      />

      {/* Top Gradient Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10"
      >
        
        {/* 2. Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Branding Column (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-3">
             <Logo /> 
             <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400">
                v{packageJson.version}
             </span>
            </div>
            <p className="text-zinc-400 leading-relaxed max-w-sm text-sm">
             Interactive avatar-based learning for computer science and web development. Learn smarter, not harder.
            </p>
            
            {/* Socials */}
            <div className="flex items-center gap-3 mt-2">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <motion.a 
                    key={i} 
                    href="#" 
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20 transition-all duration-300"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns (Span 2 each) */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Product</h4>
            <ul className="flex flex-col gap-3">
              {['Features', 'Integrations', 'Pricing', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-zinc-400 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm inline-block">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Company</h4>
            <ul className="flex flex-col gap-3">
              {['About', 'Careers', 'FAQ', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-zinc-400 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm inline-block">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column (Span 4) */}
          <div className="lg:col-span-4">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Stay updated</h4>
            <p className="text-zinc-400 text-sm mb-6">
              Subscribe to our newsletter for the latest updates and features.
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-[#0f1621] border border-white/10 rounded-xl px-4 py-3.5 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-1.5 top-1.5 p-2.5 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-900/30"
              >
                <Send size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* 3. Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            © 2025 Outlrn. All rights reserved.
          </p>
          <div className="flex items-center gap-6 md:gap-8">
            <a href="#" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Terms of Service</a>
            <div className="flex items-center gap-2">
              <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
              />
              <span className="text-zinc-500 text-sm">All systems normal</span>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>

        </div>
    )
}