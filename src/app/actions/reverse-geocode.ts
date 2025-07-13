
'use server';

import { z } from 'zod';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const PointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});
type Point = z.infer<typeof PointSchema>;

/**
 * Converts latitude and longitude coordinates into a human-readable address.
 * @param location - An object containing the latitude and longitude.
 * @returns A promise that resolves to the formatted address string, or a fallback message on failure.
 */
export async function reverseGeocode(location: Point): Promise<string> {
    if (!GOOGLE_MAPS_API_KEY) {
        console.error("Google Maps API Key is not configured.");
        throw new Error("API key not configured.");
    }

    const { lat, lng } = location;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Geocoding API HTTP Error:', response.status);
            return 'Address not found.';
        }
        
        const data = await response.json();
        if (data.status === 'OK' && data.results[0]) {
            return data.results[0].formatted_address;
        } else {
            console.warn('Geocoding failed:', data.status, data.error_message);
            return 'Address not available.';
        }
    } catch (error) {
        console.error('Reverse geocoding fetch failed:', error);
        throw new Error('Could not fetch address.');
    }
}
