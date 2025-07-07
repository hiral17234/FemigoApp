
'use server';
/**
 * @fileOverview An AI flow for verifying an Aadhaar card.
 *
 * - verifyAadhaar - A function that handles the Aadhaar card verification process.
 * - AadhaarVerificationInput - The input type for the verifyAadhaar function.
 * - AadhaarVerificationOutput - The return type for the verifyAadhaar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AadhaarVerificationInputSchema = z.object({
  aadhaarPhotoDataUri: z
    .string()
    .describe(
      "A photo of an Aadhaar card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userName: z.string().describe("The user's full name, as provided during signup."),
});
export type AadhaarVerificationInput = z.infer<typeof AadhaarVerificationInputSchema>;

const AadhaarVerificationOutputSchema = z.object({
    verificationPassed: z.boolean().describe("Whether the overall verification passed."),
    reason: z.string().describe("A summary of the verification outcome. If failed, this explains why."),
    extractedName: z.string().optional().describe("The name extracted from the Aadhaar card."),
    extractedGender: z.string().optional().describe("The gender extracted from the Aadhaar card."),
    extractedAadhaarNumber: z.string().optional().describe("The 12-digit Aadhaar number extracted from the card."),
});
export type AadhaarVerificationOutput = z.infer<typeof AadhaarVerificationOutputSchema>;


const aadhaarVerificationPrompt = ai.definePrompt({
    name: 'aadhaarVerificationPrompt',
    model: 'googleai/gemini-1.5-flash',
    inputSchema: AadhaarVerificationInputSchema,
    outputSchema: AadhaarVerificationOutputSchema,
    prompt: `You are an AI assistant performing Aadhaar card verification for Femigo, a platform for women. Your task is to analyze the provided image of an Aadhaar card and verify it against the user's provided name.

    User's name from signup: '{{userName}}'
    Aadhaar Card Image: {{media url=aadhaarPhotoDataUri}}

    Follow these steps VERY CAREFULLY:

    1.  **CRITICAL FIRST STEP: Image Validity Check.**
        *   Analyze the image. Is it a clear, readable photo of an Indian Aadhaar card?
        *   If the image is **NOT** a valid Aadhaar card (e.g., it's a random photo, a driver's license, blurry, or unreadable), you **MUST** stop all other processing immediately. Your response **MUST BE** only the following JSON object and nothing else:
            \`\`\`json
            {
                "verificationPassed": false,
                "reason": "Please upload or capture a clear Aadhaar photo."
            }
            \`\`\`
        *   If and only if the image is a valid Aadhaar card, proceed to the next step.

    2.  **Data Extraction:** If the card is valid, extract the following fields:
        *   **Name:** The full name of the cardholder.
        *   **Gender:** The gender of the cardholder.
        *   **Aadhaar Number:** Use OCR to find the 12-digit number. It must be exactly 12 digits long and must not start with '0' or '1'. Ignore any spaces. Do not extract numbers from barcodes or QR codes.

    3.  **Verification Logic:**
        *   **Name Match:** Does the extracted name closely match the user's signup name ('{{userName}}')? A partial match is acceptable.
        *   **Gender Check:** Is the extracted gender "Female"?
        *   **Aadhaar Number Validity:** Is the extracted number a valid 12-digit Aadhaar number based on the rules?

    4.  **Final Output Generation:**
        *   **If all checks pass (Name matches, Gender is Female, Aadhaar is valid):** Return a JSON object where \`verificationPassed\` is \`true\`, \`reason\` is "Aadhaar details verified successfully.", and include all extracted data.
        *   **If any check fails:** Return a JSON object where \`verificationPassed\` is \`false\`. The \`reason\` field should clearly explain the first point of failure (e.g., "Name on card does not match the registered name.", "Gender on card is not female.", "A valid Aadhaar number could not be found."). Include any data that was successfully extracted, but ensure the response is always a valid JSON object matching the output schema.
`
});


const aadhaarVerificationFlow = ai.defineFlow(
    {
      name: 'aadhaarVerificationFlow',
      inputSchema: AadhaarVerificationInputSchema,
      outputSchema: AadhaarVerificationOutputSchema,
    },
    async (input) => {
      const { output } = await aadhaarVerificationPrompt(input);
      if (!output) {
        // This case should be rare given the strict prompt, but it's good practice.
        return {
            verificationPassed: false,
            reason: "The AI failed to generate a valid response. Please try again with a clearer image.",
        };
      }
      return output;
    }
);

export async function verifyAadhaar(input: AadhaarVerificationInput): Promise<AadhaarVerificationOutput> {
    return aadhaarVerificationFlow(input);
}
