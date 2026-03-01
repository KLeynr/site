"use client";

import React, { useState, useMemo } from "react";
import { LayoutDashboard, History, Settings, Menu, BrainCircuit, Calendar as CalendarIcon, Clock, Loader2, Trash2, Activity, Users, Utensils, Monitor, Moon, TrendingUp, Sparkles } from "lucide-react";
import { ChatPanel } from "@/components/chat-panel";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy, limit, deleteDoc, doc, writeBatch, getDocs, setDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AnalysisReport } from "@/components/analysis-report";
import { ScoreChart } from "@/components/score-chart";
import { analyzeAndScoreActivities } from "@/ai/flows/analyze-and-score-activities";

type ViewType = "dashboard" | "status" | "history" | "settings";

const CATEGORY_MAP: Record<string, { label: string, color: string, icon: any }> = {
  physical: { label: "Fiziksel Aktivite", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Activity },
  social: { label: "Sosyal Aktivite", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Users },
  nutrition: { label: "Beslenme", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: Utensils },
  screen_time: { label: "Ekran Süresi", color: "bg-rose-100 text-rose-700 border-rose-200", icon: Monitor },
  sleep: { label: "Uyku", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: Moon },
};

export default function DopamineCheckDashboard() {
  const db = useFirestore();
  const { user } = useUser();
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const userId = user?.uid || "guest_user";

  const logsQuery = useMemo(() => {
    if (!db || !userId) return null;
    return query(
      collection(db, "users", userId, "logs"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
  }, [db, userId]);

  const { data: logs, loading: logsLoading } = useCollection(logsQuery);

  const reportQuery = useMemo(() => {
    if (!db || !userId) return null;
    return query(
      collection(db, "users", userId, "analysis_reports"),
      orderBy("last_update", "desc"),
      limit(1)
    );
  }, [db, userId]);

  const { data: reports, loading: reportsLoading } = useCollection(reportQuery);
  const latestReport = reports && reports.length > 0 ? reports[0] : null;

  const chartData = useMemo(() => {
    if (latestReport && Array.isArray(latestReport.score_history)) {
      return latestReport.score_history;
    }
    return [];
  }, [latestReport]);

  const handleGenerateAnalysis = async () => {
    if (!db || !userId || !logs || logs.length === 0) {
      toast({
        title: "Veri Yetersiz",
        description: "Analiz yapabilmek için önce birkaç günlük faaliyet girmelisiniz.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const activitiesText = logs.map(l => `[${l.category}] ${l.content}`).join(", ");
      const result = await analyzeAndScoreActivities({ activities: activitiesText });
      
      const today = new Date().toISOString().split('T')[0];
      const reportRef = doc(db, "users", userId, "analysis_reports", today);
      
      const newScoreEntry = {
        score: result.total_score,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      await setDoc(reportRef, {
        ...result,
        last_update: serverTimestamp(),
        score_history: arrayUnion(newScoreEntry)
      }, { merge: true });
      
      toast({
        title: "Analiz Tamamlandı",
        description: "Zihinsel durumunuz güncellendi ve geçmişe eklendi.",
      });
      setCurrentView("status");
    } catch (error) {
       toast({
         title: "Hata",
         description: "Analiz yapılırken bir sorun oluştu.",
         variant: "destructive"
       });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteLog = (logId: string) => {
    if (!db || !userId) return;
    const docRef = doc(db, "users", userId, "logs", logId);
    deleteDoc(docRef);
    toast({ title: "Kayıt silindi" });
  };

  const handleClearAllData = async () => {
    if (!db || !userId) return;
    if (confirm("Tüm verileriniz silinecek. Emin misiniz?")) {
      const batch = writeBatch(db);
      const logsRef = collection(db, "users", userId, "logs");
      const logsSnapshot = await getDocs(logsRef);
      logsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
      const reportsRef = collection(db, "users", userId, "analysis_reports");
      const reportsSnapshot = await getDocs(reportsRef);
      reportsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      toast({ title: "Veriler temizlendi", variant: "destructive" });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans">
        <Sidebar className="border-r border-slate-200 hidden md:flex bg-white">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/30">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-tight">Dopamine<br/>Check AI</h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-4 py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={currentView === "dashboard"} onClick={() => setCurrentView("dashboard")} className="hover:bg-primary/10 transition-all rounded-xl py-6">
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-bold">Panel</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={currentView === "status"} onClick={() => setCurrentView("status")} className="hover:bg-primary/10 transition-all rounded-xl py-6">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-bold">Günlük Durum</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={currentView === "history"} onClick={() => setCurrentView("history")} className="hover:bg-primary/10 transition-all rounded-xl py-6">
                  <History className="w-5 h-5" />
                  <span className="font-bold">Kayıt Arşivi</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={currentView === "settings"} onClick={() => setCurrentView("settings")} className="hover:bg-primary/10 transition-all rounded-xl py-6">
                  <Settings className="w-5 h-5" />
                  <span className="font-bold">Ayarlar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-6 border-t bg-slate-50/50">
            <div className="flex items-center gap-3 px-2">
               <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs border-2 border-white shadow-sm uppercase">
                 {userId?.charAt(0) || "G"}
               </div>
               <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-slate-700 truncate">Kişisel Veritabanı</p>
                  <p className="text-[10px] text-slate-400 truncate">Aktif Oturum</p>
               </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-y-auto relative">
          <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-md border-b">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="md:hidden rounded-full"><Menu className="w-4 h-4" /></Button>
              <div>
                <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Dopamine Check AI</h2>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {currentView === "dashboard" && "Faaliyet Girişi"}
                  {currentView === "status" && "Zihinsel Gelişim ve Durum"}
                  {currentView === "history" && "Tüm Geçmiş Kayıtlar"}
                  {currentView === "settings" && "Profil Ayarlar"}
                </h3>
              </div>
            </div>
            {currentView === "dashboard" && (
              <Button onClick={handleGenerateAnalysis} disabled={isAnalyzing || logs?.length === 0} className="rounded-full px-6 font-bold shadow-lg shadow-primary/20 gap-2">
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Nöro-Analizi Başlat
              </Button>
            )}
          </header>

          <div className="max-w-[1400px] mx-auto p-8 space-y-8">
            {currentView === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7"><ChatPanel /></div>
                <div className="lg:col-span-5 space-y-6">
                  <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b">
                      <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" /> Son Faaliyetlerin
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[480px]">
                        <div className="p-6 space-y-4">
                            {logsLoading ? (
                              <div className="flex flex-col items-center justify-center py-20 gap-3"><Loader2 className="w-6 h-6 animate-spin text-primary" /><p className="text-sm font-medium text-slate-400 italic">Yükleniyor...</p></div>
                            ) : logs?.length === 0 ? (
                              <div className="text-center py-20 px-10"><History className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-sm text-slate-400 italic">Henüz kayıt yok.</p></div>
                            ) : (
                              logs?.map((log: any) => {
                                const cat = CATEGORY_MAP[log.category || 'physical'];
                                const CatIcon = cat ? cat.icon : Activity;
                                return (
                                  <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className={cn("text-[9px] font-black border uppercase px-2 py-0", cat?.color)}>
                                          <CatIcon className="w-2.5 h-2.5 mr-1" />{cat?.label}
                                        </Badge>
                                        <button onClick={() => handleDeleteLog(log.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium">{log.content}</p>
                                    <span className="text-[9px] text-slate-300 font-bold block mt-2">{log.date}</span>
                                  </div>
                                );
                              })
                            )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {currentView === "status" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ScoreChart data={chartData} />
                <AnalysisReport data={latestReport} loading={reportsLoading || isAnalyzing} />
              </div>
            )}

            {currentView === "history" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {logs?.map((log: any) => {
                   const cat = CATEGORY_MAP[log.category || 'physical'];
                   const CatIcon = cat ? cat.icon : Activity;
                   return (
                    <Card key={log.id} className="border-none shadow-lg rounded-[2rem] p-6 bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className={cn("text-[10px] font-black uppercase px-3 py-1", cat?.color)}>{cat?.label}</Badge>
                          <button onClick={() => handleDeleteLog(log.id)} className="p-1.5 text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <p className="text-sm text-slate-700 font-medium mb-4">{log.content}</p>
                        <div className="flex items-center gap-2 pt-4 border-t border-slate-50"><CalendarIcon className="w-3 h-3 text-slate-400" /><span className="text-[10px] font-bold text-slate-400">{log.date}</span></div>
                    </Card>
                   );
                })}
              </div>
            )}

            {currentView === "settings" && (
              <div className="max-w-xl mx-auto py-10">
                <Card className="border-none shadow-2xl rounded-[3rem] p-10 bg-white text-center">
                   <h2 className="text-3xl font-black mb-8">Ayarlar</h2>
                   <div className="grid gap-4">
                      <Button onClick={handleClearAllData} variant="outline" className="w-full py-6 rounded-2xl font-bold hover:text-rose-500">Tüm Verileri Temizle</Button>
                      <Button className="w-full py-6 rounded-2xl font-bold shadow-lg shadow-primary/20">Verileri Yedekle (.json)</Button>
                   </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}