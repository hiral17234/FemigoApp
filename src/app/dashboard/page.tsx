
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Siren,
  MapPin,
  RadioTower,
  Shield,
  Compass,
  BarChart,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Feature = {
  name: string
  icon: React.ElementType
  href: string
}

const features: Feature[] = [
  { name: "Location", icon: MapPin, href: "#" },
  { name: "SOS", icon: RadioTower, href: "#" },
  { name: "Check Safe", icon: Shield, href: "#" },
  { name: "Track Me", icon: Compass, href: "#" },
  { name: "Women Safety Score", icon: BarChart, href: "#" },
  { name: "Safe Mode", icon: ShieldCheck, href: "#" },
]

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [userInitial, setUserInitial] = useState("U")

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

  const FeatureButton = ({ feature }: { feature: Feature }) => (
    <button className="group flex flex-col items-center justify-center gap-3 text-center transition-transform duration-300 active:scale-95">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card/50 ring-1 ring-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_2px_hsl(var(--primary)/0.5)] group-hover:ring-primary">
        <feature.icon className="h-9 w-9 text-primary transition-colors duration-300" />
      </div>
      <span className="text-sm font-medium text-foreground/90">{feature.name}</span>
    </button>
  )
  
  const userProfileImage = "https://i.imgur.com/DFegeIc.jpeg";

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <h1 className="text-3xl font-bold text-primary" style={{ textShadow: '0 0 10px hsl(var(--primary)/0.7)' }}>
          Femigo
        </h1>
        <Avatar className="h-12 w-12 border-2 border-primary/50">
          <AvatarImage src={userProfileImage} alt={userName} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-4 py-8 md:px-6">
        {/* Emergency Button */}
        <div className="w-full max-w-sm">
           <Button className="h-24 w-full rounded-2xl border-2 border-primary/70 bg-card/50 p-4 text-2xl font-bold text-primary shadow-[0_0_20px_rgba(255,45,117,0.4)] transition-all duration-300 hover:scale-105 hover:border-primary hover:bg-primary/10 hover:text-white hover:shadow-[0_0_40px_rgba(255,45,117,0.9)] active:scale-100">
            <div className="flex items-center justify-center gap-4">
              <Siren className="h-10 w-10" />
              <span>EMERGENCY</span>
            </div>
          </Button>
        </div>

        {/* Features Grid */}
        <section className="w-full max-w-lg rounded-2xl bg-card/50 p-6 shadow-2xl backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-y-8">
            {features.map((feature) => (
              <FeatureButton key={feature.name} feature={feature} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
