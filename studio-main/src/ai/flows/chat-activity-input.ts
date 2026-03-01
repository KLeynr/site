'use server';
/**
 * @fileOverview A Genkit flow to parse natural language daily activity descriptions into a structured format.
 *
 * - chatActivityInput - A function that handles the parsing of daily activities.
 * - ChatActivityInput - The input type for the chatActivityInput function.
 * - ChatActivityOutput - The return type for the chatActivityInput function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatActivityInputSchema = z.object({
  description: z.string().describe('A natural language description of daily activities.'),
});
export type ChatActivityInput = z.infer<typeof ChatActivityInputSchema>;

const ActivityCategorySchema = z.enum([
  'social_media',
  'exercise',
  'work',
  'study',
  'relaxation',
  'social_interaction',
  'entertainment',
  'chores',
  'sleep',
  'other',
]);

const ActivitySchema = z.object({
  description: z.string().describe('A brief summary of the activity.'),
  category: ActivityCategorySchema.describe(
    'The categorized type of activity (e.g., social_media, exercise, work, study, relaxation, social_interaction, entertainment, chores, sleep, other).'
  ),
  durationMinutes: z
    .number()
    .optional()
    .describe('Estimated duration of the activity in minutes. If unknown, omit.'),
});

const ChatActivityOutputSchema = z.object({
  activities: z.array(ActivitySchema).describe('A list of parsed activities with their categories and estimated durations.'),
});
export type ChatActivityOutput = z.infer<typeof ChatActivityOutputSchema>;

export async function chatActivityInput(input: ChatActivityInput): Promise<ChatActivityOutput> {
  return chatActivityInputFlow(input);
}

const parseActivitiesPrompt = ai.definePrompt({
  name: 'parseActivitiesPrompt',
  input: { schema: ChatActivityInputSchema },
  output: { schema: ChatActivityOutputSchema },
  prompt: `You are an AI assistant designed to parse a user's daily activities from a natural language description.
Your goal is to extract individual activities, categorize them from a predefined list, and estimate their duration in minutes if possible.

Here are the allowed categories for activities: ${ActivityCategorySchema.options.join(', ')}

User's daily activities description:
{{{description}}}

Please respond with a JSON array of objects, where each object represents an activity and has the following structure:
- description: A brief summary of the activity.
- category: The categorized type of activity from the allowed list.
- durationMinutes: (Optional) Estimated duration in minutes. Only include if you can reasonably infer it from the description.

Example Output:
{{"activities": [
  {"description": "Scrolled Instagram for an hour", "category": "social_media", "durationMinutes": 60},
  {"description": "Worked on project report", "category": "work", "durationMinutes": 180},
  {"description": "Watched a movie with friends", "category": "entertainment", "durationMinutes": 120}
]}}`,
});

const chatActivityInputFlow = ai.defineFlow(
  {
    name: 'chatActivityInputFlow',
    inputSchema: ChatActivityInputSchema,
    outputSchema: ChatActivityOutputSchema,
  },
  async (input) => {
    const { output } = await parseActivitiesPrompt(input);
    if (!output) {
      throw new Error('Failed to parse activities.');
    }
    return output;
  }
);
