
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Confetti from "react-confetti"

import { Button } from "@/components/ui/button"

export default function CongratulationsPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Check for user data in localStorage
    const name = localStorage.getItem('userName')
    if (name) {
      setUserName(name)
    } else {
      // If no name, maybe redirect to start of signup or login
      router.push('/login')
    }
    
    // Cleanup localStorage after displaying the page
    const cleanupTimeout = setTimeout(() => {
        if (typeof window !== "undefined") {
            // Be specific about what you're removing
            localStorage.removeItem('userName')
            localStorage.removeItem('userCountry')
            localStorage.removeItem('userEmail')
            localStorage.removeItem('userPhone')
            localStorage.removeItem('userPhotoDataUri')
            localStorage.removeItem('userAadhaarDataUri')
            localStorage.removeItem('onboarding-details')
            localStorage.removeItem('passwordResetFlow');
        }
    }, 500); // Small delay to ensure state is set before cleanup

    // Confetti effect setup
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    handleResize()

    return () => {
        window.removeEventListener('resize', handleResize)
        clearTimeout(cleanupTimeout)
    }
  }, [router])

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black p-4 text-white">
      {windowSize.width > 0 && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />}
      <video
        src="https://media.istockphoto.com/id/1456520455/nl/video/sulfur-cosmos-flowers-bloom-in-the-garden.mp4?s=mp4-480x480-is&k=20&c=xbZAFUX4xgFK_GWD71mYxPUwCZr-qTb9wObCrWMB8ak="
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-1/2 left-1/2 w-full h-full min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0 opacity-40"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/60 to-transparent" />

      <div className="relative z-20 w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-1000 text-center">
        <div className="rounded-2xl border border-white/10 bg-transparent p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mb-6 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Congratulations, {userName || 'User'}!
          </h1>
          <p className="mt-4 text-lg text-white/70">
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
