'use client'
import { ArrowRight, Terminal } from "lucide-react"
import { Aurora } from "./aurora"
import { ConnectorLines } from "./connector-lines"

export const HeroSection = () => {
    return (
        <section className="relative pt-32 md:pt-48 pb-32 px-4 sm:px-6 flex flex-col items-center text-center z-10 max-w-[100vw] overflow-visible min-h-screen">
            <Aurora 
              colorStops={["#0029FF", "#2E9AFF", "#0055FF"]} 
              blend={0.8} 
              amplitude={1.4} 
              speed={1.2} 
            />
            <ConnectorLines />
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-medium tracking-tight leading-[1.1] mb-3 max-w-5xl text-white relative z-20">
                Personalized Learning that brings you outcome
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl leading-6 text-white max-w-2xl mb-8 font-normal relative z-20">
                Outlrn is an AI-powered, outcome-based learning platform that teaches you only the skills you need to grow
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 mb-32 relative z-20">
                <button 
                    onClick={() => window.location.href = '/auth'} 
                    className="h-12 sm:h-14 hover:cursor-pointer px-6 sm:px-8 rounded-xl bg-gradient-to-b from-[#111c96] to-[#1d4ed8] hover:from-[#3b82f6] hover:to-[#2563eb] text-white font-bold text-sm sm:text-base shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] border border-blue-400/20 transition-all active:scale-95 flex items-center gap-2"
                >
                    Get Started <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button className="h-12 sm:h-14 px-6 sm:px-8 rounded-full bg-transparent border border-white text-white hover:bg-white/5 transition-all font-bold text-sm sm:text-base flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-zinc-400" /> 
                    <span className="hidden sm:inline">Explore Learning Goals</span>
                    <span className="sm:hidden">Explore Goals</span>
                </button>
            </div>  
        </section>
    )
}



