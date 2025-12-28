'use client'

export const ConnectorLines = () => (
    <svg 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20 z-0 hidden lg:block"
        style={{ willChange: "auto" }}
    >
        <defs>
            <linearGradient id="lineGradLeft" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="lineGradRight" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="transparent" />
            </linearGradient>
        </defs>
        <path d="M 50% 55% C 40% 55%, 25% 65%, 15% 30%" stroke="url(#lineGradLeft)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
        <path d="M 50% 55% C 40% 55%, 25% 65%, 20% 80%" stroke="url(#lineGradLeft)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
        <path d="M 50% 55% C 60% 55%, 75% 65%, 85% 30%" stroke="url(#lineGradRight)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
        <path d="M 50% 55% C 60% 55%, 75% 65%, 80% 80%" stroke="url(#lineGradRight)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
    </svg>
)



