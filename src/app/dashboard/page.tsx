
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
import { format } from "date-fns"


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
  translationKey: string;
}

const features: Feature[] = [
  { name: "Location", icon: MapPin, href: "/location", translationKey: "location" },
  { name: "SOS", icon: RadioTower, href: "#", translationKey: "sos" },
  { name: "Check Safe", icon: ShieldCheck, href: "#", translationKey: "checkSafe" },
  { name: "Track Me", icon: Compass, href: "#", translationKey: "trackMe" },
  { name: "Safety Score", icon: BarChartBig, href: "#", translationKey: "safetyScore" },
  { name: "Safe Mode", icon: ShieldPlus, href: "#", translationKey: "safeMode" },
]

const translations: Record<string, Record<string, string>> = {
    en: {
        welcome: "Welcome",
        priority: "Your safety is our priority.",
        emergency: "Emergency",
        location: "Location",
        sos: "SOS",
        checkSafe: "Check Safe",
        trackMe: "Track Me",
        safetyScore: "Safety Score",
        safeMode: "Safe Mode",
    },
    hi: {
        welcome: "आपका स्वागत है",
        priority: "आपकी सुरक्षा हमारी प्राथमिकता है।",
        emergency: "आपातकाल",
        location: "स्थान",
        sos: "एसओएस",
        checkSafe: "सुरक्षित जांचें",
        trackMe: "मुझे ट्रैक करें",
        safetyScore: "सुरक्षा स्कोर",
        safeMode: "सुरक्षित मोड",
    }
};

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
        <div className="inline-block rounded-full bg-gradient-to-r from-primary/30 to-[#4b0e9c]/30 p-px shadow-lg shadow-primary/10">
            <div className="rounded-full bg-[#4b0e9c]/30 px-4 py-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <p>{format(currentDateTime, "eeee, MMMM d, yyyy 'at' hh:mm:ss a")}</p>
            </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-[#4b0e9c]/10 p-8 shadow-inner-lg border border-border/10 relative">
            <p className="text-lg italic text-foreground/90">"{dailyQuote.quote}"</p>
            <p className="text-right text-sm text-muted-foreground font-medium mt-4">- {dailyQuote.author}</p>
        </div>
    </div>
  );
}


export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('femigo-language');
    if (storedLang && (storedLang === 'en' || storedLang === 'hi')) {
        setLanguage(storedLang);
    }
  }, []);


  useEffect(() => {
    // Logic is handled in the layout, this page just gets the name.
    const nameToDisplay = localStorage.getItem('userName') || 'User';
    setUserName(nameToDisplay);
    setIsLoadingUser(false);
  }, []);
  
  const t = translations[language];


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
          {t.welcome}, <span className="bg-gradient-to-r from-primary to-[#4b0e9c] bg-clip-text text-transparent">{userName}!</span>
        </h1>
        <p className="text-muted-foreground">
          {t.priority}
        </p>
      </div>
      
      <DailyThought />

      <Link href="/emergency" className="w-full max-w-md mx-auto">
        <div className="group rounded-3xl bg-gradient-to-r from-primary to-[#4b0e9c] p-1 shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 active:scale-100">
          <div className="flex h-20 items-center justify-center gap-4 rounded-[22px] bg-black px-8">
            <Siren className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110" style={{filter: 'drop-shadow(0 0 8px hsl(var(--primary)))'}} />
            <span className="text-3xl font-bold text-foreground">
              {t.emergency}
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
              <div className="rounded-full bg-gradient-to-br from-primary/30 to-[#4b0e9c]/30 p-px transition-all duration-300 group-hover:from-primary/80 group-hover:to-[#4b0e9c]/80">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black transition-colors duration-300">
                    <feature.icon className="h-8 w-8 text-primary [filter:drop-shadow(0_0_4px_hsl(var(--primary)))]" />
                  </div>
              </div>
              <span className="text-sm font-medium text-foreground">
                {t[feature.translationKey]}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
