"use client";

import React from "react";
import { Brain, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const getStatus = (s: number) => {
    if (s >= 80) return { label: "Mükemmel Denge", color: "text-emerald-500", bg: "bg-emerald-50", icon: TrendingUp };
    if (s >= 60) return { label: "İyi Durum", color: "text-blue-500", bg: "bg-blue-50", icon: TrendingUp };
    if (s >= 40) return { label: "Dikkat Gerekli", color: "text-amber-500", bg: "bg-amber-50", icon: Minus };
    return { label: "Düşük Denge", color: "text-rose-500", bg: "bg-rose-50", icon: TrendingDown };
  };

  const status = getStatus(score);
  const Icon = status.icon;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 overflow-hidden">
         <div 
           className={cn("h-full transition-all duration-1000 ease-out", status.color.replace('text', 'bg'))}
           style={{ width: `${score}%` }}
         />
      </div>
      
      <div className="mb-4 p-3 bg-primary/10 rounded-full">
        <Brain className="w-8 h-8 text-primary" />
      </div>

      <div className="relative mb-2">
        <span className="text-6xl font-black tracking-tighter text-slate-800">{score}</span>
        <span className="text-sm font-bold text-slate-400 absolute bottom-2 -right-6">/100</span>
      </div>

      <div className={cn("px-4 py-1.5 rounded-full flex items-center gap-2 mb-2", status.bg)}>
        <Icon className={cn("w-4 h-4", status.color)} />
        <span className={cn("text-xs font-bold uppercase tracking-wider", status.color)}>{status.label}</span>
      </div>
      
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-2">Günlük Zihinsel Denge Skoru</p>
    </div>
  );
}
