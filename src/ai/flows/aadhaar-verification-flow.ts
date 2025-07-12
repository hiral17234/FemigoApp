
'use server';
/**
 * @fileOverview An AI flow for verifying an Aadhaar card.
 *
 * - verifyAadhaar - A function that handles the Aadhaar card verification process.
 */

import {ai} from '@/ai/genkit';
import { AadhaarVerificationInputSchema, AadhaarVerificationOutputSchema, type AadhaarVerificationInput, type AadhaarVerificationOutput } from '@/ai/types';


const aadhaarVerificationPrompt = ai.definePrompt({
    name: 'aadhaarVerificationPrompt',
    input: { schema: AadhaarVerificationInputSchema },
    output: { schema: AadhaarVerificationOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an expert Aadhaar verification agent for a women's safety app.
    Your task is to analyze an image of an Aadhaar card and verify it against the user's provided name.

    Here is the user's name from their profile: "{{userName}}"

    Perform the following verification steps on the provided photo:
    1.  **Name Verification:** Extract the full name from the Aadhaar card. Compare it to the user's profile name ("{{userName}}"). The name must match EXACTLY.
    2.  **Gender Verification:** Extract the gender from the card. The gender MUST be 'Female' or 'FEMALE'.
    3.  **Number Verification:** Extract the 12-digit Aadhaar number. Ensure it is a valid 12-digit number.

    Based on your analysis, provide a structured JSON response.

    - If all checks pass, set 'verificationPassed' to true and the 'reason' to "Aadhaar verification successful."
    - If the name does not match, set 'verificationPassed' to false and the 'reason' to "The name on the card does not match the profile name."
    - If the gender is not 'Female', set 'verificationPassed' to false and the 'reason' to "Verification is for female users only."
    - If the Aadhaar number is invalid or unreadable, set 'verificationPassed' to false and the 'reason' to "The Aadhaar number is invalid. Please provide a clear image."
    - If any other detail is unreadable, set 'verificationPassed' to false and the 'reason' to "Could not read all required details from the card. Please provide a clearer image."

    Also return the extracted details for 'extractedName', 'extractedGender', and 'extractedAadhaarNumber' in the final JSON output.

    Photo: {{media url=aadhaarPhotoDataUri}}
    `,
});

const aadhaarVerificationFlow = ai.defineFlow(
    {
      name: 'aadhaarVerificationFlow',
      inputSchema: AadhaarVerificationInputSchema,
      outputSchema: AadhaarVerificationOutputSchema,
    },
    async (input) => {
        try {
            const { output } = await aadhaarVerificationPrompt(input);
            if (!output) {
                // This case handles if the AI returns a completely empty or non-JSON response.
                throw new Error("The AI model did not return a valid structured response.");
            }
            return output;

        } catch(e) {
            console.error("Aadhaar verification flow failed", e);
            // This catches network errors or other exceptions during the AI call.
            return {
                verificationPassed: false,
                reason: "Could not process the document at this time. Please try again."
            }
        }
    }
);

export async function verifyAadhaar(input: AadhaarVerificationInput): Promise<AadhaarVerificationOutput> {
    return aadhaarVerificationFlow(input);
}
