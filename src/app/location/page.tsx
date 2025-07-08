
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, LocateFixed, Car, Bike, BusFront, Footprints, ArrowRightLeft, Share2, MapPin, Circle } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, MapCameraChangedEvent, useMap } from '@vis.gl/react-google-maps';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { snapToRoad } from '@/app/actions/snap-to-road';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Point = { lat: number; lng: number };
type TravelMode = 'drive' | 'bike' | 'bus' | 'walk';

// A custom marker component that pulses
const UserMarker = () => (
    <div className="relative flex h-5 w-5 items-center justify-center">
      <div className="absolute h-full w-full animate-ping rounded-full bg-primary/70" />
      <div className="relative h-3 w-3 rounded-full border-2 border-white bg-primary" />
    </div>
);

// A component to render the polyline, since useMap must be used inside <Map>
const RoutePolyline = ({ path }: { path: Point[] }) => {
    const map = useMap();
    const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

    useEffect(() => {
        if (!map || !window.google?.maps?.Polyline) return;
        
        if (polyline) {
            polyline.setPath(path);
        } else {
            const newPolyline = new window.google.maps.Polyline({
                path: path,
                strokeColor: "hsl(var(--primary))",
                strokeOpacity: 0.8,
                strokeWeight: 6,
                map: map,
            });
            setPolyline(newPolyline);
        }

        // Clean up polyline on component unmount
        return () => {
            if (polyline) {
                polyline.setMap(null);
            }
        };
    }, [map, path, polyline]);

    return null;
};


