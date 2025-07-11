
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Bell, MapPin, ChevronRight, LogOut, Moon, Sun, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { auth, db } from "@/lib/firebase"


export default function SettingsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { theme, setTheme } = useTheme()
    
    const [user, setUser] = useState<FirebaseUser | null>(null)
    const [userData, setUserData] = useState<{ displayName?: string; email?: string } | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!auth || !db) {
            setIsLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                } else {
                    setUserData({ displayName: currentUser.displayName || 'User', email: currentUser.email || 'No email' });
                }
            } else {
                router.push('/login');
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        if (!auth) return
        try {
            await signOut(auth)
            toast({ title: "Logged Out", description: "You have been successfully logged out." })
            router.push('/login')
        } catch (error) {
            toast({ variant: "destructive", title: "Logout Failed" })
        }
    }

    const userInitial = userData?.displayName?.charAt(0).toUpperCase() || 'U';

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-[#020617]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

  return (
    <main className="relative flex min-h-full w-full flex-col items-center overflow-y-auto bg-[#020617] p-4 text-white">
      <div className="absolute inset-x-0 top-0 h-1/2 w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-blue-950/10 to-transparent" />
      
      <div className="w-full max-w-2xl">
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-accent/20 hover:text-primary rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <h1 className="my-6 text-center text-3xl font-bold tracking-tight">Settings</h1>
      
          <Card className="w-full rounded-2xl border-none bg-black/30 p-6 shadow-2xl shadow-primary/10 backdrop-blur-md">
            <CardContent className="p-0">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Avatar className="h-24 w-24 border-4 border-primary/50">
                        <AvatarImage data-ai-hint="woman face" src="https://placehold.co/100x100.png" alt={userData?.displayName} />
                        <AvatarFallback className="text-4xl bg-primary/20 text-primary">{userInitial}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold">{userData?.displayName}</h2>
                        <p className="text-muted-foreground">{userData?.email}</p>
                    </div>
                </div>

                <Separator className="my-6 bg-border/20" />

                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Profile</h3>
                        <div className="flex items-center justify-between rounded-lg bg-black/20 p-4">
                            <div className="flex items-center gap-4">
                                <User className="h-5 w-5 text-primary" />
                                <span>Edit Profile</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Notifications</h3>
                        <div className="rounded-lg bg-black/20 p-4 space-y-4">
                           <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Bell className="h-5 w-5 text-primary" />
                                    <span>Emergency Alerts</span>
                                </div>
                                <Switch id="emergency-alerts" defaultChecked />
                            </div>
                            <Separator className="bg-border/20" />
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Bell className="h-5 w-5 text-primary" />
                                    <span>App Updates</span>
                                </div>
                                <Switch id="app-updates" defaultChecked />
                            </div>
                        </div>
                    </div>

                    {/* Regional Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Regional</h3>
                        <div className="flex items-center justify-between rounded-lg bg-black/20 p-4">
                            <div className="flex items-center gap-4">
                                <MapPin className="h-5 w-5 text-primary" />
                                <span>Language & Region</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">English (US)</span>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                     {/* Theme Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Theme</h3>
                        <div className="flex items-center justify-between rounded-lg bg-black/20 p-4">
                            <div className="flex items-center gap-4">
                                {theme === 'light' ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
                                <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                            </div>
                            <Switch id="theme-mode" checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
                        </div>
                    </div>

                </div>

                 <Separator className="my-6 bg-border/20" />

                 <Button variant="destructive" className="w-full bg-red-900/50 border border-red-500/50 hover:bg-red-900/80" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                 </Button>

            </CardContent>
          </Card>
      </div>
    </main>
  )
}
