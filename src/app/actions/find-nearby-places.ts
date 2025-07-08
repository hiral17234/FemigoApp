
'use server';

import { z } from 'zod';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const PointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});
type Point = z.infer<typeof PointSchema>;

const FindNearbyPlacesInputSchema = z.object({
  location: PointSchema,
  placeType: z.enum(['police', 'hospital']),
  radius: z.number().default(5000), // 5km radius
});
export type FindNearbyPlacesInput = z.infer<typeof FindNearbyPlacesInputSchema>;

export const PlaceSchema = z.object({
    name: z.string(),
    vicinity: z.string().optional(),
    location: PointSchema,
    place_id: z.string(),
});
export type Place = z.infer<typeof PlaceSchema>;

// This function calls the Google Maps Places API to find nearby places of a certain type.
export async function findNearbyPlaces(input: FindNearbyPlacesInput): Promise<Place[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Google Maps API Key is not configured.");
    throw new Error("API key not configured.");
  }

  const validatedInput = FindNearbyPlacesInputSchema.safeParse(input);

  if (!validatedInput.success) {
      console.error("Invalid input for findNearbyPlaces:", validatedInput.error);
      return [];
  }

  const { location, placeType, radius } = validatedInput.data;
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=${placeType}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Google Places API HTTP Error:', response.status, errorData);
        throw new Error('Failed to fetch data from Google Places API.');
    }

    const data = await response.json();

    if (data.results) {
      return data.results.map((place: any) => ({
        name: place.name,
        vicinity: place.vicinity,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        place_id: place.place_id,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch from Places API:', error);
    throw new Error('An unexpected error occurred while finding nearby places.');
  }
}
