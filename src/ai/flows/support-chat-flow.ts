
'use server';
/**
 * @fileOverview This file defines a Genkit flow for a supportive mental wellness chatbot.
 *
 * - supportChat - A function that generates a compassionate AI response based on chat history.
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
  response: z.string().describe('The AI\'s supportive and compassionate response.'),
});
export type SupportChatOutput = z.infer<typeof SupportChatOutputSchema>;

const prompt = ai.definePrompt({
  name: 'supportChatPrompt',
  input: {schema: SupportChatInputSchema},
  output: {schema: SupportChatOutputSchema},
  prompt: `You are a compassionate, empathetic, and supportive AI assistant for ReliefZone, a mental wellness app. Your role is to help users dealing specifically with depression and anxiety by identifying cognitive distortions and guiding them to respond using simple, practical methods.

Follow these instructions strictly for every response:

1. Start with empathy: Acknowledge the user's feeling in a calm, human way. Be warm and respectful.
2. Identify the core thought: Briefly restate what the user is thinking or feeling.
3. Detect cognitive distortion(s): If applicable, identify distortions from this list:
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
   - Magnification/Minimization
   - Hopeless Thinking
   - Intolerance of Uncertainty
   - Perfectionism
4. Explain the distortion: Gently explain it in 1–2 simple lines.
5. Apply ONE practical method:
   - Ask a reframing question
   - Offer a balanced alternative thought
   - Suggest a small behavioral step
   - Suggest grounding or breathing (if anxiety is high)
6. Keep it short, supportive, and actionable. Avoid clinical jargon or toxic positivity.
7. End with a gentle next step or check-in.

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
