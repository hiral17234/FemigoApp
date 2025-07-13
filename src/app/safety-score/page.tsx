
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, MapPin, Lightbulb, MessageSquare, AlertTriangle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reverseGeocode } from '@/app/actions/reverse-geocode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

type Point = { lat: number; lng: number };

// Function to create a simple hash from a string to seed the random number generator
function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

// Seeded random number generator
function seededRandom(seed: number) {
    let state = seed;
    return function() {
        const x = Math.sin(state++) * 10000;
        return x - Math.floor(x);
    };
}

const mockReviews = [
    { name: "Priya S.", comment: "Usually feel safe here, but some streetlights are out." },
    { name: "Anjali K.", comment: "It's a busy road, which is good. Never had any issues." },
    { name: "Rina M.", comment: "I avoid this route after 9 PM. It gets a bit too quiet." },
    { name: "Sunita G.", comment: "Good police presence during the day. Very reassuring!" },
    { name: "Neha P.", comment: "The new pavement is great, but lighting could be better in the side lanes." },
];

function SafetyScoreSkeleton() {
    return (
        <div className="w-full max-w-lg mx-auto">
             <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function SafetyScorePage() {
    const { toast } = useToast();
    const [userLocation, setUserLocation] = useState<Point | null>(null);
    const [roadName, setRoadName] = useState<string | null>(null);
    const [safetyData, setSafetyData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [review, setReview] = useState('');

    useEffect(() => {
        if (!navigator.geolocation) {
            toast({ variant: 'destructive', title: 'Geolocation is not supported.' });
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = { lat: position.coords.latitude, lng: position.coords.longitude };
                setUserLocation(location);
            },
            () => {
                toast({ variant: 'destructive', title: 'Could not get your location.' });
                setIsLoading(false);
            }
        );
    }, [toast]);

    useEffect(() => {
        if (userLocation) {
            const fetchRoadData = async () => {
                try {
                    const address = await reverseGeocode(userLocation);
                    const currentRoad = address.split(',')[0] || "Your Current Area";
                    setRoadName(currentRoad);

                    // Generate mock data based on the road name
                    const seed = simpleHash(currentRoad);
                    const random = seededRandom(seed);
                    
                    const lightingConditions = ['Well-lit', 'Moderately-lit', 'Poorly-lit'];
                    const reviewCount = Math.floor(random() * 50) + 5;
                    const accidentCount = Math.floor(random() * 5);
                    const selectedReviews = [...mockReviews].sort(() => 0.5 - random()).slice(0, 2);

                    setSafetyData({
                        lighting: lightingConditions[Math.floor(random() * lightingConditions.length)],
                        reviews: reviewCount,
                        accidents: `${accidentCount} recent incidents`,
                        peopleReviews: selectedReviews,
                    });

                } catch (error) {
                    toast({ variant: 'destructive', title: 'Could not identify your road.' });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchRoadData();
        }
    }, [userLocation, toast]);

    const handleReviewSubmit = () => {
        if (!review.trim()) {
            toast({ variant: 'destructive', title: 'Review is empty' });
            return;
        }
        toast({ title: 'Thank You!', description: 'Your review has been submitted for consideration.' });
        setReview('');
    };
    
    if (isLoading) {
        return <main className="min-h-screen w-full p-4"><SafetyScoreSkeleton /></main>;
    }

    return (
        <main className="min-h-screen w-full bg-background p-4 text-foreground">
            <div className="w-full max-w-lg mx-auto">
                <header className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Live Safety Score</h1>
                        <p className="text-muted-foreground">Real-time safety analysis of your current location.</p>
                    </div>
                </header>

                <Card className="bg-card/80 dark:bg-card">
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <MapPin className="h-6 w-6 text-primary mt-1" />
                            <div>
                                <CardTitle className="text-xl">{roadName || 'Unknown Road'}</CardTitle>
                                <CardDescription>Last updated: just now</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {safetyData && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                    <div className="p-4 bg-background rounded-lg">
                                        <Lightbulb className="mx-auto h-8 w-8 text-yellow-400 mb-2" />
                                        <p className="text-lg font-bold">{safetyData.lighting}</p>
                                        <p className="text-xs text-muted-foreground">Lighting</p>
                                    </div>
                                    <div className="p-4 bg-background rounded-lg">
                                        <MessageSquare className="mx-auto h-8 w-8 text-blue-400 mb-2" />
                                        <p className="text-lg font-bold">{safetyData.reviews}</p>
                                        <p className="text-xs text-muted-foreground">User Reviews</p>
                                    </div>
                                     <div className="p-4 bg-background rounded-lg">
                                        <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                                        <p className="text-lg font-bold">{safetyData.accidents}</p>
                                        <p className="text-xs text-muted-foreground">Reported Incidents</p>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold text-lg mb-4">What People Are Saying</h3>
                                    <div className="space-y-4">
                                        {safetyData.peopleReviews.map((rev: any, index: number) => (
                                            <div key={index} className="p-3 bg-background rounded-md">
                                                <p className="text-sm italic">"{rev.comment}"</p>
                                                <p className="text-xs text-right font-semibold mt-1">- {rev.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        <Separator />
                        <div>
                             <h3 className="font-semibold text-lg mb-4">Submit Your Review</h3>
                             <div className="space-y-4">
                                <Textarea 
                                    placeholder="How safe do you feel on this road? Share details about lighting, crowd, etc."
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                />
                                <Button onClick={handleReviewSubmit} className="w-full">
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Anonymously
                                </Button>
                             </div>
                        </div>

                         <p className="text-center text-xs text-muted-foreground pt-4">
                            Note: This is mock data for demonstration purposes.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
