
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
  Loader2,
  HeartHandshake
} from "lucide-react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { getFirebaseServices } from "@/lib/firebase"
import { Button } from "@/components/ui/button"


type Feature = {
  name: string
  icon: React.ElementType
  href: string
}

const features: Feature[] = [
  { name: "Live Map", icon: MapPin, href: "/location" },
  { name: "Emergency", icon: Siren, href: "/emergency" },
  { name: "SOS", icon: RadioTower, href: "#" },
  { name: "Check Safe", icon: ShieldCheck, href: "#" },
  { name: "Track Me", icon: Compass, href: "#" },
  { name: "Safety Score", icon: BarChartBig, href: "#" },
]

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null)

  const firebase = getFirebaseServices();

  useEffect(() => {
    if (!firebase.auth || !firebase.db) return;

    const unsubscribe = onAuthStateChanged(firebase.auth, (currentUser: User | null) => {
      if (currentUser) {
        setUser(currentUser);
        setUserName(currentUser.displayName || "there");
        setLoading(false);
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
  
  if (loading || !user) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome back, {userName}!
        </h1>
        <p className="text-muted-foreground">
          Ready to take on the day? We've got your back.
        </p>
      </div>

      <div className="relative group rounded-2xl bg-gradient-to-r from-pink-500/80 to-purple-500/80 p-6 text-center overflow-hidden">
        <div className="absolute -top-10 -right-10 text-white/10">
          <HeartHandshake size={150} strokeWidth={1} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white">Safety is a tap away</h2>
          <p className="text-white/80 mt-2 max-w-md mx-auto">
            Access emergency services, check your safety score, or start live tracking instantly.
          </p>
           <Button asChild className="mt-4 bg-white text-primary hover:bg-white/90">
             <Link href="/emergency">View Emergency Contacts</Link>
           </Button>
        </div>
      </div>
      
      <section>
        <h2 className="text-xl font-semibold tracking-tight text-white mb-4">Your Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <Link
              href={feature.href}
              key={feature.name}
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-card p-4 transition-all duration-300 hover:bg-primary/10 hover:-translate-y-1 border-2 border-transparent hover:border-primary/50"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                <feature.icon className="h-8 w-8" />
              </div>
              <span className="text-center text-sm font-medium text-white">
                {feature.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
