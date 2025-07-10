
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, PartyPopper } from "lucide-react"
import Confetti from "react-confetti"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return { width: size[0], height: size[1] };
}

export default function CongratulationsPage() {
  const router = useRouter()
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false)
  const [verifiedSteps, setVerifiedSteps] = useState<string[]>([])

  useEffect(() => {
    setShowConfetti(true)

    const steps: string[] = []
    if (typeof window !== "undefined") {
      if (localStorage.getItem("userName")) steps.push("Profile Started")
      steps.push("Face Verified")
      if (localStorage.getItem("userCountry") === "india") steps.push("Aadhaar Verified")
      if (localStorage.getItem("userPhone")) steps.push("Phone Verified")
      if (localStorage.getItem("userEmail")) steps.push("Email Verified")
    }
    setVerifiedSteps(steps)
  }, [])

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#1D0C2C] p-4 text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
      {showConfetti && width > 0 && height > 0 && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.15}
          colors={['#EC008C', '#BF55E6', '#FFD700', '#00C49F', '#0088FE', '#FF8042']}
        />
      )}

      <div className="relative z-10 w-full max-w-lg">
        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-primary to-secondary opacity-30 blur-2xl" />
        <Card className="relative z-10 animate-in fade-in zoom-in-90 duration-700 rounded-2xl border border-white/10 bg-[#12051E] p-6 text-center shadow-2xl shadow-primary/20">
            <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FF2DAF] text-white shadow-lg shadow-[#FF2DAF]/30">
                <PartyPopper size={40} />
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#FF2DAF]">
                Congratulations!
            </h1>
            <p className="pt-2 text-white/70">
                You've successfully completed the verification process. Welcome to the Femigo community!
            </p>
            </CardHeader>

            <CardContent className="space-y-8">
            <div className="mx-auto max-w-xs space-y-3">
                {verifiedSteps.map((step, index) => (
                <div
                    key={index}
                    className="flex items-center gap-3 animate-in fade-in-0 slide-in-from-left-4 duration-500"
                    style={{ animationDelay: `${index * 150}ms` }}
                >
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-base font-medium text-white/90">{step}</span>
                </div>
                ))}
            </div>

            <div className="space-y-4">
                <p className="text-sm text-white/60">
                    You're doing great! Just a few more details to complete your profile and set up your password.
                </p>
                <Button
                    onClick={() => router.push("/onboarding/details")}
                    className="w-full rounded-lg bg-[#E50081] py-3 text-lg font-semibold text-primary-foreground shadow-lg shadow-[#E50081]/30 transition-transform duration-300 hover:scale-105 hover:shadow-[#E50081]/40 focus:outline-none"
                >
                    Let's Go!
                </Button>
            </div>
            </CardContent>
        </Card>
      </div>
    </main>
  )
}
