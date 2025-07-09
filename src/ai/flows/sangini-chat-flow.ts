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

const MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2";
const API_URL = `https://api-inference.huggingface.co/models/${MODEL_ID}`;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    
    const persona = "You are Sangini, a friendly, caring, and empowering safety companion for women. Your tone should always be supportive and helpful. Keep your answers concise and to the point.";

    let fullPrompt = `[INST] ${persona} [/INST]\n`;
    history.forEach(msg => {
        fullPrompt += msg.role === 'user' ? `[INST] ${msg.content} [/INST]\n` : `${msg.content}\n`;
    });
    fullPrompt += `[INST] ${prompt} [/INST]`;

    const fetchOptions = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            inputs: fullPrompt,
            parameters: {
                return_full_text: false,
                max_new_tokens: 250,
                temperature: 0.7,
                top_p: 0.95,
                do_sample: true,
            }
        }),
    };

    try {
        // Attempt 1
        let response = await fetch(API_URL, fetchOptions);
        let result;

        // Check for the specific "model loading" error (status 503)
        if (response.status === 503) {
            result = await response.json();
            if (result.error?.includes("is currently loading")) {
                const waitTime = (result.estimated_time || 20) * 1000;
                console.log(`Hugging Face model is loading. Retrying in ${waitTime / 1000}s...`);
                await sleep(waitTime);
                
                // Attempt 2
                response = await fetch(API_URL, fetchOptions);
            }
        }
        
        // Process the final response (from attempt 1 or 2)
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Hugging Face API Error:", errorText);
            // Try to parse as JSON for a more detailed error message
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(`The AI model failed to respond. Status: ${response.status}. Details: ${errorJson.error || errorText}`);
            } catch {
                throw new Error(`The AI model failed to respond. Status: ${response.status}. Details: ${errorText}`);
            }
        }
        
        result = await response.json();

        if (Array.isArray(result) && result[0]?.generated_text) {
            return result[0].generated_text.trim();
        } else if (result.error) {
            throw new Error(`Hugging Face returned an error: ${result.error}`);
        } else {
            console.error("Unexpected Hugging Face response format:", result);
            throw new Error("Received an unexpected response format from the AI model.");
        }

    } catch (error: any) {
        console.error("Failed to execute sanginiChatFlow:", error);
        // Re-throw the error with a clear message for the UI to display
        throw new Error(error.message || "An unexpected error occurred while communicating with the AI model.");
    }
  }
);

export async function askSangini(input: SanginiChatInput): Promise<string> {
    try {
        return await sanginiChatFlow(input);
    } catch (e: any) {
        // Re-throw the caught error so the UI layer can display the specific message.
        throw e;
    }
}
