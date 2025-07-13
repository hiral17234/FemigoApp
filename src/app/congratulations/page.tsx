

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Confetti from "react-confetti"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"


export default function CongratulationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userName, setUserName] = useState<string | null>(null)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Get the newly created user's name from localStorage
    const name = localStorage.getItem('userName');
    if (name) {
        setUserName(name);
    } else {
        // If the name is somehow missing, redirect to login as a fallback
        router.push('/login');
    }
    
    // Confetti effect setup
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    
    // Show success toast
    toast({
        variant: "success",
        title: "Account Created!",
        description: "Your Femigo account has been successfully created.",
    })

    return () => {
        window.removeEventListener('resize', handleResize)
    }
  }, [router, toast])

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-foreground">
      {windowSize.width > 0 && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />}
      <video
        src="https://media.istockphoto.com/id/1456520455/nl/video/sulfur-cosmos-flowers-bloom-in-the-garden.mp4?s=mp4-480x480-is&k=20&c=xbZAFUX4xgFK_GWD71mYxPUwCZr-qTb9wObCrWMB8ak="
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-1/2 left-1/2 w-full h-full min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0 opacity-40 dark:opacity-70"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/60 to-transparent" />

      <div className="relative z-20 w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-1000 text-center">
        <div className="rounded-2xl border border-border bg-background/50 dark:bg-black/50 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Congratulations, {userName || 'User'}!
          </h1>
          <p className="mt-4 text-lg text-foreground/70">
            Your Femigo account has been created successfully. Welcome to a safer world.
          </p>

          <Link href="/login">
            <Button
              className="mt-10 w-full rounded-xl bg-primary py-3 text-lg text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105"
            >
              Proceed to Login
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
