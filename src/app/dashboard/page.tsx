
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
  { name: "Women Safety Score", icon: BarChartBig, href: "#" },
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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#06010F] font-body text-[#F5F5F5]">
      {/* Decorative radial gradients for ambient glow */}
      <div className="absolute -left-1/4 -top-1/4 z-0 h-1/2 w-1/2 rounded-full bg-gradient-radial from-primary/10 to-transparent blur-3xl" />
      <div className="absolute -right-1/4 -bottom-1/4 z-0 h-1/2 w-1/2 rounded-full bg-gradient-radial from-secondary/10 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto flex h-full max-w-lg flex-col p-6 sm:p-8">
        {/* Header */}
        <header className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-3xl font-bold text-white [text-shadow:0_0_8px_hsl(var(--primary)/0.5)]">Femigo</h1>
            <p className="text-sm font-medium text-[#888DFF]">
              Safety. Strength. Solidarity.
            </p>
          </div>
          <Avatar className="h-12 w-12 border-2 border-primary/50 shadow-[0_0_15px_hsl(var(--primary)/0.5)]">
            <AvatarImage src={userProfileImage} alt={userName} />
            <AvatarFallback className="bg-card text-primary">{userInitial}</AvatarFallback>
          </Avatar>
        </header>

        {/* Welcome Message */}
        <section className="my-8 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            Welcome, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{userName}!</span>
          </h2>
          <p className="mt-2 text-base text-white/80">
            Your safety is our priority.
          </p>
        </section>

        {/* Emergency Button */}
        <div className="group relative my-8">
          <div
            className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#FF0080] to-[#7928CA] opacity-60 blur-xl transition duration-300 group-hover:opacity-100"
            aria-hidden="true"
          />
          <button className="relative w-full rounded-3xl bg-gradient-to-r from-[#FF0080] to-[#7928CA] p-1 transition-transform duration-200 active:scale-95">
            <div className="flex h-[100px] w-full items-center justify-center gap-4 rounded-[22px] bg-[#0A0A0F]">
              <Siren className="h-8 w-8 text-[#FF0080]" />
              <span className="text-2xl font-bold text-white">Emergency</span>
            </div>
          </button>
        </div>


        {/* Features Grid */}
        <section className="mt-8">
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => (
              <div key={feature.name} className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-[#1A1A2E] p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40 aspect-square">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/50 ring-1 ring-primary/30 transition-all duration-300 group-hover:bg-primary/10 group-hover:ring-primary/50 group-hover:shadow-[0_0_20px_0_hsl(var(--primary)/0.4)]">
                  <feature.icon className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="text-center text-sm font-medium text-white/80">{feature.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
