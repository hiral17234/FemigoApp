
"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, Trash2, Music, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

type Recording = {
    id: number;
    date: string;
    dataUrl: string;
};

const RecordingsSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-24 rounded-md" />
                </div>
            </Card>
        ))}
    </div>
);


export default function RecordingsPage() {
    const { toast } = useToast();
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const storedRecordings = JSON.parse(localStorage.getItem('femigo-recordings') || '[]');
        setRecordings(storedRecordings);
        setIsLoading(false);
    }, []);
    
    const handleDelete = (id: number) => {
        const updatedRecordings = recordings.filter(rec => rec.id !== id);
        setRecordings(updatedRecordings);
        localStorage.setItem('femigo-recordings', JSON.stringify(updatedRecordings));
        toast({ title: "Recording Deleted" });
    };

    return (
        <main className="relative min-h-screen w-full bg-background p-4 text-foreground">
            <div className="absolute inset-x-0 top-0 h-1/2 w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-blue-950/10 to-transparent -z-10" />

            <div className="w-full max-w-2xl mx-auto">
                <header className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">My Recordings</h1>
                        <p className="text-muted-foreground">Audio captured from Safe Mode.</p>
                    </div>
                </header>

                {isLoading ? (
                    <RecordingsSkeleton />
                ) : recordings.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground bg-card/80 dark:bg-card rounded-lg shadow-lg">
                        <Music className="mx-auto h-12 w-12 mb-4" />
                        <p className="font-semibold">No recordings yet.</p>
                        <p className="text-sm mt-1">Audio you record in Safe Mode will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recordings.map((recording) => (
                            <Card key={recording.id} className="p-4 bg-card/90 backdrop-blur-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <Mic className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">
                                                Recording - {format(new Date(recording.date), "MMM d, yyyy")}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(recording.date), "h:mm a")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <audio src={recording.dataUrl} controls className="max-w-[200px] h-10" />
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive">
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete this recording. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(recording.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
