
'use server';
/**
 * @fileOverview An AI flow to verify if a user is female based on a photo.
 *
 * - verifyGender - A function that handles the gender verification process.
 * - GenderVerificationInput - The input type for the verifyGender function.
 * - GenderVerificationOutput - The return type for the verifyGender function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const GenderVerificationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenderVerificationInput = z.infer<typeof GenderVerificationInputSchema>;

export const GenderVerificationOutputSchema = z.object({
  isFemale: z
    .boolean()
    .describe('Whether the person in the photo is identified as female.'),
  reason: z
    .string()
    .describe('A brief, user-friendly explanation for the determination.'),
});
export type GenderVerificationOutput = z.infer<typeof GenderVerificationOutputSchema>;

export async function verifyGender(
  input: GenderVerificationInput
): Promise<GenderVerificationOutput> {
  return genderVerificationFlow(input);
}

const genderVerificationPrompt = ai.definePrompt({
  name: 'genderVerificationPrompt',
  input: { schema: GenderVerificationInputSchema },
  output: { schema: GenderVerificationOutputSchema },
  prompt: `You are an AI assistant for Femigo, a platform reserved for female users. Your task is to determine if the person in the provided photo appears to be female. Your response should be based solely on visual assessment.

Analyze the image and respond with your determination.

- If the person appears to be female, set "isFemale" to true and provide a neutral reason like "User appears to be female."
- If the person appears to be male, set "isFemale" to false and provide a neutral reason like "User does not appear to be female."
- If you cannot determine the gender, if it's not a person, or the image is unclear, set "isFemale" to false and provide a reason like "Could not determine gender from the image."

Photo: {{media url=photoDataUri}}`,
  config: {
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
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const genderVerificationFlow = ai.defineFlow(
  {
    name: 'genderVerificationFlow',
    inputSchema: GenderVerificationInputSchema,
    outputSchema: GenderVerificationOutputSchema,
  },
  async (input) => {
    const { output } = await genderVerificationPrompt(input);
    if (!output) {
      return {
        isFemale: false,
        reason: 'AI model did not return a valid response. Please try again.',
      };
    }
    return output;
  }
);
