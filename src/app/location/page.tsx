
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, LocateFixed, Shield, Hospital, X, Loader2 } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, MapCameraChangedEvent, useMap, Pin } from '@vis.gl/react-google-maps';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { snapToRoad } from '@/app/actions/snap-to-road';
import { findNearbyPlaces, type Place } from '@/app/actions/find-nearby-places';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Point = { lat: number; lng: number };

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

// Component to render nearby place markers
const PlaceMarkers = ({ places, type }: { places: Place[], type: 'police' | 'hospital' | null }) => {
    if (!type) return null;

    const iconColor = type === 'police' ? '#3b82f6' : '#10b981';
    const borderColor = type === 'police' ? '#1d4ed8' : '#047857';

    return (
        <>
            {places.map((place) => (
                <AdvancedMarker key={place.place_id} position={place.location} title={place.name}>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Pin background={iconColor} borderColor={borderColor} glyphColor={'#ffffff'}>
                                    {type === 'police' ? <Shield size={20} /> : <Hospital size={20} />}
                                </Pin>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-bold">{place.name}</p>
                                {place.vicinity && <p className="text-muted-foreground">{place.vicinity}</p>}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </AdvancedMarker>
            ))}
        </>
    )
}

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

  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [placeType, setPlaceType] = useState<'police' | 'hospital' | null>(null);
  const [isFindingPlaces, setIsFindingPlaces] = useState(false);

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
  
  const handleFindNearby = async (type: 'police' | 'hospital') => {
    if (!userLocation) {
        toast({
            variant: "destructive",
            title: "Location not available",
            description: "We need your location to find nearby places."
        });
        return;
    }

    setIsFindingPlaces(true);
    setPlaceType(type);
    setNearbyPlaces([]);

    try {
        const places = await findNearbyPlaces({ location: userLocation, placeType: type });
        setNearbyPlaces(places);
        if (places.length === 0) {
            toast({
                title: `No ${type === 'police' ? 'police stations' : 'hospitals'} found nearby.`,
                description: "Try moving to a different area."
            });
        }
    } catch (e: any) {
        toast({
            variant: "destructive",
            title: "Error finding places",
            description: e.message || "An unexpected error occurred."
        });
    } finally {
        setIsFindingPlaces(false);
    }
  }

  const clearNearbyPlaces = () => {
    setNearbyPlaces([]);
    setPlaceType(null);
  }

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

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#06010F] p-4 text-white sm:p-6 md:p-8">
      <Card className="w-full max-w-6xl overflow-hidden rounded-2xl border-purple-900/50 bg-background shadow-2xl shadow-black/50">
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 p-4 border-b border-purple-900/50">
          <div className='flex items-center gap-4'>
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                  <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <CardTitle>Live Location</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isFindingPlaces && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>Finding...</span>
              </div>
            )}
            {nearbyPlaces.length > 0 && placeType && (
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={clearNearbyPlaces}
                            className="bg-red-900/50 hover:bg-red-900/80 text-white rounded-full h-8 w-8"
                            >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Clear places</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Clear markers</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
            )}
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleFindNearby('police')}
                            disabled={!userLocation || isFindingPlaces}
                            className={cn("rounded-full h-9 w-9 border-blue-500/50 text-blue-500 hover:bg-blue-900/20 hover:text-blue-400", placeType === 'police' && 'bg-blue-900/20')}
                            >
                            <Shield className="h-5 w-5" />
                            <span className="sr-only">Find Police Stations</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Find Police Stations</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleFindNearby('hospital')}
                            disabled={!userLocation || isFindingPlaces}
                            className={cn("rounded-full h-9 w-9 border-green-500/50 text-green-500 hover:bg-green-900/20 hover:text-green-400", placeType === 'hospital' && 'bg-green-900/20')}
                            >
                            <Hospital className="h-5 w-5" />
                            <span className="sr-only">Find Hospitals</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Find Hospitals</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-[75vh] w-full">
              <div className="absolute top-4 right-4 z-10">
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
              
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['maps', 'marker', 'places']}>
                  <Map
                  center={mapCenter}
                  zoom={mapZoom}
                  onCameraChanged={handleCameraChange}
                  gestureHandling={'greedy'}
                  disableDefaultUI={false}
                  mapId="a2b4a5d6e7f8g9h0"
                  streetViewControl={true}
                  zoomControl={true}
                  >
                  {userLocation && (
                      <AdvancedMarker position={userLocation}>
                      <UserMarker />
                      </AdvancedMarker>
                  )}
                  <RoutePolyline path={snappedPath} />
                  <PlaceMarkers places={nearbyPlaces} type={placeType} />
                  </Map>
              </APIProvider>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
