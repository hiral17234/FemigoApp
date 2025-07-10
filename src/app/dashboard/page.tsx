
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Siren,
  MapPin,
  RadioTower,
  ShieldCheck,
  Compass,
  BarChartBig,
  ShieldPlus,
  Loader2,
  CalendarDays,
  Quote
} from "lucide-react"
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"
import { format } from "date-fns"

import { auth, db, firebaseError } from "@/lib/firebase"

const dailyQuotes = [
  { quote: "A strong woman looks a challenge in the eye and gives it a wink.", author: "Gina Carey" },
  { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { quote: "She believed she could, so she did.", author: "R.S. Grey" },
  { quote: "The most effective way to do it, is to do it.", author: "Amelia Earhart" },
  { quote: "Well-behaved women seldom make history.", author: "Laurel Thatcher Ulrich" },
  { quote: "You are more powerful than you know; you are beautiful just as you are.", author: "Melissa Etheridge" },
  { quote: "A woman with a voice is, by definition, a strong woman.", author: "Melinda Gates" }
];

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

function DailyThought() {
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);
  const [dailyQuote, setDailyQuote] = useState({ quote: "", author: "" });

  useEffect(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const quoteIndex = dayOfYear % dailyQuotes.length;
    setDailyQuote(dailyQuotes[quoteIndex]);

    setCurrentDateTime(new Date());
    const timerId = setInterval(() => setCurrentDateTime(new Date()), 1000);

    return () => clearInterval(timerId);
  }, []);

  if (!currentDateTime) {
    return (
        <div className="w-full max-w-md mx-auto h-[230px] rounded-2xl bg-card/50 animate-pulse" />
    );
  }
  
  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in-0 slide-in-from-top-4 duration-700 space-y-6 text-center">
        <div className="inline-block rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 p-px shadow-lg shadow-primary/10">
            <div className="rounded-full bg-card px-4 py-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <p>{format(currentDateTime, "eeee, MMMM d, yyyy 'at' hh:mm:ss a")}</p>
            </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 p-6 shadow-inner-lg border border-border/10 relative">
            <Quote className="absolute top-4 left-2 h-8 w-8 text-primary/30" />
            <Quote className="absolute bottom-4 right-2 h-8 w-8 text-primary/30 rotate-180" />
            <p className="text-lg italic text-foreground/90">"{dailyQuote.quote}"</p>
            <p className="text-right text-sm text-muted-foreground font-medium mt-4">- {dailyQuote.author}</p>
        </div>
    </div>
  );
}


export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(() => {
    if (!auth) {
        setIsLoadingUser(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            try {
                if (!db) {
                    setUserName(currentUser.displayName || "User");
                    return;
                }
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                let nameToDisplay = "User";
                if (userDoc.exists()) {
                    nameToDisplay = userDoc.data().displayName || "User";
                } else {
                    nameToDisplay = currentUser.displayName || "User";
                }
                setUserName(nameToDisplay);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                setUserName(currentUser.displayName || "User");
            } finally {
                setIsLoadingUser(false);
            }
        } else {
            // The layout is responsible for redirecting.
            // If we reach here, it might be during the initial logout phase before redirect.
            // Setting loading to false and letting the component render a loader is fine, as layout will redirect.
            setIsLoadingUser(false);
        }
    });

    return () => unsubscribe();
  }, []);
  
  if (firebaseError) {
    return (
      <main className="flex flex-1 items-center justify-center p-4 text-center">
          <div className="rounded-lg bg-card p-8 text-card-foreground">
              <h1 className="text-xl font-bold text-destructive">Configuration Error</h1>
              <p className="mt-2 text-muted-foreground">{firebaseError}</p>
          </div>
      </main>
    );
  }

  if (isLoadingUser) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  if (!userName) {
    // This state can occur if the user is not logged in and before the layout redirects.
    // Displaying a loader here prevents showing a flicker of an empty page.
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Welcome, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{userName}!</span>
        </h1>
        <p className="text-muted-foreground">
          Your safety is our priority.
        </p>
      </div>
      
      <DailyThought />

      <Link href="/emergency" className="w-full max-w-md mx-auto">
        <div className="group rounded-3xl bg-gradient-to-r from-primary to-secondary p-0.5 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30">
          <div className="flex h-20 items-center justify-center gap-6 rounded-[22px] bg-card px-8">
            <Siren className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110" />
            <span className="text-3xl font-bold text-foreground">
              Emergency
            </span>
          </div>
        </div>
      </Link>
      
      <section className="w-full max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature) => (
            <Link
              href={feature.href}
              key={feature.name}
              className="group flex flex-col items-center justify-center gap-2 text-center transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 p-px transition-all duration-300 group-hover:from-primary/80 group-hover:to-secondary/80">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card transition-colors duration-300 group-hover:bg-accent">
                    <feature.icon className="h-8 w-8 text-primary [filter:drop-shadow(0_0_4px_hsl(var(--primary)))]" />
                  </div>
              </div>
              <span className="text-sm font-medium text-foreground">
                {feature.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
