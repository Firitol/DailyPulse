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
  prompt: `You are a compassionate, empathetic, and supportive AI assistant for DailyPulse, a mental wellness app.
Your goal is to listen to the user, validate their feelings, and provide gentle, actionable wellness advice. 

Guidelines:
1. Be a supportive listener. Use phrases like "I hear you," "That sounds difficult," or "I'm here for you."
2. Keep responses concise but warm.
3. If the user mentions self-harm or severe crisis, gently suggest they contact professional emergency services or speak to their assigned doctor in the app.
4. Avoid clinical diagnoses.
5. Personalize the response if the userName is provided: {{{userName}}}.
6. Respond ONLY in the requested language: {{{language}}}.

Chat History:
{{#each history}}
{{role}}: {{content}}
{{/each}}

User: {{{message}}}`,
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
