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
const AadhaarVerificationOutputSchema = AadhaarVerificationModelOutputSchema.extend({
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
  prompt: `You are an OCR and data extraction AI specializing in Indian Aadhaar cards for a user verification system. Your task is to extract information and validate it.

**Instructions:**

1.  **Analyze Image**: Examine the provided image to determine if it is a genuine Indian Aadhaar card. Set \`isAadhaarCard\` to \`true\` or \`false\`. If \`false\`, stop and return default values.
    *   Image: {{media url=photoDataUri}}
2.  **Extract Data**: If it is an Aadhaar card, extract the following fields:
    *   \`extractedName\`: The full name in English.
    *   \`extractedAadhaarNumber\`: The 12-digit number.
    *   \`gender\`: The gender, which must be 'female', 'male', or 'unknown'.
3.  **Format Aadhaar Number**: Remove any spaces from the extracted 12-digit Aadhaar number before using it in the next step.
4.  **Validate Aadhaar Number**: Use the \`validateAadhaarNumber\` tool with the formatted Aadhaar number.
5.  **Set Validation Flag**: Based on the output from the \`validateAadhaarNumber\` tool, set the \`isAadhaarValid\` boolean field to \`true\` or \`false\`.
6.  **Return JSON**: Your final output must be a JSON object that strictly adheres to the defined output schema.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
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
