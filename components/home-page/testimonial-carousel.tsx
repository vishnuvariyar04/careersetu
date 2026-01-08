'use client'
import { useState, useEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Star } from "lucide-react"

interface TestimonialCardProps {
    quote: string
    author: string
    role: string
    delay?: number
}

export const TestimonialCard = ({ quote, author, role, delay = 0 }: TestimonialCardProps) => (
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

export const TestimonialCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const shouldReduceMotion = useReducedMotion()
    
    const testimonials = [
        {
            quote: "Outlrn taught me React in 2 weeks — because it only made me learn what I actually needed. No fluff, just code.",
            author: "Sarah Jenkins",
            role: "Frontend Developer"
        },
        {
            quote: "The AI explains concepts better than YouTube videos I've watched for hours. It feels like a senior dev is sitting next to me.",
            author: "David Chen",
            role: "CS Student"
        },
        {
            quote: "I finally understand backend architecture. This is honestly the future of learning. I landed my first internship last week!",
            author: "Marcus Johnson",
            role: "Fullstack Aspirant"
        }
    ]
    
    const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)

    useEffect(() => {
        const timer = setInterval(() => {
            next()
        }, 2000)
        return () => clearInterval(timer)
    }, [])
    
    return (
        <div className="sm:hidden relative w-full px-2">
            <div className="relative overflow-hidden rounded-[2rem] w-full max-w-[320px] mx-auto aspect-square border border-white/10 bg-[#0f1419]/80 backdrop-blur-md">
                <motion.div
                    className="flex h-full"
                    animate={{ x: `-${currentIndex * 100}%` }}
                    transition={shouldReduceMotion ? { duration: 0.2 } : { type: "spring", stiffness: 200, damping: 25 }}
                >
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="min-w-full h-full p-6 sm:p-8 flex flex-col justify-between relative group">
                            {/* Accent Glow */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                            
                            <div className="relative z-10">
                                <div className="flex gap-1 text-blue-500 mb-4">
                                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-current" />)}
                                </div>
                                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-medium line-clamp-6">
                                    "{testimonial.quote}"
                                </p>
                            </div>

                            <div className="flex items-center gap-3 relative z-10 pt-4 border-t border-white/5">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                                    {testimonial.author[0]}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-bold truncate">{testimonial.author}</p>
                                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest truncate">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Navigation Overlay */}
                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 z-20">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/20'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Side Arrows - Simplified */}
            <button onClick={prev} className="absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            <button onClick={next} className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    )
}



