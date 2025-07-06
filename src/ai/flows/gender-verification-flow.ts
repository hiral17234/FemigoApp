
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
  prompt: `You are an expert in identity verification. Analyze the user's photo.

  1.  **Determine Gender**: Identify if the person in the photo is female.
  2.  **Detect Glasses**: Check if the person is wearing any kind of glasses (spectacles, sunglasses, etc.).

  The image must be clear and contain a human face. If not, consider it as not female and not wearing glasses.
  
  Provide your final analysis in the specified JSON format. The 'reason' should summarize your findings.

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
