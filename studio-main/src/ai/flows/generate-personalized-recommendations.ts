'use server';
/**
 * @fileOverview A Genkit flow for generating personalized recommendations based on dopamine impact score and analyzed activities.
 *
 * - generatePersonalizedRecommendations - A function that handles the generation of personalized recommendations.
 * - GeneratePersonalizedRecommendationsInput - The input type for the generatePersonalizedRecommendations function.
 * - GeneratePersonalizedRecommendationsOutput - The return type for the generatePersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedRecommendationsInputSchema = z.object({
  dopamineScore: z.number().describe('The current dopamine impact score of the user.'),
  analyzedActivities: z
    .string()
    .describe('A summary of the user\'s analyzed activities that contributed to the dopamine score.'),
});
export type GeneratePersonalizedRecommendationsInput = z.infer<
  typeof GeneratePersonalizedRecommendationsInputSchema
>;

const GeneratePersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('Personalized recommendations for activities or behavioral changes to improve dopamine balance and mental well-being.'),
});
export type GeneratePersonalizedRecommendationsOutput = z.infer<
  typeof GeneratePersonalizedRecommendationsOutputSchema
>;

export async function generatePersonalizedRecommendations(
  input: GeneratePersonalizedRecommendationsInput
): Promise<GeneratePersonalizedRecommendationsOutput> {
  return generatePersonalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedRecommendationsPrompt',
  input: {schema: GeneratePersonalizedRecommendationsInputSchema},
  output: {schema: GeneratePersonalizedRecommendationsOutputSchema},
  prompt: `You are Dopamine Check AI, an expert in dopamine balance and mental well-being.

Based on the user's dopamine impact score and their analyzed daily activities, provide personalized, actionable recommendations for activities or behavioral changes.
Your goal is to help the user improve their dopamine balance and overall mental well-being.

The recommendations should be encouraging, realistic, and tailored to the provided context.
Consider both reducing activities that might excessively stimulate dopamine and increasing activities that promote healthy dopamine regulation.

User's Dopamine Score: {{{dopamineScore}}}
Analyzed Activities: {{{analyzedActivities}}}

Please provide specific recommendations in a clear and concise manner.`,
});

const generatePersonalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedRecommendationsFlow',
    inputSchema: GeneratePersonalizedRecommendationsInputSchema,
    outputSchema: GeneratePersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
