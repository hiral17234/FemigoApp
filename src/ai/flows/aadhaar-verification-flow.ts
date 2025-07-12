
'use server';
/**
 * @fileOverview An AI flow for verifying an Aadhaar card.
 *
 * - verifyAadhaar - A function that handles the Aadhaar card verification process.
 */

import {ai} from '@/ai/genkit';
import { AadhaarVerificationInputSchema, AadhaarVerificationOutputSchema, type AadhaarVerificationInput, type AadhaarVerificationOutput } from '@/ai/types';


const aadhaarExtractionPrompt = ai.definePrompt({
    name: 'aadhaarExtractionPrompt',
    input: { schema: AadhaarVerificationInputSchema },
    output: { schema: z.object({
        extractedName: z.string().optional().describe("The full name extracted from the Aadhaar card."),
        extractedGender: z.string().optional().describe("The gender extracted from the Aadhaar card (e.g., 'Female', 'Male')."),
        extractedAadhaarNumber: z.string().optional().describe("The 12-digit Aadhaar number extracted from the card, with spaces removed."),
    }) },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an expert OCR system. Your task is to extract information from an Indian Aadhaar card.

    Analyze the provided image of the Aadhaar card.
    
    1.  **Extract Name:** Carefully extract the full name printed on the card.
    2.  **Extract Gender:** Extract the gender. It will be labeled as 'Gender' or 'लिंग' and will have a value like 'Female', 'Male', or 'Third Gender'.
    3.  **Extract Aadhaar Number:** Extract the 12-digit Aadhaar number. It might be grouped into sets of 4 digits. Remove any spaces or separators.

    Return the extracted information in the specified JSON format. If a field cannot be read, leave it empty.
    
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
            const { output: extractedData } = await aadhaarExtractionPrompt(input);
            if (!extractedData) {
                throw new Error("The AI model did not return a valid response.");
            }

            const { extractedName, extractedGender, extractedAadhaarNumber } = extractedData;

            // --- Verification Logic in TypeScript ---

            if (!extractedName || !extractedGender || !extractedAadhaarNumber) {
                 return {
                    verificationPassed: false,
                    reason: "Could not read all required details from the card. Please provide a clearer image.",
                    extractedName: extractedName,
                    extractedGender: extractedGender,
                    extractedAadhaarNumber: extractedAadhaarNumber,
                };
            }

            // 1. Check if name matches exactly
            if (extractedName.toLowerCase() !== input.userName.toLowerCase()) {
                return {
                    verificationPassed: false,
                    reason: "The name on the card does not match the profile name.",
                    extractedName: extractedName,
                    extractedGender: extractedGender,
                    extractedAadhaarNumber: extractedAadhaarNumber,
                };
            }

            // 2. Check if gender is Female
            if (extractedGender.toLowerCase() !== 'female') {
                return {
                    verificationPassed: false,
                    reason: "Verification is for female users only.",
                    extractedName: extractedName,
                    extractedGender: extractedGender,
                    extractedAadhaarNumber: extractedAadhaarNumber,
                };
            }

            // 3. Check if Aadhaar number is a valid 12-digit number
            if (!/^\d{12}$/.test(extractedAadhaarNumber)) {
                 return {
                    verificationPassed: false,
                    reason: "The Aadhaar number is invalid. Please provide a clear image.",
                    extractedName: extractedName,
                    extractedGender: extractedGender,
                    extractedAadhaarNumber: extractedAadhaarNumber,
                };
            }
            
            // All checks passed
            return {
                verificationPassed: true,
                reason: "Aadhaar verification successful.",
                extractedName: extractedName,
                extractedGender: extractedGender,
                extractedAadhaarNumber: extractedAadhaarNumber,
            };

        } catch(e) {
            console.error("Aadhaar verification flow failed", e);
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
