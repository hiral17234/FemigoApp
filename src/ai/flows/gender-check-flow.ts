
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
type GenderCheckInput = z.infer<typeof GenderCheckInputSchema>;

const GenderCheckOutputSchema = z.object({
  isFemale: z.boolean().describe('Whether the person in the photo is identified as female.'),
  reason: z.string().describe('A brief explanation of the outcome.'),
});
type GenderCheckOutput = z.infer<typeof GenderCheckOutputSchema>;

const genderCheckPrompt = ai.definePrompt({
    name: 'genderCheckPrompt',
    input: { schema: GenderCheckInputSchema },
    output: { schema: GenderCheckOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an AI security agent for Femigo, a women's safety app. Your primary task is to verify a user's live photo during onboarding.

    You must perform the following checks in order:
    1.  **Face Detection:** Is there a single, clear human face in the photo? The face should be the main subject.
    2.  **Photo Quality:** Is the image clear, well-lit, and not blurry?
    3.  **Gender Identification:** Is the person in the photo a female?

    **Rules:**
    - If no clear face is detected, fail the verification. Set 'isFemale' to false and the 'reason' to "No clear face was detected. Please take another photo."
    - If the photo is blurry, dark, or of poor quality, fail the verification. Set 'isFemale' to false and the 'reason' to "The photo is too blurry or dark. Please ensure good lighting."
    - If the person detected is not female, fail the verification. Set 'isFemale' to false and the 'reason' to "Verification is for female users only."
    - If all checks pass and the person is identified as female, pass the verification. Set 'isFemale' to true and the 'reason' to "Verification successful."

    Analyze the provided user photo and return your structured response.
    Photo: {{media url=photoDataUri}}
    `,
});

const genderCheckFlow = ai.defineFlow(
  {
    name: 'genderCheckFlow',
    inputSchema: GenderCheckInputSchema,
    outputSchema: GenderCheckOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await genderCheckPrompt(input);
        if (!output) {
            throw new Error("The AI model did not return a valid response.");
        }
        return output;
    } catch(e) {
        console.error("Gender check flow failed", e);
        // Fallback to a user-friendly error message if the AI call fails for network/other reasons
        return {
            isFemale: false,
            reason: "Could not process the image at this time. Please try again in a moment."
        }
    }
  }
);

export async function genderCheck(input: GenderCheckInput): Promise<GenderCheckOutput> {
    return genderCheckFlow(input);
}
