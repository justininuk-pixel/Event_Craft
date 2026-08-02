"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, BookOpen } from "lucide-react";

type FamilyNode = {
  id: string;
  name: string;
  relation: string;
  transcript: string;
};

const defaultNodes: FamilyNode[] = [
  { id: "n1", name: "Grandpa Joe", relation: "Grandfather", transcript: "Q: What's your earliest memory?\n\nA: I remember the smell of coal dust. My father worked the mines in Pennsylvania. Every evening he'd come home black as night, and my mother would have the tin tub ready by the stove. He'd scrub his hands first, always his hands, and then he'd pick me up with those clean hands and say, 'How's my boy?' I must have been three, maybe four.\n\nQ: What was your wedding day like?\n\nA: Your grandmother wore daisies in her hair. Not fancy flowers — just daisies from the field behind the church. I thought she was the most beautiful thing I'd ever seen. Still do." },
  { id: "n2", name: "Grandma Rose", relation: "Grandmother", transcript: "Q: How did you and Grandpa meet?\n\nA: At a dance. He stepped on my shoes three times. I told him if he stepped on them a fourth time, he'd have to buy me new ones. He said, 'Then I better make it count.' He stepped on them on purpose. Bought me the nicest pair of shoes I ever owned.\n\nQ: What do you miss most?\n\nA: Sunday dinners. The whole family around one table. Twelve, sometimes fifteen people. The noise. You don't appreciate the noise until it's quiet." },
  { id: "n3", name: "Dad", relation: "Father", transcript: "Q: What was it like growing up on the farm?\n\nA: Hard. Good, but hard. You learned that nothing comes free. If you wanted eggs, you fed the chickens. If you wanted milk, you got up at 4 AM. But I wouldn't trade it. It taught me that the things worth having require showing up every single day." },
];

export function InterviewTranscriptTree({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#92400e";
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fffbeb"];

  const nodes: FamilyNode[] = (config.experience as any)?.nodes || defaultNodes;
  const title = config.title || "Family Oral History";

  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  const handleNodeClick = (id: string) => {
    setExpandedNode(expandedNode === id ? null : id);
    if (onComplete) onComplete();
  };

  return (
    <div
      className="w-full h-full relative flex flex-col font-serif overflow-hidden"
      style={{ backgroundColor: bgColors[0] }}
    >
      {/* Paper texture */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      />

      <AnimatePresence mode="wait">
        {expandedNode ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-30 bg-amber-50 overflow-y-auto custom-scrollbar"
          >
            {(() => {
              const node = nodes.find((n) => n.id === expandedNode);
              if (!node) return null;
              return (
                <div className="p-6 pt-12 max-w-lg mx-auto">
                  <button
                    onClick={() => setExpandedNode(null)}
                    className="fixed top-4 right-4 z-40 w-10 h-10 bg-amber-900 text-amber-50 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex items-center gap-3 mb-6 border-b-2 border-amber-900/30 pb-4">
                    <BookOpen size={20} style={{ color: primaryColor }} />
                    <div>
                      <h2 className="text-2xl font-black text-amber-900">{node.name}</h2>
                      <span className="text-xs uppercase tracking-widest text-amber-700/60 font-bold">{node.relation} · Oral History</span>
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap text-amber-900/90 leading-relaxed text-[15px]">
                    {node.transcript}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        ) : (
          <motion.div
            key="tree"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center pt-12 pb-8 px-6 h-full"
          >
            <h2 className="text-2xl font-black text-amber-900 mb-2 tracking-tight">{title}</h2>
            <p className="text-xs text-amber-700/60 mb-8 italic">Tap a name to read their interview</p>

            {/* Simple tree layout */}
            <div className="flex flex-col items-center gap-2 w-full max-w-xs">
              {nodes.map((node, idx) => (
                <React.Fragment key={node.id}>
                  {idx > 0 && <div className="w-px h-6 bg-amber-900/30" />}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleNodeClick(node.id)}
                    className="w-full py-4 px-5 bg-white border-2 border-amber-900/30 rounded-lg shadow-md flex items-center justify-between hover:border-amber-900/60 transition-colors"
                  >
                    <div className="text-left">
                      <div className="font-black text-amber-900 text-lg">{node.name}</div>
                      <div className="text-xs text-amber-700/50 uppercase tracking-widest font-bold">{node.relation}</div>
                    </div>
                    <ChevronRight size={20} className="text-amber-700/40" />
                  </motion.button>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
