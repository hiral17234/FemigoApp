"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Globe, Phone, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [country, setCountry] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  
  useEffect(() => {
    const storedName = localStorage.getItem("userName")
    const storedCountry = localStorage.getItem("userCountry")
    const storedPhone = localStorage.getItem("userPhone")
    const storedEmail = localStorage.getItem("userEmail")

    if (storedPhone || storedEmail) {
      setName(storedName || "N/A")
      setCountry(storedCountry || "N/A")
      setPhone(storedPhone || "N/A")
      setEmail(storedEmail || "N/A")
    } else {
      // If no identifier, user is not logged in
      router.push("/")
    }
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem("userPhone")
    localStorage.removeItem("userName")
    localStorage.removeItem("userCountry")
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  // Helper to capitalize country name
  const formatCountry = (country: string) => {
    if (country === 'N/A') return country;
    return country.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome, {name}!</CardTitle>
          <CardDescription>
            Your account has been created successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Your Verified Details</h3>
            <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <span className="text-sm">{name}</span>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <span className="text-sm">{formatCountry(country)}</span>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <span className="text-sm">{phone}</span>
                </div>
                 <Separator />
                <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="text-sm">{email}</span>
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSignOut} variant="destructive" className="w-full">
                Sign Out
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
