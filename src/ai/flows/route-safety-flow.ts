
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
type RouteSafetyInput = z.infer<typeof RouteSafetyInputSchema>;

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
type RouteSafetyOutput = z.infer<typeof RouteSafetyOutputSchema>;

const routeSafetyFlow = ai.defineFlow(
    {
      name: 'routeSafetyFlow',
      inputSchema: RouteSafetyInputSchema,
      outputSchema: RouteSafetyOutputSchema,
    },
    async (input) => {
      // DEMO MODE: Bypass live AI call and return hardcoded data.
      console.log("Route Safety in DEMO MODE");
      
      const qualities: ('Good' | 'Moderate' | 'Poor')[] = ['Good', 'Moderate', 'Poor'];
      const lightings: ('Well-lit' | 'Partially-lit' | 'Poorly-lit')[] = ['Well-lit', 'Partially-lit', 'Poorly-lit'];
      const crowds: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];

      return {
        roadQuality: qualities[Math.floor(Math.random() * qualities.length)],
        incidents: `${Math.floor(Math.random() * 3)} minor incidents`,
        reviewsCount: Math.floor(Math.random() * 200) + 50,
        lighting: lightings[Math.floor(Math.random() * lightings.length)],
        crowdedness: crowds[Math.floor(Math.random() * crowds.length)],
        safetySummary: 'A popular and generally safe route used by many commuters.',
        crimeSummary: 'Crime rates are lower than the city average in this area.',
        policeInfo: 'Regular police patrols are common along this route.',
        weatherInfo: 'Current weather is clear with good visibility.',
      };
    }
);

export async function getRouteSafetyDetails(input: RouteSafetyInput): Promise<RouteSafetyOutput> {
    return routeSafetyFlow(input);
}
