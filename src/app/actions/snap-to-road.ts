
'use server';

import { z } from 'zod';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const PointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const SnapToRoadInputSchema = z.array(PointSchema);

type Point = z.infer<typeof PointSchema>;

// This function calls the Google Maps Roads API to snap a path of coordinates to the nearest roads.
export async function snapToRoad(path: Point[]): Promise<Point[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Google Maps API Key is not configured.");
    // Return original path if API key is missing to avoid breaking the app.
    return path;
  }
  
  // The Roads API has a limit of 100 points per request.
  if (path.length === 0 || path.length > 100) {
    console.warn(`Path must contain 1-100 points. Received ${path.length}.`);
    // Return the last valid point to keep the line going, or an empty array.
    return path.length > 0 ? [path[path.length - 1]] : [];
  }

  const validatedPath = SnapToRoadInputSchema.safeParse(path);

  if (!validatedPath.success) {
      console.error("Invalid path format for snapToRoad:", validatedPath.error);
      return [];
  }

  const pathString = validatedPath.data.map(p => `${p.lat},${p.lng}`).join('|');
  const url = `https://roads.googleapis.com/v1/snapToRoads?path=${pathString}&interpolate=true&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        console.error('Google Roads API HTTP Error:', response.status, errorData);
        return path; // Return original path on API error
    }

    const data = await response.json();

    if (data.snappedPoints) {
      return data.snappedPoints.map((point: any) => ({
        lat: point.location.latitude,
        lng: point.location.longitude,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch from Roads API:', error);
    return path; // Return original path on network error
  }
}
