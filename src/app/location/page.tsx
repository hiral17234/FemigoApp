
'use client'

import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Wind, Milestone, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('react-map-gl').then(mod => mod.Map), { ssr: false });
const Marker = dynamic(() => import('react-map-gl').then(mod => mod.Marker), { ssr: false });
const Source = dynamic(() => import('react-map-gl').then(mod => mod.Source), { ssr: false });
const Layer = dynamic(() => import('react-map-gl').then(mod => mod.Layer), { ssr: false });

type Viewport = {
  longitude: number;
  latitude: number;
  zoom: number;
};

type GeoJsonSource = {
  type: 'Feature';
  geometry: {
    type: 'LineString';
    coordinates: number[][];
  };
  properties: {};
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export default function LocationPage() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  
  const [viewport, setViewport] = useState<Viewport>({
    longitude: 78.9629, // Centered on India
    latitude: 20.5937,
    zoom: 4,
  });

  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null);
  const [route, setRoute] = useState<number[][]>([]);
  const [distance, setDistance] = useState(0);

  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation(position.coords);
        
        setRoute(prevRoute => {
          const newRoute = [...prevRoute, [longitude, latitude]];
          if (newRoute.length > 1) {
            const lastPoint = newRoute[newRoute.length - 2];
            const newDistance = calculateDistance(lastPoint[1], lastPoint[0], latitude, longitude);
            setDistance(prevDistance => prevDistance + newDistance);
          }
          return newRoute;
        });

        // Center map on first location fix
        if (route.length === 0) {
            setViewport(prev => ({...prev, latitude, longitude, zoom: 15 }));
        }
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Unable to retrieve your location. Please enable location services.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const routeGeoJson: GeoJsonSource = useMemo(() => ({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: route,
    },
    properties: {},
  }), [route]);

  const recenterMap = () => {
    if (currentLocation) {
      setViewport({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        zoom: 16,
      });
    }
  };

  const speed = currentLocation?.speed ? (currentLocation.speed * 3.6).toFixed(1) : '0.0';

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#06010F]">
        <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-[#06010F] to-transparent">
            <Link href="/dashboard">
                <Button variant="ghost" className="text-gray-300 hover:bg-white/10 hover:text-white">
                    <ArrowLeft size={20} className="mr-2" /> Back
                </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">Live Location</h1>
            <div className="w-20" />
        </header>

        {!mapboxToken && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-md p-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Map Configuration Error</AlertTitle>
                  <AlertDescription>
                    The Mapbox Access Token is missing. Please add <code className="font-mono bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to your <code className="font-mono bg-muted px-1 py-0.5 rounded">.env</code> file.
                  </AlertDescription>
                </Alert>
            </div>
        )}

        {mapboxToken && <Map
            {...viewport}
            onMove={evt => setViewport(evt.viewState)}
            mapboxAccessToken={mapboxToken}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            style={{ width: '100vw', height: '100vh' }}
        >
            {/* User's current location marker */}
            {currentLocation && (
                <Marker longitude={currentLocation.longitude} latitude={currentLocation.latitude}>
                    <div className="relative">
                        <div className="h-4 w-4 rounded-full bg-blue-400 border-2 border-white pulse-marker" />
                    </div>
                </Marker>
            )}

            {/* Start point marker */}
            {route.length > 0 && (
                <Marker longitude={route[0][0]} latitude={route[0][1]}>
                    <div className="flex flex-col items-center text-pink-500">
                        <MapPin size={32} fill="#FF0080" strokeWidth={0} />
                        <span className="text-xs font-bold text-white bg-black/50 px-1 rounded">Start</span>
                    </div>
                </Marker>
            )}

            {/* Route polyline */}
            <Source id="route-source" type="geojson" data={routeGeoJson}>
                <Layer
                    id="route-layer"
                    type="line"
                    source="route-source"
                    layout={{
                        'line-join': 'round',
                        'line-cap': 'round'
                    }}
                    paint={{
                        'line-color': '#007BFF',
                        'line-width': 4,
                        'line-opacity': 0.8
                    }}
                />
            </Source>
        </Map>}

        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-[#06010F] to-transparent">
            <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-black/20 p-4 shadow-2xl shadow-pink-500/10 backdrop-blur-xl">
                 <div className="grid grid-cols-3 gap-4 text-center text-white">
                    <div>
                        <p className="text-sm text-purple-300/80">Speed</p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <Wind size={20} className="text-primary"/>
                            <p className="text-2xl font-bold">{speed}</p>
                            <p className="text-xs self-end mb-1">km/h</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-purple-300/80">Distance</p>
                         <div className="flex items-center justify-center gap-2 mt-1">
                            <Milestone size={20} className="text-primary"/>
                            <p className="text-2xl font-bold">{distance.toFixed(2)}</p>
                            <p className="text-xs self-end mb-1">km</p>
                        </div>
                    </div>
                    <div>
                        <Button onClick={recenterMap} className="h-full w-full bg-white/10 hover:bg-white/20">
                            <MapPin size={20} className="mr-2" /> Recenter
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
