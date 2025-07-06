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
  isFemale: z.boolean().describe('Whether the person in the image is female.'),
  reason: z.string().describe('A brief explanation for the decision, e.g., "User identified as female.", "User identified as male."'),
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
  prompt: `You are an expert in identity verification. Analyze the user's photo and determine if the person is female.

  The image must be clear and contain a human face. If not, consider it as not female.
  
  Provide your final analysis in the specified JSON format.

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
          isFemale: false,
          reason: 'AI model was unable to process the image. Please try again.',
        };
      }
      return output;
    } catch (e: any) {
        console.error("Critical error in genderVerificationFlow:", e);
        return {
            isFemale: false,
            reason: `An unexpected error occurred: ${e.message || 'Please try again later.'}`
        }
    }
  }
);
