'use client'
import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Code2 } from "lucide-react"

export const QuickstartSection = () => {
    const shouldReduceMotion = useReducedMotion()
    const [activeTab, setActiveTab] = useState<'typescript' | 'python' | 'curl'>('typescript')
    
    const codeSnippets = {
        typescript: `// Start learning with Outlrn

import { Outlrn } from '@outlrn/sdk';


// Initialize the Outlrn client

const outlrn = new Outlrn({
  apiKey: process.env.OUTLRN_API_KEY
});


// Ask any topic and get interactive learning

const session = await outlrn.learn({
  topic: "React Hooks",
  level: "intermediate"
});


// Get real-time AI avatar teaching

session.onMessage((message) => {
  console.log(message.content);
  // Visual diagrams, code examples, and explanations
});`,
        python: `# Start learning with Outlrn

from outlrn import Outlrn


# Initialize the Outlrn client

outlrn = Outlrn(
    api_key=os.getenv("OUTLRN_API_KEY")
)


# Ask any topic and get interactive learning

session = outlrn.learn(
    topic="Python Decorators",
    level="beginner"
)


# Get real-time AI avatar teaching

for message in session.stream():
    print(message.content)
    # Visual diagrams, code examples, and explanations`,
        curl: `# Start a learning session

curl -X POST https://api.outlrn.ai/v1/learn \\
  -H "Authorization: Bearer $OUTLRN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "JavaScript Promises",
    "level": "intermediate"
  }'


# Response includes interactive AI avatar
# with visuals, diagrams, and code examples`
    }
    
    return (
        <section id="quickstart" className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 relative z-10 bg-[#0b0f14] overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[300px] sm:h-[450px] md:h-[600px] bg-blue-900/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="container mx-auto max-w-7xl relative z-10">
                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Column - Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="order-2 lg:order-1"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-4 sm:mb-6"
                        >
                            <Code2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            Quickstart
                        </motion.div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                            Start learning interactively <br className="hidden sm:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                in minutes
                            </span>
                        </h2>
                        <p className="text-base sm:text-lg text-zinc-400 mb-6 sm:mb-8 leading-relaxed">
                            Get started with Outlrn and experience interactive AI-powered learning. Ask any computer science or web development topic, and get real-time teaching with visuals, diagrams, and code examples.
                        </p>
                        
                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                        >
                            <motion.a
                                href="/auth"
                                whileHover={!shouldReduceMotion ? { scale: 1.02 } : {}}
                                whileTap={!shouldReduceMotion ? { scale: 0.98 } : {}}
                                className="relative rounded-[12px] sm:rounded-[18px] overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 rounded-[12px] sm:rounded-[18px] text-white font-medium text-sm sm:text-base shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all"
                                    style={{
                                        boxShadow: 'rgba(255, 255, 255, 0.25) 2px 2px 8px 0px inset, rgba(0, 0, 0, 0.15) -2px -2px 7px 0px inset'
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        Get Started Free
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </motion.a>
                            <motion.a
                                href="/docs"
                                whileHover={!shouldReduceMotion ? { scale: 1.02 } : {}}
                                whileTap={!shouldReduceMotion ? { scale: 0.98 } : {}}
                                className="px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 rounded-[12px] sm:rounded-[16px] border border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white font-medium text-sm sm:text-base transition-all backdrop-blur-sm"
                            >
                                View Documentation
                            </motion.a>
                        </motion.div>
                    </motion.div>
                    
                    {/* Right Column - Code Block */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="order-1 lg:order-2"
                    >
                        <div className="relative rounded-[16px] sm:rounded-[20px] bg-[#16171b] border border-[#2b2b2b] overflow-hidden">
                            {/* Tab Bar */}
                            <div className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-[#16171b] border-b border-[#2b2b2b]">
                                {(['typescript', 'python', 'curl'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`relative px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                            activeTab === tab
                                                ? 'text-blue-400 font-bold'
                                                : 'text-zinc-400 hover:text-zinc-300'
                                        }`}
                                    >
                                        {tab === 'typescript' ? 'TypeScript' : tab === 'python' ? 'Python' : 'cURL'}
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Code Content */}
                            <div className="bg-[#0b0c0e] p-4 sm:p-6 overflow-x-auto">
                                <pre className="text-[11px] sm:text-xs md:text-sm font-mono text-zinc-300 leading-relaxed">
                                    <code className="block whitespace-pre-wrap">
                                        {codeSnippets[activeTab].split('\n').map((line, lineIndex) => {
                                    if (!line.trim()) {
                                        return <span key={lineIndex} className="block h-3" />
                                    }
                                    
                                    // Comments (green)
                                    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
                                        return <span key={lineIndex} className="block text-green-500">{line}</span>
                                    }
                                    
                                    // Simple highlighting - split and highlight patterns
                                    const highlightCode = (text: string): (string | JSX.Element)[] => {
                                        const parts: (string | JSX.Element)[] = []
                                        let remaining = text
                                        
                                        // Find all matches with their positions
                                        const matches: Array<{start: number, end: number, type: 'string' | 'keyword' | 'identifier', content: string}> = []
                                        
                                        // Strings
                                        const stringRegex = /"([^"]+)"/g
                                        let stringMatch: RegExpExecArray | null
                                        while ((stringMatch = stringRegex.exec(text)) !== null) {
                                            matches.push({ start: stringMatch.index, end: stringMatch.index + stringMatch[0].length, type: 'string' as const, content: stringMatch[0] })
                                        }
                                        
                                        // Keywords
                                        const keywordRegex = /\b(import|from|export|const|let|var|new|class|function|return|if|else|async|await|def|npm|pip|curl|install|POST|GET)\b/g
                                        let keywordMatch: RegExpExecArray | null
                                        while ((keywordMatch = keywordRegex.exec(text)) !== null) {
                                            // Check if not already matched as string
                                            const isInString = matches.some(m => keywordMatch!.index! >= m.start && keywordMatch!.index! < m.end)
                                            if (!isInString) {
                                                matches.push({ start: keywordMatch.index!, end: keywordMatch.index! + keywordMatch[0].length, type: 'keyword' as const, content: keywordMatch[0] })
                                            }
                                        }
                                        
                                        // Identifiers
                                        const idRegex = /\b(Outlrn|outlrn|session|apiKey|api_key|process|env|os|getenv|OUTLRN_API_KEY|learn|onMessage|stream)\b/g
                                        let idMatch: RegExpExecArray | null
                                        while ((idMatch = idRegex.exec(text)) !== null) {
                                            const isInString = matches.some(m => idMatch!.index! >= m.start && idMatch!.index! < m.end)
                                            if (!isInString) {
                                                matches.push({ start: idMatch.index!, end: idMatch.index! + idMatch[0].length, type: 'identifier' as const, content: idMatch[0] })
                                            }
                                        }
                                        
                                        // Sort matches by position
                                        matches.sort((a, b) => a.start - b.start)
                                        
                                        // Build parts
                                        let lastIndex = 0
                                        matches.forEach((m, i) => {
                                            if (m.start > lastIndex) {
                                                parts.push(text.substring(lastIndex, m.start))
                                            }
                                            const className = m.type === 'string' ? 'text-orange-400' : 
                                                           m.type === 'keyword' ? 'text-blue-400' : 'text-cyan-300'
                                            parts.push(<span key={`${m.type}-${i}`} className={className}>{m.content}</span>)
                                            lastIndex = m.end
                                        })
                                        
                                        if (lastIndex < text.length) {
                                            parts.push(text.substring(lastIndex))
                                        }
                                        
                                        return parts.length > 0 ? parts : [text]
                                    }
                                    
                                            const highlighted = highlightCode(line)
                                            return <span key={lineIndex} className="block">{highlighted}</span>
                                        })}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}



