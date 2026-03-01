'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeActivitiesInputSchema = z.object({
  activities: z.string().describe('Daily activity log.'),
});

const AnalyzeActivitiesOutputSchema = z.object({
  total_score: z.number().int().min(0).max(100),
  neuro_status: z.string().describe('Status in Turkish (e.g. Stabil, Hassas, Optimize)'),
  risk_factor: z.string().describe('Risk factor in Turkish (e.g. Düşük, Orta, Yüksek)'),
  prediction: z.string().describe('Prediction for tomorrow in Turkish'),
  dominant_trend: z.string().describe('Category identifier (physical, social, nutrition, screen_time, sleep)'),
  advice: z.string().describe('Coaching advice in Turkish'),
});

export async function analyzeAndScoreActivities(input: z.infer<typeof AnalyzeActivitiesInputSchema>) {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: `Sen uzman bir nöro-psikoloji asistanısın. Kullanıcının günlük faaliyetlerini analiz edip dopamin dengesini raporlayacaksın.
    
    Analiz Kuralları:
    1. total_score: 0-100 arası bir dopamin denge puanı ver.
    2. neuro_status: 'Stabil', 'Hassas', 'Optimize', 'Düşük' gibi terimler kullan.
    3. risk_factor: 'Düşük Risk', 'Orta Risk', 'Yüksek Risk' gibi ifadeler kullan.
    4. dominant_trend: Sadece şu kategorilerden birini seç: physical, social, nutrition, screen_time, sleep.
    5. advice: Maksimum 2 cümlelik, motive edici bir nöro-koç tavsiyesi ver.
    6. prediction: Yarın kullanıcının zihinsel durumunun nasıl olacağına dair kısa bir tahmin yap.

    Faaliyetler: ${input.activities}`,
    output: { schema: AnalyzeActivitiesOutputSchema }
  });
  return output!;
}