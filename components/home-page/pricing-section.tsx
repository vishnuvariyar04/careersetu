'use client'
import { motion, useReducedMotion } from "framer-motion"
import { Check, BarChart } from "lucide-react"

interface PricingCardProps {
    plan: string
    price: string
    period: string
    description: string
    features: string[]
    buttonText: string
    buttonLink: string
    isPro?: boolean
    delay?: number
}

const PricingCard = ({ plan, price, period, description, features, buttonText, buttonLink, isPro = false, delay = 0 }: PricingCardProps) => {
    const shouldReduceMotion = useReducedMotion()
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            whileHover={!shouldReduceMotion ? { y: -8, transition: { duration: 0.3 } } : {}}
            style={{ 
                willChange: "transform, opacity",
                backfaceVisibility: "hidden"
            }}
            className={`relative group h-full ${isPro ? 'md:scale-105' : ''}`}
        >
            {/* Outer stroke gradient */}
            <div 
                className="rounded-[32px] md:rounded-[32px] rounded-b-[20px] md:rounded-b-[24px] p-[1px] h-full"
                style={{
                    background: isPro 
                        ? 'linear-gradient(147deg, rgba(59, 130, 246, 0.3) 4%, rgba(59, 130, 246, 0.1) 61%)'
                        : 'linear-gradient(147deg, rgba(255, 255, 255, 0.1) 4%, rgba(255, 255, 255, 0) 61%)'
                }}
            >
                {/* Main card */}
                <div className="relative rounded-[32px] md:rounded-[32px] rounded-b-[20px] md:rounded-b-[20px] bg-[#1c2026] overflow-hidden h-full flex flex-col">
                    {/* Pro plan background image effect */}
                    {isPro && (
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent" />
                        </div>
                    )}
                    
                    {/* Top gradient highlight */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                    
                    <div className="relative p-4 sm:p-6 md:p-8 flex flex-col flex-grow z-10">
                        {/* Price badge */}
                        <div className="mb-6 flex justify-center">
                            <div className="relative inline-block">
                                {/* Outer stroke for badge */}
                                <div 
                                    className="rounded-[24px] p-[1px]"
                                    style={{
                                        background: isPro
                                            ? 'linear-gradient(124deg, rgb(231, 248, 255) 0%, rgba(172, 232, 255, 0.5) 100%)'
                                            : 'linear-gradient(124deg, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%)'
                                    }}
                                >
                                    {/* Badge inner */}
                                    <div 
                                        className={`rounded-[24px] px-4 py-2 ${
                                            isPro 
                                                ? 'bg-gradient-to-br from-blue-100 to-cyan-100' 
                                                : 'bg-gradient-to-br from-[#2c2e31] to-[#1e2024]'
                                        }`}
                                        style={{ backdropFilter: 'blur(3px)' }}
                                    >
                                        <p className={`text-sm font-medium tracking-tight text-center ${
                                            isPro ? 'text-blue-900' : 'text-white'
                                        }`}>
                                            {plan}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Price */}
                        <div className="mb-3 sm:mb-4 text-center">
                            <div className="flex items-baseline justify-center gap-1.5 sm:gap-2">
                                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                                    {price}
                                </span>
                                <span className="text-xs sm:text-sm text-zinc-400 font-normal">
                                    /{period}
                                </span>
                            </div>
                        </div>
                        
                        {/* Description */}
                        <p className="text-xs sm:text-sm text-white font-medium mb-6 sm:mb-8 text-center leading-relaxed px-2">
                            {description}
                        </p>
                        
                        {/* Features */}
                        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                            {features.map((feature: string, index: number) => (
                                <div key={index} className="flex items-start sm:items-center gap-2 sm:gap-3">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-white font-medium tracking-tight leading-relaxed">
                                        {feature}
                                    </p>
                                </div>
                            ))}
                        </div>
                        
                        {/* CTA Button */}
                        <a
                            href={buttonLink}
                            className={`block w-full rounded-lg sm:rounded-xl md:rounded-[18px] py-2.5 sm:py-3.5 px-4 sm:px-6 text-center text-xs sm:text-sm font-medium transition-all duration-300 ${
                                isPro
                                    ? 'bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50'
                                    : 'bg-gradient-to-b from-[#1c2026] to-[#12161c] border border-white/10 hover:border-white/20 text-white hover:bg-white/5'
                            }`}
                            style={{
                                boxShadow: isPro 
                                    ? 'rgba(255, 255, 255, 0.25) 2px 2px 8px 0px inset, rgba(0, 0, 0, 0.15) -2px -2px 7px 0px inset'
                                    : 'rgba(255, 255, 255, 0.05) 2px 2px 4px 0px inset, rgba(0, 0, 0, 0.15) -2px -2px 6px 0px inset'
                            }}
                        >
                            {buttonText}
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export const PricingSection = () => {
    const shouldReduceMotion = useReducedMotion()
    
    const pricingPlans = [
        {
            plan: "Free",
            price: "$0",
            period: "month",
            description: "Perfect for getting started with interactive learning.",
            features: [
                "10 learning sessions per month",
                "Basic AI avatar teaching",
                "Community support",
                "Access to core topics"
            ],
            buttonText: "Get Started",
            buttonLink: "/auth",
            isPro: false
        },
        {
            plan: "Pro",
            price: "$19",
            period: "month",
            description: "Memory for power users and quick moving teams.",
            features: [
                "Unlimited learning sessions",
                "Advanced AI avatar with visuals",
                "Priority support",
                "Advanced analytics",
                "All topics unlocked"
            ],
            buttonText: "Get started with Pro →",
            buttonLink: "/auth",
            isPro: true
        },
        {
            plan: "Scale",
            price: "$99",
            period: "month",
            description: "Enterprise-grade learning for large organizations with dedicated support.",
            features: [
                "Everything in Pro",
                "Team collaboration features",
                "Dedicated support",
                "Custom integrations",
                "Advanced reporting"
            ],
            buttonText: "Get started with Scale →",
            buttonLink: "/auth",
            isPro: false
        }
    ]
    
    return (
        <section id="pricing" className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 relative z-10 bg-[#0b0f14] overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[300px] sm:h-[450px] md:h-[600px] bg-blue-900/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="container mx-auto max-w-7xl relative z-10">
                {/* Header */}
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
                        <BarChart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Pricing
                    </motion.div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-2">
                        The fastest learning layer, <br className="hidden sm:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                            at a fraction of the cost
                        </span>
                    </h2>
                    <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto px-4">
                        Start free, experiment fast, and only pay when learning becomes your advantage. No hidden fees.
                    </p>
                </motion.div>
                
                {/* Pricing Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
                    {pricingPlans.map((plan, index) => (
                        <PricingCard
                            key={plan.plan}
                            {...plan}
                            delay={shouldReduceMotion ? 0 : index * 0.1}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}



