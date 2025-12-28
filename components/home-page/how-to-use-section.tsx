'use client'
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Lightbulb } from "lucide-react"

interface StepCardProps {
    step: string
    tag: string
    title: string
    desc: string
    color: string
    imgUrl: string
}

const StepCard = ({ step, tag, title, desc, color, imgUrl }: StepCardProps) => {
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

export const HowToUseSection = () => {
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
        <section id="features" className="relative bg-[#0b0f15] py-20 sm:py-24 md:py-32 px-4 sm:px-6">
            {/* --- FIXED BLUE HIGHLIGHT - FIXED TO VIEWPORT --- */}
            {!shouldReduceMotion && (
                <div 
                    className="fixed top-1/2 left-1/2 w-[80vw] h-[60vh] bg-[#115ca3] blur-[80px] mix-blend-screen opacity-30 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                        zIndex: 0
                    }}
                />
            )}
            
            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 md:gap-16 items-start">
                    
                    {/* --- LEFT COLUMN: FIXED/STICKY HEADER --- */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5 }}
                        style={{ 
                            willChange: "transform, opacity",
                            backfaceVisibility: "hidden"
                        }}
                        className="w-full lg:w-5/12 lg:sticky lg:top-24 lg:self-start py-6 sm:py-10 relative z-10"
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
                    <div className="w-full lg:w-7/12 flex flex-col pt-6 sm:pt-10 pb-20 sm:pb-32 relative z-10" style={{ willChange: "auto" }}>
                        
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



