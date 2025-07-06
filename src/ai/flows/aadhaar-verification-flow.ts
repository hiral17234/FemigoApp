
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
  aadhaarNumber: z.string().describe('The 12-digit Aadhaar number, formatted as XXXX XXXX XXXX. Return an empty string if not found.'),
  fullName: z.string().describe('The full name of the person as written on the card. Return an empty string if not found.'),
  gender: z.enum(['Male', 'Female', 'Other', 'Unspecified']).describe('The gender of the person. Infer "Female" or "Male" based on the name or text. If not clear, return "Unspecified".'),
  isPhotoMatch: z.boolean().describe('Whether the face in the live photo matches the face on the Aadhaar card.'),
  photoMatchReason: z.string().describe('A brief explanation for the photo match decision, accounting for age differences. e.g., "Faces match, accounting for age progression.", "Faces do not match due to different individuals."'),
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
  Analyze the provided images and extract the following information accurately.

  1.  **Aadhaar Number**: Find the 12-digit number from the Aadhaar card. It is usually formatted as XXXX XXXX XXXX.
  2.  **Full Name**: Extract the full name of the cardholder from the Aadhaar card.
  3.  **Gender**: Extract the gender from the Aadhaar card. It will be written as 'Male' or 'Female' in English or 'पुरुष / Male' or 'महिला / Female' in Hindi/English. Map it to the enum 'Male' or 'Female'. If you cannot determine it, return 'Unspecified'.
  4.  **Photo Match (isPhotoMatch)**: Compare the person's face from the live photo with the face on the Aadhaar card. They must be the same person. **Take into account that there might be a significant age difference between the two photos.** The person in the live photo could be much older than in the Aadhaar photo. Focus on matching core, stable facial features (like nose shape, eye spacing, jawline) rather than superficial changes from aging (like wrinkles, hair graying, or weight changes). If the core features match despite the age gap, consider it a match.

  **IMPORTANT RULES:**
  *   If any piece of information is unclear, unreadable, or not present, return an empty string for that field.
  *   Ensure the Aadhaar number is formatted with spaces.
  *   Provide a concise reason for the photo match decision in 'photoMatchReason'. If the match is successful despite an age gap, mention it (e.g., "Faces match, accounting for age progression."). If it fails, specify why (e.g., "Faces appear to be different individuals.").

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
      throw new Error(`An unexpected error occurred during OCR: ${e.message || 'Please try again later.'}`);
    }
  }
);
