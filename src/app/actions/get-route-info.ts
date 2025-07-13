
'use server';

import { z } from 'zod';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const PointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});
type Point = z.infer<typeof PointSchema>;

const RouteInfoInputSchema = z.object({
  origin: PointSchema,
  destination: PointSchema,
});
export type RouteInfoInput = z.infer<typeof RouteInfoInputSchema>;

const RouteInfoOutputSchema = z.object({
    distance: z.string().optional(),
    duration: z.string().optional(),
});
export type RouteInfoOutput = z.infer<typeof RouteInfoOutputSchema>;

/**
 * Fetches the distance and duration for the primary route between two points.
 * @param input - An object containing the origin and destination points.
 * @returns A promise that resolves to an object with distance and duration strings.
 */
export async function getRouteInfo(input: RouteInfoInput): Promise<RouteInfoOutput> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Google Maps API Key is not configured.");
    throw new Error("API key not configured.");
  }
  
  const validatedInput = RouteInfoInputSchema.safeParse(input);
  if (!validatedInput.success) {
      console.error("Invalid input for getRouteInfo:", validatedInput.error);
      return { distance: 'N/A', duration: 'N/A' };
  }

  const { origin, destination } = validatedInput.data;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
        return { distance: 'N/A', duration: 'N/A' };
    }
    const data = await response.json();
    if (data.status === 'OK' && data.routes.length > 0) {
      const leg = data.routes[0].legs[0];
      return {
        distance: leg.distance?.text,
        duration: leg.duration?.text,
      };
    }
    return { distance: 'N/A', duration: 'N/A' };
  } catch (error) {
    console.error('Failed to fetch from Directions API:', error);
    return { distance: 'N/A', duration: 'N/A' };
  }
}
