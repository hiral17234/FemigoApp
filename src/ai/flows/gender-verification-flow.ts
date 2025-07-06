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
  model: 'googleai/gemini-pro-vision',
  input: {schema: GenderVerificationInputSchema},
  output: {schema: GenderVerificationOutputSchema},
  prompt: `You are an advanced AI security agent for Femigo, a platform exclusively for female users. Your task is to analyze the provided user image and determine if the user meets the platform's criteria.

  Perform the following checks in order:
  1.  **Clarity Check:** Determine if the image is clear and not blurry. The user's face must be reasonably sharp and visible.
  2.  **Human Check:** Determine if the image contains a human face. It must not be an object, animal, or illustration.
  3.  **Gender Check:** If the image is clear and contains a human, determine if the person is female.

  Based on your analysis, provide a response in the required JSON format.
  - If the image is blurry, set 'isClear' to false and provide a reason. 'isHuman' and 'isFemale' should also be false.
  - If the image is clear but does not contain a human, set 'isHuman' to false and provide a reason. 'isFemale' should also be false.
  - If the image is clear and contains a human, but the person is not female, set 'isFemale' to false and provide a reason.
  - If all checks pass (clear image, human, female), set all boolean flags to true and provide a success reason.

  Photo to analyze: {{media url=photoDataUri}}
  `,
   config: {
    safetySettings: [
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
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
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
  }
);
