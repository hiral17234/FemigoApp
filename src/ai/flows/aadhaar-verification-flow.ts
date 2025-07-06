'use server';
/**
 * @fileOverview An AI flow to verify a user's Aadhaar card from an image.
 *
 * - verifyAadhaar - A function that handles the Aadhaar card verification process.
 * - AadhaarVerificationInput - The input type for the verifyAadhaar function.
 * - AadhaarVerificationOutput - The return type for the verifyAadhaar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { validateAadhaarNumber } from '../tools/aadhaar-validator';

const AadhaarVerificationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an Aadhaar card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    name: z.string().describe("The user's full name as it appears on the Aadhaar card.")
});
export type AadhaarVerificationInput = z.infer<typeof AadhaarVerificationInputSchema>;

// Schema for the data extracted by the AI model
const AadhaarVerificationModelOutputSchema = z.object({
  isAadhaarCard: z.boolean().describe('Whether or not the image contains a valid Aadhaar card.'),
  isAadhaarValid: z.boolean().describe("Whether the Aadhaar number passed the simulated government validation. This is true if the tool 'validateAadhaarNumber' returns true."),
  extractedName: z.string().describe("The full name extracted from the Aadhaar card in English."),
  extractedAadhaarNumber: z.string().describe("The 12-digit Aadhaar number extracted from the card, with spaces removed."),
  gender: z.enum(['female', 'male', 'unknown']).describe("The gender identified from the Aadhaar card. It can be 'female', 'male', or 'unknown'."),
});

// Final output schema for the flow, including the server-side name match check
export const AadhaarVerificationOutputSchema = AadhaarVerificationModelOutputSchema.extend({
  isNameMatch: z.boolean().describe("Whether the name on the card matches the provided name."),
});
export type AadhaarVerificationOutput = z.infer<typeof AadhaarVerificationOutputSchema>;

export async function verifyAadhaar(input: AadhaarVerificationInput): Promise<AadhaarVerificationOutput> {
  return aadhaarVerificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aadhaarVerificationPrompt',
  input: {schema: AadhaarVerificationInputSchema},
  output: {schema: AadhaarVerificationModelOutputSchema},
  tools: [validateAadhaarNumber],
  prompt: `You are an expert OCR system specializing in Indian identity documents. Your task is to analyze an Aadhaar card from a provided image and extract its details.

Follow these steps precisely:

1.  **Card Identification**: First, determine if the image is a clear photo of a valid Indian Aadhaar card. Set 'isAadhaarCard' to true or false. If it is false, stop here and return empty strings/unknown for other fields.

2.  **Data Extraction**: If 'isAadhaarCard' is true, extract the following information from the card:
    *   The full name as written in English. Set this value to 'extractedName'.
    *   The 12-digit Aadhaar number (e.g., XXXX XXXX XXXX).
    *   The gender. Set this to 'gender' ('female', 'male', or 'unknown').

3.  **Aadhaar Number Formatting & Validation**:
    *   Take the extracted 12-digit number and store it **without spaces** in 'extractedAadhaarNumber'.
    *   Use the 'validateAadhaarNumber' tool with the 'extractedAadhaarNumber'. The tool will simulate a check against a government database. Based on the tool's response, set 'isAadhaarValid' to true or false.

4.  **Final Output**: Return the complete output object with all fields populated according to the steps above.

Image of Aadhaar Card: {{media url=photoDataUri}}`,
});

const aadhaarVerificationFlow = ai.defineFlow(
  {
    name: 'aadhaarVerificationFlow',
    inputSchema: AadhaarVerificationInputSchema,
    outputSchema: AadhaarVerificationOutputSchema,
  },
  async (input) => {
    const { output: modelOutput } = await prompt(input);

    if (!modelOutput || !modelOutput.isAadhaarCard) {
      return {
        isAadhaarCard: false,
        isAadhaarValid: false,
        isNameMatch: false,
        extractedName: '',
        extractedAadhaarNumber: '',
        gender: 'unknown',
      };
    }

    // Perform case-insensitive name comparison in code for reliability
    const isNameMatch =
      modelOutput.extractedName.trim().toLowerCase() ===
      input.name.trim().toLowerCase();
    
    // Re-format the Aadhaar number for display if it was extracted successfully
    let formattedAadhaarNumber = modelOutput.extractedAadhaarNumber;
    if (formattedAadhaarNumber && formattedAadhaarNumber.length === 12) {
      formattedAadhaarNumber = formattedAadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
    }

    const finalOutput: AadhaarVerificationOutput = {
      ...modelOutput,
      isNameMatch: isNameMatch,
      extractedAadhaarNumber: formattedAadhaarNumber,
    };

    return finalOutput;
  }
);
