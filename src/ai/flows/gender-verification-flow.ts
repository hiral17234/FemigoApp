
'use server';
/**
 * @fileOverview A gender and glasses verification AI agent.
 *
 * - verifyGenderAndGlasses - A function that handles the verification process.
 * - GenderVerificationInput - The input type for the function.
 * - GenderVerificationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenderVerificationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenderVerificationInput = z.infer<typeof GenderVerificationInputSchema>;

const GenderVerificationOutputSchema = z.object({
  isFemale: z.boolean().describe('Whether the person in the image is female.'),
  hasGlasses: z.boolean().describe('Whether the person in the image is wearing glasses (spectacles or sunglasses).'),
  reason: z.string().describe('A brief explanation for the decision, e.g., "User identified as female and is not wearing glasses.", "User is wearing glasses."'),
});
export type GenderVerificationOutput = z.infer<typeof GenderVerificationOutputSchema>;


export async function verifyGender(input: GenderVerificationInput): Promise<GenderVerificationOutput> {
  return genderVerificationFlow(input);
}


const genderVerificationPrompt = ai.definePrompt({
  name: 'genderVerificationPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenderVerificationInputSchema},
  output: {schema: GenderVerificationOutputSchema},
  prompt: `You are a policy compliance system for a women-only social platform. Your task is to check if a user's photo meets two critical platform rules for entry.
  
  **Rules to Enforce:**
  1.  **Female Presence**: The user in the photo must be identifiable as female.
  2.  **No Glasses**: The user must not be wearing any type of glasses (spectacles or sunglasses).

  Analyze the provided photo based on these two rules.
  - If the user is female and not wearing glasses, set 'isFemale' to true and 'hasGlasses' to false.
  - If the user is wearing glasses, set 'hasGlasses' to true.
  - If the user does not appear to be female, set 'isFemale' to false.
  
  Provide a concise 'reason' for your final decision. Be direct. For example: "User identified as female and is not wearing glasses." or "Verification failed because the user is wearing glasses."

  Photo to analyze: {{media url=photoDataUri}}
  `,
   config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
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
    try {
      const {output} = await genderVerificationPrompt(input);
      if (!output) {
        throw new Error('AI model was unable to process the image. Please try again.');
      }
      return output;
    } catch (e: any) {
        console.error("Critical error in genderVerificationFlow:", e);
        if (e.message && e.message.includes('429')) {
            throw new Error('You have made too many requests. Please wait a moment and try again.');
        }
        throw new Error(`An unexpected error occurred during verification: ${e.message || 'Please try again later.'}`);
    }
  }
);
