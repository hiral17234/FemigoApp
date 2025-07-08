'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, LocateFixed, Search, Siren, Hospital, Trash2 } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, MapCameraChangedEvent, useMap } from '@vis.gl/react-google-maps';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { snapToRoad } from '@/app/actions/snap-to-road';
import { findNearbyPlaces } from '@/app/actions/find-nearby-places';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Point = { lat: number; lng: number };
type Place = { name: string; vicinity?: string; location: Point; place_id: string; };

const UserMarker = () => (
    <div className="relative flex h-5 w-5 items-center justify-center">
      <div className="absolute h-full w-full animate-ping rounded-full bg-primary/70" />
      <div className="relative h-3 w-3 rounded-full border-2 border-white bg-primary" />
    </div>
);

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

        return () => {
            if (polyline) polyline.setMap(null);
        };
    }, [map, path, polyline]);

    return null;
};

const NearbyPlaceMarker = ({ place, icon }: { place: Place, icon: React.ElementType }) => {
    const Icon = icon;
    return (
        <div className="flex flex-col items-center">
            <div className="bg-background rounded-full p-2 shadow-lg border-2 border-primary">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="bg-background text-foreground text-xs font-bold p-1 rounded-md shadow mt-1 whitespace-nowrap">
                {place.name}
            </div>
        </div>
    );
};


export default function FullscreenMapPage() {
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

    const [searchQuery, setSearchQuery] = useState('');

    const processPath = useCallback(async () => {
        if (isProcessingRef.current || rawPathRef.current.length === 0) return;
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

    const handleFindNearby = async (type: 'police' | 'hospital') => {
        if (!userLocation) {
            toast({ variant: 'destructive', title: 'Your location is not available yet.' });
            return;
        }
        setPlaceType(type);
        toast({ title: `Searching for nearby ${type}...` });
        const places = await findNearbyPlaces({ location: userLocation, placeType: type });
        setNearbyPlaces(places);
        if (places.length === 0) {
            toast({ variant: 'destructive', title: 'No places found nearby.' });
        }
    };

    const handleClearPlaces = () => {
        setNearbyPlaces([]);
        setPlaceType(null);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery || !window.google?.maps?.Geocoder) {
            console.error("Search query or Geocoder not available.");
            return;
        }

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: searchQuery }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                setMapCenter({ lat: location.lat(), lng: location.lng() });
                setMapZoom(15);
            } else {
                toast({ 
                    variant: 'destructive', 
                    title: 'Location not found', 
                    description: `Could not find a location for "${searchQuery}".` 
                });
            }
        });
    };

    if (!GOOGLE_MAPS_API_KEY) {
        return <div className="flex h-screen w-screen items-center justify-center bg-[#06010F] p-4 text-white">API Key Missing</div>;
    }

    return (
        <main className="h-screen w-screen flex flex-col bg-[#06010F]">
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['maps', 'marker', 'places', 'geocoding']}>
                <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-start gap-4">
                    <Link href="/location">
                        <Button variant="outline" size="icon" className="bg-background/80 hover:bg-background text-foreground backdrop-blur-sm rounded-full shrink-0">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <Input 
                            placeholder="Search for a location..." 
                            className="bg-background/80 border-gray-500" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button type="submit" variant="outline" size="icon" className="bg-background/80 hover:bg-background text-foreground backdrop-blur-sm rounded-full shrink-0">
                            <Search className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
                
                <Map
                    className="flex-grow"
                    center={mapCenter}
                    zoom={mapZoom}
                    onCameraChanged={handleCameraChange}
                    gestureHandling={'greedy'}
                    disableDefaultUI={false}
                    mapTypeControl={true}
                    streetViewControl={true}
                    zoomControl={true}
                    fullscreenControl={false}
                    mapId="a2b4a5d6e7f8g9h0"
                >
                    {userLocation && (
                        <AdvancedMarker position={userLocation} zIndex={10}>
                            <UserMarker />
                        </AdvancedMarker>
                    )}
                    <RoutePolyline path={snappedPath} />
                    {nearbyPlaces.map((place) => (
                        <AdvancedMarker key={place.place_id} position={place.location}>
                             <NearbyPlaceMarker place={place} icon={placeType === 'police' ? Siren : Hospital} />
                        </AdvancedMarker>
                    ))}
                </Map>

                <div className="absolute bottom-16 sm:bottom-4 left-4 z-10 flex flex-col gap-2">
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => handleFindNearby('police')} className="bg-background/80 hover:bg-background text-foreground backdrop-blur-sm rounded-full">
                                    <Siren className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right"><p>Find Police</p></TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => handleFindNearby('hospital')} className="bg-background/80 hover:bg-background text-foreground backdrop-blur-sm rounded-full">
                                    <Hospital className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right"><p>Find Hospital</p></TooltipContent>
                        </Tooltip>
                         {nearbyPlaces.length > 0 && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="destructive" size="icon" onClick={handleClearPlaces} className="backdrop-blur-sm rounded-full">
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right"><p>Clear Places</p></TooltipContent>
                            </Tooltip>
                        )}
                    </TooltipProvider>
                </div>

                <div className="absolute bottom-16 sm:bottom-4 right-4 z-10">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleRecenter}
                                    disabled={!userLocation}
                                    className="bg-background/80 hover:bg-background text-foreground backdrop-blur-sm rounded-full"
                                    >
                                    <LocateFixed className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Re-center on me</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
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
            </APIProvider>
        </main>
    );
}
