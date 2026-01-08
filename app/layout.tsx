import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { SessionProvider } from "@/components/session-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Outlrn",
  description: "AI-powered project management platform for web developers",
  icons: {
    icon: "/images/outlrn-fav.png",
    
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <SessionProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
