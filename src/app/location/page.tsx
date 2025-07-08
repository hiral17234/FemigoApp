
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Car, Bike, TramFront, Footprints, ArrowRightLeft, Share2, MapPin, Circle, Loader2 } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { snapToRoad } from '@/app/actions/snap-to-road';


const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Point = { lat: number; lng: number };
type Place = { address: string; location: Point | null };
type TravelMode = 'DRIVING' | 'BICYCLING' | 'TRANSIT' | 'WALKING';

// A custom marker component that pulses
const UserMarker = () => (
    <div className="relative flex h-5 w-5 items-center justify-center">
      <div className="absolute h-full w-full animate-ping rounded-full bg-blue-500/70" />
      <div className="relative h-3 w-3 rounded-full border-2 border-white bg-blue-500" />
    </div>
);

/**
 * Renders the route polylines on the map.
 * @param routes - The array of routes from the Directions Service.
 * @param selectedRouteIndex - The index of the currently selected route.
 * @param onRouteClick - Handler for when a route is clicked.
 */
const RoutePolylines = ({ routes, selectedRouteIndex, onRouteClick }: { routes: google.maps.DirectionsRoute[], selectedRouteIndex: number, onRouteClick: (index: number) => void }) => {
    const map = useMap();
    const polylinesRef = useRef<google.maps.Polyline[]>([]);

    useEffect(() => {
        if (!map) return;

        // Clear previous polylines
        polylinesRef.current.forEach(polyline => polyline.setMap(null));
        polylinesRef.current = [];

        if (!routes) return;
        
        routes.forEach((route, index) => {
            const isSelected = index === selectedRouteIndex;
            const lineSymbol = {
                path: 'M 0,-1 0,1',
                strokeOpacity: 1,
                scale: 4,
            };

            const polyline = new google.maps.Polyline({
                path: route.overview_path,
                geodesic: true,
                strokeColor: isSelected ? '#FF0000' : '#808080',
                strokeOpacity: isSelected ? 0.8 : 0,
                strokeWeight: isSelected ? 8 : 5,
                zIndex: isSelected ? 2 : 1,
                icons: isSelected ? undefined : [{
                    icon: lineSymbol,
                    offset: '0',
                    repeat: '20px'
                }],
                map: map,
            });

            polyline.addListener('click', () => {
                onRouteClick(index);
            });

            polylinesRef.current.push(polyline);
        });

        return () => {
            polylinesRef.current.forEach(polyline => polyline.setMap(null));
        }

    }, [map, routes, selectedRouteIndex, onRouteClick]);

    return null;
}

/**
 * Renders the user's live tracked path on the map.
 * @param path - An array of points representing the user's path.
 */
const LiveTrackingPolyline = ({ path }: { path: Point[] }) => {
    const map = useMap();
    const polylineRef = useRef<google.maps.Polyline | null>(null);

    useEffect(() => {
        if (!map) return;

        if (!polylineRef.current) {
            polylineRef.current = new google.maps.Polyline({
                strokeColor: '#0000FF', // Blue
                strokeOpacity: 0.9,
                strokeWeight: 8,
                zIndex: 3,
                map: map,
            });
        }
        polylineRef.current.setPath(path);

    }, [map, path]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
            }
        };
    }, []);

    return null;
}

