'use client'
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { TestimonialCard } from "./testimonial-carousel"
import { TestimonialCarousel } from "./testimonial-carousel"

export const TestimonialsSection = () => {
    return (
        <section className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 relative z-10 bg-[#0b0f14]">
            <div className="container mx-auto max-w-6xl">
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
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-blue-400" />
                        Testimonials
                    </motion.div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold px-2">Loved by CareerSetu learners</h2>
                </motion.div>
                
                {/* Grid View - Desktop */}
                <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <TestimonialCard 
                        quote="CareerSetu taught me React in 2 weeks — virtual projects and real tasks made me learn exactly what I needed. No fluff, just code."
                        author="Sarah Jenkins"
                        role="Frontend Developer"
                        delay={0}
                    />
                    <TestimonialCard 
                        quote="The CareerSetu AI Teacher explains concepts better than YouTube. Task boards and code reviews make it feel like a senior dev is pair-programming with me."
                        author="David Chen"
                        role="CS Student"
                        delay={0.15}
                    />
                    <TestimonialCard 
                        quote="CareerSetu's virtual companies gave me real project experience and PR feedback. I landed my first internship last week!"
                        author="Marcus Johnson"
                        role="Fullstack Aspirant"
                        delay={0.3}
                    />
                </div>
                
                {/* Carousel View - Mobile */}
                <TestimonialCarousel />
            </div>
        </section>
    )
}



