
'use server';
/**
 * @fileOverview An AI flow for generating plausible safety details for a given route.
 *
 * - getRouteSafetyDetails - A function that returns safety insights for a route.
 * - RouteSafetyInput - The input type for the function.
 * - RouteSafetyOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RouteSafetyInputSchema = z.object({
  summary: z.string().describe("The summary of the route, e.g., 'US-101 S'"),
  distance: z.string().describe("The total distance of the route, e.g., '15.3 km'"),
  duration: z.string().describe("The estimated travel time for the route, e.g., '25 mins'"),
});
export type RouteSafetyInput = z.infer<typeof RouteSafetyInputSchema>;

const RouteSafetyOutputSchema = z.object({
  roadQuality: z.enum(['Good', 'Moderate', 'Poor']).describe("The overall quality of the road surface."),
  incidents: z.string().describe("A plausible number of recent minor incidents or accidents reported, e.g., '0-2 incidents' or '3 minor delays'."),
  reviewsCount: z.number().describe("A realistic number of user reviews for this route."),
  lighting: z.enum(['Well-lit', 'Partially-lit', 'Poorly-lit']).describe("The general lighting condition of the route, especially for night travel."),
  crowdedness: z.enum(['Low', 'Medium', 'High']).describe("The typical traffic level or crowdedness of the route."),
  safetySummary: z.string().describe("A brief, one-sentence summary of the route's safety profile."),
  crimeSummary: z.string().describe("A brief, one-sentence summary of the area's crime reports."),
  policeInfo: z.string().describe("A brief, one-sentence summary of local police presence or station info."),
  weatherInfo: z.string().describe("A brief, one-sentence summary of the current weather and visibility."),
});
export type RouteSafetyOutput = z.infer<typeof RouteSafetyOutputSchema>;

const routeSafetyPrompt = ai.definePrompt({
    name: 'routeSafetyPrompt',
    model: 'googleai/gemini-1.5-flash',
    inputSchema: RouteSafetyInputSchema,
    outputSchema: RouteSafetyOutputSchema,
    prompt: `You are a route safety analyst for a women's safety app called Femigo.
    Your task is to generate a realistic but simulated safety profile for a given driving, walking, or cycling route.
    Do not state that the data is simulated. Present it as factual information.
    Based on the provided route summary, distance, and duration, generate a plausible safety assessment.
    Consider factors like urban vs. rural roads, time of travel implied by duration, etc. to make the data feel authentic.

    Route Summary: {{summary}}
    Distance: {{distance}}
    Duration: {{duration}}

    Generate the safety data in the required JSON format.
    - For reviewsCount, pick a number that seems reasonable for a route of this type.
    - For incidents, provide a short string like "0-2 incidents" or "1 minor accident reported".
    - For crowdedness, use "Low", "Medium", or "High" and consider the context (e.g., a long highway route might have high traffic).
    - For safetySummary, crimeSummary, policeInfo, and weatherInfo, provide a concise, plausible sentence for each.
    `
});

const routeSafetyFlow = ai.defineFlow(
    {
      name: 'routeSafetyFlow',
      inputSchema: RouteSafetyInputSchema,
      outputSchema: RouteSafetyOutputSchema,
    },
    async (input) => {
      const { output } = await routeSafetyPrompt(input);
      if (!output) {
        throw new Error("The AI failed to generate a valid safety profile.");
      }
      return output;
    }
);

export async function getRouteSafetyDetails(input: RouteSafetyInput): Promise<RouteSafetyOutput> {
    return routeSafetyFlow(input);
}
