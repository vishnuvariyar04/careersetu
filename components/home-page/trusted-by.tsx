'use client'
import { motion } from "framer-motion"

export const TrustedBy = () => {
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



