
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Siren,
  MapPin,
  RadioTower,
  ShieldCheck,
  Compass,
  BarChartBig,
  ShieldPlus,
  Loader2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { getFirebaseServices } from "@/lib/firebase"


type Feature = {
  name: string
  icon: React.ElementType
  href: string
}

const features: Feature[] = [
  { name: "Location", icon: MapPin, href: "/location" },
  { name: "SOS", icon: RadioTower, href: "#" },
  { name: "Check Safe", icon: ShieldCheck, href: "#" },
  { name: "Track Me", icon: Compass, href: "#" },
  { name: "Safety Score", icon: BarChartBig, href: "#" },
  { name: "Safe Mode", icon: ShieldPlus, href: "#" },
]

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null)
  const [userInitial, setUserInitial] = useState("")

  const firebase = getFirebaseServices();

  useEffect(() => {
    if (!firebase.auth || !firebase.db) return;

    const unsubscribe = onAuthStateChanged(firebase.auth, async (currentUser: User | null) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(firebase.db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          let nameToDisplay = "User";
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Use displayName from Firestore, which could be nickname or full name
            nameToDisplay = userData.displayName || "User";
          } else {
            // Fallback to auth display name if Firestore doc doesn't exist for some reason
            nameToDisplay = currentUser.displayName || "User";
          }
          
          setUserName(nameToDisplay);
          setUserInitial(nameToDisplay.charAt(0).toUpperCase());
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            // If there's an error, still try to show something
            setUserName(currentUser.displayName || "User");
        } finally {
            setLoading(false);
        }

      } else {
        // User is signed out. Redirect to login.
        router.push("/login");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router, firebase.auth, firebase.db]);

  if (firebase.error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#06010F] p-4 text-center">
          <div className="rounded-lg bg-card p-8 text-card-foreground">
              <h1 className="text-xl font-bold text-destructive">Configuration Error</h1>
              <p className="mt-2 text-muted-foreground">{firebase.error}</p>
          </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#06010F] text-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4">Loading Dashboard...</p>
      </div>
    );
  }

  // If we are no longer loading, but have no user, it means a redirect is in progress.
  // Show a loader to prevent a flash of a broken page.
  if (!user || !userName) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#06010F] text-white">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4">Redirecting...</p>
        </div>
    );
  }


  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#06010F] font-sans text-white">
      <div className="relative z-10 mx-auto flex h-full max-w-lg flex-col p-6 sm:p-8">
        <header className="flex items-center justify-between py-4">
          <div>
            <div className="flex items-center gap-1 text-3xl font-bold text-white">
              Femigo
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                  <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor"/>
              </svg>
            </div>
            <p className="mt-1 text-sm font-medium text-white/80">
              Safety. Strength. Solidarity.
            </p>
          </div>
          <div className="relative">
             <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#FF0080] to-purple-900 opacity-75 blur-md"></div>
            <Avatar className="relative h-12 w-12 border-2 border-slate-900">
              <AvatarImage data-ai-hint="logo abstract" src="https://i.imgur.com/DFegeIc.jpeg" alt="Femigo Logo" />
              <AvatarFallback className="bg-card text-primary">{userInitial}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <section className="my-8 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            Welcome, <span className="bg-gradient-to-r from-[#FF0080] to-purple-800 bg-clip-text text-transparent">{userName}!</span>
          </h2>
          <p className="mt-2 text-base text-white/80">
            Your safety is our priority.
          </p>
        </section>

        <Link href="/emergency" className="relative my-8 block group">
          <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-[#FF0080] to-purple-900 opacity-60 blur-xl transition-opacity duration-300 group-hover:opacity-80"></div>
          
          <div className="relative rounded-3xl bg-gradient-to-r from-[#FF0080] to-purple-900 p-1 transition-transform duration-150 active:scale-95">
            <div className="flex h-24 w-full items-center justify-center rounded-[20px] bg-[#0A0A0F] px-7 py-4">
              <div className="flex items-center justify-center gap-4">
                <Siren className="h-8 w-8 text-[#FF0080] drop-shadow-[0_0_8px_#FF0080]" />
                <span className="text-2xl font-bold text-white">Emergency</span>
              </div>
            </div>
          </div>
        </Link>
        
        <section className="mt-12">
          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
            {features.map((feature) => (
              <Link
                href={feature.href}
                key={feature.name}
                className="group flex cursor-pointer flex-col items-center justify-center gap-2 transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-black/30">
                  <div className="absolute inset-0 rounded-full border-2 border-[#FF0080]/50 transition-all duration-300 group-hover:border-[#FF0080]/80 group-hover:shadow-[0_0_15px_#FF008066]" />
                  <feature.icon className="relative z-10 h-10 w-10 text-[#FF0080] drop-shadow-[0_0_8px_#FF0080] transition-all duration-300 group-hover:text-[#FF0080] group-hover:scale-110" />
                </div>
                <span className="text-center text-sm font-medium text-white">
                  {feature.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
