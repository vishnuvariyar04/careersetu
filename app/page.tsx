'use client'
import React, { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion"
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
    }
    
    html {
      scroll-behavior: smooth;
      scroll-padding-top: 100px;
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
// --- 6. NEW: Modern Comparison Component ---

const ComparisonRow = ({ feature, traditional, outlrn, delay }:any) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: delay, duration: 0.5 }}
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

const ComparisonSection = () => {
    // Animation variants for staggered entry
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
        }
    }

    return (
        <section className="py-32 px-6 relative z-10 bg-[#0b0f15]">
            
            {/* Background Glow with animation */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                viewport={{ once: true }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" 
            />

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="container mx-auto max-w-5xl relative z-10"
            >
                
                {/* Header with staggered animations */}
                <motion.div variants={itemVariants} className="text-center mb-20">
                    <motion.div 
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-6"
                    >
                        <BarChart className="w-3.5 h-3.5" />
                        VS Video Courses
                    </motion.div>
                    <motion.h2 
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Why choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Outlrn?</span>
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-zinc-400 text-lg">
                        Stop watching. Start learning interactively.
                    </motion.p>
                </motion.div>
                
                {/* Main Comparison Table Card */}
                <motion.div 
                    variants={itemVariants}
                    className="relative rounded-[2.5rem] bg-[#0c1117]/80 backdrop-blur-xl border border-white/10 p-8 md:p-12 shadow-2xl overflow-hidden hover:border-white/20 transition-colors duration-500"
                >
                    
                    {/* Top Gradient Highlight */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-60" />
                    
                    {/* Subtle inner glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
                    
                    {/* Grid Header */}
                    <motion.div 
                        variants={itemVariants}
                        className="grid grid-cols-3 gap-6 mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-white/10 pb-6"
                    >
                        <div>Feature</div>
                        <div>Traditional Courses</div>
                        <div className="text-blue-400 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            The Outlrn Way
                        </div>
                    </motion.div>

                    {/* Rows */}
                    <div className="flex flex-col">
                        <ComparisonRow 
                            feature="Learning Style" 
                            traditional="Watching long videos" 
                            outlrn="Live AI avatar teaching" 
                            delay={0.1}
                        />
                        <ComparisonRow 
                            feature="Interaction" 
                            traditional="Pause, rewind, guess" 
                            outlrn="Ask questions instantly" 
                            delay={0.15}
                        />
                        <ComparisonRow 
                            feature="Explanations" 
                            traditional="One-size-fits-all" 
                            outlrn="Personalized to you" 
                            delay={0.2}
                        />
                        <ComparisonRow 
                            feature="Visual Learning" 
                            traditional="Slides or none" 
                            outlrn="Diagrams, flowcharts, code" 
                            delay={0.25}
                        />
                        <ComparisonRow 
                            feature="Learning Speed" 
                            traditional="Slow and passive" 
                            outlrn="Fast and interactive" 
                            delay={0.3}
                        />
                    </div>

                </motion.div>
            </motion.div>
        </section>
    )
}
// --- 1. Logo Component ---
const Logo = () => (
  <img src="/images/outlrn-cropped.png" className="w-40" alt="Outlrn" />
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

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
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
                    stiffness: 300,
                    damping: 30
                }}
                style={{ 
                    position: "fixed", 
                    left: "50%", 
                    x: "-50%",
                    zIndex: 50,
                    backdropFilter: isScrolled ? "blur(20px) saturate(180%)" : "blur(0px)",
                    WebkitBackdropFilter: isScrolled ? "blur(20px) saturate(180%)" : "blur(0px)",
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
// --- 4. Premium Step Card with Glassmorphism ---
const StepCard = ({ step, tag, title, desc, color, imgUrl }:any) => (
    <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ willChange: "transform, opacity" }}
        className="group relative w-full max-w-[500px] mx-auto mb-24 last:mb-0"
    >
        
        {/* Card Structure: Two layers for the double-border effect */}
        
        {/* Layer 1: Outer Ring with gradient border */}
        <div className="relative rounded-[2.5rem] p-[1px] bg-gradient-to-b from-white/15 via-white/5 to-transparent hover:from-white/25 hover:via-white/10 transition-all duration-500">
            
            {/* Layer 2: Inner Dark Body with glassmorphism */}
            <div className="relative h-full rounded-[2.5rem] bg-gradient-to-b from-[#151a22] to-[#0f141a] overflow-hidden backdrop-blur-xl">
                
                {/* Top Gradient Highlight (The sharp colored line) */}
                <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${color} opacity-80 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Subtle inner glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                
                {/* Content Padding */}
                <div className="px-8 pt-10 pb-0 relative z-20">
                    
                    {/* Header: Tag with enhanced styling */}
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex items-center gap-3 mb-5"
                    >
                        <span className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                            {step}
                        </span>
                        <span className="text-blue-400 font-mono text-[11px] font-bold tracking-[0.15em] uppercase">
                            {tag}
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4 leading-tight tracking-tight">
                        {title}
                    </h3>

                    {/* Description */}
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mb-8">
                        {desc}
                    </p>
                </div>

                {/* Visual Area (Integrated Bottom Section) */}
                <div className="relative w-full h-[320px] flex items-end justify-center overflow-hidden">
                    
                    {/* Blue Radial Glow behind the image */}
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-600/30 rounded-full blur-[100px]" 
                    />
                    
                    {/* Tech Grid Pattern - more subtle */}
                    <div className="absolute inset-0 opacity-10" 
                         style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
                    />

                    {/* Image/Visual - Anchored to bottom with enhanced hover */}
                    <motion.img 
                        src={imgUrl}
                        alt={title}
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="relative z-10 w-[70%] object-contain object-bottom drop-shadow-2xl"
                    />
                    
                    {/* Fade to Black at bottom to merge with border */}
                    <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0f141a] via-[#0f141a]/80 to-transparent z-20" />
                </div>
            </div>
        </div>
    </motion.div>
)

// --- 5. How To Use Section with Premium Styling ---
const HowToUseSection = () => {
    
    // Gradient definitions for top borders
    const gradients = [
        "from-blue-500 via-cyan-400 to-transparent",
        "from-cyan-500 via-teal-400 to-transparent",
        "from-indigo-500 via-purple-400 to-transparent",
        "from-orange-500 via-amber-400 to-transparent",
        "from-emerald-500 via-green-400 to-transparent"
    ]

    return (
        <section id="features" className="relative bg-[#0b0f15] py-32 px-6">
            
            {/* --- FIXED FULL-WIDTH BACKGROUND (The Aurora) --- */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                 
                 {/* Sticky Window for the Flare */}
                 <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full scale-[1] opacity-80">
                        <AuroraFlare opacity={1} />
                    </div>
                 </div>

                 {/* --- BLEND MASKS (Top & Bottom) --- */}
                 <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#0b0f15] to-transparent z-10" />
                 <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-[#0b0f15] to-transparent z-10" />
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    
                    {/* --- LEFT COLUMN: STICKY HEADER --- */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="lg:w-5/12 lg:sticky lg:top-32 lg:h-fit py-10"
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-wider text-zinc-300 w-fit mb-8"
                        >
                            <Lightbulb className="w-3.5 h-3.5" />
                            How it works
                        </motion.div>
                        
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-6 leading-[1.1] tracking-tight">
                            How to use <br/> 
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                                Outlrn platform
                            </span>
                        </h2>
                        
                        <p className="text-lg text-zinc-400 leading-relaxed max-w-md mb-8">
                            Type any topic, get a live AI avatar that teaches with visuals, diagrams, and code — adapting to how you learn.
                        </p>

                        <motion.button 
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-medium hover:border-white/30 transition-all w-fit"
                        >
                            <span>See how it works</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </motion.div>

                    {/* --- RIGHT COLUMN: SCROLLING CARDS --- */}
                    <div className="lg:w-7/12 flex flex-col pt-10 pb-32 relative">
                        
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
// --- Aurora Component ---
const Aurora = ({ colorStops, blend, amplitude, speed }:any) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {colorStops.map((color:any, index:any) => (
        <motion.div
          key={index}
          className="absolute rounded-[100%] mix-blend-screen opacity-40 blur-[80px]"
          style={{
            backgroundColor: color,
            width: '60vw',
            height: '60vh',
            left: index === 0 ? '-10%' : index === 1 ? '30%' : '50%',
            bottom: '-20%',
            willChange: "transform, opacity"
          }}
          animate={{
            y: [0, -40 * amplitude, 0],
            x: [0, 20 * amplitude, 0],
            scale: [1, 1.2 * amplitude, 1],
            opacity: [0.3, 0.7 * blend, 0.3],
          }}
          transition={{
            duration: 10 / speed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 1.5,
          }}
        />
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0b0f14] via-[#0b0f14]/60 to-transparent" />
    </div>
  )
}

const ConnectorLines = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0 hidden lg:block">
        <defs>
            <linearGradient id="lineGradLeft" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="lineGradRight" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="transparent" />
            </linearGradient>
        </defs>
        <path d="M 50% 55% C 40% 55%, 25% 65%, 15% 30%" stroke="url(#lineGradLeft)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
        <path d="M 50% 55% C 40% 55%, 25% 65%, 20% 80%" stroke="url(#lineGradLeft)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
        <path d="M 50% 55% C 60% 55%, 75% 65%, 85% 30%" stroke="url(#lineGradRight)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
        <path d="M 50% 55% C 60% 55%, 75% 65%, 80% 80%" stroke="url(#lineGradRight)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
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
                className="container mx-auto px-6 text-center"
            >
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-[0.2em] mb-10">Trusted by innovative companies worldwide</p>
                
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
        className="p-8 rounded-[2rem] bg-gradient-to-b from-[#0f1419]/80 to-[#0a0f16]/60 border border-white/5 hover:border-blue-500/30 transition-all duration-500 backdrop-blur-sm relative group overflow-hidden"
    >
        {/* Hover glow effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/0 group-hover:via-blue-500/50 to-transparent transition-all duration-500" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-full blur-3xl transition-all duration-500 pointer-events-none" />
        
        <div className="relative z-10">
            <div className="flex gap-1 text-blue-500 mb-6">
                {[1,2,3,4,5].map(s => (
                    <motion.div
                        key={s}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: delay + s * 0.05, duration: 0.3 }}
                        viewport={{ once: true }}
                    >
                        <Star className="w-4 h-4 fill-current" />
                    </motion.div>
                ))}
            </div>
            <p className="text-zinc-300 mb-6 text-base leading-relaxed">"{quote}"</p>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900/50 to-blue-800/30 flex items-center justify-center text-blue-300 font-bold border border-blue-500/20 group-hover:border-blue-400/40 transition-colors duration-300">
                    {author[0]}
                </div>
                <div>
                    <p className="text-white text-sm font-bold">{author}</p>
                    <p className="text-zinc-500 text-xs uppercase tracking-wide">{role}</p>
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
                className="w-full py-6 text-left flex items-center justify-between text-zinc-300 hover:text-white transition-all duration-300" 
                onClick={() => setOpen(!open)}
            >
                <span className="font-medium text-lg pr-4">{q}</span>
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${open ? 'bg-blue-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}
                >
                    {open ? <Minus className="w-4 h-4 text-blue-400" /> : <Plus className="w-4 h-4" />}
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
                        <p className="pb-6 text-zinc-400 text-sm leading-relaxed max-w-2xl">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// --- NEW SCROLL-BASED HOW IT WORKS SECTION ---

// --- 1. NEW: High-Intensity Aurora Flare ---
const AuroraFlare = ({ opacity }:any) => {
    return (
        <motion.div 
            style={{ opacity }}
            className="absolute bottom-0 left-0 right-0 h-[130vh] w-full pointer-events-none z-0 overflow-visible"
        >
            {/* Gradient Mask to fade top edge smoothly */}
            <div 
                className="absolute inset-0 w-full h-full"
                style={{
                    maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to top, black 40%, transparent 100%)"
                }}
            >
                {/* 1. The Core Blaze */}
                <motion.div 
                    animate={{ scaleY: [1, 1.15, 1], opacity: [0.7, 0.9, 0.7] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    style={{ willChange: "transform, opacity", transform: "translate3d(0,0,0)" }}
                    className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[40%] h-[60%] bg-[#115ca3] blur-[80px] mix-blend-screen"
                />

                {/* 2. Wide Glow */}
                <motion.div 
                    animate={{ scale: [1, 1.02, 1], opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                    style={{ willChange: "transform, opacity", transform: "translate3d(0,0,0)" }}
                    className="absolute bottom-[-20%] left-[15%] right-[15%] h-[70%] bg-[#0f2dbf] blur-[100px] mix-blend-screen"
                />

                {/* 3. Rising Light Pillars */}
                <motion.div 
                    animate={{ 
                        y: [0, -40, 0],
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    style={{ willChange: "transform, opacity", transform: "translate3d(0,0,0)" }}
                    className="absolute bottom-[-10%] left-[30%] w-[40%] h-[90%] bg-gradient-to-t from-white via-blue-400 to-transparent blur-[50px] mix-blend-overlay"
                />
            </div>
        </motion.div>
    )
}


// --- 1. Floating Particles Background Effect ---
const FloatingParticles = ({ opacity, color = "blue" }:any) => {
    const particles = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 3,
        duration: 8 + Math.random() * 6,
        size: 2 + Math.random() * 4,
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
                display: useTransform(opacity, (v: any) => v > 0 ? "block" : "none")
            }} 
            className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        >
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className={`absolute rounded-full ${colorClasses[color]} blur-[1px]`}
                    style={{ 
                        left: particle.left, 
                        top: particle.top,
                        width: particle.size,
                        height: particle.size,
                        willChange: "transform, opacity"
                    }}
                    animate={{ 
                        y: [0, -30, 0],
                        x: [0, 15, 0],
                        opacity: [0.2, 0.6, 0.2],
                        scale: [1, 1.2, 1]
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

// --- 2. Professional Story Card with Icon ---
const StoryCard = ({ icon: Icon, iconColor, title, desc, style }:any) => (
    <motion.div 
        style={{ 
            ...style, 
            willChange: "transform, opacity",
            display: useTransform(style.opacity, (v: any) => v > 0 ? "block" : "none")
        }}
        className="absolute top-0 left-0 right-0 w-full max-w-xl mx-auto px-4"
    >
        <div className="relative rounded-[2rem] overflow-hidden group shadow-2xl">
            {/* Layered background for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] opacity-95" />
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            {/* Hover shimmer effect */}
            <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.5 }}
            />
            
            {/* Border and top highlight */}
            <div className="absolute inset-0 rounded-[2rem] border border-white/10 group-hover:border-white/20 transition-colors duration-500" />
            <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

            <div className="relative p-6 md:p-8 flex flex-row items-center gap-6 z-10 text-left">
                {/* Icon container with glow */}
                <div className="shrink-0 relative">
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 ${iconColor} rounded-full blur-[30px] opacity-40 group-hover:opacity-60 transition-opacity duration-500`} />
                    <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:scale-105 transition-transform duration-500`}>
                        <Icon className={`w-7 h-7 md:w-8 md:h-8 ${iconColor.replace('bg-', 'text-').replace('/20', '')}`} strokeWidth={1.5} />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold mb-2 tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-200/50">{title}</span>
                    </h3>
                    <p className="text-blue-200/60 text-sm md:text-base leading-relaxed font-medium">{desc}</p>
                </div>
            </div>
        </div>
    </motion.div>
)

// --- 3. Main HowItWorks Component ---
const HowItWorksSection = () => {
    const targetRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    })

    // --- SINGLE SPRING for ultra-smooth progress ---
    // Increased damping and mass for a more "weighted", buttery smooth cinematic feel
    const smoothProgress = useSpring(scrollYProgress, { 
        damping: 50, 
        stiffness: 70, 
        mass: 1,
        restDelta: 0.0001 
    })

    // --- A. GLOBAL ANIMATIONS ---
    const flareOpacity = useTransform(smoothProgress, [0, 0.08], [0, 1])
    const headerOpacity = useTransform(smoothProgress, [0, 0.08, 0.12, 0.15], [0, 1, 1, 0])
    const headerY = useTransform(smoothProgress, [0, 0.08, 0.12, 0.15], [40, 0, 0, -40])
    const headerScale = useTransform(smoothProgress, [0, 0.08, 0.12, 0.15], [0.9, 1, 1, 0.95])

    // --- B. PARTICLE OPACITY TRIGGERS ---
    const particles1Op = useTransform(smoothProgress, [0.08, 0.12, 0.25, 0.30], [0, 0.4, 0.4, 0])
    const particles2Op = useTransform(smoothProgress, [0.28, 0.32, 0.45, 0.50], [0, 0.4, 0.4, 0])
    const particles3Op = useTransform(smoothProgress, [0.48, 0.52, 0.65, 0.70], [0, 0.4, 0.4, 0])
    const particles4Op = useTransform(smoothProgress, [0.68, 0.72, 1.0], [0, 0.6, 0.6])

    // --- C. SEQUENTIAL CARD LOGIC with improved timing and no expensive blurs ---

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
        <section ref={targetRef} id="how-it-works" className="relative h-[500vh] bg-[#0b0f14]">
            {/* Sticky Viewport */}
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center">
                
                {/* 1. Aurora Flare Background */}
                <motion.div 
                    style={{ opacity: flareOpacity, transformOrigin: "bottom center", willChange: "opacity" }}
                    className="absolute inset-0 z-0 flex items-end justify-center pointer-events-none"
                >
                    <AuroraFlare />
                </motion.div>

                {/* --- Floating Particles --- */}
                <div className="absolute inset-0 z-[1] pointer-events-none">
                    <FloatingParticles color="purple" opacity={particles1Op} />
                    <FloatingParticles color="blue" opacity={particles2Op} />
                    <FloatingParticles color="cyan" opacity={particles3Op} />
                    <FloatingParticles color="emerald" opacity={particles4Op} />
                </div>

                {/* --- Ultra-Smooth Bottom Gradient --- */}
                <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-[#0b0f14] via-[#0b0f14]/80 to-transparent z-10 pointer-events-none" />

                {/* 2. Content Layer */}
                <div className="container mx-auto max-w-4xl relative z-10 px-6 h-full flex flex-col items-center justify-center">
                    
                    {/* Header with improved animations */}
                    <motion.div 
                        style={{ 
                            opacity: headerOpacity, 
                            y: headerY, 
                            scale: headerScale, 
                            willChange: "transform, opacity",
                            display: useTransform(headerOpacity, (v: any) => v > 0 ? "block" : "none")
                        }}
                        className="text-center absolute top-[15%] w-full z-20"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-zinc-300 mb-6">
                            <MonitorPlay className="w-4 h-4" />
                            The Problem with Video Courses
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-2xl">
                            Why Video Learning <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">Doesn't Work</span>
                        </h2>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="flex items-center justify-center gap-2 text-blue-100/70 text-lg mt-4"
                        >
                            <span>Scroll to discover</span>
                            <ArrowRight className="w-4 h-4 rotate-90" />
                        </motion.div>
                    </motion.div>

                    {/* Cards Container */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl flex items-center justify-center" style={{ willChange: "transform" }}>
                        
                        <StoryCard 
                            style={{ y: c1Y, opacity: c1Op, scale: c1Scale, zIndex: 10 }}
                            icon={MonitorPlay}
                            iconColor="bg-red-500/20"
                            title="The Old Way: Video Courses"
                            desc="Watching hours of videos. Pausing, rewinding, hoping something sticks."
                        />

                        <StoryCard 
                            style={{ y: c2Y, opacity: c2Op, scale: c2Scale, zIndex: 20 }}
                            icon={HelpCircle}
                            iconColor="bg-amber-500/20"
                            title="The Problem"
                            desc="You can't ask questions. The explanations don't fit how you think. You're lost and alone."
                        />

                        <StoryCard 
                            style={{ y: c3Y, opacity: c3Op, scale: c3Scale, zIndex: 30 }}
                            icon={Sparkles}
                            iconColor="bg-blue-500/20"
                            title="The Outlrn Way"
                            desc="Type any topic. A live AI avatar teaches you with visuals, diagrams, and code. Ask follow-ups anytime."
                        />

                        <StoryCard 
                            style={{ y: c4Y, opacity: c4Op, scale: c4Scale, zIndex: 40 }}
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
    return (
        <div className="min-h-screen bg-[#0b0f15] text-white selection:bg-blue-500/30 relative font-['Space_Grotesk']">
            <GlobalStyles />
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 md:pt-48 pb-32 px-6 flex flex-col items-center text-center z-10 max-w-[100vw] overflow-visible min-h-screen">
                <Aurora 
                  colorStops={["#0029FF", "#2E9AFF", "#0055FF"]} 
                  blend={0.8} 
                  amplitude={1.4} 
                  speed={1.2} 
                />
                <ConnectorLines />
                
                {/* Animated Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative z-20 mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-zinc-300 backdrop-blur-sm">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-emerald-400"
                        />
                        Now in Beta
                    </div>
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="text-5xl md:text-[80px] font-medium tracking-tight leading-[1.1] mb-6 max-w-5xl text-white relative z-20"
                >
                    Learn by having a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300">conversation</span>
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="text-lg md:text-xl leading-7 text-zinc-300 max-w-2xl mb-10 font-normal relative z-20"
                >
                    An interactive AI avatar that teaches Computer Science and Web Development using visuals, diagrams, and code.
                </motion.p>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center gap-5 mb-32 relative z-20"
                >
                    <motion.button 
                        onClick={()=>window.location.href = '/auth'} 
                        whileHover={{ scale: 1.02, boxShadow: "0 0 40px -5px rgba(37,99,235,0.7)" }}
                        whileTap={{ scale: 0.98 }}
                        className="h-14 hover:cursor-pointer px-8 rounded-xl bg-gradient-to-b from-[#1d4ed8] to-[#1e40af] text-white font-bold text-base shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] border border-blue-400/30 transition-all flex items-center gap-2 group"
                    >
                        Get Started 
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        className="h-14 px-8 rounded-full bg-transparent border border-white/20 text-white hover:border-white/40 transition-all font-bold text-base flex items-center gap-2"
                    >
                        <Terminal className="w-4 h-4 text-zinc-400" /> Explore Learning Goals
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

            {/* --- TESTIMONIALS --- */}
            <section className="py-32 px-6 relative z-10 bg-[#0b0f14] overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-purple-900/5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="container mx-auto max-w-7xl relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-20"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-6"
                        >
                            <Star className="w-3.5 h-3.5 fill-current text-blue-400" />
                            Testimonials
                        </motion.div>
                        <h2 className="text-3xl md:text-4xl font-bold">Loved by ambitious developers</h2>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-8">
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
            <section id="faq" className="py-32 px-6 relative z-10 bg-[#0b0f14]">
                <div className="container mx-auto max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-6"
                        >
                            <HelpCircle className="w-3.5 h-3.5" />
                            FAQ
                        </motion.div>
                        <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
                    </motion.div>
                    <div className="flex flex-col gap-2 rounded-2xl bg-[#0a0f16]/50 border border-white/5 p-6 md:p-8 backdrop-blur-sm">
                        <FAQItem index={0} q="Is this a video course?" a="No. Outlrn is not video-based. You interact with a live AI avatar that teaches concepts in real time and adapts based on your questions." />
                        <FAQItem index={1} q="What can I learn on Outlrn?" a="Outlrn is focused on computer science and web development concepts including programming, data structures, frontend, backend, and system fundamentals." />
                        <FAQItem index={2} q="Can I ask follow-up questions?" a="Yes. You can ask follow-up questions, request another example, or give your own code and ask the avatar to explain it." />
                        <FAQItem index={3} q="Do I need to know coding basics?" a="It helps, but isn't strictly necessary. The AI avatar adapts to your level and can explain concepts from fundamentals to advanced topics." />
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="py-40 px-6 relative z-10 text-center bg-[#0b0f14] overflow-hidden">
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
                         className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-zinc-300 mb-8"
                     >
                         <Rocket className="w-3.5 h-3.5" />
                         Ready to Transform Your Learning?
                     </motion.div>
                     
                     <motion.h2 
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.6, delay: 0.1 }}
                         className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight text-white"
                     >
                         Stop watching videos. <br/> 
                         <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400">
                             Start learning interactively.
                         </span>
                     </motion.h2>
                     
                     <motion.p 
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.6, delay: 0.2 }}
                         className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                     >
                         Type any CS or Web Dev topic and learn from a live AI avatar that adapts to you in real time.
                     </motion.p>
                     
                     <motion.div 
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.6, delay: 0.3 }}
                         className="flex flex-col sm:flex-row items-center justify-center gap-5"
                     >
                        <motion.button 
                            whileHover={{ scale: 1.03, boxShadow: "0 0 50px -5px rgba(37,99,235,0.7)" }}
                            whileTap={{ scale: 0.98 }}
                            className="h-14 px-10 rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold text-lg shadow-[0_0_40px_-5px_rgba(37,99,235,0.5)] transition-all border border-blue-400/20 flex items-center gap-2 group"
                        >
                            Start Learning Now 
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            className="h-14 px-10 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white font-medium transition-all text-lg backdrop-blur-sm"
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