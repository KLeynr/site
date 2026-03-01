"use client";

import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

interface ScoreData {
  time: string;
  score: number;
}

interface ScoreChartProps {
  data: ScoreData[];
}

const chartConfig = {
  score: {
    label: "Dopamin Skoru",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function ScoreChart({ data }: ScoreChartProps) {
  return (
    <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
      <CardHeader className="px-8 py-6 border-b border-slate-50">
        <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Dopamin Gelişim Trendi (Dakika Dakika)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="h-[400px] w-full">
          {data && data.length > 0 ? (
            <ChartContainer config={chartConfig}>
              <AreaChart
                data={data}
                margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
              >
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                  dy={15}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                  dx={-10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={6}
                  dot={{ 
                    r: 8, 
                    fill: "hsl(var(--primary))", 
                    strokeWidth: 3, 
                    stroke: "#fff",
                    fillOpacity: 1
                  }}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 font-medium italic gap-4">
              <TrendingUp className="w-12 h-12 text-slate-200" />
              <p>Geçmiş veri toplanıyor... Analizi başlatın.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}