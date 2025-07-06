"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signOut, User } from "firebase/auth"

import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setLoading(false)
      } else {
        // Not signed in, redirect to home page
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      // The onAuthStateChanged listener will handle the redirect automatically.
    } catch (error)      {
      console.error("Error signing out: ", error)
    }
  }

  // Show a loader while we check for authentication state.
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }
  
  // This is a fallback to prevent flashing content before the redirect.
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome to Femigo!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>
            You have successfully verified your identity and are logged in with phone number:
          </CardDescription>
          <p className="text-lg font-semibold text-primary">{user.phoneNumber}</p>
          <Button onClick={handleSignOut} variant="destructive">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
