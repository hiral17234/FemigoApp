
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

const AadhaarOcrOutputSchema = z.object({
  aadhaarNumber: z.string().optional().describe('The 12-digit Aadhaar number, formatted as XXXX XXXX XXXX. Return an empty string if not found.'),
  fullName: z.string().optional().describe('The full name of the person as written on the card. Return an empty string if not found.'),
  gender: z.enum(['Male', 'Female', 'Other', 'Unspecified']).optional().describe('The gender of the person. Infer "Female" or "Male" based on the text on the card. If not clear, return "Unspecified".'),
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
  prompt: `You are an AI assistant tasked with two things: extracting text from a document and comparing two images.

  **Task 1: Extract Information**
  Analyze the Aadhaar Card image and extract the following information. If a field is unreadable, return an empty string for it.
  - Aadhaar Number: The 12-digit number, formatted as XXXX XXXX XXXX.
  - Full Name: The cardholder's full name.
  - Gender: The gender specified on the card ('Male' or 'Female'). If not present, use "Unspecified".

  **Task 2: Compare Photos**
  Compare the face in the live photo with the face on the Aadhaar card.
  - Consider that the person may be older in the live photo. Focus on stable facial features.
  - Set \`isPhotoMatch\` to \`true\` if they are the same person, otherwise \`false\`.
  - Provide a brief, neutral explanation in \`photoMatchReason\`. Examples: "Facial features appear consistent, accounting for age." or "Facial features do not appear to match."

  Live Photo to compare: {{media url=livePhotoDataUri}}
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
      // Check for policy/safety blocks which often return a 429 or similar error code but are not true rate limits.
      if (e.message && (e.message.includes('429') || e.message.includes('SAFETY'))) {
        throw new Error('Verification request was blocked. This may be due to image quality or content policy. Please try again with a clear, well-lit photo.');
      }
      if (e.message && e.message.includes('Schema validation failed')) {
        throw new Error('The AI could not read the document clearly. Please try again with a clearer image.');
      }
      throw new Error(`An unexpected error occurred during OCR: ${e.message || 'Please try again later.'}`);
    }
  }
);
