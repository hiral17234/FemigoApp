'use server';
/**
 * @fileOverview An AI flow to verify a user's Aadhaar card.
 *
 * - verifyAadhaar - A function that handles the Aadhaar card verification process.
 * - AadhaarVerificationInput - The input type for the verifyAadhaar function.
 * - AadhaarVerificationOutput - The return type for the verifyAadhaar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AadhaarVerificationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A live photo of an Aadhaar card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    name: z.string().describe("The user's full name as it appears on the Aadhaar card.")
});
export type AadhaarVerificationInput = z.infer<typeof AadhaarVerificationInputSchema>;

const AadhaarVerificationOutputSchema = z.object({
  isAadhaarCard: z.boolean().describe("Whether or not the image contains a valid Aadhaar card."),
  isNameMatch: z.boolean().describe("Whether the name on the card matches the provided name."),
  extractedName: z.string().describe("The full name extracted from the Aadhaar card."),
});
export type AadhaarVerificationOutput = z.infer<typeof AadhaarVerificationOutputSchema>;

export async function verifyAadhaar(input: AadhaarVerificationInput): Promise<AadhaarVerificationOutput> {
  return aadhaarVerificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aadhaarVerificationPrompt',
  input: {schema: AadhaarVerificationInputSchema},
  output: {schema: AadhaarVerificationOutputSchema},
  prompt: `You are an expert OCR system specializing in Indian identity documents. Your task is to verify an Aadhaar card from a provided image.

1. First, determine if the image is a clear photo of a valid Indian Aadhaar card. Set 'isAadhaarCard' to true or false.
2. If 'isAadhaarCard' is false, set 'isNameMatch' to false and 'extractedName' to an empty string.
3. If 'isAadhaarCard' is true, extract the full name printed on the card. Set this value to 'extractedName'.
4. Compare the extracted name with the user-provided name: '{{name}}'. Perform a case-insensitive comparison.
5. Set 'isNameMatch' to true if the names match, and false otherwise.

User-provided name: {{name}}
Image of Aadhaar Card: {{media url=photoDataUri}}`,
});

const aadhaarVerificationFlow = ai.defineFlow(
  {
    name: 'aadhaarVerificationFlow',
    inputSchema: AadhaarVerificationInputSchema,
    outputSchema: AadhaarVerificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        return { isAadhaarCard: false, isNameMatch: false, extractedName: "" };
    }
    return output;
  }
);
