
'use server';
/**
 * @fileOverview An AI flow for verifying Aadhaar card details.
 *
 * - verifyAadhaar - A function that handles the Aadhaar verification process.
 * - AadhaarVerificationInput - The input type for the verifyAadhaar function.
 * - AadhaarVerificationOutput - The return type for the verifyAadhaar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AadhaarVerificationInputSchema = z.object({
  aadhaarPhotoDataUri: z
    .string()
    .describe(
      "A photo of the user's Aadhaar card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AadhaarVerificationInput = z.infer<typeof AadhaarVerificationInputSchema>;

const AadhaarVerificationOutputSchema = z.object({
  isFemale: z.boolean().describe('Whether the gender identified on the card is Female.'),
  extractedName: z.string().optional().describe('The name extracted from the Aadhaar card.'),
  extractedAadhaarNumber: z.string().optional().describe('The Aadhaar number extracted from the card.'),
  reason: z.string().describe('A brief explanation of the verification outcome.'),
});
export type AadhaarVerificationOutput = z.infer<typeof AadhaarVerificationOutputSchema>;


const verificationPrompt = ai.definePrompt({
    name: 'aadhaarVerificationPrompt',
    model: 'googleai/gemini-1.5-flash',
    inputSchema: AadhaarVerificationInputSchema,
    outputSchema: AadhaarVerificationOutputSchema,
    prompt: `You are an AI assistant for Femigo, a platform exclusively for women. Your task is to verify a user's identity using a picture of their Aadhaar card.

    Follow these steps precisely and populate the JSON output fields accordingly:

    1.  **Analyze the Aadhaar Card Image**:
        *   Carefully read all text on the Aadhaar card image provided in \`{{media url=aadhaarPhotoDataUri}}\`.
        *   If the image is blurry, unreadable, or not an Aadhaar card, set the 'reason' field to "Could not read Aadhaar card. Please upload a clearer image.", set 'isFemale' to false, and leave other fields empty.

    2.  **Extract Information**:
        *   If the card is readable, extract the person's full name and set it as the 'extractedName' field.
        *   Extract the 12-digit Aadhaar number and set it as the 'extractedAadhaarNumber' field.
        *   Identify the gender from the card.

    3.  **Determine Final Output**:
        *   **If Gender is "Female"**:
            *   Set the 'isFemale' field to \`true\`.
            *   Set the 'reason' field to "Verification successful."
        *   **If Gender is not "Female" (e.g., "Male" or "Third Gender")**:
            *   Set the 'isFemale' field to \`false\`.
            *   Set the 'reason' field to "Verification failed: Platform is for women only."
        *   **If Gender cannot be identified from the card**:
            *   Set the 'isFemale' field to \`false\`.
            *   Set the 'reason' field to "Could not determine gender from Aadhaar card."

    **Input Image:**
    - User's Aadhaar Card Photo: \`{{media url=aadhaarPhotoDataUri}}\``
});

const aadhaarVerificationFlow = ai.defineFlow(
  {
    name: 'aadhaarVerificationFlow',
    inputSchema: AadhaarVerificationInputSchema,
    outputSchema: AadhaarVerificationOutputSchema,
  },
  async (input) => {
    const { output } = await verificationPrompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a valid response. This can happen if the Aadhaar card is unclear, contains inappropriate content, or if the service is temporarily unavailable. Please try again with a clearer image.");
    }
    return output;
  }
);

export async function verifyAadhaar(input: AadhaarVerificationInput): Promise<AadhaarVerificationOutput> {
    return aadhaarVerificationFlow(input);
}
