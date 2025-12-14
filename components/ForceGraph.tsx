'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const ForceGraph = ({ data }: { data: { nodes: any[], links: any[] } }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const graphData = useMemo(() => {
    const safeNodes = data?.nodes || [];
    const safeLinks = data?.links || [];

    return {
      nodes: safeNodes.map(n => ({
        ...n,
        // --- THE FIX: LOCK POSITIONS ---
        // If the backend sent 'x' and 'y', we map them to 'fx' and 'fy'.
        // This disables the physics for these specific nodes.
        fx: n.x !== undefined ? n.x : undefined,
        fy: n.y !== undefined ? n.y : undefined
      })),
      links: safeLinks.map(l => ({ ...l }))
    };
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      
      {dimensions.width > 0 && (
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          
          // Render logic (same as before)
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.label;
            const fontSize = 14 / globalScale;
            const r = 6;
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#06b6d4';
            ctx.fill();
            
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(label, node.x, node.y + r + 8); 
          }}
          nodePointerAreaPaint={(node: any, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
          
          linkColor={() => "#333"}
          // If positions are fixed, we don't need a long cooldown
          cooldownTicks={50} 
        />
      )}
    </div>
  );
};

export default ForceGraph;