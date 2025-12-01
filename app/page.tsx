'use client'
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion"
import { 
  ArrowRight, 
  Menu, 
  X,
  Code2, 
  Terminal, 
  Check,
  Brain,
  Target,
  Zap,
  BarChart,
  Rocket,
  MessageSquare,
  Clock,
  Plus,
  Minus,
  Star,
  GitBranch ,
  Twitter,
  Github,
  Linkedin,
  Send
} from "lucide-react"

// --- 0. Font & Global Styles ---
const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    
    body {
      font-family: 'Space Grotesk', sans-serif;
      background-color: #0b0f14; 
      color: white;
      overflow-x: hidden;
    }
    
    html {
      scroll-behavior: smooth;
    }
  `}</style>
)

// --- 1. Logo Component ---
const Logo = () => (
  <img src="/images/outlrn-cropped.png" className="w-28" alt="Outlrn" />
)

// --- 2. Custom Icons ---
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
// --- 3. UI Components ---

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <>
            <motion.nav 
                initial={false}
                animate={isScrolled ? "scrolled" : "top"}
                variants={{
                    top: { 
                        width: "100%", 
                        top: 0, 
                        borderRadius: "0px", 
                        backgroundColor: "rgba(11, 15, 20, 0)", 
                        borderColor: "rgba(255, 255, 255, 0)",
                        paddingTop: "1.5rem",
                        paddingBottom: "1.5rem"
                    },
                    scrolled: { 
                        width: "min(90%, 80%)", 
                        top: 24, 
                        borderRadius: "9999px", 
                        backgroundColor: "rgba(10, 15, 22, 0.7)", // Increased opacity slightly for better glass feel
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        paddingTop: "0.75rem",
                        paddingBottom: "0.75rem"
                    }
                }}
                // FIXED: Changed to 'tween' to prevent overshoot/bouncing
                transition={{ 
                    type: "tween", 
                    ease: "easeInOut", 
                    duration: 0.4 
                }}
                style={{ 
                    position: "fixed", 
                    left: "50%", 
                    x: "-50%", // Keeps it perfectly centered
                    zIndex: 50,
                    backdropFilter: isScrolled ? "blur(12px)" : "blur(0px)",
                }}
                className="flex items-center justify-between px-6 border"
            >
                {/* 1. Logo Section */}
                <div className="flex items-center gap-2 shrink-0">
                    <Logo />
                </div>

                {/* 2. Navigation Links (Desktop) - Centered */}
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    {['Features', 'How it Works', 'Pricing', 'Blog'].map(item => (
                        <a 
                            key={item} 
                            href={`#${item.toLowerCase().replace(/\s/g, '-')}`} 
                            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group whitespace-nowrap"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full" />
                        </a>
                    ))}
                </div>

                {/* 3. Right Actions */}
                <div className="hidden md:flex items-center gap-4 shrink-0">
                    {/* Social Proof Pill */}
                    {/* <motion.div 
                        animate={{ 
                            opacity: isScrolled ? 1 : 0, 
                            scale: isScrolled ? 1 : 0.8,
                            width: isScrolled ? "auto" : 0,
                            marginRight: isScrolled ? "8px" : 0
                        }}
                        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer overflow-hidden"
                    >
                        <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        <span className="whitespace-nowrap">12k</span>
                    </motion.div> */}

                    <button className="text-zinc-400 hover:text-white text-sm font-medium transition-colors whitespace-nowrap">
                        Sign In
                    </button>
                    
                    <button className="bg-[#0f172a] hover:bg-[#1e293b] border border-white/10 text-white px-5 py-2 rounded-full text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center gap-2 whitespace-nowrap">
                        Get Started <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden text-white ml-auto" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </motion.nav>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-[#0b0f14] pt-24 px-6 md:hidden">
                    <div className="flex flex-col gap-6 text-xl font-medium text-zinc-400">
                        {['Features', 'How it Works', 'Pricing', 'Blog'].map(item => (
                            <a key={item} href="#" onClick={() => setIsOpen(false)} className="hover:text-white">{item}</a>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}

// --- Aurora Component ---
const Aurora = ({ colorStops, blend, amplitude, speed }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {colorStops.map((color, index) => (
        <motion.div
          key={index}
          className="absolute rounded-[100%] mix-blend-screen opacity-40 blur-[80px]"
          style={{
            backgroundColor: color,
            width: '60vw',
            height: '60vh',
            left: index === 0 ? '-10%' : index === 1 ? '30%' : '50%',
            bottom: '-20%',
          }}
          animate={{
            y: [0, -40 * amplitude, 0],
            x: [0, 20 * amplitude, 0],
            scale: [1, 1.2 * amplitude, 1],
            opacity: [0.3, 0.7 * blend, 0.3],
          }}
          transition={{
            duration: 10 / speed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 1.5,
          }}
        />
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0b0f14] via-[#0b0f14]/60 to-transparent" />
    </div>
  )
}

const ConnectorLines = () => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0 hidden lg:block">
        <defs>
            <linearGradient id="lineGradLeft" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="lineGradRight" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="transparent" />
            </linearGradient>
        </defs>
        <path d="M 50% 55% C 40% 55%, 25% 65%, 15% 30%" stroke="url(#lineGradLeft)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
        <path d="M 50% 55% C 40% 55%, 25% 65%, 20% 80%" stroke="url(#lineGradLeft)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
        <path d="M 50% 55% C 60% 55%, 75% 65%, 85% 30%" stroke="url(#lineGradRight)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
        <path d="M 50% 55% C 60% 55%, 75% 65%, 80% 80%" stroke="url(#lineGradRight)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
    </svg>
)

// --- 3. UI Components ---

// ... (Other components)

const TrustedBy = () => {
    // Duplicate the list to ensure seamless scrolling
    
    const brands = [
        'Composio', 'ASU', 'Github', 'Cluely', 'Montra', 'Mixus', 
        'Google', 'Spotify', 'Amazon', 'Meta', 'Netflix'
    ];
    
    return (
        <section className="py-12 bg-[#0b0f14] relative z-20 overflow-hidden">
            
            {/* Inline styles for the scrolling animation */}
            <style jsx>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 80s linear infinite;
                }
                .fade-mask {
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
            `}</style>

            <div className="container mx-auto px-6 text-center">
                <p className="text-zinc-400 text-sm font-medium mb-12">Trusted by Companies and enterprises</p>
                
                {/* Scroll Container with Fade Mask */}
                <div className="relative w-full max-w-5xl mx-auto fade-mask overflow-hidden">
                    <div className="flex w-max animate-scroll gap-16 items-center">
                        {/* We render the list twice to create the infinite loop effect */}
                        {[...brands, ...brands].map((brand, i) => (
                            <div 
                                key={i} 
                                className="text-2xl font-bold text-white opacity-80 hover:opacity-100 transition-colors duration-300 cursor-default select-none flex items-center gap-2"
                            >
                              
                                <span>{brand}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
const FeatureItem = ({ imageUrl, title, desc, linkText = "Learn more" }) => (
    /* 1. Outer Bezel/Frame */
    <div className="group relative h-full rounded-[2.5rem] bg-gradient-to-b from-white/10 via-white/5 to-transparent p-[1px] hover:from-blue-500/30 hover:via-blue-500/10 hover:to-transparent transition-all duration-500">
        
        {/* 2. Main Card Body */}
        <div className="relative h-full flex flex-col bg-[#0b0f14] rounded-[2.5rem] overflow-hidden">
            
            {/* Background Noise/Texture (Kept subtle for texture) */}
            <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            
            {/* 3. Top Section: Pure Image Area */}
            {/* Removed: Glows, Hexagons, Inner Containers, Lines */}
            <div className="relative h-56 w-full overflow-hidden bg-[#171a1a]">
                <img 
                    src={imageUrl} 
                    alt={title} 
                    className="w-full h-full object-contain transform transition-transform duration-700 group-hover:scale-105" 
                />
                
                {/* Optional: Very subtle gradient at the bottom to blend image into the dark card body smoothly */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0b0f14] to-transparent" />
            </div>

            {/* 4. Bottom Section: Content */}
            <div className="relative flex flex-col flex-grow px-8 pb-8 pt-6">
                <h4 className="text-xl font-bold text-white mb-3 tracking-tight relative z-10">
                    {title}
                </h4>
                
                <p className="text-sm text-zinc-400 leading-relaxed mb-8 flex-grow relative z-10">
                    {desc}
                </p>

                {/* Link */}
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium cursor-pointer group/link hover:text-blue-300 transition-colors relative z-10">
                    <span>{linkText}</span>
                    <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                </div>
            </div>
        </div>
    </div>
)

const ComparisonRow = ({ feature, traditional, outlrn }) => (
    <div className="grid grid-cols-3 gap-4 py-5 border-b border-white/5 text-sm items-center">
        <div className="text-zinc-300 font-medium">{feature}</div>
        <div className="text-zinc-500 flex items-center gap-2"><X className="w-4 h-4 text-red-500/50" /> {traditional}</div>
        <div className="text-white flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> {outlrn}</div>
    </div>
)

const TestimonialCard = ({ quote, author, role }) => (
    <div className="p-8 rounded-[2rem] bg-[#0a0f16]/40 border border-white/5 hover:border-blue-500/20 transition-all backdrop-blur-sm relative">
        <div className="flex gap-1 text-blue-500 mb-6">
            {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
        </div>
        <p className="text-zinc-300 mb-6 text-base leading-relaxed">"{quote}"</p>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-300 font-bold border border-blue-500/20">
                {author[0]}
            </div>
            <div>
                <p className="text-white text-sm font-bold">{author}</p>
                <p className="text-zinc-500 text-xs uppercase tracking-wide">{role}</p>
            </div>
        </div>
    </div>
)

const FAQItem = ({ q, a }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className="border-b border-white/5">
            <button className="w-full py-6 text-left flex items-center justify-between text-zinc-300 hover:text-white transition-colors" onClick={() => setOpen(!open)}>
                <span className="font-medium text-lg">{q}</span>
                {open ? <Minus className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{height: 0, opacity: 0}} animate={{height: "auto", opacity: 1}} exit={{height: 0, opacity: 0}} className="overflow-hidden">
                        <p className="pb-6 text-zinc-400 text-sm leading-relaxed max-w-2xl">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// --- NEW SCROLL-BASED HOW IT WORKS SECTION ---

// --- 1. NEW: High-Intensity Aurora Flare ---
const AuroraFlare = ({ opacity }) => {
    return (
        <motion.div 
            style={{ opacity }}
            className="absolute bottom-0 left-0 right-0 h-[130vh] w-full pointer-events-none z-0 overflow-visible"
        >
            {/* Gradient Mask to fade top edge smoothly */}
            <div 
                className="absolute inset-0 w-full h-full"
                style={{
                    maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to top, black 40%, transparent 100%)"
                }}
            >
                {/* 1. The Core Blaze (Bright White/Blue center) */}
                <motion.div 
                    animate={{ scaleY: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[40%] h-[70%] bg-[#115ca3] blur-[150px] mix-blend-screen opacity-100"
                />

                {/* 2. Wide Cyan Glow (The halo) */}
                <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-20%] left-[10%] right-[10%] h-[80%] bg-[#0f2dbf] blur-[180px] mix-blend-screen opacity-60"
                />

                {/* 3. Rising Light Pillars (Vertical streaks) */}
                <motion.div 
                    animate={{ 
                        y: [0, -80, 0],
                        scaleX: [0.9, 1.1, 0.9],
                        opacity: [0.6, 0.9, 0.6]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] left-[30%] w-[40%] h-[100%] bg-gradient-to-t from-white via-blue-400 to-transparent blur-[80px] mix-blend-overlay"
                />
            </div>
        </motion.div>
    )
}


// --- 1. NEW: Blurred Emoji Rain Component ---
const EmojiRain = ({ emoji, opacity }) => {
    // Create a fixed set of raindrops with randomized properties
    const raindrops = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`, // Random horizontal position
        delay: Math.random() * 5, // Random start time
        duration: 5 + Math.random() * 10, // Random fall speed
        scale: 0.5 + Math.random() * 0.5, // Random size
    }))

    return (
        <motion.div 
            style={{ opacity }} 
            className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        >
            {raindrops.map((drop) => (
                <motion.div
                    key={drop.id}
                    className="absolute top-[-10%] text-7xl filter blur-[4px] opacity-60"
                    style={{ left: drop.left, scale: drop.scale }}
                    animate={{ y: ["0vh", "120vh"], rotate: [0, 360] }}
                    transition={{
                        duration: drop.duration,
                        delay: drop.delay,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    {emoji}
                </motion.div>
            ))}
        </motion.div>
    )
}

// --- 2. Compact Metallic Story Card (Kept the same) ---
const StoryCard = ({ emoji, title, desc, style }) => (
    <motion.div 
        style={style}
        className="absolute top-0 left-0 right-0 w-full max-w-xl mx-auto px-4 perspective-1000"
    >
        <div className="relative rounded-[2rem] overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] opacity-95" />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 rounded-[2rem] border border-white/10" />
            <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.5)]" />

            <div className="relative p-6 md:p-8 flex flex-row items-center gap-6 z-10 text-left">
                <div className="shrink-0 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-blue-500/20 rounded-full blur-[30px]" />
                    <div className="relative text-5xl md:text-6xl filter drop-shadow-lg">{emoji}</div>
                </div>
                <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2 tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-200/50">{title}</span>
                    </h3>
                    <p className="text-blue-200/60 text-sm md:text-base leading-relaxed font-medium">{desc}</p>
                </div>
            </div>
        </div>
    </motion.div>
)

// --- 3. Main HowItWorks Component ---
const HowItWorksSection = () => {
    const targetRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    })

    // --- SPRING PHYSICS ---
    const smoothConfig = { damping: 20, stiffness: 120, mass: 0.5 }
    const useSmoothTransform = (value, range, output) => useSpring(useTransform(value, range, output), smoothConfig)

    // --- A. GLOBAL ANIMATIONS ---
    const flareOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1])
    const headerOpacity = useTransform(scrollYProgress, [0.05, 0.10], [1, 0])
    const headerY = useSmoothTransform(scrollYProgress, [0.05, 0.10], [0, -100])

    // --- B. EMOJI RAIN TRIGGERS ---
    const rain1Op = useTransform(scrollYProgress, [0.12, 0.15, 0.20, 0.25], [0, 1, 1, 0])
    const rain2Op = useTransform(scrollYProgress, [0.32, 0.35, 0.40, 0.45], [0, 1, 1, 0])
    const rain3Op = useTransform(scrollYProgress, [0.52, 0.55, 0.60, 0.65], [0, 1, 1, 0])
    const rain4Op = useTransform(scrollYProgress, [0.72, 0.75, 1.0], [0, 1, 1])

    // --- C. SEQUENTIAL CARD LOGIC ---

    // CARD 1: Tutorial Hell
    const c1Op = useTransform(scrollYProgress, [0.10, 0.15, 0.25, 0.30], [0, 1, 1, 0.5]) 
    const c1Y = useSmoothTransform(scrollYProgress, [0.10, 0.15, 0.25, 0.30], ["20vh", "0vh", "0vh", "-40vh"]) 
    const c1Scale = useSmoothTransform(scrollYProgress, [0.10, 0.15, 0.25, 0.30], [0.9, 1, 1, 0.8]) 
    const c1Blur = useTransform(scrollYProgress, [0.25, 0.30], ["blur(0px)", "blur(4px)"])

    // CARD 2: Reality Check
    const c2Op = useTransform(scrollYProgress, [0.30, 0.35, 0.45, 0.50], [0, 1, 1, 0.5])
    const c2Y = useSmoothTransform(scrollYProgress, [0.30, 0.35, 0.45, 0.50], ["20vh", "0vh", "0vh", "-38vh"]) 
    const c2Scale = useSmoothTransform(scrollYProgress, [0.30, 0.35, 0.45, 0.50], [0.9, 1, 1, 0.85])
    const c2Blur = useTransform(scrollYProgress, [0.45, 0.50], ["blur(0px)", "blur(4px)"])

    // CARD 3: Outlrn Way
    const c3Op = useTransform(scrollYProgress, [0.50, 0.55, 0.65, 0.70], [0, 1, 1, 0.5])
    const c3Y = useSmoothTransform(scrollYProgress, [0.50, 0.55, 0.65, 0.70], ["20vh", "0vh", "0vh", "-36vh"]) 
    const c3Scale = useSmoothTransform(scrollYProgress, [0.50, 0.55, 0.65, 0.70], [0.9, 1, 1, 0.9])
    const c3Blur = useTransform(scrollYProgress, [0.65, 0.70], ["blur(0px)", "blur(4px)"])
    
    // CARD 4: Job Ready
    const c4Op = useTransform(scrollYProgress, [0.70, 0.75], [0, 1])
    const c4Y = useSmoothTransform(scrollYProgress, [0.70, 0.75], ["20vh", "0vh"])
    const c4Scale = useSmoothTransform(scrollYProgress, [0.70, 0.75], [0.9, 1])

    return (
        <section ref={targetRef} id="how-it-works" className="relative h-[450vh] bg-[#0b0f14]">
            {/* Sticky Viewport */}
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center">
                
                {/* 1. Aurora Flare Background */}
                <motion.div 
                    style={{ opacity: flareOpacity, transformOrigin: "bottom center" }}
                    className="absolute inset-0 z-0 flex items-end justify-center pointer-events-none"
                >
                    <AuroraFlare />
                </motion.div>

                {/* --- Emoji Rain Layers --- */}
                <div className="absolute inset-0 z-0">
                    <EmojiRain emoji="😩" opacity={rain1Op} />
                    <EmojiRain emoji="😵‍💫" opacity={rain2Op} />
                    <EmojiRain emoji="🤩" opacity={rain3Op} />
                    <EmojiRain emoji="🚀" opacity={rain4Op} />
                </div>

                {/* --- NEW: Ultra-Smooth Bottom Gradient (Takes up 50% of height for seamless blend) --- */}
                <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-[#0b0f14] via-[#0b0f14]/40 to-transparent z-10 pointer-events-none" />

                {/* 2. Content Layer */}
                <div className="container mx-auto max-w-4xl relative z-10 px-6 h-full flex flex-col items-center justify-center">
                    
                    {/* Header */}
                    <motion.div 
                        style={{ opacity: headerOpacity, y: headerY }}
                        className="text-center absolute top-[15%] w-full z-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-2xl">
                            The Journey to <br/> <span className="text-blue-300">Engineering Mastery</span>
                        </h2>
                        <p className="text-blue-100/70 text-lg animate-pulse mt-4">
                            Scroll to see the transformation &darr;
                        </p>
                    </motion.div>

                    {/* Cards Container */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl flex items-center justify-center">
                        
                        <StoryCard 
                            style={{ y: c1Y, opacity: c1Op, scale: c1Scale, filter: c1Blur, zIndex: 10 }}
                            emoji="😩"
                            title="The Old Way: Tutorial Hell"
                            desc="Watching endless videos. Copy-pasting code you don't understand."
                        />

                        <StoryCard 
                            style={{ y: c2Y, opacity: c2Op, scale: c2Scale, filter: c2Blur, zIndex: 20 }}
                            emoji="😵‍💫"
                            title="The Reality Check"
                            desc="You try to build something on your own, but you're stuck. Memorizing syntax isn't solving problems."
                        />

                        <StoryCard 
                            style={{ y: c3Y, opacity: c3Op, scale: c3Scale, filter: c3Blur, zIndex: 30 }}
                            emoji="🤩"
                            title="The Outlrn Way"
                            desc="Outcome-Based Learning. You pick a goal. AI builds your roadmap. You write code, get feedback."
                        />

                        <StoryCard 
                            style={{ y: c4Y, opacity: c4Op, scale: c4Scale, zIndex: 40 }}
                            emoji="🚀"
                            title="Job Ready"
                            desc="No more guessing. A portfolio of complex apps and the confidence of a Senior Engineer."
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0b0f14] text-white selection:bg-blue-500/30 relative font-['Space_Grotesk']">
            <GlobalStyles />
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 md:pt-48 pb-32 px-6 flex flex-col items-center text-center z-10 max-w-[100vw] overflow-visible min-h-screen">
                <Aurora 
                  colorStops={["#0029FF", "#2E9AFF", "#0055FF"]} 
                  blend={0.8} 
                  amplitude={1.4} 
                  speed={1.2} 
                />
                <ConnectorLines />
                
                <h1 className="text-5xl md:text-[75px] font-medium tracking-tight leading-[1.1] mb-3 max-w-5xl text-white relative z-20">
                    Personalized Learning that brings you outcome
                </h1>
                
                <p className="text-lg md:text-xl text-white max-w-2xl mb-8 font-normal leading-relaxed relative z-20">
                    Outlrn is an AI-powered, outcome-based learning platform that teaches you only the skills you need to grow
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-5 mb-32 relative z-20">
                    <button className="h-14 px-8 rounded-full bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] hover:from-[#3b82f6] hover:to-[#2563eb] text-white font-bold text-base shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] border border-blue-400/20 transition-all active:scale-95 flex items-center gap-2">
                        Start Your Personalized Path <ArrowRight className="w-5 h-5" />
                    </button>
                    <button className="h-14 px-8 rounded-full bg-[#0a0f16] border border-white/10 text-white hover:bg-white/5 transition-all font-bold text-base flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-zinc-400" /> Explore Learning Goals
                    </button>
                </div>
            </section>

            {/* --- TRUSTED BY --- */}
            <TrustedBy />

            {/* --- HOW IT WORKS (REPLACED WITH STICKY SCROLL) --- */}
            <HowItWorksSection />

            {/* --- FEATURES --- */}
            <section id="features" className="py-32 px-6 relative z-10 bg-[#0b0f14]">
                <div className="container mx-auto max-w-7xl">
                    <div className="mb-20 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Agents and Features</h2>
                    </div>
                   <div className="grid md:grid-cols-4 gap-6">

    <FeatureItem 
        imageUrl={"/images/code.png"} 
        title="AI Code Reviewer Agent" 
        desc="Automatically reviews your code, points out issues, suggests fixes, and even merges your PRs when the quality meets industry standards." 
    />

    <FeatureItem 
        imageUrl={"/images/image.png"} 
        title="AI Teacher Agent" 
        desc="Breaks down any task you’re working on and teaches it step-by-step with examples, explanations, and guided implementation." 
    />

    <FeatureItem 
        imageUrl={"/images/code.png"} 
        title="Personalized Learning Engine" 
        desc="Builds a custom learning path based on your goals, current level, strengths, and areas where you need improvement." 
    />

    <FeatureItem 
        imageUrl={"/images/image.png"} 
        title="Context-Aware Teaching" 
        desc="The AI adapts your learning to the project's context — teaching you exactly what’s needed for that environment, stack, and task." 
    />

    
</div>

                </div>
            </section>

            {/* --- COMPARISON --- */}
            <section className="py-32 px-6 relative z-10 bg-[#0b0f14]">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Because traditional learning is <span className="text-red-400">inefficient.</span></h2>
                    </div>
                    
                    <div className="bg-[#0a0f16]/40 border border-white/5 rounded-[2rem] p-10 shadow-2xl backdrop-blur-sm">
                        <div className="grid grid-cols-3 gap-4 mb-8 text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-white/5 pb-4">
                            <div>Feature</div>
                            <div>Traditional</div>
                            <div className="text-blue-500">Outlrn</div>
                        </div>
                        <ComparisonRow feature="Content Relevance" traditional="Irrelevant topics" outlrn="Only what's needed" />
                        <ComparisonRow feature="Learning Path" traditional="Generic / Linear" outlrn="Personalized" />
                        <ComparisonRow feature="Feedback" traditional="None / Slow" outlrn="Real-time AI" />
                        <ComparisonRow feature="Format" traditional="Long Videos" outlrn="Micro-tasks" />
                        <ComparisonRow feature="Goal" traditional="Certificates" outlrn="Job Readiness" />
                    </div>
                </div>
            </section>

            {/* --- TESTIMONIALS --- */}
            <section className="py-32 px-6 relative z-10 bg-[#0b0f14]">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold">Loved by ambitious developers</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <TestimonialCard 
                            quote="Outlrn taught me React in 2 weeks — because it only made me learn what I actually needed. No fluff, just code."
                            author="Sarah Jenkins"
                            role="Frontend Developer"
                        />
                        <TestimonialCard 
                            quote="The AI explains concepts better than YouTube videos I've watched for hours. It feels like a senior dev is sitting next to me."
                            author="David Chen"
                            role="CS Student"
                        />
                        <TestimonialCard 
                            quote="I finally understand backend architecture. This is honestly the future of learning. I landed my first internship last week!"
                            author="Marcus Johnson"
                            role="Fullstack Aspirant"
                        />
                    </div>
                </div>
            </section>

            {/* --- FAQ --- */}
            <section className="py-32 px-6 relative z-10 bg-[#0b0f14]">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Frequently Asked Questions</h2>
                    <div className="flex flex-col gap-2">
                        <FAQItem q="How is Outlrn different from other platforms?" a="Unlike video-based courses, Outlrn uses an outcome-based approach. We assess your current level and generate a custom curriculum that only teaches what you need to reach your goal. It's active learning vs passive watching." />
                        <FAQItem q="Can beginners use Outlrn?" a="Absolutely. The AI adapts to your starting level, whether you are a complete novice or an experienced dev looking to switch stacks. We have paths specifically for fundamentals." />
                        <FAQItem q="How does the AI teacher work?" a="Our AI analyzes your code submissions in real-time, providing specific feedback, refactoring tips, and explaining concepts just like a human mentor would. It understands context, not just syntax." />
                        <FAQItem q="Do I need to know coding basics?" a="It helps, but isn't strictly necessary. You can start a 'Fundamentals' path to build your base knowledge first before tackling complex frameworks." />
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="py-40 px-6 relative z-10 text-center bg-[#0b0f14] overflow-hidden">
                 <Aurora 
                  colorStops={["#0029FF", "#2E9AFF", "#0055FF"]} 
                  blend={0.8} 
                  amplitude={1.2} 
                  speed={1.2}
                />
                 
                 <div className="container mx-auto max-w-4xl relative z-20">
                     <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white">Stop learning randomly. <br/> <span className="text-blue-500">Learn with purpose.</span></h2>
                     <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">Get a personalized, outcome-based learning plan that adapts to you — and makes you job-ready faster.</p>
                     <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button className="h-14 px-10 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-lg shadow-[0_0_40px_-5px_rgba(37,99,235,0.6)] transition-all">
                            Start Learning Now
                        </button>
                        <button className="h-14 px-10 rounded-full bg-[#0a0f16] border border-white/10 text-white font-medium hover:bg-white/5 transition-all text-lg">
                            Begin Your Path
                        </button>
                     </div>
                 </div>
            </section>


            <footer className="relative bg-[#0b0f14] pt-20 pb-10 overflow-hidden border-t border-white/5">
      
      {/* 1. Background Effects */}
      {/* Massive bottom glow to anchor the page */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ 
               backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
           }} 
      />

      {/* Top Gradient Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10">
        
        {/* 2. Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Branding Column (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-0">
              
             <Logo />
            </div>
            <p className="text-zinc-400 leading-relaxed max-w-sm">
             Building the future of personalized, outcome-based learning for developers worldwide.
            </p>
            
            {/* Socials */}
            <div className="flex items-center gap-4 mt-2">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20 transition-all duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns (Span 2 each) */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6">Product</h4>
            <ul className="flex flex-col gap-4">
              {['Features', 'Integrations', 'Pricing', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-zinc-400 hover:text-blue-400 transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="flex flex-col gap-4">
              {['About', 'Careers', 'Blog', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-zinc-400 hover:text-blue-400 transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column (Span 4) */}
          <div className="lg:col-span-4">
            <h4 className="text-white font-semibold mb-4">Stay updated</h4>
            <p className="text-zinc-400 text-sm mb-6">
              Subscribe to our newsletter for the latest updates and features.
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-[#0f1621] border border-white/10 rounded-xl px-4 py-3 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
              <button className="absolute right-1.5 top-1.5 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            © 2025 Platform Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Terms of Service</a>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <span className="text-zinc-500 text-sm">All systems normal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>

        </div>
    )
}