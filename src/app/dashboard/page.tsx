
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
  ShieldPlus,
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
  { name: "Safe Mode", icon: ShieldPlus, href: "#" },
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
      <div className="absolute -left-1/4 -top-1/4 z-0 h-1/2 w-1/2 rounded-full bg-gradient-radial from-primary/10 to-transparent blur-3xl" />
      <div className="absolute -right-1/4 -bottom-1/4 z-0 h-1/2 w-1/2 rounded-full bg-gradient-radial from-secondary/10 to-transparent blur-3xl" />

      <div className="relative z-10 mx-auto flex h-full max-w-lg flex-col p-6 sm:p-8">
        <header className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              Femigo
            </h1>
            <p className="text-sm font-medium text-[#888DFF]">
              Safety. Strength. Solidarity.
            </p>
          </div>
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#FF0080] to-[#7928CA] blur-md"
              aria-hidden="true"
            />
            <Avatar className="relative h-12 w-12 border-2 border-transparent">
              <AvatarImage src={userProfileImage} alt={userName} />
              <AvatarFallback className="bg-card text-primary">{userInitial}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <section className="my-8 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            Welcome, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{userName}!</span>
          </h2>
          <p className="mt-2 text-base text-white/80">
            Your safety is our priority.
          </p>
        </section>

        <div className="group relative my-8">
          <div
            className="absolute -inset-0.5 rounded-3xl bg-gradient-to-l from-[#FF0080] to-[#5D26C1] opacity-60 blur-lg transition duration-500 group-hover:opacity-100"
            aria-hidden="true"
          />
          <button className="relative w-full rounded-3xl p-1">
            <div className="flex h-[100px] w-full items-center justify-center gap-4 rounded-[22px] bg-[#06010F]">
              <Siren className="h-8 w-8 text-[#FF0080]" />
              <span className="text-2xl font-bold text-white">Emergency</span>
            </div>
          </button>
        </div>
        
        <section className="mt-12">
          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
            {features.map((feature) => (
              <a
                href={feature.href}
                key={feature.name}
                className="group flex cursor-pointer flex-col items-center justify-center gap-2 transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-black">
                  <div
                    className="absolute -left-1/4 -top-1/4 h-full w-full bg-gradient-radial from-[#FF007A]/50 via-[#9C00FF]/30 to-transparent blur-2xl transition-transform duration-300 group-hover:scale-125"
                    aria-hidden="true"
                  />
                  <div className="relative z-10 flex h-full w-full items-center justify-center">
                    <feature.icon className="h-10 w-10 text-[#FF007A] drop-shadow-[0_0_8px_#FF007A] transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <span className="text-center text-sm font-medium text-white/80">
                  {feature.name}
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
