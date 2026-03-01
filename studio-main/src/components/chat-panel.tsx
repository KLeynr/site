
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, ClipboardList, Activity, Users, Utensils, Monitor, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  category?: string;
}

const CATEGORIES = [
  { id: "physical", label: "Fiziksel Aktivite", icon: Activity, color: "text-blue-500" },
  { id: "social", label: "Sosyal Aktivite", icon: Users, color: "text-purple-500" },
  { id: "nutrition", label: "Beslenme", icon: Utensils, color: "text-emerald-500" },
  { id: "screen_time", label: "Ekran Süresi", icon: Monitor, color: "text-rose-500" },
  { id: "sleep", label: "Uyku", icon: Moon, color: "text-indigo-500" },
];

export function ChatPanel() {
  const db = useFirestore();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Selam! Bugün neler yaptığını kategori seçerek yazabilirsin. Dopamine Check AI veritabanına anlık olarak kaydedilecektir.",
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("physical");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const saveLogToFirestore = (content: string, category: string) => {
    if (!db) return;
    const userId = user?.uid || "guest_user";

    const logsRef = collection(db, "users", userId, "logs");
    const today = new Date().toISOString().split('T')[0];
    
    const data = {
      date: today,
      content: content,
      category: category,
      createdAt: serverTimestamp(),
    };

    addDoc(logsRef, data)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: logsRef.path,
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content: input,
      category: selectedCategory 
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    const currentCategory = selectedCategory;
    
    setInput("");
    setIsLoading(true);

    try {
      saveLogToFirestore(currentInput, currentCategory);
      
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { 
            id: (Date.now() + 1).toString(), 
            role: "assistant", 
            content: `${CATEGORIES.find(c => c.id === currentCategory)?.label} kategorisine notun başarıyla kaydedildi!` 
          },
        ]);
        setIsLoading(false);
      }, 400);

    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] border-none shadow-xl overflow-hidden bg-white">
      <div className="p-4 border-b flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-700">Faaliyet Girişi</h3>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
               Kategorize Edilmiş Kayıt
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4" ref={scrollRef}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex w-fit max-w-[90%] flex-col gap-1.5 rounded-2xl px-4 py-3 text-sm transition-all animate-in fade-in slide-in-from-bottom-2 shadow-sm",
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                  : "mr-auto bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200"
              )}
            >
              {m.category && (
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-70 mb-0.5">
                  {CATEGORIES.find(c => c.id === m.category)?.label}
                </span>
              )}
              <p className="leading-relaxed break-words">{m.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="bg-slate-100 border border-slate-200 w-fit rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span className="text-xs text-slate-500 font-medium italic">Senkronize ediliyor...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-slate-50/50 space-y-3">
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] rounded-xl bg-white border-slate-200 text-xs font-bold">
              <SelectValue placeholder="Kategori Seç" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <cat.icon className={cn("w-3.5 h-3.5", cat.color)} />
                    {cat.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Ne yaptığını yaz..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-white border-slate-200 focus:ring-primary shadow-sm"
          />
          <Button size="icon" type="submit" disabled={isLoading || !input.trim()} className="rounded-xl shrink-0 shadow-lg shadow-primary/20">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
