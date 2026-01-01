'use client'
import { ArrowRight, Terminal } from "lucide-react"
import { Aurora } from "./aurora"
import { ConnectorLines } from "./connector-lines"

export const HeroSection = () => {
    return (
        <section className="relative pt-32 md:pt-48 pb-32 px-4 sm:px-6 flex flex-col items-center text-center z-10 max-w-[100vw] overflow-visible min-h-screen">
            {/* Background Aesthetics */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Grid Pattern - More subtle for dark feel */}
                <div 
                    className="absolute inset-0 opacity-[0.02]" 
                    style={{ 
                        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', 
                        backgroundSize: '80px 80px' 
                    }} 
                />
            </div>

            <Aurora 
              colorStops={["#0055FF", "#2E9AFF", "#60A5FA", "#3B82F6"]} 
              blend={1.2} 
              amplitude={1.8} 
              speed={0.8} 
            />
            <ConnectorLines />
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[100px] font-extrabold tracking-[-0.04em] leading-[0.95] mb-8 max-w-6xl text-white relative z-20">
                Learn by having a <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">conversation</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-zinc-400 max-w-3xl mb-12 font-medium relative z-20">
                A live AI avatar that teaches Computer Science and Web Development using visuals, diagrams, and code.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 mb-24 relative z-20">
                <button 
                    onClick={() => window.location.href = '/auth'} 
                    className="h-14 sm:h-16 hover:cursor-pointer px-10 sm:px-12 rounded-2xl bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black text-base sm:text-lg shadow-[0_0_50px_-10px_rgba(37,99,235,0.5)] border border-blue-400/20 transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-3 group"
                >
                    Start Learning Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </button>
                <button className="h-14 sm:h-16 px-10 sm:px-12 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all font-bold text-base sm:text-lg flex items-center gap-3 backdrop-blur-md">
                    <Terminal className="w-5 h-5 text-blue-400" /> 
                    <span>Explore Goals</span>
                </button>
            </div>  
        </section>
    )
}



