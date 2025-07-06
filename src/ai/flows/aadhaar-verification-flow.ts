
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
  livePhotoDataUri: z
    .string()
    .describe(
        "A live photo of the user's face, as a data URI for comparison. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AadhaarOcrInput = z.infer<typeof AadhaarOcrInputSchema>;

export const AadhaarOcrOutputSchema = z.object({
  aadhaarNumber: z.string().optional().describe('The 12-digit Aadhaar number, formatted as XXXX XXXX XXXX. Return an empty string if not found.'),
  fullName: z.string().optional().describe('The full name of the person as written on the card. Return an empty string if not found.'),
  gender: z.enum(['Male', 'Female', 'Other', 'Unspecified']).optional().describe('The gender of the person. Infer "Female" or "Male" based on the name or text. If not clear, return "Unspecified".'),
  isPhotoMatch: z.boolean().optional().describe('Whether the face in the live photo matches the face on the Aadhaar card.'),
  photoMatchReason: z.string().optional().describe('A brief explanation for the photo match decision, accounting for age differences. e.g., "Faces match, accounting for age progression.", "Faces do not match due to different individuals."'),
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
  prompt: `You are an expert OCR system and identity verification specialist.
  Your task is to analyze the provided images of an Aadhaar card and a live photo, and extract specific information in a structured JSON format.

  **Extraction and Verification Rules:**

  1.  **Aadhaar Number**: Extract the 12-digit Aadhaar number. It is typically formatted as XXXX XXXX XXXX.
      - If the number is not found or unreadable, do not include the field in the output.

  2.  **Full Name**: Extract the full name of the cardholder.
      - If the name is not found or unreadable, do not include the field in the output.

  3.  **Gender**: Determine the gender from the card ('Male' or 'Female').
      - If the gender cannot be determined, return "Unspecified".

  4.  **Photo Match (isPhotoMatch & photoMatchReason)**: Compare the face in the live photo with the face on the Aadhaar card.
      - **CRITICAL**: Account for age differences. The person in the live photo may be significantly older. Focus on matching stable facial features (e.g., nose shape, eye spacing) rather than superficial changes (wrinkles, hair color).
      - If the faces match, set \`isPhotoMatch\` to \`true\` and \`photoMatchReason\` to a brief explanation like "Faces match, accounting for age progression."
      - If the faces do not match, set \`isPhotoMatch\` to \`false\` and \`photoMatchReason\` to a reason like "Faces do not appear to match."
      - If you cannot perform the comparison, set \`isPhotoMatch\` to \`false\` and \`photoMatchReason\` to "Could not perform photo comparison."

  Live Photo to analyze: {{media url=livePhotoDataUri}}
  Aadhaar Card to analyze: {{media url=photoDataUri}}
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
      if (e.message && e.message.includes('429')) {
        throw new Error('You have made too many requests. Please wait a moment and try again.');
      }
      // Provide a more user-friendly message for schema validation errors.
      if (e.message && e.message.includes('Schema validation failed')) {
        throw new Error('The AI could not read the document clearly. Please try again with a clearer image.');
      }
      throw new Error(`An unexpected error occurred during OCR: ${e.message || 'Please try again later.'}`);
    }
  }
);
