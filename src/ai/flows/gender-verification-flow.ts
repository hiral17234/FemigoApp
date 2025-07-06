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
  prompt: `You are an AI model specializing in image analysis. Your task is to analyze the provided photo and determine if it contains a person, and if so, identify their apparent gender.

**Instructions:**
1.  Examine the image: {{media url=photoDataUri}}.
2.  **Person Detection**: First, determine if the image contains a clear human face.
    *   If a face is present, set \`isPerson\` to \`true\`.
    *   If no clear face is visible, set \`isPerson\` to \`false\` and \`gender\` to \`unknown\`.
3.  **Gender Classification**: If a person is detected, classify their apparent gender based on visual features.
    *   If the person appears to be female, set \`gender\` to \`'female'\`.
    *   If the person appears to be male, set \`gender\` to \`'male'\`.
    *   If the gender is ambiguous or cannot be determined, set \`gender\` to \`'unknown'\`.
4.  **Output**: You MUST respond with a single, valid JSON object that adheres strictly to the defined output schema. Do not include any additional text, explanations, or apologies.

**Example 1:**
*Input*: A clear photo of a woman's face.
*Output*: \`{"isPerson": true, "gender": "female"}\`

**Example 2:**
*Input*: A clear photo of a man's face.
*Output*: \`{"isPerson": true, "gender": "male"}\`

**Example 3:**
*Input*: A photo of a dog.
*Output*: \`{"isPerson": false, "gender": "unknown"}\``,
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
