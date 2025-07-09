
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
  // Check for the API key before making a call.
  if (!process.env.NEXT_PUBLIC_GOOGLE_AI_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_KEY.includes('YOUR_')) {
    console.error("Google AI API key is missing. Please add it to your .env file as NEXT_PUBLIC_GOOGLE_AI_KEY.");
    return "I'm sorry, I cannot connect to the AI service right now. The application's AI capabilities are not configured correctly. An API key is required.";
  }
  
  const history: Message[] = [...input.history, { role: 'user', content: input.message }];

  const response = await ai.generate({
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
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
            },
        ],
    }
  });

  return response.text ?? "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
}
