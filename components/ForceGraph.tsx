'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// Define the shape of our payload
interface GraphPayload {
  nodes: any[];
  links: any[];
  activeNodes?: string[];
  activeEdges?: string[][]; // Array of [source, target] arrays
}

const ForceGraph = ({ data }: { data: GraphPayload }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 1. Memoize Data & Create Lookup Maps for Highlighting
  const { graphData, activeNodeSet, activeEdgeSet } = useMemo(() => {
    const safeNodes = data?.nodes || [];
    const safeLinks = data?.links || [];
    
    // Create a Set for fast node lookup: "A" -> true
    const nodeSet = new Set(data?.activeNodes || []);

    // Create a Set for fast edge lookup: "A-B" -> true
    // We check both directions "A-B" and "B-A" just in case
    const edgeSet = new Set();
    (data?.activeEdges || []).forEach(([src, tgt]) => {
      edgeSet.add(`${src}-${tgt}`);
      edgeSet.add(`${tgt}-${src}`);
    });

    return {
      graphData: {
        nodes: safeNodes.map(n => ({ 
            ...n, 
            fx: n.x ?? undefined, 
            fy: n.y ?? undefined 
        })),
        links: safeLinks.map(l => ({ ...l }))
      },
      activeNodeSet: nodeSet,
      activeEdgeSet: edgeSet
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

          // --- LINK STYLING ---
          // Check if the link is in our active set
          linkColor={(link: any) => {
            const id = `${link.source.id || link.source}-${link.target.id || link.target}`;
            return activeEdgeSet.has(id) ? '#22d3ee' : '#333'; // Cyan if active, Dark Grey if not
          }}
          linkWidth={(link: any) => {
            const id = `${link.source.id || link.source}-${link.target.id || link.target}`;
            return activeEdgeSet.has(id) ? 3 : 1; // Thicker if active
          }}
          linkDirectionalParticles={(link: any) => {
             const id = `${link.source.id || link.source}-${link.target.id || link.target}`;
             return activeEdgeSet.has(id) ? 4 : 0; // Show moving particles on active links!
          }}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleWidth={4}

          // --- NODE STYLING ---
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.label;
            const fontSize = 14 / globalScale;
            const r = 6;
            
            // Check highlight status
            const isActive = activeNodeSet.has(node.id);

            // 1. Draw Glow if active
            if (isActive) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, r * 2.5, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'rgba(6, 182, 212, 0.2)'; // Faint Cyan Glow
                ctx.fill();
            }

            // 2. Draw Node Circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = isActive ? '#22d3ee' : '#06b6d4'; // Brighter if active
            ctx.fill();
            
            // 3. Draw Text
            ctx.font = `${isActive ? 'bold ' : ''}${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isActive ? '#fff' : 'rgba(255, 255, 255, 0.6)';
            ctx.fillText(label, node.x, node.y + r + 8); 
          }}
          
          nodePointerAreaPaint={(node: any, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
          
          cooldownTicks={50} 
        />
      )}
    </div>
  );
};

export default ForceGraph;