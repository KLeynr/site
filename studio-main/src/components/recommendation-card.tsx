"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Loader2, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generatePersonalizedRecommendations } from "@/ai/flows/generate-personalized-recommendations";

interface RecommendationCardProps {
  score: number;
  activities: string;
}

export function RecommendationCard({ score, activities }: RecommendationCardProps) {
  const [recommendations, setRecommendations] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getRecommendations() {
      if (!activities) return;
      setLoading(true);
      try {
        const result = await generatePersonalizedRecommendations({
          dopamineScore: score,
          analyzedActivities: activities,
        });
        setRecommendations(result.recommendations);
      } catch (error) {
        console.error("Recommendations error", error);
      } finally {
        setLoading(false);
      }
    }
    getRecommendations();
  }, [score, activities]);

  if (!activities && !loading) return null;

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white to-accent/5 overflow-hidden group">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <CardTitle className="text-base font-bold text-slate-800">Dopamine Check AI Tavsiyeleri</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground italic">Size özel denge planı oluşturuluyor...</p>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-accent/10 shadow-sm relative overflow-hidden">
                <div className="flex gap-3 items-start">
                   <div className="mt-1">
                      <Lightbulb className="w-4 h-4 text-accent" />
                   </div>
                   <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                    {recommendations}
                   </div>
                </div>
                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Sparkles className="w-12 h-12 text-accent" />
                </div>
             </div>
             
             <button className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-2">
               Gelişim Planını Gör <ArrowRight className="w-3 h-3" />
             </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
