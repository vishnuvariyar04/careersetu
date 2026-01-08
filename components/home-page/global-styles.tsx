'use client'

export const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    
    * {
      scroll-behavior: smooth;
    }
    
    body {
      font-family: 'Space Grotesk', sans-serif;
      background-color: #0b0f14; 
      color: white;
      overflow-x: hidden;
      /* Performance optimizations */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    
    html {
      scroll-behavior: smooth;
      scroll-padding-top: 100px;
    }
    
    /* GPU acceleration and performance optimizations */
    [data-scroll-container] {
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
    }
    
    /* Optimize scroll performance */
    @media (prefers-reduced-motion: no-preference) {
      * {
        scroll-behavior: smooth;
      }
    }
    
    /* Force GPU acceleration for animated elements */
    [class*="motion-"], [data-framer-component] {
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
      will-change: transform, opacity;
    }
    
    /* Optimize fixed elements */
    [style*="position: fixed"] {
      will-change: transform;
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
    }
    
    /* Reduce repaints on scroll */
    body {
      -webkit-overflow-scrolling: touch;
    }
    
    /* Optimize images */
    img {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
    
    /* Custom scrollbar for premium feel */
    ::-webkit-scrollbar {
      width: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: #0b0f14;
    }
    
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #2563eb 0%, #1e3a5f 100%);
    }
    
    /* Smooth transitions for all interactive elements */
    a, button {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `}</style>
)



