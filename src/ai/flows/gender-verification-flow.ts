
'use server';
/**
 * @fileOverview A simple AI agent to verify if a user appears to be female from a photo.
 *
 * - verifyUserIsFemale - A function that handles the gender verification.
 * - GenderVerificationInput - The input type for the function.
 * - GenderVerificationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenderVerificationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A live photo of the user's face, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenderVerificationInput = z.infer<typeof GenderVerificationInputSchema>;

const GenderVerificationOutputSchema = z.object({
  isFemale: z.boolean().describe('Whether the person in the photo appears to be female.'),
  reason: z.string().describe('A brief, neutral explanation for the decision. e.g., "The user in the photo appears to be female.", "The user in the photo does not appear to be female.", "Could not determine from the photo."'),
});
export type GenderVerificationOutput = z.infer<typeof GenderVerificationOutputSchema>;

export async function verifyUserIsFemale(input: GenderVerificationInput): Promise<GenderVerificationOutput> {
  return genderVerificationFlow(input);
}

const genderVerificationPrompt = ai.definePrompt({
  name: 'genderVerificationPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenderVerificationInputSchema},
  output: {schema: GenderVerificationOutputSchema},
  prompt: `You are a verification system for a women's empowerment platform. Your task is to analyze the user's live photo and determine if the person appears to be female.
  
  **Rules:**
  1.  Analyze the image provided: {{media url=photoDataUri}}
  2.  Set \`isFemale\` to \`true\` if the person appears to be female.
  3.  Set \`isFemale\` to \`false\` if the person does not appear to be female or if you cannot determine.
  4.  Provide a simple, non-judgmental reason for your decision.
  
  This is a critical step for our platform's safety policy. Be accurate and objective.`
});

const genderVerificationFlow = ai.defineFlow(
  {
    name: 'genderVerificationFlow',
    inputSchema: GenderVerificationInputSchema,
    outputSchema: GenderVerificationOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await genderVerificationPrompt(input);
      if (!output) {
        throw new Error('AI model was unable to process the image.');
      }
      return output;
    } catch (e: any) {
      console.error("Error in genderVerificationFlow:", e);
      if (e.message && e.message.includes('429')) {
        throw new Error('You have made too many requests. Please wait a moment and try again.');
      }
      throw new Error('An unexpected error occurred during verification.');
    }
  }
);
