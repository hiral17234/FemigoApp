
"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, User as UserIcon, Mail, Phone, Calendar, Home, Save, Loader2, Edit2, Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  displayName: z.string().min(3, "Full name must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  nickname: z.string().optional(),
  age: z.coerce.number().min(13, "You must be at least 13 years old.").optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  address3: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type UserData = {
    displayName: string;
    email: string;
    phone: string;
    nickname: string;
    age: number;
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    photoURL?: string;
};

const getFromStorage = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        return fallback;
    }
};

const saveToStorage = <T,>(key: string, value: T) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

const ProfileSkeleton = () => (
    <div className="w-full max-w-lg p-4">
        <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
        </div>
        <div className="relative w-full">
            <div className="h-32 rounded-t-2xl bg-gradient-to-r from-primary/80 to-secondary/80" />
            <div className="absolute top-16 left-1/2 -translate-x-1/2">
                <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
            </div>
            <Card className="mt-[-2rem] rounded-2xl border-none bg-background pt-20">
                <CardContent className="flex flex-col items-center gap-6 p-6">
                     <div className="text-center space-y-2">
                        <Skeleton className="h-8 w-48 mx-auto" />
                        <Skeleton className="h-5 w-32 mx-auto" />
                    </div>
                    <div className="w-full space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-12 w-full mt-4" />
                </CardContent>
            </Card>
        </div>
    </div>
);


export default function EditProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        const profileJson = localStorage.getItem('femigo-user-profile');
        if (profileJson) {
            try {
                const data = JSON.parse(profileJson);
                setUserData(data);
                form.reset({
                    displayName: data.displayName || "",
                    email: data.email || "",
                    nickname: data.nickname || "",
                    age: data.age || undefined,
                    address1: data.address1 || "",
                    address2: data.address2 || "",
                    address3: data.address3 || "",
                    city: data.city || "",
                    state: data.state || "",
                });
            } catch (e) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load user profile.' });
                router.push('/login');
            }
        } else {
             toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
             router.push('/login');
        }
        setIsLoading(false);
    }, [router, toast, form]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userData) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const photoURL = reader.result as string;
            
            try {
                toast({ title: 'Updating...', description: 'Your new profile picture is being saved.' });
                
                const updatedUserData = { ...userData, photoURL };
                setUserData(updatedUserData);
                
                // Update the master list of accounts
                const allAccounts = getFromStorage<any[]>('femigo-accounts', []);
                const accountIndex = allAccounts.findIndex(acc => acc.email === userData.email);
                if (accountIndex > -1) {
                    allAccounts[accountIndex] = updatedUserData;
                    saveToStorage('femigo-accounts', allAccounts);
                }

                // Update the currently logged-in user profile
                saveToStorage('femigo-user-profile', updatedUserData);

                toast({ title: 'Success!', description: 'Profile picture updated.' });
            } catch (error) {
                console.error("Error saving profile picture:", error);
                toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update your profile picture.' });
            }
        };
    };

    const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
        if (!userData) {
            toast({ variant: 'destructive', title: 'Not Authenticated' });
            return;
        }
        setIsSubmitting(true);
        try {
            const updatedUserData = { ...userData, ...data };
            
            // Update the master list of accounts
            const allAccounts = getFromStorage<any[]>('femigo-accounts', []);
            const accountIndex = allAccounts.findIndex(acc => acc.email === userData.email);
            if (accountIndex > -1) {
                allAccounts[accountIndex] = updatedUserData;
                saveToStorage('femigo-accounts', allAccounts);
            }

            // Update the currently logged-in user profile
            saveToStorage('femigo-user-profile', updatedUserData);
            setUserData(updatedUserData);

            localStorage.setItem('userName', data.displayName);
            toast({ title: 'Profile Updated!', description: 'Your changes have been saved successfully.' });
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save your changes.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return <main className="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4"><ProfileSkeleton /></main>
    }
    
    if (!userData) {
         return <main className="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-foreground">Could not load user data.</main>
    }
    
    const userPhoto = userData.photoURL || "https://i.ibb.co/W4PR2Pw2/Whats-App-Image-2025-07-09-at-11-21-29-ca10852e.jpg";

    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#f9fafb] dark:bg-background p-4 text-foreground">
            <div className="w-full max-w-lg">
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
                    <Link href="/settings" aria-label="Back to Settings">
                    <Button variant="ghost" size="icon" className="text-muted-foreground bg-black/30 hover:bg-black/50 hover:text-primary rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    </Link>
                </div>

                <div className="relative w-full">
                    <div className="h-32 rounded-t-2xl bg-gradient-to-r from-primary to-secondary" />

                    <div className="absolute top-16 left-1/2 -translate-x-1/2 group">
                        <Avatar className="h-32 w-32 rounded-full border-4 border-background">
                            <AvatarImage src={userPhoto} alt={userData.displayName} data-ai-hint="person face" />
                            <AvatarFallback className="text-5xl bg-primary/20 text-primary">{userData.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            size="icon"
                            className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-background/80 text-foreground hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Camera className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <Card className="mt-[-2rem] rounded-2xl border-none bg-background pt-20">
                        <CardContent className="flex flex-col items-center gap-6 p-6">
                           
                            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                                <div className="space-y-1">
                                    <Label htmlFor="displayName">Full Name</Label>
                                    <Input id="displayName" {...form.register("displayName")} />
                                    {form.formState.errors.displayName && <p className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="phone">Phone (Non-editable)</Label>
                                    <Input id="phone" value={userData.phone} readOnly disabled className="bg-muted/30" />
                                </div>
                                 <div className="space-y-1">
                                    <Label htmlFor="email">Email Address (Non-editable)</Label>
                                    <Input id="email" {...form.register("email")} readOnly disabled className="bg-muted/30" />
                                    {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <div className="space-y-1">
                                        <Label htmlFor="nickname">Nickname</Label>
                                        <Input id="nickname" {...form.register("nickname")} placeholder="e.g., Alex" />
                                        {form.formState.errors.nickname && <p className="text-xs text-destructive">{form.formState.errors.nickname.message}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="age">Age</Label>
                                        <Input id="age" type="number" {...form.register("age")} placeholder="Your Age" />
                                        {form.formState.errors.age && <p className="text-xs text-destructive">{form.formState.errors.age.message}</p>}
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label>Address</Label>
                                    <Input {...form.register("address1")} placeholder="Address Line 1" />
                                    <Input {...form.register("address2")} placeholder="Address Line 2 (Optional)" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input {...form.register("city")} placeholder="City" />
                                        <Input {...form.register("state")} placeholder="State / Province" />
                                    </div>
                                </div>
                                
                                <Button type="submit" className="w-full bg-primary py-3 text-lg" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
