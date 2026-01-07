'use client'
import React, { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion"
import packageJson from "../package.json"
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
  GitBranch,
  Twitter,
  Github,
  Linkedin,
  Send,
  PlayCircle,
  AlertTriangle,
  Sparkles,
  GraduationCap,
  MonitorPlay,
  HelpCircle,
  Lightbulb,
  TrendingUp
} from "lucide-react"
import { HeroSection } from "../components/home-page/hero-section"
import { Aurora } from "../components/home-page/aurora"
import { GlobalStyles } from "../components/home-page/global-styles"
import { Navbar } from "../components/home-page/navbar"
import { TrustedBy } from "../components/home-page/trusted-by"
import { HowItWorksSection } from "../components/home-page/how-it-works-section"
import { HowToUseSection } from "../components/home-page/how-to-use-section"
import { ComparisonSection } from "../components/home-page/comparison-section"
import { PricingSection } from "../components/home-page/pricing-section"
import { QuickstartSection } from "../components/home-page/quickstart-section"
import { TestimonialsSection } from "../components/home-page/testimonials-section"
import { FAQSection } from "../components/home-page/faq-section"

// All components have been moved to components/home-page/

export default function LandingPage() {
    const shouldReduceMotion = useReducedMotion()
    
    return (
        <div 
            className="min-h-screen bg-[#0b0f15] text-white selection:bg-blue-500/30 relative font-['Space_Grotesk']"
            style={{ 
                willChange: "auto"
            }}
        >
            <GlobalStyles />
            <Navbar />

            {/* --- HERO SECTION --- */}
            <HeroSection />

            {/* --- TRUSTED BY --- */}
            <TrustedBy />

            {/* --- HOW IT WORKS (REPLACED WITH STICKY SCROLL) --- */}
            <HowItWorksSection />
<div className="h-28 bg-[#0b0f15]"></div>
            <HowToUseSection />

            {/* --- FEATURES --- */}
            {/* <section id="features" className="py-32 px-6 relative z-10 bg-[#0b0f14]">
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
        desc="Breaks down any task you're working on and teaches it step-by-step with examples, explanations, and guided implementation." 
    />

    <FeatureItem 
        imageUrl={"/images/code.png"} 
        title="Personalized Learning Engine" 
        desc="Builds a custom learning path based on your goals, current level, strengths, and areas where you need improvement." 
    />

    <FeatureItem 
        imageUrl={"/images/image.png"} 
        title="Context-Aware Teaching" 
        desc="The AI adapts your learning to the project's context — teaching you exactly what's needed for that environment, stack, and task." 
    />

    
</div>

                </div>
            </section> */}

           <ComparisonSection />

            {/* --- PRICING SECTION --- */}
            <PricingSection />

            {/* --- QUICKSTART SECTION --- */}
            <QuickstartSection />

            {/* --- TESTIMONIALS --- */}
            <TestimonialsSection />

            {/* --- FAQ --- */}
            <FAQSection />

            {/* --- FINAL CTA --- */}
            <section className="py-24 sm:py-32 md:py-40 px-4 sm:px-6 relative z-10 text-center bg-[#0b0f14] overflow-hidden">
                 <Aurora 
                  colorStops={["#0029FF", "#2E9AFF", "#0055FF"]} 
                  blend={0.8} 
                  amplitude={1.2} 
                  speed={1.2}
                />
                 
                 <motion.div 
                     initial={{ opacity: 0, y: 40 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.8 }}
                     className="container mx-auto max-w-4xl relative z-20"
                 >
                     <motion.div
                         initial={{ opacity: 0, scale: 0.9 }}
                         whileInView={{ opacity: 1, scale: 1 }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.5 }}
                         className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-300 mb-6 sm:mb-8"
                     >
                         <Rocket className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                         <span className="hidden sm:inline">Ready to Transform Your Learning?</span>
                         <span className="sm:hidden">Ready to Start?</span>
                     </motion.div>
                     
                     <motion.h2 
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.6, delay: 0.1 }}
                         className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 tracking-tight text-white px-2"
                     >
                         Stop watching videos. <br className="hidden sm:block"/> 
                         <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400">
                             Start learning interactively.
                         </span>
                     </motion.h2>
                     
                     <motion.p 
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.6, delay: 0.2 }}
                         className="text-base sm:text-lg md:text-xl text-zinc-400 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4"
                     >
                         Type any CS or Web Dev topic and learn from a live AI avatar that adapts to you in real time.
                     </motion.p>
                     
                     <motion.div 
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.6, delay: 0.3 }}
                         className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 w-full px-4"
                     >
                        <motion.button 
                            whileHover={{ scale: 1.03, boxShadow: "0 0 50px -5px rgba(37,99,235,0.7)" }}
                            whileTap={{ scale: 0.98 }}
                            className="h-12 sm:h-14 px-6 sm:px-8 md:px-10 rounded-lg sm:rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold text-sm sm:text-base md:text-lg shadow-[0_0_40px_-5px_rgba(37,99,235,0.5)] transition-all border border-blue-400/20 flex items-center gap-2 group w-full sm:w-auto"
                        >
                            Start Learning Now 
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            className="h-12 sm:h-14 px-6 sm:px-8 md:px-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white font-medium transition-all text-sm sm:text-base md:text-lg backdrop-blur-sm w-full sm:w-auto"
                        >
                            Try It Free
                        </motion.button>
                     </motion.div>
                 </motion.div>
            </section>


            <footer className="relative bg-[#0b0f14] pt-20 pb-10 overflow-hidden border-t border-white/5">
      
      {/* 1. Background Effects */}
      <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" 
      />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{ 
               backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', 
               backgroundSize: '48px 48px' 
           }} 
      />

      {/* Top Gradient Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10"
      >
        
        {/* 2. Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Branding Column (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-3">
             <img 
               src="/images/outlrn-cropped.png" 
               className="w-40" 
               alt="Outlrn"
               loading="eager"
               decoding="async"
               style={{ willChange: "auto" }}
             /> 
             <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400">
                v{packageJson.version}
             </span>
            </div>
            <p className="text-zinc-400 leading-relaxed max-w-sm text-sm">
             Interactive avatar-based learning for computer science and web development. Learn smarter, not harder.
            </p>
            
            {/* Socials */}
            <div className="flex items-center gap-3 mt-2">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <motion.a 
                    key={i} 
                    href="#" 
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20 transition-all duration-300"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns (Span 2 each) */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Product</h4>
            <ul className="flex flex-col gap-3">
              {[
                { name: 'Features', href: '#features' },
                { name: 'Integrations', href: '#' },
                { name: 'Pricing', href: '/pricing' },
                { name: 'Changelog', href: '#' }
              ].map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-zinc-400 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm inline-block">{item.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Company</h4>
            <ul className="flex flex-col gap-3">
              {['About', 'Careers', 'FAQ', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-zinc-400 hover:text-white hover:translate-x-1 transition-all duration-300 text-sm inline-block">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column (Span 4) */}
          <div className="lg:col-span-4">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Stay updated</h4>
            <p className="text-zinc-400 text-sm mb-6">
              Subscribe to our newsletter for the latest updates and features.
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-[#0f1621] border border-white/10 rounded-xl px-4 py-3.5 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-1.5 top-1.5 p-2.5 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-900/30"
              >
                <Send size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* 3. Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            © 2025 Outlrn. All rights reserved.
          </p>
          <div className="flex items-center gap-6 md:gap-8">
            <a href="#" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Terms of Service</a>
            <div className="flex items-center gap-2">
              <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
              />
              <span className="text-zinc-500 text-sm">All systems normal</span>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>

        </div>
    )
}
// --- 4. OPTIMIZED: Premium Step Card with Glassmorphism ---
const StepCard = ({ step, tag, title, desc, color, imgUrl }:any) => {
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

const FeatureItem = ({ imageUrl, title, desc, linkText = "Learn more" }:any) => (
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

// const ComparisonRow = ({ feature, traditional, outlrn }) => (
//     <div className="grid grid-cols-3 gap-4 py-5 border-b border-white/5 text-sm items-center">
//         <div className="text-zinc-300 font-medium">{feature}</div>
//         <div className="text-zinc-500 flex items-center gap-2"><X className="w-4 h-4 text-red-500/50" /> {traditional}</div>
//         <div className="text-white flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> {outlrn}</div>
//     </div>
// )

// --- TESTIMONIAL CAROUSEL FOR MOBILE ---
const TestimonialCarousel = () => {
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

const TestimonialCard = ({ quote, author, role, delay = 0 }:any) => (
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

const FAQItem = ({ q, a, index = 0 }:any) => {
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

// --- NEW SCROLL-BASED HOW IT WORKS SECTION ---

// --- 1. OPTIMIZED: High-Intensity Aurora Flare ---
const AuroraFlare = ({ opacity }:any) => {
    return (
        <motion.div 
            style={{ 
                opacity,
                willChange: "opacity",
                transform: "translate3d(0,0,0)"
            }}
            className="absolute bottom-0 left-0 right-0 h-[130vh] w-full pointer-events-none z-0 overflow-visible"
        >
            {/* Gradient Mask to fade top edge smoothly */}
            <div 
                className="absolute inset-0 w-full h-full"
                style={{
                    maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to top, black 40%, transparent 100%)",
                    willChange: "auto"
                }}
            >
                {/* 1. The Core Blaze - Reduced blur for performance */}
                <motion.div 
                    animate={{ scaleY: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ 
                        willChange: "transform, opacity", 
                        transform: "translate3d(0,0,0)",
                        backfaceVisibility: "hidden"
                    }}
                    className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[40%] h-[60%] bg-[#115ca3] blur-[60px] mix-blend-screen"
                />

                {/* 2. Wide Glow - Reduced blur */}
                <motion.div 
                    animate={{ scale: [1, 1.01, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    style={{ 
                        willChange: "transform, opacity", 
                        transform: "translate3d(0,0,0)",
                        backfaceVisibility: "hidden"
                    }}
                    className="absolute bottom-[-20%] left-[15%] right-[15%] h-[70%] bg-[#0f2dbf] blur-[70px] mix-blend-screen"
                />

                {/* 3. Rising Light Pillars - Simplified animation */}
                <motion.div 
                    animate={{ 
                        y: [0, -30, 0],
                        opacity: [0.4, 0.6, 0.4]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    style={{ 
                        willChange: "transform, opacity", 
                        transform: "translate3d(0,0,0)",
                        backfaceVisibility: "hidden"
                    }}
                    className="absolute bottom-[-10%] left-[30%] w-[40%] h-[90%] bg-gradient-to-t from-white via-blue-400 to-transparent blur-[40px] mix-blend-overlay"
                />
            </div>
        </motion.div>
    )
}


// --- 1. OPTIMIZED: Floating Particles Background Effect ---
const FloatingParticles = ({ opacity, color = "blue" }:any) => {
    // Reduced particle count from 8 to 4 for better performance
    const particles = useMemo(() => Array.from({ length: 4 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 3,
        duration: 10 + Math.random() * 4, // Slower animations
        size: 3 + Math.random() * 3,
    })), [])

    const colorClasses: Record<string, string> = {
        blue: "bg-blue-500",
        cyan: "bg-cyan-400",
        purple: "bg-purple-500",
        emerald: "bg-emerald-400"
    }

    return (
        <motion.div 
            style={{ 
                opacity,
                willChange: "opacity"
            }} 
            className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        >
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className={`absolute rounded-full ${colorClasses[color]}`}
                    style={{ 
                        left: particle.left, 
                        top: particle.top,
                        width: particle.size,
                        height: particle.size,
                        willChange: "transform, opacity",
                        transform: "translate3d(0,0,0)",
                        backfaceVisibility: "hidden"
                    }}
                    animate={{ 
                        y: [0, -25, 0],
                        x: [0, 10, 0],
                        opacity: [0.15, 0.5, 0.15],
                        scale: [1, 1.15, 1]
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </motion.div>
    )
}

// --- 2. ULTRA-OPTIMIZED: Professional Story Card with Icon ---
const StoryCard = ({ icon: Icon, iconColor, title, desc, style }:any) => {
    return (
        <motion.div 
            style={{ 
                y: style?.y,
                scale: style?.scale,
                opacity: style?.opacity,
                zIndex: style?.zIndex,
                willChange: "transform, opacity",
                backfaceVisibility: "hidden"
            }}
            className="absolute top-0 left-0 right-0 w-full max-w-xl mx-auto px-2 sm:px-4"
        >
            <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden group shadow-2xl">
                {/* Layered background for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] opacity-95" />
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                
                {/* Border and top highlight */}
                <div className="absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 group-hover:border-white/20 transition-colors duration-500" />
                <div className="absolute top-0 inset-x-8 sm:inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

                <div className="relative p-4 sm:p-6 md:p-8 flex flex-row items-center gap-3 sm:gap-4 md:gap-6 z-10 text-left">
                    {/* Icon container - removed expensive blur glow */}
                    <div className="shrink-0 relative">
                        <div className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:scale-105 transition-transform duration-500`}>
                            <Icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${iconColor.replace('bg-', 'text-').replace('/20', '')}`} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-200/50">{title}</span>
                        </h3>
                        <p className="text-blue-200/60 text-xs sm:text-sm md:text-base leading-relaxed font-medium">{desc}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
