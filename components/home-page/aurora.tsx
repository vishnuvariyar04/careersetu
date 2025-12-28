'use client'
import { motion, useReducedMotion } from "framer-motion"

interface AuroraProps {
  colorStops: string[]
  blend: number
  amplitude: number
  speed: number
}

export const Aurora = ({ colorStops, blend, amplitude, speed }: AuroraProps) => {
  const shouldReduceMotion = useReducedMotion()
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {!shouldReduceMotion && colorStops.map((color, index) => (
        <motion.div
          key={index}
          className="absolute rounded-[100%] mix-blend-screen opacity-40 blur-[60px]"
          style={{
            backgroundColor: color,
            width: '50vw',
            height: '50vh',
            left: index === 0 ? '-10%' : index === 1 ? '30%' : '50%',
            bottom: '-20%',
            willChange: "transform, opacity",
            transform: "translate3d(0,0,0)",
            backfaceVisibility: "hidden"
          }}
          animate={{
            y: [0, -30 * amplitude, 0],
            x: [0, 15 * amplitude, 0],
            scale: [1, 1.1 * amplitude, 1],
            opacity: [0.25, 0.5 * blend, 0.25],
          }}
          transition={{
            duration: 12 / speed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 2,
          }}
        />
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0b0f14] via-[#0b0f14]/60 to-transparent" />
    </div>
  )
}



