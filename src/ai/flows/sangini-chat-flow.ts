
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


const sanginiChatFlow = ai.defineFlow(
    {
        name: 'sanginiChatFlow',
        inputSchema: SanginiChatInputSchema,
        outputSchema: z.string(),
    },
    async (input) => {
        // DEMO MODE: Bypass live AI call and return a helpful message.
        console.log("Sangini Chat in DEMO MODE");
        
        const isFirstMessage = input.history.length === 0;

        if (isFirstMessage) {
            return "Hi there! I'm Sangini. The live AI connection is pending verification, but you can fully test the chat interface. Try sending a message! 😊";
        }
        
        return `Thanks for your message! This is a demo response. Once the cloud account is verified, I'll be able to have a full conversation. For now, feel free to keep testing the UI.`;
    }
);

export async function sanginiChat(input: SanginiChatInput): Promise<string> {
    return sanginiChatFlow(input);
}
