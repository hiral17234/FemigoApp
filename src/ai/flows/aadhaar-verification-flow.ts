
'use server';
/**
 * @fileOverview An AI flow for verifying Aadhaar card details.
 *
 * - verifyAadhaar - A function that handles the Aadhaar verification process.
 * - AadhaarVerificationInput - The input type for the verifyAadhaar function.
 * - AadhaarVerificationOutput - The return type for the verifyAadhaar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AadhaarVerificationInputSchema = z.object({
  aadhaarPhotoDataUri: z
    .string()
    .describe(
      "A photo of the user's Aadhaar card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userName: z.string().describe("The user's name as entered during signup."),
});
export type AadhaarVerificationInput = z.infer<typeof AadhaarVerificationInputSchema>;

const AadhaarVerificationOutputSchema = z.object({
    verificationPassed: z.boolean().describe("True if all checks (name, gender, Aadhaar number) passed."),
    nameMatch: z.boolean().optional().describe("Whether the name on the card matches the user's provided name."),
    isFemale: z.boolean().optional().describe('Whether the gender identified on the card is Female.'),
    aadhaarNumberValid: z.boolean().optional().describe("Whether a valid 12-digit Aadhaar number was found."),
    extractedName: z.string().optional().describe('The name extracted from the Aadhaar card.'),
    extractedAadhaarNumber: z.string().optional().describe('The Aadhaar number extracted from the card.'),
    reason: z.string().describe('A brief explanation of the verification outcome.'),
});
export type AadhaarVerificationOutput = z.infer<typeof AadhaarVerificationOutputSchema>;


const verificationPrompt = ai.definePrompt({
    name: 'aadhaarVerificationPrompt',
    model: 'googleai/gemini-1.5-flash',
    inputSchema: AadhaarVerificationInputSchema,
    outputSchema: AadhaarVerificationOutputSchema,
    prompt: `You are an AI assistant for Femigo, a platform exclusively for women. Your task is to verify a user's identity using an image of their Aadhaar card and their self-declared name.

    You will receive an image of an Aadhaar card and the user's name: '{{userName}}'.

    Follow these steps precisely and populate the JSON output fields accordingly:

    1.  **Analyze the Aadhaar Card Image**:
        *   Carefully examine the image provided in \`{{media url=aadhaarPhotoDataUri}}\`.
        *   If the image is blurry, unreadable, or not an Aadhaar card, set 'verificationPassed' to \`false\`, set the 'reason' field to "Could not read Aadhaar card. Please upload a clearer image.", and leave other fields empty/false.

    2.  **Verify Name**:
        *   Extract the full name from the card. Set it as 'extractedName'.
        *   Compare the extracted name with the user's provided name: \`{{userName}}\`. The match should be case-insensitive and allow for partial matches (e.g., "Hiral Goyal" matches "Hiral R Goyal"). If they match, set 'nameMatch' to \`true\`. Otherwise, set it to \`false\`.

    3.  **Verify Gender**:
        *   Identify the gender from the card.
        *   If the gender is "Female", set 'isFemale' to \`true\`. Otherwise, set it to \`false\`.

    4.  **Verify Aadhaar Number**:
        *   Use OCR to extract any visible 12-digit number from the image.
        *   Prefer numbers that appear near labels like "Aadhaar", "UID", or "Identity Number".
        *   Ignore any numbers found inside barcodes or QR codes.
        *   Validate the extracted number: it must be exactly 12 digits long (ignoring spaces) and must not start with '0' or '1'.
        *   If a valid number is found, set 'aadhaarNumberValid' to \`true\` and set the extracted number (digits only) to 'extractedAadhaarNumber'.
        *   If no valid number is found, set 'aadhaarNumberValid' to \`false\`.

    5.  **Determine Final Outcome**:
        *   Set 'verificationPassed' to \`true\` ONLY IF 'nameMatch' is true, 'isFemale' is true, AND 'aadhaarNumberValid' is true.
        *   If 'verificationPassed' is \`true\`, set 'reason' to "Verification successful."
        *   If 'verificationPassed' is \`false\`, construct a helpful 'reason' based on which check failed. For example: "Name on card does not match.", "Platform is for women only.", "Invalid Aadhaar number detected.", or a combination. If multiple checks fail, list the primary reason.

    **Input:**
    - User's Name: \`{{userName}}\`
    - Aadhaar Card Photo: \`{{media url=aadhaarPhotoDataUri}}\``
});

const aadhaarVerificationFlow = ai.defineFlow(
  {
    name: 'aadhaarVerificationFlow',
    inputSchema: AadhaarVerificationInputSchema,
    outputSchema: AadhaarVerificationOutputSchema,
  },
  async (input) => {
    const { output } = await verificationPrompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a valid response. This can happen if the Aadhaar card is unclear, contains inappropriate content, or if the service is temporarily unavailable. Please try again with a clearer image.");
    }
    return output;
  }
);

export async function verifyAadhaar(input: AadhaarVerificationInput): Promise<AadhaarVerificationOutput> {
    return aadhaarVerificationFlow(input);
}
