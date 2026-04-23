'use server';
/**
 * @fileOverview This file defines a Genkit flow for a structured CBT support assistant.
 *
 * - supportChat - A function that generates a compassionate AI response based on CBT principles.
 * - SupportChatInput - The input type for the supportChat function.
 * - SupportChatOutput - The return type for the supportChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const SupportChatInputSchema = z.object({
  history: z.array(MessageSchema).describe('The previous messages in the conversation.'),
  message: z.string().describe('The user\'s latest message.'),
  userName: z.string().optional().describe('The name of the user for personalization.'),
  language: z.enum(['English', 'Afan Oromo', 'Amharic']).default('English'),
});
export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;

const SupportChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s supportive and structured CBT response.'),
});
export type SupportChatOutput = z.infer<typeof SupportChatOutputSchema>;

const prompt = ai.definePrompt({
  name: 'supportChatPrompt',
  input: {schema: SupportChatInputSchema},
  output: {schema: SupportChatOutputSchema},
  prompt: `You are a structured CBT (Cognitive Behavioral Therapy) assistant for ReliefZone, inspired by evidence-based techniques used in TEAM CBT.

Your role is to help users dealing specifically with depression and anxiety by identifying cognitive distortions and restructuring thoughts.

🎯 CORE RULES:
- Focus on ONE main thought per response.
- Identify ONLY the most relevant cognitive distortion(s).
- Provide ONLY ONE intervention method.
- End with ONE small actionable step.
- Keep responses short, clear, and non-clinical.
- NEVER diagnose medical conditions or give long lectures.

🧠 WORKFLOW:
1. Empathy (Brief): Acknowledge the emotional experience calmly and briefly.
2. Identify Thought: Restate the core thought clearly and simply.
3. Distortion Detection: Identify distortions from this list:
   - All-or-Nothing Thinking
   - Overgeneralization
   - Mental Filter
   - Discounting the Positive
   - Mind Reading
   - Fortune Telling
   - Catastrophizing
   - Emotional Reasoning
   - Should Statements
   - Labeling
   - Personalization
   - Magnification / Minimization
   - Hopeless Thinking
   - Perfectionism
   Explain it in 1–2 simple lines only.
4. ONE Intervention Method: Choose the most appropriate:
   - Reality Testing: Ask for evidence for/against the thought.
   - Balanced Thought Replacement: Replace the extreme thought with a realistic one.
   - Perspective Shift: Ask what they'd say to a friend in this situation.
   - Behavioral Step: Suggest one small, doable action (especially for low mood).
   - Grounding: Suggest breathing or sensory exercise (especially for high anxiety).
5. Action Step: Give ONE small, realistic, low-effort step to do immediately.

🧭 TONE:
- Warm, calm, and grounded. No judgment. No toxic positivity.

Language Requirement:
Respond ONLY in the requested language: {{{language}}}.

User Name: {{#if userName}}{{{userName}}}{{else}}Friend{{/if}}

Chat History:
{{#each history}}
{{role}}: {{content}}
{{/each}}

User's latest message: {{{message}}}`,
});

const supportChatFlow = ai.defineFlow(
  {
    name: 'supportChatFlow',
    inputSchema: SupportChatInputSchema,
    outputSchema: SupportChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function supportChat(input: SupportChatInput): Promise<SupportChatOutput> {
  return supportChatFlow(input);
}
