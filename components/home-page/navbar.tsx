'use client'
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Menu, X } from "lucide-react"
import packageJson from "../../package.json"

const Logo = () => (
  <img 
    src="/images/outlrn-cropped.png" 
    className="w-40" 
    alt="Outlrn"
    loading="eager"
    decoding="async"
    style={{ willChange: "auto" }}
  />
)

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

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const rafRef = useRef<number | null>(null)
    const lastScrollY = useRef(0)

    useEffect(() => {
        const handleScroll = () => {
            // Cancel previous RAF if it exists
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
            }
            
            // Use requestAnimationFrame for smooth, throttled updates
            rafRef.current = requestAnimationFrame(() => {
                const currentScrollY = window.scrollY
                // Only update if scroll position changed significantly (reduces re-renders)
                if (Math.abs(currentScrollY - lastScrollY.current) > 5) {
                    setIsScrolled(currentScrollY > 50)
                    lastScrollY.current = currentScrollY
                }
            })
        }
        
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => {
            window.removeEventListener("scroll", handleScroll)
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
            }
        }
    }, [])

    return (
        <>
            <motion.nav 
                initial={false}
                animate={isScrolled ? "scrolled" : "top"}
                variants={{
                    top: { 
                        width: "100%", 
                        borderRadius: "0px", 
                        backgroundColor: "rgba(11, 15, 20, 0)", 
                        borderColor: "rgba(255, 255, 255, 0)",
                        paddingTop: "1.5rem",
                        paddingBottom: "1.5rem"
                    },
                    scrolled: { 
                        width: "min(90%, 1200px)", 
                        borderRadius: "9999px", 
                        backgroundColor: "rgba(11, 15, 20, 0.75)",
                        borderColor: "rgba(255, 255, 255, 0.08)",
                        paddingTop: "0.75rem",
                        paddingBottom: "0.75rem"
                    }
                }}
                transition={{ 
                    type: "spring",
                    stiffness: 400,
                    damping: 40,
                    mass: 0.5
                }}
                className="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 border shadow-xl shadow-black/5"
                style={{ 
                    // Reduced blur for better performance
                    backdropFilter: isScrolled ? "blur(12px) saturate(150%)" : "blur(0px)",
                    WebkitBackdropFilter: isScrolled ? "blur(12px) saturate(150%)" : "blur(0px)",
                    willChange: "transform, backdrop-filter",
                    backfaceVisibility: "hidden"
                }}
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
                        transition={{ duration: 0.2 }}
                        style={{ willChange: "transform, opacity" }}
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
                            href={item === 'Pricing' ? '/pricing' : `#${item.toLowerCase().replace(/\s/g, '-')}`} 
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
                                    href={item === 'Pricing' ? '/pricing' : `#${item.toLowerCase().replace(/\s/g, '-')}`}
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



