
'use server';
/**
 * @fileOverview An Aadhaar card OCR and face verification AI agent.
 *
 * - extractAadhaarData - A function that handles the Aadhaar data extraction and face match process.
 * - AadhaarOcrInput - The input type for the extractAadhaarData function.
 * - AadhaarOcrOutput - The return type for the extractAadhaarData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AadhaarOcrInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an Aadhaar card, as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  livePhotoDataUri: z
    .string()
    .describe(
        "A live photo of the user's face, as a data URI for comparison. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AadhaarOcrInput = z.infer<typeof AadhaarOcrInputSchema>;

// Make all fields required but allow empty strings for robustness. This prevents schema validation errors.
const AadhaarOcrOutputSchema = z.object({
  aadhaarNumber: z.string().describe('The 12-digit Aadhaar number (XXXX XXXX XXXX). Return empty string if not found.'),
  fullName: z.string().describe('The full name on the card. Return empty string if not found.'),
  gender: z.enum(['Male', 'Female', 'Other', 'Unspecified']).describe('The gender from the card. Default to "Unspecified" if not found.'),
  isPhotoMatch: z.boolean().describe('True if the live photo matches the Aadhaar photo, false otherwise.'),
  photoMatchReason: z.string().describe('Brief reason for the photo match decision (e.g., "Faces appear consistent.").'),
});
export type AadhaarOcrOutput = z.infer<typeof AadhaarOcrOutputSchema>;

export async function extractAadhaarData(input: AadhaarOcrInput): Promise<AadhaarOcrOutput> {
  return aadhaarVerificationFlow(input);
}

// A simplified, more direct prompt to reduce the chance of triggering safety policies.
const aadhaarOcrPrompt = ai.definePrompt({
  name: 'aadhaarOcrPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: AadhaarOcrInputSchema},
  output: {schema: AadhaarOcrOutputSchema},
  prompt: `
    From the provided Aadhaar card image, extract the Aadhaar Number, Full Name, and Gender.
    Compare the face in the live photo with the face on the Aadhaar card and determine if they are a match.
    Provide a brief reason for your photo match decision.
    Your response must conform to the specified JSON schema.

    Aadhaar Card: {{media url=photoDataUri}}
    Live Photo: {{media url=livePhotoDataUri}}
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
        throw new Error('The AI model returned an empty response. The image may be unreadable.');
      }
      // Ensure gender is set, defaulting to "Unspecified" if empty, to match the schema enum.
      if (!output.gender) {
        output.gender = 'Unspecified';
      }
      return output;
    } catch (e: any) {
      console.error("Critical error in aadhaarVerificationFlow:", e);
      if (e.message && (e.message.includes('429') || e.message.includes('SAFETY'))) {
        throw new Error('Verification blocked due to content policy. Please use a clear, well-lit photo and try again.');
      }
      if (e.message && e.message.includes('validation failed')) {
         throw new Error('The AI could not read the document clearly. Please use a clearer image.');
      }
      throw new Error(`An unexpected error occurred: ${e.message || 'Please try again later.'}`);
    }
  }
);
