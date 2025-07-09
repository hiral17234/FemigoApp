
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Calendar, Image as ImageIcon, Mic, Trash2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import Image from "next/image"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, getDoc, deleteDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { moods, type DiaryEntry } from '@/lib/diary-data'
import { cn } from '@/lib/utils'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

function ViewDiaryEntrySkeleton() {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6 md:p-8">
        <header className="flex items-center justify-between mb-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
        </header>
        <Card className="rounded-2xl shadow-lg border-black/10 dark:border-white/10 overflow-hidden">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-md" />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Separator />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                 <div>
                    <Skeleton className="h-6 w-24 mb-4" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    )
}


export default function ViewDiaryEntryPage() {
    const router = useRouter()
    const params = useParams()
    const entryId = params.id as string
    const { toast } = useToast()

    const [user, setUser] = useState<User | null>(null);
    const [entry, setEntry] = useState<DiaryEntry | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!entryId) return;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const entryDocRef = doc(db, "users", currentUser.uid, "diaryEntries", entryId);
                    const docSnap = await getDoc(entryDocRef);
                    if (docSnap.exists()) {
                        setEntry({ id: docSnap.id, ...docSnap.data() } as DiaryEntry);
                    } else {
                        toast({ variant: 'destructive', title: "Not Found", description: "The diary entry could not be found." });
                        router.push('/diary');
                    }
                } catch (error) {
                    console.error("Failed to load entry", error)
                    toast({ variant: 'destructive', title: "Error", description: "Failed to load entry from the database." });
                } finally {
                    setIsLoading(false);
                }
            } else {
                router.push('/login');
            }
        });
        
        return () => unsubscribe();
    }, [entryId, router, toast])

    const handleDelete = async () => {
        if (!user || !entryId) return;
        try {
            await deleteDoc(doc(db, "users", user.uid, "diaryEntries", entryId));
            toast({ title: "Entry Deleted" });
            router.push('/diary');
        } catch (error) {
            console.error("Failed to delete entry", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not delete the entry." });
        }
    }
    
    if (isLoading) {
        return (
            <main className="min-h-screen w-full bg-background">
                 <ViewDiaryEntrySkeleton />
            </main>
        )
    }

    if (!entry) {
        return (
            <div className="flex h-screen items-center justify-center bg-background p-4">
                 <Card className="p-8 text-center bg-card">
                    <CardTitle>Entry Not Found</CardTitle>
                    <CardDescription>Could not find the diary entry you were looking for.</CardDescription>
                    <Button onClick={() => router.push('/diary')} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Diary
                    </Button>
                </Card>
            </div>
        )
    }

    const moodDetails = moods[entry.mood];

    return (
        <main className="min-h-screen w-full transition-colors duration-700 bg-background">
            <div className={cn("fixed inset-0 -z-10", moodDetails.bg)} />
            <div className="mx-auto max-w-2xl p-4 sm:p-6 md:p-8">
                <header className="flex items-center justify-between mb-6">
                    <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground" onClick={() => router.push('/diary')}>
                        <ArrowLeft />
                    </Button>
                    <h1 className="text-2xl font-bold">Diary Entry</h1>
                    <div className="flex items-center gap-2">
                        <Link href={`/diary/edit/${entry.id}`}>
                            <Button size="icon" className="bg-primary/80 hover:bg-primary">
                                <Edit />
                            </Button>
                        </Link>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    <Trash2 />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this diary entry.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </header>

                <Card className="rounded-2xl shadow-lg overflow-hidden transition-colors duration-500 bg-card border-border">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-3xl font-bold">{entry.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 pt-2">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(entry.date), "eeee, MMMM d, yyyy 'at' h:mm a")}
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-2xl p-2 bg-background">
                                {moodDetails.emoji}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Separator />

                        <div
                            className="rounded-lg overflow-hidden border"
                            style={{
                                backgroundImage: entry.themeUrl ? `url(${entry.themeUrl})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            <div
                                className={cn(
                                    "prose dark:prose-invert max-w-none prose-p:my-0 prose-p:text-foreground prose-strong:text-foreground",
                                    entry.themeUrl ? 'bg-background/80 backdrop-blur-sm p-4' : 'p-4'
                                )}
                                dangerouslySetInnerHTML={{ __html: entry.content }}
                            />
                        </div>

                        {entry.photos && entry.photos.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><ImageIcon /> Photos</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {entry.photos.map((photo, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="relative aspect-square">
                                                <Image src={photo.url} alt={photo.caption || `Photo ${index+1}`} layout="fill" objectFit="cover" className="rounded-lg" />
                                            </div>
                                            {photo.caption && <p className="text-xs text-center text-muted-foreground italic">"{photo.caption}"</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {entry.voiceNotes && entry.voiceNotes.length > 0 && (
                             <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Mic /> Voice Notes</h3>
                                <div className="space-y-2">
                                   <p className="text-sm text-muted-foreground">Voice notes would be playable here.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
