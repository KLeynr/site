"use client";

import React from "react";
import { Brain, TrendingUp, ShieldCheck, MessageSquareQuote, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AnalysisReportProps {
  data: any;
  loading?: boolean;
}

const ACTIVITY_TRANSLATIONS: Record<string, string> = {
  physical: "Fiziksel Aktivite",
  social: "Sosyal Aktivite",
  nutrition: "Beslenme",
  screen_time: "Ekran Süresi",
  sleep: "Uyku",
};

export function AnalysisReport({ data, loading }: AnalysisReportProps) {
  if (loading) {
    return (
      <Card className="border-none shadow-2xl bg-white rounded-[2rem] p-8 w-full">
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-base font-black text-slate-400 italic">Nöro-Analiz Yapılıyor...</p>
        </div>
      </Card>
    );
  }

  if (!data) return null;

  const getRiskColor = (risk: string) => {
    const r = risk?.toLowerCase() || "";
    if (r.includes("düşük")) return "bg-emerald-500 text-white shadow-lg";
    if (r.includes("orta")) return "bg-amber-500 text-white shadow-lg";
    if (r.includes("yüksek")) return "bg-rose-500 text-white shadow-lg";
    return "bg-slate-500 text-white";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-slate-50/80 px-8 py-8 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl"><Brain className="w-6 h-6 text-white" /></div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Günlük Nöro-Durum</CardTitle>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SON GÜNCELLEME: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <Badge className={cn("rounded-xl px-5 py-2 text-[11px] font-black uppercase border-none", getRiskColor(data.risk_factor))}>
              {data.risk_factor || "Stabil"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 border-r-0 lg:border-r border-slate-100 pr-0 lg:pr-12">
              <p className="text-[11px] font-black text-slate-400 uppercase mb-4">DOPAMİN ENDEKSİ</p>
              <div className="flex items-baseline gap-2 mb-6">
                <h4 className="text-6xl md:text-7xl font-black text-slate-800 tracking-tighter">{data.total_score || 0}</h4>
                <span className="text-xl font-bold text-slate-300">/100</span>
              </div>
              <Progress value={data.total_score || 0} className="h-4 bg-slate-100 rounded-full mb-6" />
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <p className="text-sm font-bold text-slate-700">Durum: <span className="text-primary uppercase">{data.neuro_status || "Stabil"}</span></p>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-6">BASKIN TREND</p>
                <p className="text-xl font-black text-slate-800">{ACTIVITY_TRANSLATIONS[data.dominant_trend?.toLowerCase()] || data.dominant_trend}</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-6">YARIN TAHMİNİ</p>
                <p className="text-lg font-bold text-slate-700 leading-relaxed">{data.prediction}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-2xl bg-gradient-to-r from-primary to-indigo-800 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-10 relative">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl shrink-0">
              <MessageSquareQuote className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-[12px] font-black text-white/50 uppercase tracking-widest mb-3">NÖRO-KOÇ TAVSİYESİ</h3>
              <p className="text-2xl md:text-3xl font-black text-white leading-tight italic tracking-tight">"{data.advice}"</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}