
'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, Source, Layer, type LayerProps } from 'react-map-gl';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Custom pulsing dot for the user's location
const UserMarker = () => (
  <div className="mapbox-user-marker-dot" />
);

const trafficLayer: LayerProps = {
  id: 'traffic',
  source: 'mapbox-traffic',
  'source-layer': 'traffic',
  type: 'line',
  paint: {
    'line-width': 2,
    'line-color': [
      'case',
      ['==', ['get', 'congestion'], 'low'], '#66ff66', // Green
      ['==', ['get', 'congestion'], 'moderate'], '#ffc400', // Yellow
      ['==', ['get', 'congestion'], 'heavy'], '#ff6b6b', // Orange-Red
      ['==', ['get', 'congestion'], 'severe'], '#a40000', // Dark Red
      '#cccccc' // Default color for unknown
    ]
  }
};

export default function LocationPage() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [viewport, setViewport] = useState({
    latitude: 20.5937, // Default to center of India
    longitude: 78.9629,
    zoom: 4,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setViewport((prev) => ({ ...prev, latitude, longitude, zoom: 14 }));
        },
        (err) => {
          console.error("Error getting geolocation:", err);
          setError("Could not get your location. Please enable location services in your browser settings.");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#06010F] p-4 text-white">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Mapbox Access Token is missing. Please add <code className="font-mono bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to your environment variables. The map cannot be displayed without it.
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
         <div className="absolute inset-0 flex items-center justify-center bg-[#06010F]/50 z-20 backdrop-blur-sm">
            <div className="text-center text-white space-y-4">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                <h2 className="text-2xl font-bold">Finding your location...</h2>
                <p className="text-muted-foreground">Please allow location access if prompted.</p>
            </div>
         </div>
      )}

      <Map
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11" // Dark theme to match the app
        style={{ width: '100%', height: '100%' }}
        key="mapbox-map-container"
      >
        {userLocation && (
          <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="center">
            <UserMarker />
          </Marker>
        )}
        <GeolocateControl position="top-right" />
        <NavigationControl position="top-right" />

        <Source id="mapbox-traffic" type="vector" url="mapbox://mapbox.traffic-v1">
          <Layer {...trafficLayer} />
        </Source>
      </Map>
    </div>
  );
}
