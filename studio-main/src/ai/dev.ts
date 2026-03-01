import { config } from 'dotenv';
config();

import '@/ai/flows/generate-personalized-recommendations.ts';
import '@/ai/flows/chat-activity-input.ts';
import '@/ai/flows/chat-explanation-and-query.ts';
import '@/ai/flows/analyze-and-score-activities.ts';