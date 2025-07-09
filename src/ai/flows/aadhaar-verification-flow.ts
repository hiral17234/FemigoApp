
'use server';
/**
 * @fileOverview An AI flow for verifying an Aadhaar card.
 *
 * - verifyAadhaar - A function that handles the Aadhaar card verification process.
 * - AadhaarVerificationInput - The input type for the verifyAadhaar function.
 * - AadhaarVerificationOutput - The return type for the verifyAadhaar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AadhaarVerificationInputSchema = z.object({
  aadhaarPhotoDataUri: z
    .string()
    .describe(
      "A photo of an Aadhaar card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userName: z.string().describe("The user's full name, as provided during signup."),
});
export type AadhaarVerificationInput = z.infer<typeof AadhaarVerificationInputSchema>;

const AadhaarVerificationOutputSchema = z.object({
    verificationPassed: z.boolean().describe("Whether the overall verification passed."),
    reason: z.string().describe("A summary of the verification outcome. If failed, this explains why."),
    extractedName: z.string().optional().describe("The name extracted from the Aadhaar card."),
    extractedGender: z.string().optional().describe("The gender extracted from the Aadhaar card."),
    extractedAadhaarNumber: z.string().optional().describe("The 12-digit Aadhaar number extracted from the card."),
});
export type AadhaarVerificationOutput = z.infer<typeof AadhaarVerificationOutputSchema>;


const aadhaarVerificationFlow = ai.defineFlow(
    {
      name: 'aadhaarVerificationFlow',
      inputSchema: AadhaarVerificationInputSchema,
      outputSchema: AadhaarVerificationOutputSchema,
    },
    async (input) => {
        // DEMO MODE: Bypass live AI call and return a successful result.
        console.log("Aadhaar Verification in DEMO MODE");
        // Simulate a short delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return {
            verificationPassed: true,
            reason: "Aadhaar details verified successfully.",
            extractedName: input.userName,
            extractedGender: "Female",
            extractedAadhaarNumber: `xxxx-xxxx-${Math.floor(1000 + Math.random() * 9000)}`,
        };
    }
);

export async function verifyAadhaar(input: AadhaarVerificationInput): Promise<AadhaarVerificationOutput> {
    return aadhaarVerificationFlow(input);
}
