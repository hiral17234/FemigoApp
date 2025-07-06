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
      "A live photo of a person's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VerifyGenderInput = z.infer<typeof VerifyGenderInputSchema>;

const VerifyGenderOutputSchema = z.object({
  isPerson: z.boolean().describe("Whether or not the image contains a person's face."),
  gender: z.enum(['female', 'male', 'unknown']).describe("The identified gender of the person in the photo. It can be 'female', 'male', or 'unknown' if not determinable or if it's not a person."),
});
export type VerifyGenderOutput = z.infer<typeof VerifyGenderOutputSchema>;

export async function verifyGender(input: VerifyGenderInput): Promise<VerifyGenderOutput> {
  return genderVerificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'genderVerificationPrompt',
  input: {schema: VerifyGenderInputSchema},
  output: {schema: VerifyGenderOutputSchema},
  prompt: `You are an AI assistant for a women-only platform. Your task is to verify if the user is female based on their photo.

1.  Analyze the provided image: {{media url=photoDataUri}}
2.  First, confirm if the image contains a clear photo of a person. Set 'isPerson' to true or false.
3.  If 'isPerson' is true, identify the gender.
4.  Your output for the 'gender' field MUST be one of the following strings: 'female', 'male', or 'unknown'.
5.  This is for a security check. Be strict. If you are not highly confident the person is female, you must classify the gender as 'unknown' or 'male'.
6.  Return the final result as a JSON object matching the required output schema.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
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
        return { isPerson: false, gender: 'unknown' };
    }
    return output;
  }
);
