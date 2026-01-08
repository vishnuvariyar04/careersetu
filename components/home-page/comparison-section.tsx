'use client'
import { motion, useReducedMotion } from "framer-motion"
import { X, Check, BarChart, Sparkles } from "lucide-react"

interface ComparisonRowProps {
    feature: string
    traditional: string
    outlrn: string
    delay: number
}

const ComparisonRow = ({ feature, traditional, outlrn, delay }: ComparisonRowProps) => {
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

export const ComparisonSection = () => {
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



