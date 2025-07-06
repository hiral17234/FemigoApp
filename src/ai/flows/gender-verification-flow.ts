'use server';
/**
 * @fileOverview A gender verification AI agent.
 *
 * - verifyGender - A function that handles the gender verification process.
 * - GenderVerificationInput - The input type for the verifyGender function.
 * - GenderVerificationOutput - The return type for the verifyGender function.
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
  isHuman: z.boolean().describe('Whether or not the image contains a human face.'),
  isClear: z.boolean().describe('Whether the image is clear and not blurry.'),
  isFemale: z.boolean().describe('Whether the person in the image is female. Set to false if not human or not clear.'),
  reason: z.string().describe('A brief explanation for the decision, e.g., "Image is blurry", "No human face detected", "User identified as male.", "Verification successful."'),
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
  prompt: `You are an expert in identity verification. Analyze the user's photo based on three strict criteria.

1.  **Clarity Check (isClear):** Is the photo sharp and well-lit? The entire face must be clearly visible. If it is blurry, poorly lit, or obscured, 'isClear' must be false.
2.  **Human Check (isHuman):** Does the photo contain a real human face? It cannot be an animal, object, cartoon, or illustration. If it is not a human, 'isHuman' must be false.
3.  **Gender Check (isFemale):** If, and only if, the photo is clear AND contains a human, determine if the person is female.

**IMPORTANT RULES:**
*   If 'isClear' is false, then 'isHuman' and 'isFemale' **must** also be false.
*   If 'isHuman' is false, then 'isFemale' **must** also be false.

Return your final analysis in the specified JSON format. Your 'reason' must be concise and directly related to the outcome.

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
        // Fallback in case the model fails to generate valid JSON
        return {
          isHuman: false,
          isClear: false,
          isFemale: false,
          reason: 'AI model was unable to process the image. Please try again.',
        };
      }
      return output;
    } catch (e: any) {
        console.error("Critical error in genderVerificationFlow:", e);
        return {
            isHuman: false,
            isClear: false,
            isFemale: false,
            reason: `An unexpected error occurred: ${e.message || 'Please try again later.'}`
        }
    }
  }
);
