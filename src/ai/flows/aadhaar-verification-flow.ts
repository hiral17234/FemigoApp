
'use server';
/**
 * @fileOverview An AI flow for verifying an Aadhaar card.
 *
 * - verifyAadhaar - A function that handles the Aadhaar card verification process.
 */

import {ai} from '@/ai/genkit';
import { AadhaarVerificationInputSchema, AadhaarVerificationOutputSchema, type AadhaarVerificationInput, type AadhaarVerificationOutput } from './types';


const aadhaarVerificationPrompt = ai.definePrompt({
    name: 'aadhaarVerificationPrompt',
    input: { schema: AadhaarVerificationInputSchema },
    output: { schema: AadhaarVerificationOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an AI verification agent for Femigo, a women's safety app. Your task is to verify an Indian Aadhaar card from a photo.

    The user's declared name is: {{{userName}}}

    Perform the following steps:
    1.  **Analyze the image:** Determine if the image is a valid Aadhaar card.
    2.  **Extract Information:** Extract the full name, gender, and the 12-digit Aadhaar number from the card. The Aadhaar number might have spaces; remove them for the final output.
    3.  **Verify Name:** Compare the extracted name to the user's declared name. A partial match (e.g., first name matches) is acceptable.
    4.  **Verify Gender:** Ensure the extracted gender is 'Female'.
    5.  **Final Decision:**
        - If the document is not an Aadhaar card, or if the photo is unreadable, fail with a clear reason.
        - If the extracted gender is not 'Female', fail with the reason "Verification is for female users only."
        - If the name does not match at all, fail with the reason "The name on the card does not match the profile name."
        - If all checks pass, set 'verificationPassed' to true and provide a success reason.

    **Rules:**
    - If successful, populate all extracted fields. The 'extractedAadhaarNumber' should be a 12-digit string with no spaces.
    - If failed, populate the 'reason' field and set 'verificationPassed' to false. Still provide any information you were able to extract.

    Analyze the provided image and return your structured response.
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
                throw new Error("The AI model did not return a valid response.");
            }
            return output;
        } catch(e) {
            console.error("Aadhaar verification flow failed", e);
            return {
                verificationPassed: false,
                reason: "Could not process the document at this time. Please try again in a moment."
            }
        }
    }
);

export async function verifyAadhaar(input: AadhaarVerificationInput): Promise<AadhaarVerificationOutput> {
    return aadhaarVerificationFlow(input);
}
