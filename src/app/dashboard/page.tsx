"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function DashboardPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [identifierType, setIdentifierType] = useState("")

  useEffect(() => {
    const storedPhone = typeof window !== "undefined" ? localStorage.getItem("userPhone") : null
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null

    if (storedPhone) {
      setIdentifier(storedPhone)
      setIdentifierType("phone number")
    } else if (storedEmail) {
      setIdentifier(storedEmail)
      setIdentifierType("email")
    } else {
      // If no identifier, user is not logged in
      router.push("/")
    }
  }, [router])


  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userPhone")
      localStorage.removeItem("userName")
      localStorage.removeItem("userCountry")
      localStorage.removeItem("userEmail")
    }
    router.push("/")
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome to Femigo!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>
            You have successfully logged in. Your verified {identifierType} is:
          </CardDescription>
          <p className="text-lg font-semibold text-primary">{identifier}</p>
          <Button onClick={handleSignOut} variant="destructive">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
