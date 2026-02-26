'use client'
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, HelpCircle } from "lucide-react"

interface FAQItemProps {
    q: string
    a: string
    index?: number
}

export const FAQItem = ({ q, a, index = 0 }: FAQItemProps) => {
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

export const FAQSection = () => {
    return (
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
                    <FAQItem index={0} q="Is CareerSetu a video course?" a="No. CareerSetu is project-based. You join virtual companies, work on real tasks with Kanban boards, and learn from AI Teacher & PM agents with live feedback and code reviews." />
                    <FAQItem index={1} q="What does CareerSetu offer?" a="CareerSetu offers virtual companies, real projects, task boards, AI code review, interactive learning with Teacher & PM agents, and career-focused training in CS and web development." />
                    <FAQItem index={2} q="Can I ask follow-up questions?" a="Yes. The AI agents adapt to your questions. You can request examples, submit your code for review, or ask for deeper explanations on any task." />
                    <FAQItem index={3} q="Do I need coding experience?" a="It helps, but isn't required. CareerSetu adapts to your level — from fundamentals to advanced topics — with task-based learning and personalized feedback." />
                </div>
            </div>
        </section>
    )
}



