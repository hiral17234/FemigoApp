
'use client'

import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Wind, Milestone, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import type { DivIcon, Map as LeafletMap } from 'leaflet';

// Dynamically import react-leaflet components. This is crucial for Next.js.
// The loading component provides immediate feedback to the user.
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { 
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-[#06010F]">
            <Loader2 className="h-10 w-10 animate-spin text-white/50" />
        </div>
    ),
});
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });

type LatLngTuple = [number, number];

// Haversine formula to calculate distance between two lat/lng points in km.
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
  const mapRef = useRef<LeafletMap | null>(null);
  
  // This key is the definitive solution. It's generated once when the component mounts
  // and forces React to create a new, clean DOM element for the map, preventing the error.
  const [mapKey, setMapKey] = useState(Date.now());
  
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null);
  const [route, setRoute] = useState<LatLngTuple[]>([]);
  const [distance, setDistance] = useState(0);

  const [pulsingIcon, setPulsingIcon] = useState<DivIcon | null>(null);
  const [startIcon, setStartIcon] = useState<DivIcon | null>(null);

  useEffect(() => {
    // Dynamically import Leaflet to create custom icons only on the client-side.
    import('leaflet').then(L => {
      setPulsingIcon(new L.DivIcon({
        className: 'pulsing-marker-container',
        html: '<div class="relative flex h-4 w-4"><div class="absolute h-full w-full rounded-full bg-blue-400 border-2 border-white pulse-marker"></div></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      }));

      setStartIcon(new L.DivIcon({
          className: 'start-marker-container',
          html: `
              <div class="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#FF0080" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span class="text-xs font-bold text-white bg-black/50 px-1 rounded -mt-2">Start</span>
              </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
      }));
    });

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    // Start watching the user's position.
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPoint: LatLngTuple = [latitude, longitude];
        
        setCurrentLocation(position.coords);
        
        setRoute(prevRoute => {
          if (prevRoute.length > 0) {
            const lastPoint = prevRoute[prevRoute.length - 1];
            const newDistance = calculateDistance(lastPoint[0], lastPoint[1], newPoint[0], newPoint[1]);
            setDistance(prevDistance => prevDistance + newDistance);
          }
          return [...prevRoute, newPoint];
        });
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Unable to retrieve your location. Please enable location services.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Effect to pan the map to the current location when it updates.
  // This runs separately to avoid conflicts.
  useEffect(() => {
    if (mapRef.current && currentLocation) {
      if (route.length === 1) { // Only pan automatically on the very first location fix.
        mapRef.current.setView([currentLocation.latitude, currentLocation.longitude], 16);
      }
    }
  }, [currentLocation, route.length]);


  const recenterMap = () => {
    if (currentLocation && mapRef.current) {
      const { latitude, longitude } = currentLocation;
      mapRef.current.setView([latitude, longitude], 16);
    }
  };

  const speed = currentLocation?.speed ? (currentLocation.speed * 3.6).toFixed(1) : '0.0';
  
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#06010F]">
        <header className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between p-4 bg-gradient-to-b from-[#06010F] to-transparent">
            <Link href="/dashboard">
                <Button variant="ghost" className="text-gray-300 hover:bg-white/10 hover:text-white">
                    <ArrowLeft size={20} className="mr-2" /> Back
                </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">Live Location</h1>
            <div className="w-20" />
        </header>

        <MapContainer 
            key={mapKey}
            center={[20.5937, 78.9629]} 
            zoom={5} 
            style={{ height: '100%', width: '100%', backgroundColor: '#06010F' }}
            zoomControl={false}
            whenCreated={mapInstance => { mapRef.current = mapInstance }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {currentLocation && pulsingIcon && (
                <Marker position={[currentLocation.latitude, currentLocation.longitude]} icon={pulsingIcon} />
            )}

            {route.length > 0 && startIcon && (
                 <Marker position={route[0]} icon={startIcon} />
            )}

            <Polyline pathOptions={{ color: '#007BFF', weight: 4, opacity: 0.8 }} positions={route} />
        </MapContainer>

        <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4 bg-gradient-to-t from-[#06010F] to-transparent">
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