function LocationPlanner() {
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<Point | null>(null);
  const [mapCenter, setMapCenter] = useState<Point>({ lat: 20.5937, lng: 78.9629 });
  const [mapZoom, setMapZoom] = useState(4);
  const [initialLocationSet, setInitialLocationSet] = useState(false);
  const [travelMode, setTravelMode] = useState<TravelMode>('WALKING');

  const [startPoint, setStartPoint] = useState<Place>({ address: "", location: null });
  const [destinationPoint, setDestinationPoint] = useState<Place>({ address: "", location: null });
  
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [isCalculating, setIsCalculating] =useState(false);

  const [isTracking, setIsTracking] = useState(false);
  const [livePath, setLivePath] = useState<Point[]>([]);
  const rawPathRef = useRef<Point[]>([]);
  const watchIdRef = useRef<number | null>(null);

  const startInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  
  const placesLibrary = useMapsLibrary('places');
  const routesLibrary = useMapsLibrary('routes');
  const geometryLibrary = useMapsLibrary('geometry');


  // Effect to get user's location once and set the initial map state.
  useEffect(() => {
    if (initialLocationSet || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: Point = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(newLocation);
        setStartPoint({ address: "Your Location", location: newLocation });
        if (!initialLocationSet) {
          setMapCenter(newLocation);
          setMapZoom(15);
          setInitialLocationSet(true);
        }
      },
      () => {
        setInitialLocationSet(true); // Prevent this from running again
      }, 
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [initialLocationSet]);

  // Effect to initialize Google Places Autocomplete.
  useEffect(() => {
    if (!placesLibrary || !startInputRef.current || !destinationInputRef.current) return;

    const startAutocomplete = new placesLibrary.Autocomplete(startInputRef.current, { fields: ['geometry.location', 'formatted_address', 'name'] });
    const destinationAutocomplete = new placesLibrary.Autocomplete(destinationInputRef.current, { fields: ['geometry.location', 'formatted_address', 'name'] });

    const startListener = startAutocomplete.addListener('place_changed', () => {
      const place = startAutocomplete.getPlace();
      if (place.geometry?.location) {
          setStartPoint({ 
              address: place.formatted_address || place.name || '', 
              location: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
          });
      }
    });
    
    const destListener = destinationAutocomplete.addListener('place_changed', () => {
      const place = destinationAutocomplete.getPlace();
      if (place.geometry?.location) {
          setDestinationPoint({ 
              address: place.formatted_address || place.name || '',
              location: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
          });
      }
    });

    return () => {
        startListener.remove();
        destListener.remove();
    }
  }, [placesLibrary]);

  // Effect to re-center the map when the start or destination point changes.
  useEffect(() => {
    if (startPoint.location && startPoint.address !== "Your Location") {
      setMapCenter(startPoint.location);
      setMapZoom(15);
    } else if (destinationPoint.location) {
        setMapCenter(destinationPoint.location);
        setMapZoom(15);
    }
  }, [startPoint, destinationPoint]);

  // Effect to fetch directions when route parameters change.
  useEffect(() => {
    if (!routesLibrary || !startPoint.location || !destinationPoint.location) {
      setDirections(null);
      return;
    }
    const directionsService = new routesLibrary.DirectionsService();
    setIsCalculating(true);
    setDirections(null);
    directionsService.route({
        origin: startPoint.location,
        destination: destinationPoint.location,
        travelMode: travelMode as google.maps.TravelMode,
        provideRouteAlternatives: true,
    }).then(response => {
        setDirections(response);
        setSelectedRouteIndex(0);
        if(response.routes.length > 0 && response.routes[0].bounds) {
            const map = document.querySelector('.gm-style')?.parentElement;
            if(map){
                 // This part needs a map instance to fit bounds, will skip for now
                 // For simplicity, we just center on destination
                setMapCenter(destinationPoint.location!);
                setMapZoom(12);
            }
        }
    }).catch(e => {
        console.error("Directions request failed", e);
        toast({ variant: 'destructive', title: 'Could not calculate routes.' });
    }).finally(() => {
        setIsCalculating(false);
    });
  }, [routesLibrary, startPoint.location, destinationPoint.location, travelMode, toast]);
  
  // Effect to manage live location tracking
  useEffect(() => {
    if (!isTracking) {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        return;
    }

    const processPath = async () => {
        if (rawPathRef.current.length === 0) return;
        
        const path_to_snap = [...(livePath.slice(-1)), ...rawPathRef.current];
        rawPathRef.current = [];
        
        try {
            const newSnappedPoints = await snapToRoad(path_to_snap);
            if (newSnappedPoints && newSnappedPoints.length > 0) {
                 setLivePath(prev => {
                    const prevPath = prev.length > 0 ? prev.slice(0, -1) : [];
                    return [...prevPath, ...newSnappedPoints];
                });
            }
        } catch (e) { console.error("Failed to snap to road:", e); }
    };

    const snapInterval = setInterval(processPath, 5000);

    watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
            const newLocation: Point = { lat: position.coords.latitude, lng: position.coords.longitude };
            setUserLocation(newLocation);
            rawPathRef.current.push(newLocation);

            // Off-route check
            if (geometryLibrary && directions && directions.routes[selectedRouteIndex]) {
                const routePath = directions.routes[selectedRouteIndex].overview_path;
                const onRoute = geometryLibrary.poly.isLocationOnEdge(
                    new google.maps.LatLng(newLocation.lat, newLocation.lng),
                    new google.maps.Polyline({ path: routePath }),
                    0.001 // ~100 meters tolerance
                );

                if (!onRoute) {
                    toast({ variant: "destructive", title: "You are off-route!", description: "Recalculating..." });
                    setStartPoint({ address: "Your Location", location: newLocation });
                }
            }
        },
        () => {
            toast({ variant: "destructive", title: "Could not get your location." });
            setIsTracking(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
    
    return () => {
        clearInterval(snapInterval);
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }
    };
  }, [isTracking, livePath, directions, selectedRouteIndex, geometryLibrary, toast]);


  const handleSwapLocations = () => {
    setStartPoint(destinationPoint);
    setDestinationPoint(startPoint);
  };
  
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartPoint({ address: e.target.value, location: null });
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => setDestinationPoint({ address: e.target.value, location: null });
  const handleStartFocus = () => startPoint?.address === "Your Location" && setStartPoint({ address: "", location: null });
  const handleStartTracking = () => {
      if (isTracking) {
        setIsTracking(false);
      } else {
         if (!directions?.routes[selectedRouteIndex]) {
            toast({ variant: 'destructive', title: 'No route selected to start tracking.' });
            return;
        }
        setLivePath(userLocation ? [userLocation] : []);
        rawPathRef.current = [];
        setIsTracking(true);
      }
  }

  const travelModes = [
      { name: 'DRIVING', icon: Car },
      { name: 'BICYCLING', icon: Bike },
      { name: 'TRANSIT', icon: TramFront },
      { name: 'WALKING', icon: Footprints },
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
        <CardContent className="p-0 flex-1 flex flex-col gap-4 min-h-0">
            <div className="relative flex flex-col gap-2 shrink-0 p-4">
                <div className="relative">
                    <Circle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input ref={startInputRef} value={startPoint?.address || ''} onChange={handleStartChange} onFocus={handleStartFocus} className="pl-9 bg-gray-800 border-gray-700" placeholder="Choose start location" />
                </div>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input ref={destinationInputRef} value={destinationPoint?.address || ''} onChange={handleDestinationChange} className="pl-9 bg-gray-800 border-gray-700" placeholder="Choose destination" />
                </div>
                <Button variant="outline" size="icon" onClick={handleSwapLocations} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border-gray-600">
                    <ArrowRightLeft className="h-4 w-4"/>
                </Button>
            </div>
            
            <div className="flex items-center justify-around bg-gray-900/70 p-1 rounded-full shrink-0 mx-4">
                {travelModes.map((mode) => (
                    <Button 
                        key={mode.name}
                        variant="ghost" 
                        className={cn("flex-1 rounded-full text-white/70 hover:text-white capitalize", travelMode === mode.name && "bg-primary/80 text-white hover:bg-primary/90")}
                        onClick={() => setTravelMode(mode.name as TravelMode)}
                    >
                      <mode.icon className="h-5 w-5" />
                    </Button>
                ))}
            </div>

            <div className="relative flex-1 w-full overflow-hidden min-h-[200px] md:min-h-0">
                <Map center={mapCenter} zoom={mapZoom} gestureHandling={'greedy'} disableDefaultUI={true} mapId="a2b4a5d6e7f8g9h0" onCenterChanged={(e) => setMapCenter(e.detail.center)}>
                    {userLocation && <AdvancedMarker position={userLocation}><UserMarker /></AdvancedMarker>}
                    {directions && <RoutePolylines routes={directions.routes} selectedRouteIndex={selectedRouteIndex} onRouteClick={setSelectedRouteIndex} />}
                    {isTracking && <LiveTrackingPolyline path={livePath} />}
                </Map>
                 {isCalculating && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                      <div className="text-center space-y-4 text-foreground">
                          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                          <h2 className="text-xl font-bold">Calculating Routes...</h2>
                      </div>
                  </div>
                )}
            </div>

            {directions && directions.routes.length > 0 && (
                <div className="flex flex-col gap-2 shrink-0 p-4 border-t border-purple-900/50">
                    <h3 className="font-bold text-lg text-white">Select a Route</h3>
                    <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
                        {directions.routes.map((route, index) => (
                            <div key={index} onClick={() => setSelectedRouteIndex(index)} className={cn(
                                "p-3 rounded-md cursor-pointer border-2 transition-colors",
                                selectedRouteIndex === index ? "bg-primary/20 border-primary" : "border-gray-800 bg-gray-900/70 hover:bg-gray-800"
                            )}>
                                <p className="font-semibold text-white">{route.summary || `Route ${index + 1}`}</p>
                                <p className="text-sm text-muted-foreground">{route.legs[0].distance?.text} · {route.legs[0].duration?.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 shrink-0 p-4 pt-0">
                <Button onClick={handleStartTracking} className="w-full py-6 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50" disabled={!directions || isCalculating}>
                    {isTracking ? "STOP" : "START"}
                </Button>
                <div className="flex justify-around items-center bg-gray-900/50 p-2 rounded-2xl">
                    <Button variant="ghost" className="text-white font-semibold disabled:opacity-50" disabled={isTracking}>
                        <Share2 className="mr-2 h-5 w-5 text-primary" />
                        Share Live Location
                    </Button>
                    <Button variant="ghost" className="text-white font-semibold disabled:opacity-50" disabled={isTracking}>
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
       <APIProvider apiKey={GOOGLE_MAPS_API_KEY as string} libraries={['marker', 'places', 'routes', 'geometry']}>
        <LocationPlanner />
      </APIProvider>
    </main>
  );
}

