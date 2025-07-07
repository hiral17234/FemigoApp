
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Siren,
  MapPin,
  RadioTower,
  ShieldCheck,
  Compass,
  BarChartBig,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Feature = {
  name: string
  icon: React.ElementType
  href: string
}

const features: Feature[] = [
  { name: "Location", icon: MapPin, href: "#" },
  { name: "SOS", icon: RadioTower, href: "#" },
  { name: "Check Safe", icon: ShieldCheck, href: "#" },
  { name: "Track Me", icon: Compass, href: "#" },
  { name: "Safety Score", icon: BarChartBig, href: "#" },
  { name: "Safe Mode", icon: ShieldCheck, href: "#" },
]

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [userInitial, setUserInitial] = useState("U")
  const userProfileImage = "https://i.imgur.com/DFegeIc.jpeg"

  useEffect(() => {
    const storedName = localStorage.getItem("userName")
    const storedPhone = localStorage.getItem("userPhone")
    const storedEmail = localStorage.getItem("userEmail")

    if (storedPhone || storedEmail) {
      setUserName(storedName || "User")
      setUserInitial(storedName ? storedName.charAt(0).toUpperCase() : "U")
    } else {
      router.push("/")
    }
  }, [router])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background font-body text-foreground">
      {/* Background Glows */}
      <div className="absolute -left-80 -top-80 z-0 h-[40rem] w-[40rem] rounded-full bg-primary/10 blur-[150px]" />
      <div className="absolute -right-80 -bottom-60 z-0 h-[40rem] w-[40rem] rounded-full bg-secondary/10 blur-[150px]" />

      <div className="relative z-10 mx-auto flex h-full max-w-lg flex-col p-6 sm:p-8">
        {/* Header */}
        <header className="flex items-center justify-between py-4">
          <h1 className="text-3xl font-bold text-white" style={{ textShadow: '0 0 15px hsl(var(--primary)/0.6)' }}>
            Femigo
          </h1>
          <Avatar className="h-12 w-12 border-2 border-primary/30">
            <AvatarImage src={userProfileImage} alt={userName} />
            <AvatarFallback className="bg-card text-primary">{userInitial}</AvatarFallback>
          </Avatar>
        </header>

        {/* Welcome Message */}
        <section className="my-8">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            Welcome, <span className="text-primary/90">{userName}!</span>
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Your safety is our priority.
          </p>
        </section>

        {/* Emergency Button */}
        <div className="group relative my-4">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary to-secondary opacity-60 blur-lg transition-all duration-300 group-hover:opacity-100 group-hover:duration-200"></div>
          <button className="relative flex h-24 w-full items-center justify-center gap-4 rounded-2xl bg-card text-2xl font-bold text-white transition-transform duration-200 active:scale-95">
            <Siren className="h-8 w-8 text-primary" />
            <span>Emergency</span>
          </button>
        </div>

        {/* Features Grid */}
        <section className="mt-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
            {features.map((feature) => (
              <div key={feature.name} className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-accent hover:shadow-2xl hover:shadow-primary/20 aspect-square">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/50 ring-1 ring-primary/30 transition-all duration-300 group-hover:bg-primary/10 group-hover:ring-primary/50 group-hover:shadow-[0_0_20px_0_hsl(var(--primary)/0.4)]">
                  <feature.icon className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{feature.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
