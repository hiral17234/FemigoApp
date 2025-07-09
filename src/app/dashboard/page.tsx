
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
  CalendarDays,
  Quote
} from "lucide-react"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { format } from "date-fns"

import { auth, db, firebaseError } from "@/lib/firebase"
import { Button } from "@/components/ui/button"

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
    // Set daily quote based on the day of the year
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const quoteIndex = dayOfYear % dailyQuotes.length;
    setDailyQuote(dailyQuotes[quoteIndex]);

    // Set initial time and then update every second
    setCurrentDateTime(new Date());
    const timerId = setInterval(() => setCurrentDateTime(new Date()), 1000);

    return () => clearInterval(timerId);
  }, []);

  if (!currentDateTime) {
    return (
        <div className="w-full max-w-md mx-auto h-[164px] rounded-2xl bg-[#110D1F] animate-pulse" />
    );
  }
  
  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in-0 slide-in-from-top-4 duration-700 space-y-6 text-center">
        {/* Date/Time toastbox */}
        <div className="inline-block rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 p-px shadow-lg shadow-pink-500/10">
            <div className="rounded-full bg-[#110D1F] px-4 py-2 flex items-center justify-center gap-2 text-sm text-purple-300">
                <CalendarDays className="h-4 w-4" />
                <p>{format(currentDateTime, "eeee, MMMM d, yyyy 'at' hh:mm:ss a")}</p>
            </div>
        </div>

        {/* Free-floating Quote */}
        <div className="space-y-2 px-4">
            <div className="relative text-white/90 italic pt-2 text-lg">
                <Quote className="absolute -left-4 -top-1 h-5 w-5 text-primary/50" />
                <p>{dailyQuote.quote}</p>
                <Quote className="absolute -right-2 -bottom-1 h-5 w-5 text-primary/50 rotate-180" />
            </div>
            <p className="text-right text-sm text-muted-foreground font-medium">- {dailyQuote.author}</p>
        </div>
    </div>
  );
}


export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userName, setUserName] = useState<string | null>(null)
  const [userInitial, setUserInitial] = useState("")
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(() => {
    if (firebaseError || !auth || !db) {
        setIsLoadingUser(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
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
  }, [router]);
  
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
      
      <DailyThought />

      <Link href="/emergency" className="w-full max-w-md mx-auto">
        <div className="group rounded-3xl bg-gradient-to-r from-[#FF0080] to-[#7928CA] p-0.5 shadow-lg shadow-[#FF0080]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#FF0080]/30">
          <div className="flex h-24 items-center justify-center gap-4 rounded-[22px] bg-[#0A0A0F]">
            <Siren className="h-8 w-8 text-[#FF0080] transition-transform duration-300 group-hover:scale-110" />
            <span className="text-2xl font-bold text-white">
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
