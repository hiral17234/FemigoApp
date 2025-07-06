'use server';
/**
 * @fileOverview An Aadhaar card OCR AI agent.
 *
 * - extractAadhaarData - A function that handles the Aadhaar OCR process.
 * - AadhaarOcrInput - The input type for the extractAadhaarData function.
 * - AadhaarOcrOutput - The return type for the extractAadhaarData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AadhaarOcrInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an Aadhaar card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AadhaarOcrInput = z.infer<typeof AadhaarOcrInputSchema>;

const AadhaarOcrOutputSchema = z.object({
  aadhaarNumber: z.string().describe('The 12-digit Aadhaar number, formatted as XXXX XXXX XXXX. Return an empty string if not found.'),
  fullName: z.string().describe('The full name of the person as written on the card. Return an empty string if not found.'),
  gender: z.enum(['Male', 'Female', 'Other', 'Unspecified']).describe('The gender of the person. Infer "Female" or "Male" based on the name or text. If not clear, return "Unspecified".'),
});
export type AadhaarOcrOutput = z.infer<typeof AadhaarOcrOutputSchema>;

export async function extractAadhaarData(input: AadhaarOcrInput): Promise<AadhaarOcrOutput> {
  return aadhaarVerificationFlow(input);
}

const aadhaarOcrPrompt = ai.definePrompt({
  name: 'aadhaarOcrPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: AadhaarOcrInputSchema},
  output: {schema: AadhaarOcrOutputSchema},
  prompt: `You are an expert OCR system specialized in reading Indian Aadhaar cards.
  Analyze the provided image and extract the following information accurately.

  1.  **Aadhaar Number**: Find the 12-digit number. It is usually formatted as XXXX XXXX XXXX.
  2.  **Full Name**: Extract the full name of the cardholder.
  3.  **Gender**: Extract the gender. It will be written as 'Male' or 'Female' in English or 'पुरुष / Male' or 'महिला / Female' in Hindi/English. Map it to the enum 'Male' or 'Female'. If you cannot determine it, return 'Unspecified'.

  If any piece of information is unclear, unreadable, or not present, return an empty string for that field. Ensure the Aadhaar number is formatted with spaces.

  Image to analyze: {{media url=photoDataUri}}
  `,
});

const aadhaarVerificationFlow = ai.defineFlow(
  {
    name: 'aadhaarVerificationFlow',
    inputSchema: AadhaarOcrInputSchema,
    outputSchema: AadhaarOcrOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await aadhaarOcrPrompt(input);
      if (!output) {
        throw new Error('AI model was unable to process the image.');
      }
      return output;
    } catch (e: any) {
      console.error("Critical error in aadhaarVerificationFlow:", e);
      throw new Error(`An unexpected error occurred during OCR: ${e.message || 'Please try again later.'}`);
    }
  }
);
