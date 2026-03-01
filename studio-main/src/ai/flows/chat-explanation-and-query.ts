'use server';
/**
 * @fileOverview A Genkit flow for the Dopamine Check AI chat interface, allowing users to ask questions about their dopamine scores, activity analyses, or personalized recommendations.
 *
 * - chatExplanationAndQuery - A function that handles the chat query process.
 * - ChatExplanationAndQueryInput - The input type for the chatExplanationAndQuery function.
 * - ChatExplanationAndQueryOutput - The return type for the chatExplanationAndQuery function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatExplanationAndQueryInputSchema = z.object({
  query: z.string().describe("The user's question about their dopamine scores, activity analyses, or personalized recommendations."),
  dopamineScore: z.number().optional().describe("The user's current dopamine score, if available."),
  activityAnalysis: z.string().optional().describe("A summary of the user's activity analysis, if available."),
  recommendations: z.string().optional().describe("The personalized recommendations provided to the user, if available."),
});
export type ChatExplanationAndQueryInput = z.infer<typeof ChatExplanationAndQueryInputSchema>;

const ChatExplanationAndQueryOutputSchema = z.object({
  response: z.string().describe("The AI's explanation or answer to the user's question."),
});
export type ChatExplanationAndQueryOutput = z.infer<typeof ChatExplanationAndQueryOutputSchema>;

export async function chatExplanationAndQuery(input: ChatExplanationAndQueryInput): Promise<ChatExplanationAndQueryOutput> {
  return chatExplanationAndQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatExplanationAndQueryPrompt',
  input: { schema: ChatExplanationAndQueryInputSchema },
  output: { schema: ChatExplanationAndQueryOutputSchema },
  prompt: `You are Dopamine Check AI, an AI assistant focused on helping users understand their dopamine levels, activity impacts, and personalized recommendations.
Answer the user's question concisely and helpfully.

If provided, consider the following context:
{{#if dopamineScore}}
Dopamine Score: {{{dopamineScore}}}
{{/if}}
{{#if activityAnalysis}}
Activity Analysis: {{{activityAnalysis}}}
{{/if}}
{{#if recommendations}}
Recommendations: {{{recommendations}}}
{{/if}}

User question: {{{query}}}`,
});

const chatExplanationAndQueryFlow = ai.defineFlow(
  {
    name: 'chatExplanationAndQueryFlow',
    inputSchema: ChatExplanationAndQueryInputSchema,
    outputSchema: ChatExplanationAndQueryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
