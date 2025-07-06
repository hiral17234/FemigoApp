'use server';
/**
 * @fileOverview A live photo verification AI agent for policy compliance.
 *
 * - runLiveVerification - A function that handles the live photo check.
 * - LiveVerificationInput - The input type for the runLiveVerification function.
 * - LiveVerificationOutput - The return type for the runLiveVerification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const LiveVerificationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A live photo of the user's face, as a data URI for compliance check. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type LiveVerificationInput = z.infer<typeof LiveVerificationInputSchema>;

const LiveVerificationOutputSchema = z.object({
  verificationPassed: z.boolean().describe("Whether the user passes the platform's policy checks."),
  isFemale: z.boolean().describe("Whether the person in the photo appears to be a woman."),
  hasGlasses: z.boolean().describe("Whether the person in the photo is wearing glasses."),
  failureReason: z.string().optional().describe("A brief, user-friendly reason if verification fails (e.g., 'Please remove glasses.' or 'This platform is for women only.'). Return an empty string if verification passes."),
});
export type LiveVerificationOutput = z.infer<typeof LiveVerificationOutputSchema>;


export async function runLiveVerification(input: LiveVerificationInput): Promise<LiveVerificationOutput> {
  return liveVerificationFlow(input);
}


const compliancePrompt = ai.definePrompt({
    name: 'liveVerificationCompliancePrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: LiveVerificationInputSchema },
    output: { schema: LiveVerificationOutputSchema },
    prompt: `You are a strict policy compliance AI for a platform called 'Femigo' which is exclusively for women.
    Your task is to analyze the provided user photo against two critical platform rules and respond in the required JSON format.

    **Platform Rules:**
    1.  **User Must Appear Female:** The platform is for women only. The user in the photo must clearly appear to be a woman.
    2.  **No Glasses Allowed:** For identity verification purposes, the user must not be wearing any kind of glasses (including sunglasses or prescription glasses).

    **Your Analysis Steps:**
    1.  Analyze the photo: {{media url=photoDataUri}}
    2.  Determine if the user appears to be a woman. Set \`isFemale\` accordingly.
    3.  Determine if the user is wearing glasses. Set \`hasGlasses\` accordingly.
    4.  Based on the rules, decide if the verification passes. Set \`verificationPassed\` to \`true\` only if \`isFemale\` is true AND \`hasGlasses\` is false. Otherwise, set it to \`false\`.
    5.  If verification fails, provide a concise, user-friendly \`failureReason\`.
        - If \`hasGlasses\` is true, the reason must be: "Please remove your glasses for the photo."
        - If \`isFemale\` is false, the reason must be: "This platform is for women only. Access is denied."
        - If both fail, prioritize the glasses reason.
        - If verification passes, return an empty string for the reason.
    `,
});

const liveVerificationFlow = ai.defineFlow(
  {
    name: 'liveVerificationFlow',
    inputSchema: LiveVerificationInputSchema,
    outputSchema: LiveVerificationOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await compliancePrompt(input);
      if (!output) {
        throw new Error('The AI model was unable to process the image.');
      }
      return output;
    } catch (e: any) {
        console.error("Critical error in liveVerificationFlow:", e);
        if (e.message && e.message.includes('429')) {
            throw new Error('You have made too many requests. Please wait a moment and try again.');
        }
        if (e.message && e.message.includes('Schema validation failed')) {
            throw new Error('The AI could not analyze the photo clearly. Please try again with a clearer image.');
        }
        throw new Error(`An unexpected error occurred during verification: ${e.message || 'Please try again later.'}`);
    }
  }
);
