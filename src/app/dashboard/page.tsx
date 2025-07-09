
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Siren,
  MapPin,
  RadioTower,
  ShieldCheck,
  Compass,
  BarChartBig,
  ShieldPlus,
  Loader2
} from "lucide-react"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { getFirebaseServices } from "@/lib/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userName, setUserName] = useState<string | null>(null)
  const [userInitial, setUserInitial] = useState("")
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  const firebase = getFirebaseServices();

  useEffect(() => {
    if (!firebase.auth || !firebase.db) {
        setIsLoadingUser(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(firebase.auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(firebase.db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          let nameToDisplay = "User";
          if (userDoc.exists()) {
            nameToDisplay = userDoc.data().displayName || "User";
          } else {
            nameToDisplay = currentUser.displayName || "User";
          }
          setUserName(nameToDisplay);
          setUserInitial(nameToDisplay.charAt(0).toUpperCase());
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            setUserName(currentUser.displayName || "User");
        } finally {
            setIsLoadingUser(false);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router, firebase.auth, firebase.db]);
  
  if (firebase.error) {
    return (
      <main className="flex flex-1 items-center justify-center p-4 text-center">
          <div className="rounded-lg bg-card p-8 text-card-foreground">
              <h1 className="text-xl font-bold text-destructive">Configuration Error</h1>
              <p className="mt-2 text-muted-foreground">{firebase.error}</p>
          </div>
      </main>
    );
  }

  if (isLoadingUser || !user) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Welcome, <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">{userName}!</span>
        </h1>
        <p className="text-muted-foreground">
          Your safety is our priority.
        </p>
      </div>

      <Link href="/emergency" className="w-full max-w-sm mx-auto">
        <div className="group rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 p-px shadow-lg shadow-pink-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/30">
          <div className="flex h-16 items-center justify-center gap-4 rounded-[15px] bg-[#110D1F]">
            <Siren className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
            <span className="text-2xl font-semibold text-primary">
              Emergency
            </span>
          </div>
        </div>
      </Link>
      
      <section className="w-full max-w-sm mx-auto">
        <div className="grid grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature) => (
            <Link
              href={feature.href}
              key={feature.name}
              className="group flex flex-col items-center justify-center gap-2 text-center transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="rounded-full bg-gradient-to-br from-pink-500/80 to-purple-500/80 p-px">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#110D1F] transition-colors duration-300 group-hover:bg-[#1f1a30]">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
              </div>
              <span className="text-sm font-medium text-white">
                {feature.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
