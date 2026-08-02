"use client";

import React, { useState } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, User, Utensils, PenTool } from "lucide-react";

type RecipeNode = {
   id: string;
   author: string;
   title: string;
   image: string;
   baseRecipe: string; // The original inherited text
   mutations: string[]; // Specific changes made by this node
   children: RecipeNode[];
};

const defaultTree: RecipeNode = {
   id: "root",
   author: "Great Grandma Pearl",
   title: "Classic Apple Pie",
   image: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?q=80&w=400&auto=format&fit=crop",
   baseRecipe: "6 apples, peeled and sliced. 1/2 cup sugar. 1 tsp cinnamon. Bake in pie crust at 375F for 45 minutes.",
   mutations: ["Original Recipe"],
   children: [
      {
         id: "child1",
         author: "Grandma Rose",
         title: "Rose's Apple Pie",
         image: "https://images.unsplash.com/photo-1621236378699-8597faf6a176?q=80&w=400&auto=format&fit=crop",
         baseRecipe: "6 apples, peeled and sliced. 1/2 cup sugar. 1 tsp cinnamon. Bake in pie crust at 375F for 45 minutes.",
         mutations: ["Added 1/4 tsp nutmeg to the spice mix", "Used brown sugar instead of white"],
         children: [
            {
               id: "grandchild1",
               author: "Mom",
               title: "Mom's Apple Crisp Pie",
               image: "https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=400&auto=format&fit=crop",
               baseRecipe: "6 apples, peeled and sliced. 1/2 cup brown sugar. 1 tsp cinnamon. 1/4 tsp nutmeg. Bake in pie crust at 375F for 45 minutes.",
               mutations: ["Replaced top crust with oat crumble", "Added squeeze of lemon juice to apples"],
               children: []
            }
         ]
      },
      {
         id: "child2",
         author: "Uncle Joe",
         title: "Joe's Bourbon Apple Pie",
         image: "https://images.unsplash.com/photo-1535920527002-b35e96722eb9?q=80&w=400&auto=format&fit=crop",
         baseRecipe: "6 apples, peeled and sliced. 1/2 cup sugar. 1 tsp cinnamon. Bake in pie crust at 375F for 45 minutes.",
         mutations: ["Soaked apples in 2 tbsp bourbon", "Thickened filling with cornstarch"],
         children: []
      }
   ]
};

export function RecipeHeritageTree({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#d97706"; // amber-600
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#fef3c7"]; // amber-50

  const treeData = (config.experience as any)?.treeData || defaultTree;

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["root"]));
  const [selectedNode, setSelectedNode] = useState<RecipeNode>(treeData);

  const toggleNode = (nodeId: string, e: React.MouseEvent) => {
     e.stopPropagation();
     setExpandedNodes(prev => {
        const next = new Set(prev);
        if (next.has(nodeId)) {
           next.delete(nodeId);
        } else {
           next.add(nodeId);
        }
        return next;
     });
  };

  const selectNode = (node: RecipeNode) => {
     setSelectedNode(node);
     if (onComplete && node.children.length === 0) {
        onComplete();
     }
  };

  const renderNode = (node: RecipeNode, level: number = 0) => {
     const isExpanded = expandedNodes.has(node.id);
     const isSelected = selectedNode.id === node.id;
     const hasChildren = node.children && node.children.length > 0;

     return (
        <div key={node.id} className="flex flex-col">
           <div 
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-amber-100/50 border border-amber-200' : 'hover:bg-black/5 border border-transparent'}`}
              onClick={() => selectNode(node)}
              style={{ marginLeft: `${level * 24}px` }}
           >
              <div 
                 className={`w-6 h-6 flex items-center justify-center shrink-0 ${hasChildren ? 'cursor-pointer hover:bg-black/10 rounded' : 'opacity-0'}`}
                 onClick={(e) => hasChildren ? toggleNode(node.id, e) : undefined}
              >
                 {isExpanded ? <ChevronDown size={14} className="text-amber-800" /> : <ChevronRight size={14} className="text-amber-800" />}
              </div>
              
              <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 shrink-0 border border-amber-300">
                 <User size={14} />
              </div>
              
              <div className="flex flex-col">
                 <span className="text-sm font-bold text-amber-900">{node.author}</span>
                 <span className="text-xs text-amber-700/70">{node.title}</span>
              </div>
           </div>

           <AnimatePresence>
              {isExpanded && hasChildren && (
                 <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden relative"
                 >
                    {/* Vertical connecting line */}
                    <div 
                       className="absolute left-[38px] top-0 bottom-0 w-px bg-amber-300/50"
                       style={{ marginLeft: `${level * 24}px` }}
                    />
                    <div className="flex flex-col py-1">
                       {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
     );
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col font-serif overflow-hidden text-amber-900"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Texture Background */}
      <div 
         className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply"
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      <div className="absolute top-0 left-0 right-0 p-6 z-20 text-center border-b border-amber-900/10 bg-amber-50/50 backdrop-blur-sm">
         <h2 className="text-2xl font-black tracking-tighter">
            {config.title || "The Family Recipe Tree"}
         </h2>
      </div>

      <div className="flex-1 flex flex-col md:flex-row mt-20 relative z-10 h-full overflow-hidden">
         
         {/* Left Side: Tree Navigation */}
         <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto p-6 border-b md:border-b-0 md:border-r border-amber-900/10 custom-scrollbar">
            <h3 className="text-sm font-bold uppercase tracking-widest text-amber-700/50 mb-6 flex items-center gap-2">
               <Utensils size={14} /> Lineage
            </h3>
            {renderNode(treeData, 0)}
         </div>

         {/* Right Side: Selected Node Details */}
         <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto p-6 custom-scrollbar bg-white/40">
            <AnimatePresence mode="wait">
               <motion.div
                  key={selectedNode.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
               >
                  <h3 className="text-3xl font-black italic mb-1">{selectedNode.title}</h3>
                  <div className="text-sm font-bold uppercase tracking-widest text-amber-700/60 mb-6 flex items-center gap-2">
                     <User size={14} /> By {selectedNode.author}
                  </div>

                  {selectedNode.image && (
                     <div className="w-full h-48 rounded-xl overflow-hidden shadow-lg border-4 border-white mb-8 bg-amber-100">
                        <img src={selectedNode.image} alt={selectedNode.title} className="w-full h-full object-cover" />
                     </div>
                  )}

                  <div className="mb-8">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700/50 mb-3 border-b border-amber-900/10 pb-2">
                        Inherited Recipe
                     </h4>
                     <p className="text-sm leading-relaxed text-amber-900/80">
                        {selectedNode.baseRecipe}
                     </p>
                  </div>

                  <div className="mb-4">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700/50 mb-3 border-b border-amber-900/10 pb-2 flex items-center gap-2">
                        <PenTool size={14} /> Personal Tweaks
                     </h4>
                     <ul className="space-y-3">
                        {selectedNode.mutations.map((mutation, idx) => (
                           <li key={idx} className="flex gap-3 text-sm items-start">
                              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                                 +
                              </span>
                              <span className="leading-relaxed font-bold bg-amber-200/40 px-2 py-0.5 rounded text-amber-900">
                                 {mutation}
                              </span>
                           </li>
                        ))}
                     </ul>
                  </div>

               </motion.div>
            </AnimatePresence>
         </div>

      </div>

    </div>
  );
}
