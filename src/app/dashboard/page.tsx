
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
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

// Define a type for the feature buttons for easier mapping
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

  useEffect(() => {
    // Check if user is "logged in" by checking localStorage
    const storedName = localStorage.getItem("userName")
    const storedPhone = localStorage.getItem("userPhone")
    const storedEmail = localStorage.getItem("userEmail")

    if (storedPhone || storedEmail) {
      setUserName(storedName || "User")
    } else {
      router.push("/")
    }
  }, [router])

  // A component for the feature grid items
  const FeatureButton = ({ feature }: { feature: Feature }) => (
    <button className="flex flex-col items-center justify-start gap-2 text-center transition-transform hover:scale-105">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-black shadow-md">
        <feature.icon className="h-8 w-8 text-primary" />
      </div>
      <span className="text-xs font-medium text-foreground">{feature.name}</span>
    </button>
  )
  
  const userProfileImage = "https://i.imgur.com/DFegeIc.jpeg";

  return (
    <div className="flex min-h-screen w-full flex-col bg-black text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="text-2xl font-bold">
          Femigo
        </div>
        <Avatar>
          <AvatarImage src={userProfileImage} alt="User" />
          <AvatarFallback>{userName ? userName.charAt(0).toUpperCase() : "U"}</AvatarFallback>
        </Avatar>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        {/* Profile Section */}
        <section className="flex flex-col items-center py-6">
          <div className="relative">
            <div className="rounded-full bg-white/30 p-2 shadow-md dark:bg-card/30">
              <Avatar className="h-32 w-32 border-4 border-white dark:border-card">
                <AvatarImage src={userProfileImage} alt="Profile" />
                <AvatarFallback className="text-4xl">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </section>

        {/* Emergency Button */}
        <section className="px-6">
          <Button className="h-20 w-full justify-start rounded-2xl bg-gray-900 p-4 shadow-lg hover:bg-gray-800/90">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black">
                <Siren className="h-8 w-8 text-primary" />
              </div>
              <span className="text-xl font-semibold text-card-foreground">Emergency</span>
            </div>
          </Button>
        </section>

        {/* Features Grid */}
        <section className="mt-8 flex-1 rounded-t-3xl bg-gradient-to-r from-gray-900 to-gray-800 p-6 shadow-2xl">
          <div className="grid grid-cols-3 gap-y-6">
            {features.map((feature) => (
              <FeatureButton key={feature.name} feature={feature} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
