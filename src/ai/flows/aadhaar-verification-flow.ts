
'use server';
/**
 * @fileOverview A flow to verify a live photo for platform compliance.
 *
 * - verifyLivePhoto - A function that checks if a user photo meets platform policies.
 * - LiveVerificationInput - The input type for the verifyLivePhoto function.
 * - LiveVerificationOutput - The return type for the verifyLivePhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const LiveVerificationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type LiveVerificationInput = z.infer<typeof LiveVerificationInputSchema>;

export const LiveVerificationOutputSchema = z.object({
  isAllowed: z
    .boolean()
    .describe('Whether the user is allowed to proceed based on the policies.'),
  reason: z
    .string()
    .describe('A concise, user-friendly reason for the decision.'),
});
export type LiveVerificationOutput = z.infer<typeof LiveVerificationOutputSchema>;

export async function verifyLivePhoto(
  input: LiveVerificationInput
): Promise<LiveVerificationOutput> {
  return liveVerificationFlow(input);
}

const liveVerificationPrompt = ai.definePrompt({
  name: 'liveVerificationPrompt',
  input: {schema: LiveVerificationInputSchema},
  output: {schema: LiveVerificationOutputSchema},
  prompt: `You are a strict AI verifier for a women-only social platform. Your task is to analyze the user's submitted photo based on two critical platform policies:
1.  **User Policy**: The user in the photo must clearly appear to be a woman.
2.  **Image Quality Policy**: The photo must be clear, well-lit, and not blurry.

Based on the photo provided, determine if the user should be allowed to proceed. Your response must be in JSON format.

If the user appears to be a woman and the photo is clear, set isAllowed to true and the reason to "Verification successful.".
If the user does not appear to be a woman, set isAllowed to false and the reason to "Platform access is for women only.".
If the photo is blurry or unclear, set isAllowed to false and the reason to "The photo is too blurry. Please capture a clear image.".

User Photo: {{media url=photoDataUri}}`,
});

const liveVerificationFlow = ai.defineFlow(
  {
    name: 'liveVerificationFlow',
    inputSchema: LiveVerificationInputSchema,
    outputSchema: LiveVerificationOutputSchema,
  },
  async input => {
    const {output} = await liveVerificationPrompt(input);
    return output!;
  }
);
