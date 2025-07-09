
'use server';
/**
 * @fileOverview A conversational AI flow for the Sangini assistant.
 *
 * - sanginiChat - A function that handles the chat conversation.
 * - SanginiChatInput - The input type for the sanginiChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {Message} from 'genkit/model';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const SanginiChatInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  message: z.string().describe('The latest user message.'),
});
export type SanginiChatInput = z.infer<typeof SanginiChatInputSchema>;


export async function sanginiChat(input: SanginiChatInput): Promise<string> {
  const history: Message[] = [...input.history, { role: 'user', content: input.message }];

  const { output } = await ai.generate({
    model: 'googleai/gemini-1.5-flash',
    history: history,
    system: `You are Sangini, an AI assistant for the Femigo app. Femigo is a platform dedicated to women's safety, empowerment, and community.
Your personality is friendly, empathetic, supportive, and empowering. You are a good listener and provide helpful, non-judgmental advice.
Your name, Sangini, means 'female companion' or 'friend' in Hindi. Always embody this meaning.
Keep your responses concise and easy to read on a mobile screen. Use emojis where appropriate to convey warmth and friendliness.
Do not provide medical, legal, or financial advice. Instead, suggest the user consult with a professional.
Your goal is to be a trusted digital companion for the user.`,
    config: {
        temperature: 0.7,
    }
  });

  return output?.text ?? "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
}

