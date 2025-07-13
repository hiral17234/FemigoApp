
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Siren, MapPin, Loader2, Navigation, Building, Clock, Route } from 'lucide-react';
import { findNearbyPlaces, type Place } from '@/app/actions/find-nearby-places';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getRouteInfo } from '@/app/actions/get-route-info';

type Point = { lat: number; lng: number };
type EnrichedPlace = Place & { distance?: string; duration?: string };

function NearbyHelpSkeleton() {
    return (
        <div className="w-full max-w-lg mx-auto space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                </Card>
            ))}
        </div>
    )
}

export default function NearbyHelpPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [userLocation, setUserLocation] = useState<Point | null>(null);
    const [nearbyPolice, setNearbyPolice] = useState<EnrichedPlace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('Finding your location...');

    useEffect(() => {
        if (!navigator.geolocation) {
            toast({ variant: 'destructive', title: 'Geolocation not supported by your browser.' });
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setUserLocation(location);
            },
            () => {
                toast({ variant: 'destructive', title: 'Unable to retrieve your location. Please enable location services.' });
                setIsLoading(false);
            }
        );
    }, [toast]);

    useEffect(() => {
        if (userLocation) {
            const fetchClosestPlaces = async () => {
                setIsLoading(true);
                const searchRadiuses = [1000, 2000, 5000]; // Search in 1km, then 2km, then 5km
                let foundPlaces: Place[] = [];

                for (const radius of searchRadiuses) {
                    setStatusMessage(`Searching for help within ${radius/1000}km...`);
                    try {
                        const places = await findNearbyPlaces({
                            location: userLocation,
                            placeType: 'police',
                            radius: radius,
                        });

                        if (places.length > 0) {
                            foundPlaces = places;
                            break; 
                        }
                    } catch (error) {
                         console.error(`Failed to find nearby places with radius ${radius}:`, error);
                         toast({ variant: 'destructive', title: 'Could not fetch nearby places.' });
                         break;
                    }
                }
                
                if (foundPlaces.length > 0) {
                    setStatusMessage('Fetching route information...');
                    const enrichedPlacesPromises = foundPlaces.map(async (place) => {
                        const routeInfo = await getRouteInfo({ origin: userLocation, destination: place.location });
                        return { ...place, ...routeInfo };
                    });
                    const enrichedPlaces = await Promise.all(enrichedPlacesPromises);
                    setNearbyPolice(enrichedPlaces);
                }

                setIsLoading(false);
            };
            fetchClosestPlaces();
        }
    }, [userLocation, toast]);

    return (
        <main className="min-h-screen w-full bg-background p-4 text-foreground">
             <div className="w-full max-w-lg mx-auto">
                <header className="flex items-center gap-4 mb-6">
                    <Link href="/sos">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Nearby Help</h1>
                        <p className="text-muted-foreground">Closest police stations to your location.</p>
                    </div>
                </header>

                {isLoading && (
                    <div className="space-y-4">
                        <div className="flex justify-center items-center gap-2 p-4 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>{statusMessage}</span>
                        </div>
                        <NearbyHelpSkeleton />
                    </div>
                )}


                {!isLoading && nearbyPolice.length === 0 && (
                     <div className="text-center py-16 text-muted-foreground bg-card rounded-lg">
                        <Building className="mx-auto h-12 w-12 mb-4" />
                        <p className="font-semibold">No police stations found within a 5km radius.</p>
                        <p className="text-sm mt-1">Try expanding your search or checking your location permissions.</p>
                    </div>
                )}
                
                {!isLoading && nearbyPolice.length > 0 && (
                    <div className="space-y-4">
                        {nearbyPolice.map((place) => {
                            const destinationUrl = `/location?destinationName=${encodeURIComponent(place.name)}&destinationLat=${place.location.lat}&destinationLng=${place.location.lng}&destinationAddress=${encodeURIComponent(place.vicinity || place.name)}`;
                            
                            return (
                            <Card key={place.place_id} className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <Siren className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="font-bold truncate">{place.name}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{place.vicinity}</p>
                                        {place.distance && place.duration && (
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                                <span className="flex items-center gap-1"><Route className="h-3 w-3" /> {place.distance}</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {place.duration}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Link href={destinationUrl}>
                                    <Button size="icon" variant="outline">
                                        <Navigation className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </Card>
                        )})}
                    </div>
                )}
             </div>
        </main>
    );
}
