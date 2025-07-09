'use server';
/**
 * @fileOverview A friendly AI chat assistant named Sangini.
 *
 * - askSangini - The main function to interact with the assistant.
 * - SanginiChatInput - The input type for the chat flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const SanginiChatInputSchema = z.object({
  history: z.array(MessageSchema),
  prompt: z.string().describe('The latest message from the user.'),
});
export type SanginiChatInput = z.infer<typeof SanginiChatInputSchema>;

const sanginiChatFlow = ai.defineFlow(
  {
    name: 'sanginiChatFlow',
    inputSchema: SanginiChatInputSchema,
    outputSchema: z.string(),
  },
  async ({ history, prompt }) => {
    const systemInstruction = `You are Sangini, a friendly, helpful, and empowering AI assistant for the Femigo women's safety app. Your primary goal is to provide support, safety tips, and positive encouragement. Always be warm and empathetic. Keep your answers concise and easy to understand. Your responses should feel like talking to a trusted friend. Do not use markdown formatting.`;

    const fullHistory = [
      { role: 'user' as const, content: systemInstruction },
      { role: 'model' as const, content: 'Understood. I am Sangini, ready to help.' },
      ...history,
    ];

    const llm = ai.getGenerator('googleai/gemini-pro');

    const result = await llm.generate({
      prompt: prompt,
      history: fullHistory,
      config: {
        temperature: 0.7,
      },
    });

    return result.text;
  }
);

export async function askSangini(input: SanginiChatInput): Promise<string> {
    try {
        return await sanginiChatFlow(input);
    } catch(e) {
        console.error("Sangini chat flow failed", e);
        return "I'm sorry, I'm having a little trouble connecting right now. Please try again in a moment.";
    }
}
