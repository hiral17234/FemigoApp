
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Route, AlertTriangle, MessageSquare, Lamp, Users, ShieldCheck, MapPin, Cloudy, Building, BadgePercent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

type RouteDetail = {
  roadQuality: 'Good' | 'Moderate' | 'Poor';
  incidents: number;
  reviewsCount: number;
  lighting: 'Well-lit' | 'Partially-lit' | 'Poorly-lit';
  crowdedness: 'Low' | 'Medium' | 'High';
}

function RouteDetailsContent() {
    const searchParams = useSearchParams();
    const routeStr = searchParams.get('route');
    const detailsStr = searchParams.get('details');

    if (!routeStr || !detailsStr) {
        return (
            <div className="text-center text-muted-foreground">
                <p>Could not load route details. Please go back and try again.</p>
            </div>
        );
    }
    
    // It's safe to parse here because we checked for null/undefined above.
    const route = JSON.parse(routeStr);
    const details: RouteDetail = JSON.parse(detailsStr);
    
    // Placeholder for safety score calculation
    const safetyScore = Math.floor(Math.random() * 41) + 60; // Random score between 60 and 100

    const InfoRow = ({ icon: Icon, label, value, valueClass }: { icon: React.ElementType, label: string, value: string, valueClass?: string }) => (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-white/80">{label}</span>
            </div>
            <span className={`font-semibold ${valueClass}`}>{value}</span>
        </div>
    );

    const PlaceholderSection = ({ icon: Icon, title, text }: { icon: React.ElementType, title: string, text: string }) => (
        <div className="rounded-lg bg-black/30 p-4">
            <div className="flex items-center gap-3 mb-2">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-white">{title}</h3>
            </div>
            <p className="text-sm text-white/60">{text}</p>
        </div>
    );

    return (
        <div className="w-full max-w-md mx-auto">
            <Link href="/location" className="mb-4 inline-flex items-center gap-2 text-sm text-purple-300/70 transition-colors hover:text-purple-300">
                <ArrowLeft className="h-4 w-4" />
                Back to Planner
            </Link>
            <Card className="w-full rounded-2xl border border-white/10 bg-black/20 p-6 shadow-2xl shadow-pink-500/10 backdrop-blur-xl text-white">
                <CardHeader className="text-center p-0 pb-6">
                    <CardTitle className="text-2xl font-bold tracking-tight">Route Details</CardTitle>
                    <CardDescription className="text-purple-200/70">
                        {route.summary} ({route.legs[0].distance?.text})
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                    <div className="text-center rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 p-4 border border-primary/30">
                        <p className="text-sm font-medium text-purple-200/80">Overall Safety Score</p>
                        <p className="text-5xl font-bold text-white mt-1">{safetyScore}/100</p>
                    </div>

                    <div className="space-y-1">
                        <InfoRow icon={Route} label="Road Quality" value={details.roadQuality} />
                        <Separator className="bg-white/10" />
                        <InfoRow icon={AlertTriangle} label="Historical Incidents" value={`${details.incidents} reported`} />
                        <Separator className="bg-white/10" />
                        <InfoRow icon={MessageSquare} label="User Reviews" value={`${details.reviewsCount} reviews`} />
                         <Separator className="bg-white/10" />
                        <InfoRow icon={Lamp} label="Lighting Condition" value={details.lighting} />
                         <Separator className="bg-white/10" />
                        <InfoRow icon={Users} label="Crowdedness" value={`${details.crowdedness} Traffic`} />
                    </div>

                    <div className="space-y-4">
                        <PlaceholderSection 
                            icon={ShieldCheck}
                            title="Area Crime Reports"
                            text="No major incidents reported in the last 72 hours. General caution advised after 10 PM."
                        />
                        <PlaceholderSection 
                            icon={Building}
                            title="Local Police Station"
                            text=" nearest police station is 2km away from the mid-point of this route. Contact: 100"
                        />
                         <PlaceholderSection 
                            icon={Cloudy}
                            title="Weather & Visibility"
                            text="Currently clear skies. Visibility is excellent at 10km. No weather alerts in effect."
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function RouteDetailsSkeleton() {
    return (
         <div className="w-full max-w-md mx-auto">
            <Skeleton className="h-6 w-32 mb-4" />
            <Card className="w-full rounded-2xl border border-white/10 bg-black/20 p-6 shadow-2xl shadow-pink-500/10 backdrop-blur-xl text-white">
                <CardHeader className="text-center p-0 pb-6">
                    <Skeleton className="h-7 w-48 mx-auto" />
                    <Skeleton className="h-4 w-36 mx-auto mt-2" />
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                    <Skeleton className="h-28 w-full rounded-xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="space-y-4">
                         <Skeleton className="h-24 w-full rounded-lg" />
                         <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function RouteDetailsPage() {
  return (
    <main className="min-h-screen w-full bg-[#06010F] p-4 flex items-center justify-center">
        <Suspense fallback={<RouteDetailsSkeleton />}>
            <RouteDetailsContent />
        </Suspense>
    </main>
  );
}
