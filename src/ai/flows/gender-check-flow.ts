
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


const genderCheckPrompt = ai.definePrompt({
    name: 'genderCheckPrompt',
    model: 'googleai/gemini-1.5-flash',
    inputSchema: GenderCheckInputSchema,
    outputSchema: GenderCheckOutputSchema,
    prompt: `You are an AI assistant for Femigo, a platform exclusively for women. Your task is to verify if the user in the provided live photo is female.

    1.  **Analyze the Photo**: Analyze the user's live photo provided in {{media url=photoDataUri}}.
    2.  **Determine Gender**: Based on the visual analysis, determine if the person appears to be female.
    3.  **Set Output**:
        *   If the person is identified as female, set 'isFemale' to true and 'reason' to "Verification successful."
        *   If the person is not identified as female, set 'isFemale' to false and 'reason' to "Verification failed: Platform is for women only."
        *   If you cannot determine the gender or see a face, set 'isFemale' to false and 'reason' to "Could not identify a face in the photo. Please take a clearer picture."

    **Input Image:**
    - User's Live Photo: {{media url=photoDataUri}}`
});

const genderCheckFlow = ai.defineFlow(
  {
    name: 'genderCheckFlow',
    inputSchema: GenderCheckInputSchema,
    outputSchema: GenderCheckOutputSchema,
  },
  async (input) => {
    const { output } = await genderCheckPrompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a valid response. Please try again with a clearer image.");
    }
    return output;
  }
);

export async function genderCheck(input: GenderCheckInput): Promise<GenderCheckOutput> {
    return genderCheckFlow(input);
}
