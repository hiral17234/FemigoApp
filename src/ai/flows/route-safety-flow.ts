
'use server';
/**
 * @fileOverview An AI flow for generating plausible safety details for a given route.
 *
 * - getRouteSafetyDetails - A function that returns safety insights for a route.
 */

import {ai} from '@/ai/genkit';
import { RouteSafetyInputSchema, RouteSafetyOutputSchema, type RouteSafetyInput, type RouteSafetyOutput } from './types';


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
