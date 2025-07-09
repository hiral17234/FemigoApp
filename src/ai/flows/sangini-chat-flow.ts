
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
        try {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_KEY;

            if (!apiKey || apiKey.includes('YOUR_')) {
                console.error("Google AI API key is missing or not configured.");
                return "I'm sorry, I cannot connect to the AI service. The API key is missing from the application's configuration.";
            }
            
            const history: Message[] = [...input.history, { role: 'user', content: input.message }];

            const response = await ai.generate({
                model: 'googleai/gemini-pro',
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

            const text = response.text;
            if (!text) {
                // This case handles when the model returns a response, but it's empty (often due to safety filters).
                return "I'm sorry, I couldn't generate a response. This might be due to a safety filter. Please try rephrasing your message.";
            }

            return text;

        } catch (error: any) {
            console.error(`CRITICAL ERROR in sanginiChatFlow:`, error);
            const errorMessage = (error.message || 'Unknown error').toLowerCase();
            const errorDetails = error.details ? JSON.stringify(error.details) : '';

            // Check for specific error messages that indicate configuration issues.
            if (errorMessage.includes('api key not valid') || errorMessage.includes('permission denied')) {
                return "There seems to be an issue with the API key. It might be invalid or lack the necessary permissions. Please check the key and your Google Cloud project settings.";
            }
            if (errorMessage.includes('api not enabled') || errorMessage.includes('method not found')) {
                return "The Vertex AI API is not enabled for your project. Please go to the Google Cloud Console, search for 'Vertex AI API', and enable it.";
            }
            if (errorMessage.includes('billing') || errorDetails.includes('billing')) {
                 return "The Google Cloud project associated with this app does not have billing enabled. Please go to the Google Cloud Console, find 'Billing', and ensure your project is linked to a billing account.";
            }
            
            // Generic fallback message
            return `I'm sorry, a server error occurred. Please report this to your developer. [Error: ${error.message}]`;
        }
    }
);

export async function sanginiChat(input: SanginiChatInput): Promise<string> {
    return sanginiChatFlow(input);
}
