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
  prompt: `You are a specialized AI model for a user verification system for an application called Femigo, which is exclusively for female users. Your only job is to determine if the person in the photo is female.

**CRITICAL INSTRUCTIONS:**
1.  Analyze the provided image: {{media url=photoDataUri}}.
2.  **Is this a person?** If the image clearly contains a human face, set \`isPerson\` to \`true\`. Otherwise, set it to \`false\`.
3.  **Is the person female?** Based on the visual evidence, determine if the person is female.
    *   If the person appears to be female, set the \`gender\` field to \`'female'\`.
    *   If the person appears to be male, set the \`gender\` field to \`'male'\`.
    *   If you cannot determine the gender, or if no person is detected, set the \`gender\` field to \`'unknown'\`.
4.  **Output Format**: Your entire response MUST be a single JSON object matching the output schema. Do not add any other text or explanation.

**Example Input Image:** A photo of a woman.
**Expected Output:** \`{"isPerson": true, "gender": "female"}\`

**Example Input Image:** A photo of a man.
**Expected Output:** \`{"isPerson": true, "gender": "male"}\`

**Example Input Image:** A photo of a landscape.
**Expected Output:** \`{"isPerson": false, "gender": "unknown"}\``,
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
