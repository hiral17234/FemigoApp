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
  async ({ prompt }) => {
    // DEMO MODE to unblock hackathon while Google account is under review.
    // This simulates a real AI response instantly.
    console.log("Sangini Chat in DEMO MODE");

    // A small delay to simulate the AI "thinking"
    await new Promise(resolve => setTimeout(resolve, 750));

    const lowerCasePrompt = prompt.toLowerCase();

    if (lowerCasePrompt.includes('hello') || lowerCasePrompt.includes('hi')) {
        return "Hello there! I'm Sangini, your personal safety companion. How can I empower you today?";
    }
    if (lowerCasePrompt.includes('help') || lowerCasePrompt.includes('sos')) {
        return "If this is an emergency, please use the SOS button on the dashboard to contact authorities or your trusted contacts immediately. For safety tips or a friendly chat, just ask!";
    }
    if (lowerCasePrompt.includes('safety tips')) {
        return "Of course! A great safety tip is to always be aware of your surroundings. Avoid walking alone at night if possible, and always let someone know your route and estimated arrival time. Stay strong and stay safe!";
    }
     if (lowerCasePrompt.includes('thank')) {
        return "You're very welcome! I'm always here if you need me. Stay safe!";
    }

    // Default response
    return "That's a great question. As your safety companion, I'm here to support you. Remember to always trust your instincts and prioritize your well-being.";
  }
);

export async function askSangini(input: SanginiChatInput): Promise<string> {
    // In demo mode, we can bypass the complex try/catch since it's a direct, reliable call.
    return sanginiChatFlow(input);
}
