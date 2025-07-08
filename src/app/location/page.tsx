
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Car, Bike, BusFront, Footprints, ArrowRightLeft, Share2, MapPin, Circle } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, useMapsLibrary } from '@vis.gl/react-google-maps';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Point = { lat: number; lng: number };
type Place = { address: string; location: Point | null };
type TravelMode = 'drive' | 'bike' | 'bus' | 'walk';

// A custom marker component that pulses
const UserMarker = () => (
    <div className="relative flex h-5 w-5 items-center justify-center">
      <div className="absolute h-full w-full animate-ping rounded-full bg-primary/70" />
      <div className="relative h-3 w-3 rounded-full border-2 border-white bg-primary" />
    </div>
);


function LocationPlanner() {
  const [userLocation, setUserLocation] = useState<Point | null>(null);
  const [mapCenter, setMapCenter] = useState<Point>({ lat: 20.5937, lng: 78.9629 });
  const [mapZoom, setMapZoom] = useState(4);
  const [initialLocationSet, setInitialLocationSet] = useState(false);
  const [travelMode, setTravelMode] = useState<TravelMode>('walk');

  const [startPoint, setStartPoint] = useState<Place>({ address: "", location: null });
  const [destinationPoint, setDestinationPoint] = useState<Place>({ address: "", location: null });
  
  const startInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  
  const places = useMapsLibrary('places');

  // Effect to get user's location and set the initial map state.
  useEffect(() => {
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: Point = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(newLocation);
          
          if (!initialLocationSet) {
             setMapCenter(newLocation);
             setMapZoom(15);
             setInitialLocationSet(true);
             // Set start point to user's location only if it hasn't been set.
             if (!startPoint.location) {
                setStartPoint({ address: "Your Location", location: newLocation });
             }
          }
        },
        () => {}, // Handle geolocation error
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [initialLocationSet, startPoint.location]);

  // Effect to initialize the Google Places Autocomplete functionality on the input fields.
  useEffect(() => {
    if (!places || !startInputRef.current || !destinationInputRef.current) return;

    const startAutocomplete = new places.Autocomplete(startInputRef.current, {
        fields: ['geometry.location', 'formatted_address', 'name'],
    });

    const destinationAutocomplete = new places.Autocomplete(destinationInputRef.current, {
        fields: ['geometry.location', 'formatted_address', 'name'],
    });

    startAutocomplete.addListener('place_changed', () => {
        const place = startAutocomplete.getPlace();
        if (place.geometry?.location) {
            const newLocation: Point = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            };
            setStartPoint({ address: place.formatted_address || place.name || '', location: newLocation });
            setMapCenter(newLocation);
            setMapZoom(15);
        }
    });

    destinationAutocomplete.addListener('place_changed', () => {
        const place = destinationAutocomplete.getPlace();
        if (place.geometry?.location) {
            const newLocation: Point = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            };
            setDestinationPoint({ address: place.formatted_address || place.name || '', location: newLocation });
        }
    });

    // Clean up the listeners when the component unmounts.
    return () => {
        if (window.google) {
            google.maps.event.clearInstanceListeners(startAutocomplete);
            google.maps.event.clearInstanceListeners(destinationAutocomplete);
        }
    }
  }, [places]);

  const handleSwapLocations = () => {
      const tempStart = startPoint;
      setStartPoint(destinationPoint);
      setDestinationPoint(tempStart);
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartPoint({ ...startPoint, address: e.target.value });
  };
  
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestinationPoint({ ...destinationPoint, address: e.target.value });
  };

  const handleStartFocus = () => {
      if (startPoint?.address === "Your Location") {
          setStartPoint({ address: "", location: null });
      }
  };

  const travelModes = [
      { name: 'drive', icon: Car },
      { name: 'bike', icon: Bike },
      { name: 'bus', icon: BusFront },
      { name: 'walk', icon: Footprints },
  ]

  return (
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
                    <Input 
                      ref={startInputRef}
                      value={startPoint?.address || ''}
                      onChange={handleStartChange}
                      onFocus={handleStartFocus}
                      className="pl-9 bg-gray-800 border-gray-700" 
                      placeholder="Choose start location" 
                    />
                </div>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input 
                      ref={destinationInputRef}
                      value={destinationPoint?.address || ''}
                      onChange={handleDestinationChange}
                      className="pl-9 bg-gray-800 border-gray-700" 
                      placeholder="Choose destination" 
                    />
                </div>
                <Button variant="outline" size="icon" onClick={handleSwapLocations} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border-gray-600">
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
              <Link href="/location/fullscreen" className="block w-full h-full">
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <p className="text-white font-bold text-lg bg-black/50 p-2 rounded-md">Click to expand map</p>
                </div>
                <Map
                  center={mapCenter}
                  zoom={mapZoom}
                  gestureHandling={'none'}
                  disableDefaultUI={true}
                  mapId="a2b4a5d6e7f8g9h0"
                >
                {userLocation ? (
                    <AdvancedMarker position={userLocation}>
                      <UserMarker />
                    </AdvancedMarker>
                ) : (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                      <div className="text-center space-y-4 text-foreground">
                          <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                              <div className="absolute h-full w-full animate-ping rounded-full bg-primary/50" />
                              <Skeleton className="h-full w-full rounded-full" />
                          </div>
                          <h2 className="text-2xl font-bold">Finding you...</h2>
                      </div>
                  </div>
                )}
                </Map>
              </Link>
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
  );
}


export default function LocationPage() {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#06010F] p-4 text-center">
            <div className="rounded-lg bg-card p-8 text-card-foreground">
                <h1 className="text-xl font-bold text-destructive">Configuration Error</h1>
                <p className="mt-2 text-muted-foreground">Google Maps API Key is missing. Please add <code className="font-mono bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment variables.</p>
            </div>
        </div>
    );
  }

  return (
    <main className="h-screen w-full flex flex-col bg-[#06010F]">
       <APIProvider apiKey={GOOGLE_MAPS_API_KEY as string} libraries={['marker', 'places']}>
        <LocationPlanner />
      </APIProvider>
    </main>
  );
}
