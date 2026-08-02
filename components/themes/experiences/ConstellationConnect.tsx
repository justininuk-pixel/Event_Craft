"use client";

import React, { useState, useRef } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion } from "framer-motion";

interface Node {
  id: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

const DEFAULT_NODES: Node[] = [
  { id: 0, x: 20, y: 30 },
  { id: 1, x: 50, y: 15 },
  { id: 2, x: 80, y: 35 },
  { id: 3, x: 70, y: 70 },
  { id: 4, x: 30, y: 80 },
];

export function ConstellationConnect({
  config,
  palette,
  onComplete,
}: ExperienceViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [nodes] = useState<Node[]>(DEFAULT_NODES);
  const [connectedNodes, setConnectedNodes] = useState<number[]>([]);
  const [activeLine, setActiveLine] = useState<{ x: number, y: number } | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const handlePointerDownNode = (e: React.PointerEvent, id: number) => {
    e.stopPropagation();
    if (isRevealed) return;
    
    if (connectedNodes.length === 0) {
      setConnectedNodes([id]);
    } else if (connectedNodes[connectedNodes.length - 1] === id) {
      // User grabbed the last connected node again, fine
    } else if (!connectedNodes.includes(id)) {
      // Direct jump? Allow if they are just clicking around
      const newConnected = [...connectedNodes, id];
      setConnectedNodes(newConnected);
      checkWin(newConnected);
    }
  };

  const handlePointerEnterNode = (id: number) => {
    if (isRevealed || connectedNodes.length === 0) return;
    if (!connectedNodes.includes(id)) {
      const newConnected = [...connectedNodes, id];
      setConnectedNodes(newConnected);
      checkWin(newConnected);
    }
  };

  const checkWin = (arr: number[]) => {
    if (arr.length === nodes.length) {
      setIsRevealed(true);
      setActiveLine(null);
      setTimeout(() => onComplete?.(), 1000); // Small delay for visual completion
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isRevealed || connectedNodes.length === 0) return;
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Also check for collision with nodes (fallback for touch devices where onPointerEnter might fail)
    nodes.forEach(node => {
      if (!connectedNodes.includes(node.id)) {
        const dx = (node.x / 100) * rect.width - (e.clientX - rect.left);
        const dy = (node.y / 100) * rect.height - (e.clientY - rect.top);
        if (Math.sqrt(dx*dx + dy*dy) < 30) {
          const newConnected = [...connectedNodes, node.id];
          setConnectedNodes(newConnected);
          checkWin(newConnected);
        }
      }
    });

    setActiveLine({ x, y });
  };

  const handlePointerUp = () => {
    if (isRevealed) return;
    setActiveLine(null); // Stop drawing
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden touch-none select-none"
      style={{ backgroundColor: isRevealed ? palette.background as string : '#0a0b10' }}
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      
      {/* Background Revealed Content */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-opacity duration-1000"
        style={{ opacity: isRevealed ? 1 : 0 }}
      >
        {config.mediaUrl && (
          <img 
            src={config.mediaUrl} 
            alt="Surprise" 
            className="w-48 h-48 object-cover rounded-xl shadow-2xl mb-6"
          />
        )}
        <h1 className="text-4xl font-heading mb-4 text-[var(--exp-primary)]">
          {config.title}
        </h1>
        <p className="text-lg font-body text-[var(--exp-text)] whitespace-pre-wrap max-w-md">
          {config.body}
        </p>
      </div>

      {/* SVG Layer for lines and stars */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10, mixBlendMode: isRevealed ? 'overlay' : 'normal' }}
      >
        {/* Draw confirmed connected lines */}
        {connectedNodes.map((nodeId, index) => {
          if (index === 0) return null;
          const prevNode = nodes.find(n => n.id === connectedNodes[index - 1]);
          const currNode = nodes.find(n => n.id === nodeId);
          if (!prevNode || !currNode) return null;
          return (
            <line 
              key={`line-${prevNode.id}-${currNode.id}`}
              x1={`${prevNode.x}%`} 
              y1={`${prevNode.y}%`} 
              x2={`${currNode.x}%`} 
              y2={`${currNode.y}%`} 
              stroke={palette.accent as string || "#ffffff"}
              strokeWidth="2"
              strokeDasharray={isRevealed ? "none" : "4 4"}
              className="transition-all duration-300"
            />
          );
        })}

        {/* Draw active line */}
        {activeLine && connectedNodes.length > 0 && !isRevealed && (
          <line 
            x1={`${nodes.find(n => n.id === connectedNodes[connectedNodes.length - 1])?.x}%`} 
            y1={`${nodes.find(n => n.id === connectedNodes[connectedNodes.length - 1])?.y}%`} 
            x2={`${activeLine.x}%`} 
            y2={`${activeLine.y}%`} 
            stroke={palette.secondary as string || "#aaaaaa"}
            strokeWidth="2"
            opacity="0.5"
          />
        )}
      </svg>

      {/* HTML Layer for interactive nodes */}
      {nodes.map((node) => {
        const isConnected = connectedNodes.includes(node.id);
        const isActive = connectedNodes[connectedNodes.length - 1] === node.id;
        
        return (
          <div
            key={`node-${node.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-crosshair"
            style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: 20 }}
            onPointerDown={(e) => handlePointerDownNode(e, node.id)}
            onPointerEnter={() => handlePointerEnterNode(node.id)}
          >
            {/* Hit area */}
            <div className="w-12 h-12 flex items-center justify-center">
              {/* Visual star */}
              <motion.div 
                className="rounded-full shadow-[0_0_15px_currentColor]"
                style={{ backgroundColor: palette.accent as string, color: palette.accent as string }}
                initial={{ width: 6, height: 6, opacity: 0.5 }}
                animate={{ 
                  width: isConnected ? 12 : 6, 
                  height: isConnected ? 12 : 6,
                  opacity: isConnected ? 1 : 0.5,
                  scale: isActive ? 1.5 : 1
                }}
              />
            </div>
          </div>
        );
      })}

      {!isRevealed && connectedNodes.length === 0 && (
        <p className="absolute bottom-12 w-full text-center text-white/50 font-heading animate-pulse pointer-events-none">
          Connect the stars to reveal the message
        </p>
      )}
      
    </div>
  );
}
