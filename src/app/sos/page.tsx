
"use client"

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Heart, Siren, Phone, MessageSquare, Shield, Users, Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { reverseGeocode } from '@/app/actions/reverse-geocode';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type TrustedContact = { id: string; name: string; phone: string; };

const getFromStorage = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        return fallback;
    }
};

const PreventiveSafetyButton = ({ icon, text, href }: { icon: React.ReactNode, text: string, href: string }) => (
    <Link href={href}>
        <div className="flex flex-col items-center justify-center gap-2 text-center p-2 rounded-xl bg-card/50 dark:bg-card hover:bg-accent transition-colors cursor-pointer h-full">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                {icon}
            </div>
            <span className="text-xs font-semibold">{text}</span>
        </div>
    </Link>
);


export default function SosPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [userData, setUserData] = useState<{ displayName: string; photoURL: string } | null>(null);
    const [locationAddress, setLocationAddress] = useState<string | null>("Fetching location...");
    const [isHolding, setIsHolding] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isFollowMeActive, setIsFollowMeActive] = useState(false);

    useEffect(() => {
        const profile = getFromStorage<{ displayName: string; photoURL: string }>('femigo-user-profile', { displayName: 'User', photoURL: '' });
        setUserData(profile);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const address = await reverseGeocode({ lat: latitude, lng: longitude });
                        setLocationAddress(address);
                    } catch (error) {
                        setLocationAddress("Could not determine address.");
                        console.error(error);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setLocationAddress("Location access denied.");
                    toast({
                        variant: "destructive",
                        title: "Location Error",
                        description: "Please enable location access for this feature to work.",
                    });
                }
            );
        } else {
            setLocationAddress("Geolocation not supported.");
        }

    }, [toast]);
    
    const handleSosPress = () => {
        setIsHolding(true);
        timerRef.current = setTimeout(() => {
            if (timerRef.current) { // Check if timer is still active
                toast({
                    variant: "destructive",
                    title: "SOS ACTIVATED",
                    description: "Alerting emergency contacts and services.",
                    duration: 5000,
                });
                // In a real app, you would dispatch the SOS action here.
                setIsHolding(false); // Reset state after activation
            }
        }, 3000);
    };

    const handleSosRelease = () => {
        setIsHolding(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };


    const handleFollowMe = () => {
        const profile = getFromStorage<any>('femigo-user-profile', null);
        const contacts: TrustedContact[] = profile?.trustedContacts || [];
        
        if (contacts.length === 0) {
            toast({ variant: 'destructive', title: "No Trusted Contacts", description: "Please add at least one trusted contact in the Emergency section to use this feature." });
            setIsFollowMeActive(false); // Reset switch
            return;
        }

        const shareUrl = `${window.location.origin}/location/fullscreen`;
        const shareText = `I'm using Femigo's 'Follow Me' feature. You can see my live location here: ${shareUrl}`;

        // Get numbers of trusted contacts. Add the women's helpline number.
        const phoneNumbers = [...contacts.map(c => c.phone), '1091'].join(',');
        
        // Use the sms: protocol to open the user's default messaging app.
        window.location.href = `sms:${phoneNumbers}?body=${encodeURIComponent(shareText)}`;

        toast({ title: 'Sharing Initiated', description: 'Your location is being shared with trusted contacts and the helpline.' });
    };

    const userInitial = userData?.displayName?.charAt(0).toUpperCase() || 'U';

    return (
        <div className="min-h-screen w-full bg-background text-foreground">
            <div className="relative z-0 min-h-screen">
                {/* Top gradient background */}
                <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-primary/80 to-primary/60 dark:from-primary/50 dark:to-primary/30" />

                {/* Header */}
                <header className="absolute top-0 left-0 w-full p-4 text-white z-10">
                    <div className="flex items-center justify-between">
                         <Link href="/dashboard" className="text-white hover:text-gray-200">
                           <ArrowLeft size={24} />
                         </Link>
                         <div className="flex items-center gap-1 text-2xl font-bold">
                            SOS
                         </div>
                         <div className="w-6" />
                    </div>
                    <div className="flex items-center gap-3 mt-6">
                        <Avatar className="h-12 w-12 border-2 border-white/50">
                            <AvatarImage src={userData?.photoURL} alt={userData?.displayName} />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-bold text-xl">{userData?.displayName}</h2>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 mt-4 text-sm">
                        <MapPin className="h-5 w-5" />
                        <div>
                            <p className="font-semibold">Current Location</p>
                            <p className="text-white/80 flex items-center gap-2">
                               {locationAddress === 'Fetching location...' && <Loader2 className="h-4 w-4 animate-spin" />}
                               {locationAddress}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="absolute top-[230px] left-0 w-full p-4 space-y-6">
                    <div className="rounded-2xl bg-card p-6 shadow-lg">
                        <div className="flex justify-between items-start">
                           <div>
                                <p className="text-muted-foreground">Are you in</p>
                                <h1 className="text-2xl font-bold text-foreground">Emergency?</h1>
                                <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
                                    Press the SOS button, your live location will be shared.
                                </p>
                           </div>
                           <div className="flex flex-col items-center gap-1">
                                <div className="relative flex items-center justify-center h-16 w-16 border-2 border-muted-foreground rounded-full">
                                    <Users className="h-8 w-8 text-muted-foreground" />
                                    <div className="absolute -top-1 -right-1 flex items-center justify-center h-6 w-6 bg-primary rounded-full text-primary-foreground font-bold text-sm">
                                        5
                                    </div>
                                </div>
                                <p className="text-xs font-semibold text-muted-foreground">Rakshak nearby</p>
                           </div>
                        </div>

                        <div className="mt-6 flex justify-center items-center">
                            <div className="relative">
                                <div 
                                    className="absolute inset-0 rounded-full bg-primary/30 transition-transform duration-3000 ease-linear"
                                    style={{
                                        transform: isHolding ? 'scale(1.3)' : 'scale(1)',
                                        opacity: isHolding ? 1 : 0
                                    }}
                                />
                                <button
                                    onMouseDown={handleSosPress}
                                    onMouseUp={handleSosRelease}
                                    onTouchStart={handleSosPress}
                                    onTouchEnd={handleSosRelease}
                                    className="h-36 w-36 rounded-full bg-gradient-to-r from-primary to-secondary flex flex-col items-center justify-center text-primary-foreground active:scale-95 transition-transform border border-black relative"
                                >
                                    <span className="text-4xl font-bold">SOS</span>
                                    <span className="text-sm">Press 3 seconds</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <AlertDialog>
                        <div className="rounded-2xl bg-card p-4 shadow-lg flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-foreground">Follow Me</h3>
                                <p className="text-sm text-muted-foreground">(I'm Travelling)</p>
                            </div>
                            <AlertDialogTrigger asChild>
                                <Switch checked={isFollowMeActive} onCheckedChange={setIsFollowMeActive} />
                            </AlertDialogTrigger>
                        </div>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Location Sharing</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will share a live tracking link with all your trusted contacts and the women's helpline via SMS. Are you sure you want to proceed?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setIsFollowMeActive(false)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleFollowMe}>Confirm & Share</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>


                    <div className="rounded-2xl bg-card p-4 shadow-lg">
                        <h3 className="font-bold text-foreground mb-4">Preventive Safety</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <PreventiveSafetyButton 
                                href="/emergency" 
                                icon={<Siren className="h-6 w-6" />} 
                                text="Emergency Contact" 
                            />
                            <PreventiveSafetyButton 
                                href="#"
                                icon={<MessageSquare className="h-6 w-6" />}
                                text="Raise Concern"
                            />
                            <PreventiveSafetyButton 
                                href="#"
                                icon={<Shield className="h-6 w-6" />} 
                                text="Safety tips" 
                            />
                            <PreventiveSafetyButton 
                                href="#"
                                icon={<Users className="h-6 w-6" />} 
                                text="Women Council"
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
