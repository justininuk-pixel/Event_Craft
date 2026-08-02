"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { GitMerge, CheckCircle, XCircle } from "lucide-react";

type TreeNode = {
  id: string;
  type: "question" | "resolution";
  text: string;
  yesId?: string;
  noId?: string;
  status?: "success" | "error"; // for resolutions
};

const defaultTree: TreeNode[] = [
  { id: "root", type: "question", text: "Is the server responding to pings?", yesId: "q1", noId: "q2" },
  { id: "q1", type: "question", text: "Are there active errors in the logs?", yesId: "r1", noId: "r2" },
  { id: "q2", type: "question", text: "Is the physical host powered on?", yesId: "q3", noId: "r3" },
  { id: "q3", type: "question", text: "Is the network cable connected?", yesId: "r4", noId: "r5" },
  
  { id: "r1", type: "resolution", text: "Investigate application layer bugs.", status: "error" },
  { id: "r2", type: "resolution", text: "System is healthy. False alarm.", status: "success" },
  { id: "r3", type: "resolution", text: "Power on the host machine.", status: "error" },
  { id: "r4", type: "resolution", text: "Check router configuration.", status: "error" },
  { id: "r5", type: "resolution", text: "Reconnect the network cable.", status: "error" },
];

export function SOPDecisionTreeBuilder({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {

  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f8fafc"]; // slate-50
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#0f172a"; // slate-900

  const tree: TreeNode[] = (config.experience as any)?.tree || defaultTree;
  const title = config.title || "Diagnostic SOP";

  const [history, setHistory] = useState<string[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string>("root");

  const currentNode = tree.find(n => n.id === currentNodeId);

  const handleAnswer = (nextId?: string) => {
    if (!nextId) return;
    setHistory(prev => [...prev, currentNodeId]);
    setCurrentNodeId(nextId);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
    
    // Check if next node is a resolution
    const nextNode = tree.find(n => n.id === nextId);
    if (nextNode && nextNode.type === "resolution") {
       if (onComplete) setTimeout(onComplete, 5000);
    }
  };

  const handleRestart = () => {
     setHistory([]);
     setCurrentNodeId("root");
  };

  if (!currentNode) return null;

  return (
    <div className="w-full h-full relative flex flex-col font-sans overflow-hidden select-none bg-slate-50 text-slate-800" style={{ backgroundColor: bgColors[0] }}>
      
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white z-20 shadow-sm">
         <div className="flex items-center gap-2">
            <GitMerge size={20} className="text-slate-500" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900">{title}</h2>
         </div>
         {history.length > 0 && (
            <button onClick={handleRestart} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">
               Restart
            </button>
         )}
      </div>

      {/* History Path (Breadcrumbs visually scrolling up) */}
      <div className="absolute top-24 left-0 w-full px-6 flex flex-col gap-4 pointer-events-none opacity-50 z-10" style={{ transform: "translateY(-20px)" }}>
         {history.slice(-3).map((hid, idx) => {
            const hNode = tree.find(n => n.id === hid);
            return (
               <div key={hid + idx} className="bg-slate-200 p-4 rounded-xl text-slate-500 text-sm italic transform scale-95 origin-bottom">
                  Q: {hNode?.text}
               </div>
            );
         })}
      </div>

      {/* Current Active Node */}
      <div className="flex-1 flex items-center justify-center p-6 z-20 relative">
         <AnimatePresence mode="wait">
            <motion.div 
               key={currentNode.id}
               initial={{ opacity: 0, y: 50, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: -50, scale: 0.95 }}
               transition={{ type: "spring", stiffness: 300, damping: 25 }}
               className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col"
            >
               {currentNode.type === "question" ? (
                  <>
                     <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Question</div>
                     <h3 className="text-2xl font-black text-slate-800 mb-8 leading-tight">
                        {currentNode.text}
                     </h3>
                     <div className="flex gap-4 w-full">
                        <button 
                          onClick={() => handleAnswer(currentNode.yesId)}
                          className="flex-1 py-4 bg-emerald-50 text-emerald-700 font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          Yes
                        </button>
                        <button 
                          onClick={() => handleAnswer(currentNode.noId)}
                          className="flex-1 py-4 bg-rose-50 text-rose-700 font-bold uppercase tracking-widest rounded-xl hover:bg-rose-100 border border-rose-200 transition-colors"
                        >
                          No
                        </button>
                     </div>
                  </>
               ) : (
                  <>
                     <div className="text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2" style={{ color: currentNode.status === 'success' ? '#10b981' : '#f43f5e' }}>
                        {currentNode.status === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        Resolution
                     </div>
                     <h3 className="text-2xl font-black text-slate-800 mb-4 leading-tight">
                        {currentNode.text}
                     </h3>
                     <p className="text-sm text-slate-500 italic">SOP sequence completed.</p>
                  </>
               )}
            </motion.div>
         </AnimatePresence>
      </div>

    </div>
  );
}