export default function LocationPage() {
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<Point | null>(null);
  
  const rawPathRef = useRef<Point[]>([]);
  const [snappedPath, setSnappedPath] = useState<Point[]>([]);
  
  const [mapCenter, setMapCenter] = useState<Point>({ lat: 20.5937, lng: 78.9629 });
  const [mapZoom, setMapZoom] = useState(4);
  const [error, setError] = useState<string | null>(null);
  const [initialLocationSet, setInitialLocationSet] = useState(false);
  const isProcessingRef = useRef(false);

  const [travelMode, setTravelMode] = useState<TravelMode>('walk');

  const processPath = useCallback(async () => {
    if (isProcessingRef.current || rawPathRef.current.length === 0) {
      return;
    }
    isProcessingRef.current = true;
    
    const path_to_snap = [...(snappedPath.slice(-1)), ...rawPathRef.current];
    const currentRawPoints = [...rawPathRef.current];
    rawPathRef.current = [];
    
    try {
      const newSnappedPoints = await snapToRoad(path_to_snap);
      
      if (newSnappedPoints && newSnappedPoints.length > 0) {
        setSnappedPath(prev => {
           const prevPath = prev.length > 0 ? prev.slice(0, -1) : [];
           return [...prevPath, ...newSnappedPoints];
        });
      } else {
         rawPathRef.current = [...currentRawPoints, ...rawPathRef.current]
      }
    } catch (e) {
      console.error("Failed to snap to road:", e);
      rawPathRef.current = [...currentRawPoints, ...rawPathRef.current]
    } finally {
      isProcessingRef.current = false;
    }
  }, [snappedPath]);


  useEffect(() => {
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation: Point = { lat: latitude, lng: longitude };
          
          setUserLocation(newLocation);
          rawPathRef.current.push(newLocation);
          
          if (!initialLocationSet) {
             setMapCenter(newLocation);
             setMapZoom(15);
             setSnappedPath([newLocation]);
             setInitialLocationSet(true);
          }
          setError(null);
        },
        (err) => {
          console.error("Error getting geolocation:", err);
          setError("Could not get your location. Please enable location services in your browser settings.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, [initialLocationSet]);
  
  useEffect(() => {
      const intervalId = setInterval(() => {
          if (rawPathRef.current.length > 0) {
              processPath();
          }
      }, 5000);

      return () => clearInterval(intervalId);
  }, [processPath]);


  const handleRecenter = () => {
    if (userLocation) {
        setMapCenter(userLocation);
        setMapZoom(15);
    }
  };

  const handleCameraChange = (e: MapCameraChangedEvent) => {
      setMapCenter(e.detail.center);
      setMapZoom(e.detail.zoom);
  };
  

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#06010F] p-4 text-white">
        <div className="absolute top-4 left-4">
           <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Google Maps API Key is missing. Please add <code className="font-mono bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment variables. The map cannot be displayed without it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const travelModes = [
      { name: 'drive', icon: Car },
      { name: 'bike', icon: Bike },
      { name: 'bus', icon: BusFront },
      { name: 'walk', icon: Footprints },
  ]

  return (
    <main className="h-screen w-full flex flex-col bg-[#06010F]">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1">
        <Card className="w-full flex-1 flex flex-col rounded-none sm:rounded-2xl border-purple-900/50 bg-background shadow-2xl shadow-black/50 overflow-hidden my-0 sm:my-4">
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 p-4 border-b border-purple-900/50 shrink-0">
            <div className='flex items-center gap-4'>
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-1 text-2xl font-bold text-white">
                  Femigo
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                      <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor"/>
                  </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col gap-4 min-h-0">
              <div className="relative flex flex-col gap-2 shrink-0">
                  <div className="relative">
                      <Circle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-9 bg-gray-800 border-gray-700" placeholder="Choose start location" />
                  </div>
                  <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input className="pl-9 bg-gray-800 border-gray-700" placeholder="Choose destination" />
                  </div>
                  <Button variant="outline" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border-gray-600">
                      <ArrowRightLeft className="h-4 w-4"/>
                  </Button>
              </div>
              
              <div className="flex items-center justify-around bg-gray-900/70 p-1 rounded-full shrink-0">
                  {travelModes.map((mode) => (
                      <Button 
                          key={mode.name}
                          variant="ghost" 
                          className={cn(
                              "flex-1 rounded-full text-white/70 hover:text-white",
                              travelMode === mode.name && "bg-primary/80 text-white hover:bg-primary/90"
                          )}
                          onClick={() => setTravelMode(mode.name as TravelMode)}
                      >
                        <mode.icon className="h-5 w-5" />
                      </Button>
                  ))}
              </div>

              <div className="relative flex-1 w-full rounded-lg overflow-hidden min-h-0">
                  <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['maps', 'marker', 'places']}>
                    <Map
                    center={mapCenter}
                    zoom={mapZoom}
                    onCameraChanged={handleCameraChange}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    mapId="a2b4a5d6e7f8g9h0"
                    >
                    {userLocation && (
                        <AdvancedMarker position={userLocation}>
                          <UserMarker />
                        </AdvancedMarker>
                    )}
                    <RoutePolyline path={snappedPath} />
                    </Map>
                  </APIProvider>
                  <div className="absolute top-2 right-2 z-10">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleRecenter}
                                    disabled={!userLocation}
                                    className="bg-background/80 hover:bg-background text-foreground backdrop-blur-sm rounded-full"
                                    >
                                    <LocateFixed className="h-5 w-5" />
                                    <span className="sr-only">Re-center on me</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Re-center on me</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                {error && (
                    <div className="absolute top-4 left-1/2 z-10 w-full max-w-md -translate-x-1/2 p-4">
                    <Alert variant="destructive">
                        <AlertTitle>Location Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    </div>
                )}
                {!userLocation && !error && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                        <div className="text-center space-y-4 text-foreground">
                            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                                <div className="absolute h-full w-full animate-ping rounded-full bg-primary/50" />
                                <Skeleton className="h-full w-full rounded-full" />
                            </div>
                            <h2 className="text-2xl font-bold">Finding your location...</h2>
                            <p className="text-muted-foreground">Please allow location access if prompted.</p>
                        </div>
                    </div>
                )}
              </div>

              <div className="flex flex-col gap-4 shrink-0">
                  <Button className="w-full py-6 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90">
                      START
                  </Button>
                  <div className="flex justify-around items-center bg-gray-900/50 p-2 rounded-2xl">
                      <Button variant="ghost" className="text-white font-semibold">
                          <Share2 className="mr-2 h-5 w-5 text-primary" />
                          Share Live Location
                      </Button>
                      <Button variant="ghost" className="text-white font-semibold">
                          <Footprints className="mr-2 h-5 w-5 text-primary" />
                          Track Me
                      </Button>
                  </div>
              </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
