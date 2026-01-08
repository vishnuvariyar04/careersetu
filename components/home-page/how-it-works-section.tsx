'use client'
import { useRef, useMemo } from "react"
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion"
import { ArrowRight, MonitorPlay, HelpCircle, Sparkles, TrendingUp } from "lucide-react"

interface StoryCardProps {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
    iconColor: string
    title: string
    desc: string
    style?: {
        y?: any
        scale?: any
        opacity?: any
        zIndex?: number
    }
}

const StoryCard = ({ icon: Icon, iconColor, title, desc, style }: StoryCardProps) => {
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

export const HowItWorksSection = () => {
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
                
                {/* 1. Simplified Background - Minimal Aurora for performance - STATIC POSITION */}
                {!shouldReduceMotion && (
                    <div 
                        className="fixed inset-0 z-0 flex items-end justify-center pointer-events-none"
                        style={{ 
                            willChange: "opacity",
                            transform: "translateZ(0)"
                        }}
                    >
                        {/* Simplified single glow - STATIC, only opacity changes */}
                        <motion.div 
                            style={{ 
                                opacity: flareOpacity,
                                transform: "translate3d(-50%, 0, 0)",
                                willChange: "opacity"
                            }}
                            className="absolute bottom-0 left-1/2 w-[60%] h-[50%] bg-[#115ca3] blur-[60px] mix-blend-screen"
                        />
                    </div>
                )}

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



