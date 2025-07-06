'use server';
/**
 * @fileOverview An AI flow to verify the gender of a user from a photo.
 *
 * - verifyGender - A function that handles the gender verification process.
 * - VerifyGenderInput - The input type for the verifyGender function.
 * - VerifyGenderOutput - The return type for the verifyGender function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyGenderInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VerifyGenderInput = z.infer<typeof VerifyGenderInputSchema>;

const VerifyGenderOutputSchema = z.object({
  gender: z.enum(['female', 'male', 'unknown']).describe("The identified gender of the person in the photo. It can be 'female', 'male', or 'unknown' if not determinable."),
});
export type VerifyGenderOutput = z.infer<typeof VerifyGenderOutputSchema>;

export async function verifyGender(input: VerifyGenderInput): Promise<VerifyGenderOutput> {
  return genderVerificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'genderVerificationPrompt',
  input: {schema: VerifyGenderInputSchema},
  output: {schema: VerifyGenderOutputSchema},
  prompt: `You are an expert at identifying gender from a person's facial features. Analyze the provided photo and determine the gender of the person.
The output should only be one of three options: 'female', 'male', or 'unknown'. Do not provide any additional explanation.

Photo: {{media url=photoDataUri}}`,
});

const genderVerificationFlow = ai.defineFlow(
  {
    name: 'genderVerificationFlow',
    inputSchema: VerifyGenderInputSchema,
    outputSchema: VerifyGenderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        return { gender: 'unknown' };
    }
    return output;
  }
);
