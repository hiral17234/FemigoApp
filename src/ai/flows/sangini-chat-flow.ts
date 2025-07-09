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
    } catch(e: any) {
        console.error("Sangini chat flow failed. Full error:", e);
        
        let friendlyMessage = "I'm sorry, I'm having a little trouble connecting right now. Please try again in a moment.";

        const errorMessage = e.message || 'An unknown error occurred.';

        // Provide specific, actionable feedback based on common Google Cloud errors.
        if (errorMessage.includes('API key not valid')) {
            friendlyMessage = "Connection Error: Your Google AI API Key is not valid. Please check the key in your .env file.";
        } else if (errorMessage.includes('permission denied') || errorMessage.includes('IAM') || (e.cause as any)?.status === 403) {
            friendlyMessage = "Connection Error: The request was denied due to a permission issue. Please ensure the Vertex AI API is enabled in your Google Cloud project and that your account has the 'Vertex AI User' role.";
        } else if (errorMessage.includes('billing')) {
            friendlyMessage = "Connection Error: There is a problem with your Google Cloud project's billing. Please ensure your project is linked to an active and verified billing account.";
        } else {
            // For any other error, return the raw message for direct debugging.
            friendlyMessage = `An unexpected error occurred. \n\n**Debug Info:**\n \`\`\`\n${errorMessage}\n\`\`\``;
        }

        return friendlyMessage;
    }
}
