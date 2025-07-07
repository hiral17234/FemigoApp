
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

      <div className="relative z-10 mx-auto flex h-full max-w-lg flex-col p-6 sm:p-8">
        <header className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Femigo
            </h1>
            <p className="text-sm font-medium text-purple-300/80">
              Safety. Strength. Solidarity.
            </p>
          </div>
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#FF0080] to-[#7928CA] opacity-75 blur-md"
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

        <Link href="/emergency">
          <div className="group relative my-8 transition-transform duration-150 active:scale-95">
            {/* Outer Glow */}
            <div
              className="absolute -inset-2.5 rounded-3xl bg-gradient-to-r from-[#FF0080] to-[#7928CA] opacity-30 blur-xl transition-all duration-300 group-hover:opacity-50"
              aria-hidden="true"
            />
            {/* Gradient Border */}
            <div className="relative h-24 w-full rounded-3xl bg-gradient-to-r from-[#FF0080] to-[#7928CA] p-1">
              <div className="flex h-full w-full items-center justify-center gap-4 rounded-[22px] bg-[#0A0A0F]">
                <Siren className="h-8 w-8 text-[#FF0080]" />
                <span className="text-2xl font-bold text-white">Emergency</span>
              </div>
            </div>
          </div>
        </Link>
        
        <section className="mt-12">
          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
            {features.map((feature) => (
              <a
                href={feature.href}
                key={feature.name}
                className="group flex cursor-pointer flex-col items-center justify-center gap-2 transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="relative h-24 w-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-radial from-pink-500/10 via-purple-500/5 to-transparent blur-lg transition-all duration-300 group-hover:from-pink-500/20" />
                  <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full border border-white/10 bg-gray-900/50 backdrop-blur-sm">
                    <feature.icon className="h-10 w-10 text-[#FF0080] drop-shadow-[0_0_8px_#FF007A] transition-transform duration-300 group-hover:scale-110" />
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
