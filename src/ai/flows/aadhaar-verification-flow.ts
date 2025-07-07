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
  livePhotoDataUri: z
    .string()
    .describe(
      "A live photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  aadhaarPhotoDataUri: z
    .string()
    .describe(
      "A photo of the user's Aadhaar card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AadhaarVerificationInput = z.infer<typeof AadhaarVerificationInputSchema>;

const AadhaarVerificationOutputSchema = z.object({
  isFemale: z.boolean().describe('Whether the gender identified on the card is Female.'),
  facesMatch: z
    .boolean()
    .describe('Whether the face in the live photo and the face on the Aadhaar card are a likely match.'),
  extractedName: z.string().optional().describe('The name extracted from the Aadhaar card.'),
  extractedAadhaarNumber: z.string().optional().describe('The Aadhaar number extracted from the card.'),
  reason: z.string().describe('A brief explanation of the verification outcome.'),
});
export type AadhaarVerificationOutput = z.infer<typeof AadhaarVerificationOutputSchema>;


const verificationPrompt = ai.definePrompt({
    name: 'aadhaarVerificationPrompt',
    inputSchema: AadhaarVerificationInputSchema,
    outputSchema: AadhaarVerificationOutputSchema,
    prompt: `You are an AI assistant for Femigo, a platform exclusively for women. Your task is to verify a user's identity using their live photo and a picture of their Aadhaar card.

    Follow these steps precisely:
    1.  **Analyze the Aadhaar Card Image**:
        *   Read the text on the Aadhaar card provided in {{media url=aadhaarPhotoDataUri}}.
        *   Extract the person's name and the 12-digit Aadhaar number.
        *   Crucially, identify the gender listed on the card.
        *   Based on the identified gender, set the 'isFemale' boolean field. It must be true if the gender is "Female", otherwise it must be false.

    2.  **Compare the Faces**:
        *   Compare the face in the live photo provided in {{media url=livePhotoDataUri}} with the face in the Aadhaar card photo.
        *   Determine if they are the same person. Set the 'facesMatch' boolean field accordingly.

    3.  **Provide a Final Reason**:
        *   Based on your findings, provide a concise reason for the verification outcome.
        *   If not female, state "Verification failed: Platform is for women only."
        *   If faces do not match, state "Verification failed: Live photo does not match Aadhaar photo."
        *   If both checks pass, state "Verification successful."
        *   If the Aadhaar card is unreadable, state "Could not read Aadhaar card. Please upload a clearer image."

    **Input Images:**
    - User's Live Photo: {{media url=livePhotoDataUri}}
    - User's Aadhaar Card Photo: {{media url=aadhaarPhotoDataUri}}
    `,
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
