
'use server';
/**
 * @fileOverview A friendly AI chat assistant named Sangini, connected to Hugging Face.
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

// The model we'll use from Hugging Face
const MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2";
const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;

const sanginiChatFlow = ai.defineFlow(
  {
    name: 'sanginiChatFlow',
    inputSchema: SanginiChatInputSchema,
    outputSchema: z.string(),
  },
  async ({ history, prompt }) => {
    const HUGGINGFACE_API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

    if (!HUGGINGFACE_API_KEY || HUGGINGFACE_API_KEY.includes('YOUR_')) {
        console.error("Hugging Face API Key is not configured.");
        throw new Error("The Hugging Face API Key is missing. Please add it to your .env file to use the AI assistant.");
    }
    
    // Define the persona for the AI model
    const persona = "You are Sangini, a friendly, caring, and empowering safety companion for women. Your tone should always be supportive and helpful. Keep your answers concise and to the point.";

    // Format the conversation history and the new prompt according to Mistral's instruction format.
    let fullPrompt = `[INST] ${persona} [/INST]\n`;
    history.forEach(msg => {
        if (msg.role === 'user') {
            fullPrompt += `[INST] ${msg.content} [/INST]\n`;
        } else {
            fullPrompt += `${msg.content}\n`;
        }
    });
    fullPrompt += `[INST] ${prompt} [/INST]`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: fullPrompt,
                parameters: {
                    return_full_text: false, // We only want the AI's response
                    max_new_tokens: 250,    // Limit response length
                    temperature: 0.7,       // Control randomness
                    top_p: 0.95,
                    do_sample: true,
                }
            }),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error("Hugging Face API Error:", errorDetails);
            throw new Error(`Failed to get a response from the AI model. Status: ${response.status}.`);
        }

        const result = await response.json();
        
        if (result && Array.isArray(result) && result[0] && result[0].generated_text) {
            return result[0].generated_text.trim();
        } else if (result.error) {
            // Handle specific errors like the model loading
            if (result.error.includes("is currently loading")) {
                const estimatedTime = result.estimated_time || 20;
                throw new Error(`The AI model is starting up. Please wait about ${Math.ceil(estimatedTime)} seconds and try again.`);
            }
            throw new Error(`Hugging Face Error: ${result.error}`);
        } else {
            throw new Error("Received an unexpected response format from the AI model.");
        }

    } catch (e: any) {
        console.error("Failed to call Hugging Face API", e);
        // Re-throw the error with a clear message for the UI to display
        throw new Error(e.message || "An unexpected error occurred while communicating with the AI model.");
    }
  }
);

export async function askSangini(input: SanginiChatInput): Promise<string> {
    try {
        return await sanginiChatFlow(input);
    } catch(e: any) {
        // Re-throw the caught error so the UI layer can display the specific message.
        throw e;
    }
}
