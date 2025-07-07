
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
  { name: "Check Safe", icon: ShieldCheck, href: "#" },
  { name: "Track Me", icon: Compass, href: "#" },
  { name: "Women Safety Score", icon: BarChartBig, href: "#" },
  { name: "Safe Mode", icon: ShieldCheck, href: "#" },
]

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [userInitial, setUserInitial] = useState("U")
  const userProfileImage = "https://i.imgur.com/DFegeIc.jpeg";

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
    <div className="flex min-h-screen w-full flex-col items-center bg-black p-6 font-body text-gray-100">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white" style={{ textShadow: '0 0 15px hsl(var(--primary)/0.8)' }}>
            Femigo
          </h1>
          <Avatar className="h-12 w-12 border-2 border-primary/50 ring-2 ring-primary/30">
            <AvatarImage src={userProfileImage} alt={userName} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </header>

        {/* Daily Empowerment Thoughts */}
        <p className="text-lg text-gray-400">Daily Empowerment Thoughts</p>

        {/* Emergency Button */}
        <div className="group relative">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary to-purple-600 opacity-75 blur-lg transition-opacity duration-300 group-hover:opacity-100"></div>
          <button className="relative flex h-24 w-full items-center justify-center gap-4 rounded-2xl bg-gray-900 text-2xl font-bold text-white transition-transform duration-200 active:scale-95">
            <Siren className="h-8 w-8 text-primary" />
            <span>Emergency</span>
          </button>
        </div>

        {/* Features Grid */}
        <section className="grid grid-cols-3 gap-x-4 gap-y-8 text-center">
          {features.map((feature) => (
            <div key={feature.name} className="group flex cursor-pointer flex-col items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-800/80 to-gray-900/60 shadow-inner ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_0_hsl(var(--primary)/0.5)]">
                <feature.icon className="h-9 w-9 text-primary transition-transform group-hover:scale-110" />
              </div>
              <span className="text-sm font-medium text-gray-300">{feature.name}</span>
            </div>
          ))}
        </section>

        {/* Community Card */}
        <div className="relative mt-4">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary to-purple-600 opacity-50 blur-lg"></div>
          <div className="relative flex flex-col items-center gap-6 rounded-2xl bg-gray-900 p-6 text-center">
            <Avatar className="h-16 w-16 border-2 border-primary/50">
              <AvatarImage src={userProfileImage} alt="Community illustration" />
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Empowerment Through Connection</h3>
              <p className="text-sm text-gray-400">
                Femigo is more than just an app, it's a movement. Join the community and be a part of change.
              </p>
            </div>
            <Button className="w-full rounded-lg bg-primary py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105">
              Join the Community
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
