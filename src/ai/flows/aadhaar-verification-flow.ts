
'use server';
/**
 * @fileOverview An AI flow for verifying an Aadhaar card.
 *
 * - verifyAadhaar - A function that handles the Aadhaar card verification process.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';
import { AadhaarVerificationInputSchema, AadhaarVerificationOutputSchema, type AadhaarVerificationInput, type AadhaarVerificationOutput } from '@/ai/types';

// Define a new, simpler schema for what the AI should extract.
const ExtractedAadhaarDataSchema = z.object({
    name: z.string().optional().describe("The full name extracted from the card."),
    gender: z.string().optional().describe("The gender extracted from the card (e.g., 'Male', 'Female')."),
    aadhaarNumber: z.string().optional().describe("The 12-digit Aadhaar number extracted from the card."),
});

// This is the prompt that ONLY asks the AI to extract data.
const dataExtractionPrompt = ai.definePrompt({
    name: 'aadhaarDataExtractionPrompt',
    model: 'googleai/gemini-1.5-flash',
    input: { schema: z.object({ aadhaarPhotoDataUri: z.string() }) },
    output: { schema: ExtractedAadhaarDataSchema },
    prompt: `You are an expert data extraction agent.
    Your task is to analyze an image of an Aadhaar card and extract the following details:
    - The full name of the person.
    - The gender of the person.
    - The 12-digit Aadhaar number.

    If any detail is unclear or unreadable, do not return a value for that field.

    Photo: {{media url=aadhaarPhotoDataUri}}
    `,
});

// This is the main flow that now contains the verification LOGIC.
const aadhaarVerificationFlow = ai.defineFlow(
    {
      name: 'aadhaarVerificationFlow',
      inputSchema: AadhaarVerificationInputSchema,
      outputSchema: AadhaarVerificationOutputSchema,
    },
    async (input): Promise<AadhaarVerificationOutput> => {
        try {
            // Step 1: Call the AI to extract data.
            const { output: extractedData } = await dataExtractionPrompt({ aadhaarPhotoDataUri: input.aadhaarPhotoDataUri });

            if (!extractedData) {
                return {
                    verificationPassed: false,
                    reason: "Could not read any details from the card. Please provide a clearer image.",
                };
            }
            
            const extractedName = extractedData.name;
            const extractedGender = extractedData.gender;
            const extractedAadhaarNumber = extractedData.aadhaarNumber?.replace(/\s+/g, ''); // Remove spaces from Aadhaar number

            // Step 2: Perform verification logic in TypeScript.
            if (!extractedName) {
                return { verificationPassed: false, reason: "Could not read the name from the card." };
            }
            if (extractedName.toLowerCase() !== input.userName.toLowerCase()) {
                return { 
                    verificationPassed: false, 
                    reason: `Name does not match. Profile name is "${input.userName}", but card says "${extractedName}".`,
                    extractedName,
                };
            }
            if (!extractedGender) {
                return { verificationPassed: false, reason: "Could not read the gender from the card.", extractedName };
            }
            if (extractedGender.toLowerCase() !== 'female') {
                return {
                    verificationPassed: false,
                    reason: `Verification is for female users only. Gender on card is '${extractedGender}'.`,
                    extractedName,
                    extractedGender,
                };
            }
            if (!extractedAadhaarNumber || !/^\d{12}$/.test(extractedAadhaarNumber)) {
                 return {
                    verificationPassed: false,
                    reason: `The Aadhaar number is invalid or unreadable. Expected 12 digits.`,
                    extractedName,
                    extractedGender,
                    extractedAadhaarNumber: extractedData.aadhaarNumber,
                };
            }
            
            // Step 3: If all checks pass, return success.
            return {
                verificationPassed: true,
                reason: "Aadhaar verification successful.",
                extractedName,
                extractedGender,
                extractedAadhaarNumber,
            };

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
