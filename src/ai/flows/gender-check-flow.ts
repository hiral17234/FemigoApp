
'use server';
/**
 * @fileOverview An AI flow for checking the gender from a user's photo.
 *
 * - genderCheck - A function that handles the gender check process.
 * - GenderCheckInput - The input type for the genderCheck function.
 * - GenderCheckOutput - The return type for the genderCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenderCheckInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A live photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenderCheckInput = z.infer<typeof GenderCheckInputSchema>;

const GenderCheckOutputSchema = z.object({
  isFemale: z.boolean().describe('Whether the person in the photo is identified as female.'),
  reason: z.string().describe('A brief explanation of the outcome.'),
});
export type GenderCheckOutput = z.infer<typeof GenderCheckOutputSchema>;


const genderCheckFlow = ai.defineFlow(
  {
    name: 'genderCheckFlow',
    inputSchema: GenderCheckInputSchema,
    outputSchema: GenderCheckOutputSchema,
  },
  async (input) => {
    // DEMO MODE: Bypass live AI call and return a successful result.
    console.log("Gender Check in DEMO MODE");
    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
        isFemale: true,
        reason: "Verification successful."
    };
  }
);

export async function genderCheck(input: GenderCheckInput): Promise<GenderCheckOutput> {
    return genderCheckFlow(input);
}
