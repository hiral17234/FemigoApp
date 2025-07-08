
'use server';
import { z } from 'zod';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const PointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});
type Point = z.infer<typeof PointSchema>;

export async function geocodeAddress(address: string): Promise<Point | null> {
    if (!GOOGLE_MAPS_API_KEY) {
        console.error("Google Maps API Key is not configured.");
        throw new Error("API key not configured.");
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        if (data.status === 'OK' && data.results[0]) {
            return data.results[0].geometry.location;
        }
        return null;
    } catch (error) {
        console.error('Geocoding failed:', error);
        return null;
    }
}
