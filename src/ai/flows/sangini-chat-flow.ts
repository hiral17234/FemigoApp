
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
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_KEY;

        if (!apiKey || apiKey.includes('YOUR_')) {
            console.error("Google AI API key is missing or not configured. Please add it to your .env file as NEXT_PUBLIC_GOOGLE_AI_KEY.");
            return "I'm sorry, I cannot connect to the AI service right now. The application's AI capabilities are not configured correctly. An API key is required.";
        }
        
        const history: Message[] = [...input.history, { role: 'user', content: input.message }];

        const maxRetries = 3;
        const initialDelay = 1000; // 1 second

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Using the stable gemini-pro model for reliability
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
                return response.text ?? "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
            } catch (error: any) {
                console.error(`Sangini chat attempt ${attempt} failed:`, error.message);
                
                const errorMessage = error.message || '';
                
                // Check for critical, non-retriable errors first.
                if (errorMessage.toLowerCase().includes('api not enabled') || errorMessage.toLowerCase().includes('permission denied')) {
                    return "The AI service is not enabled for this project. Please enable the 'Vertex AI API' in your Google Cloud Console and try again.";
                }

                // Check for retriable errors.
                const isRetriable = errorMessage.includes('503') || errorMessage.toLowerCase().includes('service unavailable') || errorMessage.toLowerCase().includes('overloaded');
                if (isRetriable && attempt < maxRetries) {
                    const delay = initialDelay * Math.pow(2, attempt - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue; // Retry
                }

                // Last attempt failed or it's a non-retriable error.
                return "I'm sorry, I'm having trouble connecting to the AI service right now. This could be due to a network issue or a problem with the AI provider. Please try again in a few moments.";
            }
        }
        
        // This fallback should rarely be reached.
        return "I'm sorry, I could not connect to the AI service after multiple attempts. Please try again later.";
    }
);


export async function sanginiChat(input: SanginiChatInput): Promise<string> {
    return sanginiChatFlow(input);
}
