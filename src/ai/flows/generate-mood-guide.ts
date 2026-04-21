'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a daily mood guide.
 *
 * - generateMoodGuide - A function that generates a supportive message and practical suggestions based on a user's selected mood.
 * - GenerateMoodGuideInput - The input type for the generateMoodGuide function.
 * - GenerateMoodGuideOutput - The return type for the generateMoodGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMoodGuideInputSchema = z.object({
  mood: z
    .enum(['Happy', 'Calm', 'Stressed', 'Sad', 'Angry', 'Motivated', 'Tired'])
    .describe('The user\u0027s selected mood.'),
});
export type GenerateMoodGuideInput = z.infer<typeof GenerateMoodGuideInputSchema>;

const GenerateMoodGuideOutputSchema = z.object({
  supportiveMessage: z.string().describe('A short, supportive message relevant to the mood.'),
  suggestions: z
    .array(z.string())
    .describe('One to two practical suggestions for the user, relevant to the mood. Ensure variety and personalization, avoiding repetition.'),
});
export type GenerateMoodGuideOutput = z.infer<typeof GenerateMoodGuideOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateMoodGuidePrompt',
  input: {schema: GenerateMoodGuideInputSchema},
  output: {schema: GenerateMoodGuideOutputSchema},
  prompt: `You are a compassionate and helpful AI assistant designed to provide daily mood guidance for a mental wellness app called DailyPulse.

Based on the user's selected mood, provide a short, supportive message and one to two practical, personalized suggestions. The suggestions should be actionable and relevant to the mood. Ensure the messages and suggestions feel fresh and non-repetitive over time.

Mood: {{{mood}}}`,
});

const generateMoodGuideFlow = ai.defineFlow(
  {
    name: 'generateMoodGuideFlow',
    inputSchema: GenerateMoodGuideInputSchema,
    outputSchema: GenerateMoodGuideOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateMoodGuide(input: GenerateMoodGuideInput): Promise<GenerateMoodGuideOutput> {
  return generateMoodGuideFlow(input);
}
