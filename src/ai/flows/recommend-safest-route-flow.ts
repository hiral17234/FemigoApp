
'use server';
/**
 * @fileOverview An AI flow for recommending the safest route from a list of options.
 *
 * - recommendSafestRoute - A function that returns the index of the safest route.
 * - RecommendSafestRouteInput - The input type for the function.
 * - RecommendSafestRouteOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const RecommendSafestRouteInputSchema = z.array(RouteSafetyOutputSchema);
type RecommendSafestRouteInput = z.infer<typeof RecommendSafestRouteInputSchema>;

const RecommendSafestRouteOutputSchema = z.object({
    recommendedRouteIndex: z.number().describe("The 0-based array index of the recommended safest route."),
    reason: z.string().describe("A brief explanation for why this route was recommended, highlighting its key safety advantages."),
});
type RecommendSafestRouteOutput = z.infer<typeof RecommendSafestRouteOutputSchema>;

const recommendationPrompt = ai.definePrompt({
    name: 'recommendationPrompt',
    model: 'googleai/gemini-1.5-flash',
    inputSchema: z.object({ routes: RecommendSafestRouteInputSchema }),
    outputSchema: RecommendSafestRouteOutputSchema,
    prompt: `You are a safety advisor for Femigo, a women's safety app.
    Your task is to analyze a list of potential routes and recommend the safest one.
    The routes are provided as a JSON array below.

    Consider the following criteria, in order of importance:
    1.  **Lighting:** 'Well-lit' is strongly preferred over 'Partially-lit' or 'Poorly-lit'.
    2.  **Incidents:** Fewer reported incidents are better. A route with '0-2 incidents' is safer than one with '3 minor delays'.
    3.  **Road Quality:** 'Good' is better than 'Moderate' or 'Poor'.
    4.  **Crowdedness:** 'Medium' or 'High' crowdedness can be safer than 'Low', especially for night travel.
    5.  **User Reviews:** A higher number of reviews can indicate a more popular and potentially vetted route.
    6.  **Duration:** All else being equal, a shorter duration is preferred, but safety is the absolute primary concern. Do not pick a route just because it is faster if it is less safe.

    Analyze the routes provided below and return the 0-based index of the route you recommend as the safest option. Provide a concise, user-friendly reason for your choice, mentioning 1-2 key positive factors.

    Routes:
    {{{json routes}}}
    `
});

const recommendSafestRouteFlow = ai.defineFlow(
    {
      name: 'recommendSafestRouteFlow',
      inputSchema: RecommendSafestRouteInputSchema,
      outputSchema: RecommendSafestRouteOutputSchema,
    },
    async (routes) => {
      const { output } = await recommendationPrompt({ routes });
      if (!output || output.recommendedRouteIndex === undefined || output.recommendedRouteIndex >= routes.length) {
        // Fallback: if AI fails or returns an invalid index, just recommend the first route.
        return { recommendedRouteIndex: 0, reason: "This is the primary suggested route." };
      }
      return output;
    }
);

export async function recommendSafestRoute(input: RecommendSafestRouteInput): Promise<RecommendSafestRouteOutput> {
    return recommendSafestRouteFlow(input);
}
