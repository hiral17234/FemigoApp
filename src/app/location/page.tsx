
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// A custom marker component that pulses
const UserMarker = () => (
    <div className="relative flex h-5 w-5 items-center justify-center">
      <div className="absolute h-full w-full animate-ping rounded-full bg-primary/70" />
      <div className="relative h-3 w-3 rounded-full border-2 border-white bg-primary" />
    </div>
);


export default function LocationPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      // Use watchPosition to get continuous updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setError(null);
        },
        (err) => {
          console.error("Error getting geolocation:", err);
          setError("Could not get your location. Please enable location services in your browser settings.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      
      // Cleanup the watcher when the component unmounts
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#06010F] p-4 text-white">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Google Maps API Key is missing. Please add <code className="font-mono bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment variables. The map cannot be displayed without it.
          </AlertDescription>
        </Alert>
         <div className="absolute top-4 left-4">
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-[#06010F]">
       <div className="absolute top-4 left-4 z-10">
          <Link href="/dashboard">
            <Button variant="ghost" className="bg-background/80 hover:bg-background text-foreground backdrop-blur-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

      {error && (
        <div className="absolute top-20 left-1/2 z-10 w-full max-w-md -translate-x-1/2 p-4">
          <Alert variant="destructive">
            <AlertTitle>Location Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {!userLocation && !error && (
         <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20 backdrop-blur-sm">
            <div className="text-center space-y-4">
                <div className="relative flex h-16 w-16 items-center justify-center mx-auto">
                    <div className="absolute h-full w-full animate-ping rounded-full bg-primary/50" />
                    <Skeleton className="h-full w-full rounded-full" />
                </div>
                <h2 className="text-2xl font-bold">Finding your location...</h2>
                <p className="text-muted-foreground">Please allow location access if prompted.</p>
            </div>
         </div>
      )}
      
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          center={userLocation || { lat: 20.5937, lng: 78.9629 }}
          zoom={userLocation ? 15 : 4}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          className="w-full h-full"
          mapId="a2b4a5d6e7f8g9h0"
        >
          {userLocation && (
            <AdvancedMarker position={userLocation}>
               <UserMarker />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
