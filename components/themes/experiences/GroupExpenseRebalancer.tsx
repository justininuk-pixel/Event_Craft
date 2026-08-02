"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ExperienceViewProps } from "./ExperienceHost";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, ArrowRight, DollarSign, Users, Trash2, CheckCircle } from "lucide-react";

type Expense = {
  id: string;
  payer: string;
  amount: number;
  description: string;
};

type Balance = {
  person: string;
  net: number; // positive means they are owed money, negative means they owe money
};

type Transaction = {
  from: string;
  to: string;
  amount: number;
};

export function GroupExpenseRebalancer({
  config,
  palette,
  onComplete,
  mode
}: ExperienceViewProps) {
  
  const primaryColor = Array.isArray(palette.primary) ? palette.primary[0] : palette.primary || "#2563eb"; // blue
  const bgColors = Array.isArray(palette.background) ? palette.background : [palette.background || "#f1f5f9"];

  // Mock initial state
  const roommates = ["Alice", "Bob", "Charlie"];
  const [expenses, setExpenses] = useState<Expense[]>([
     { id: "1", payer: "Alice", amount: 50, description: "Wifi" },
     { id: "2", payer: "Bob", amount: 100, description: "Groceries" },
     { id: "3", payer: "Charlie", amount: 20, description: "Netflix" },
     { id: "4", payer: "Alice", amount: 30, description: "Pizza" },
  ]);

  const [newPayer, setNewPayer] = useState(roommates[0]);
  const [newAmount, setNewAmount] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [hasSettled, setHasSettled] = useState(false);

  const handleAddExpense = (e: React.FormEvent) => {
     e.preventDefault();
     if (!newAmount || isNaN(Number(newAmount)) || !newDesc.trim()) return;
     
     setExpenses(prev => [...prev, {
        id: Date.now().toString(),
        payer: newPayer,
        amount: Number(newAmount),
        description: newDesc.trim()
     }]);
     
     setNewAmount("");
     setNewDesc("");
  };

  const deleteExpense = (id: string) => {
     setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  // Algorithm to simplify debts
  const transactions = useMemo(() => {
     if (expenses.length === 0) return [];

     // 1. Calculate how much each person paid in total
     const totalPaid: Record<string, number> = {};
     roommates.forEach(r => totalPaid[r] = 0);
     
     let totalCost = 0;
     expenses.forEach(exp => {
        totalPaid[exp.payer] += exp.amount;
        totalCost += exp.amount;
     });

     // 2. Calculate fair share (assuming split evenly among all roommates)
     const fairShare = totalCost / roommates.length;

     // 3. Calculate net balance for each person
     // Positive net means they paid more than their fair share, so they are owed money.
     // Negative net means they paid less, so they owe money.
     let balances: Balance[] = roommates.map(r => ({
        person: r,
        net: totalPaid[r] - fairShare
     })).filter(b => Math.abs(b.net) > 0.01); // Ignore tiny floating point diffs

     // 4. Match debtors (negative net) with creditors (positive net)
     const results: Transaction[] = [];
     
     // Separate into those who owe and those who are owed, sort by amount descending
     const debtors = balances.filter(b => b.net < 0).sort((a, b) => a.net - b.net); // most negative first
     const creditors = balances.filter(b => b.net > 0).sort((a, b) => b.net - a.net); // most positive first

     let dIdx = 0;
     let cIdx = 0;

     while (dIdx < debtors.length && cIdx < creditors.length) {
        const debtor = debtors[dIdx];
        const creditor = creditors[cIdx];
        
        // The amount to settle is the minimum of what the debtor owes and what the creditor is owed
        const amountToSettle = Math.min(Math.abs(debtor.net), creditor.net);
        
        // Record the transaction
        results.push({
           from: debtor.person,
           to: creditor.person,
           amount: amountToSettle
        });
        
        // Update balances
        debtor.net += amountToSettle;
        creditor.net -= amountToSettle;
        
        // Move to next if squared up
        if (Math.abs(debtor.net) < 0.01) dIdx++;
        if (creditor.net < 0.01) cIdx++;
     }

     return results;
  }, [expenses, roommates]);

  useEffect(() => {
     if (hasSettled && onComplete) {
        onComplete();
     }
  }, [hasSettled, onComplete]);

  return (
    <div 
      className="w-full h-full relative flex flex-col md:flex-row p-4 sm:p-8 font-sans overflow-hidden text-slate-800 gap-4"
      style={{ backgroundColor: bgColors[0] }}
    >
      
      {/* Left Panel: Ledger */}
      <div className="flex-1 w-full max-w-md mx-auto md:max-w-none md:w-1/2 bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col overflow-hidden">
         
         <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
               <h2 className="text-xl font-bold tracking-tight text-slate-800">
                  {config.title || "Group Ledger"}
               </h2>
               <p className="text-slate-500 text-sm mt-1">
                  Add shared expenses here.
               </p>
            </div>
            <Users size={24} className="text-slate-400" />
         </div>

         {/* Add Expense Form */}
         <form onSubmit={handleAddExpense} className="p-4 bg-white border-b border-slate-100 grid grid-cols-12 gap-2 items-center">
            <select 
               value={newPayer}
               onChange={(e) => setNewPayer(e.target.value)}
               className="col-span-3 bg-slate-100 border border-slate-200 rounded-lg px-2 py-2 text-sm font-bold text-slate-700 outline-none"
            >
               {roommates.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            
            <div className="col-span-5 relative">
               <input 
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What for?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
               />
            </div>

            <div className="col-span-4 relative flex items-center">
               <DollarSign size={14} className="absolute left-2 text-slate-400" />
               <input 
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full bg-slate-50 border border-slate-200 rounded-l-lg pl-6 pr-2 py-2 text-sm font-bold outline-none focus:border-blue-400"
               />
               <button 
                  type="submit"
                  disabled={!newAmount || !newDesc}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: (!newAmount || !newDesc) ? '#94a3b8' : primaryColor }}
               >
                  Add
               </button>
            </div>
         </form>

         {/* Expense List */}
         <div className="flex-1 overflow-y-auto p-2">
            <AnimatePresence initial={false}>
               {expenses.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center text-slate-400 italic">
                     No expenses logged yet.
                  </motion.div>
               )}
               {expenses.map((exp) => (
                  <motion.div
                     key={exp.id}
                     layout
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="flex items-center justify-between p-3 border-b border-slate-100 hover:bg-slate-50 group"
                  >
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs uppercase shadow-inner">
                           {exp.payer.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-bold">{exp.description}</span>
                           <span className="text-xs text-slate-500">Paid by {exp.payer}</span>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-700">${exp.amount.toFixed(2)}</span>
                        <button 
                           onClick={() => deleteExpense(exp.id)}
                           className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>
      </div>

      {/* Right Panel: Rebalanced Output */}
      <div className="flex-1 w-full max-w-md mx-auto md:max-w-none md:w-1/2 flex flex-col gap-4 relative z-10">
         
         <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col relative">
            <div className="p-6 bg-slate-800 text-white flex items-center justify-between relative overflow-hidden">
               {/* Pattern overlay */}
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff), linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff)", backgroundSize: "20px 20px", backgroundPosition: "0 0, 10px 10px" }} />
               
               <div>
                  <h2 className="text-xl font-bold tracking-tight">How to Settle Up</h2>
                  <p className="text-slate-300 text-sm mt-1">Algorithmically simplified debts.</p>
               </div>
               <Calculator size={24} className="text-slate-400" />
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
               {transactions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                     <CheckCircle size={48} className="mb-4 text-green-500" />
                     <p className="font-bold text-lg">All squared up!</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {transactions.map((tx, idx) => (
                        <motion.div 
                           key={idx}
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: idx * 0.1 }}
                           className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm"
                        >
                           <div className="flex items-center gap-3 font-bold text-slate-700">
                              <span className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
                                 {tx.from.charAt(0)}
                              </span>
                              <span>{tx.from}</span>
                           </div>
                           
                           <div className="flex flex-col items-center flex-1 px-4 text-slate-400">
                              <span className="text-sm font-black text-slate-800 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm mb-1 z-10">
                                 ${tx.amount.toFixed(2)}
                              </span>
                              <div className="w-full h-px bg-slate-300 relative">
                                 <ArrowRight size={16} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-slate-50 text-slate-400" />
                              </div>
                           </div>

                           <div className="flex items-center gap-3 font-bold text-slate-700">
                              <span>{tx.to}</span>
                              <span className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-inner">
                                 {tx.to.charAt(0)}
                              </span>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               )}
            </div>

            {transactions.length > 0 && (
               <div className="p-4 bg-slate-50 border-t border-slate-200">
                  <button
                     onClick={() => setHasSettled(true)}
                     className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold uppercase tracking-widest rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                  >
                     <CheckCircle size={20} /> Generate Venmo Links
                  </button>
               </div>
            )}
         </div>

      </div>

      {/* Editor Bypass */}
      {mode === "editor-preview" && !hasSettled && (
         <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button 
               onClick={() => {
                  setHasSettled(true);
                  if (onComplete) onComplete();
               }}
               className="bg-black/20 text-black backdrop-blur px-3 py-1 text-[10px] font-bold uppercase rounded"
            >
               Settle (Editor)
            </button>
         </div>
      )}

    </div>
  );
}
