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
      if (localStorage.getItem("userName")) steps.push("Account Created")
      steps.push("Face Verified")
      if (localStorage.getItem("userCountry") === "india") steps.push("Aadhaar Verified")
      if (localStorage.getItem("userPhone")) steps.push("Phone Verified")
      if (localStorage.getItem("userEmail")) steps.push("Email Verified")
    }
    setVerifiedSteps(steps)
  }, [])

  const drawHeart = (ctx: CanvasRenderingContext2D) => {
    const x = 0, y = 0, size = 15;
    ctx.fillStyle = "rgba(236, 0, 140, 0.7)";
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2 + size / 4, x, y + size);
    ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2 + size / 4, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
    ctx.fill();
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF1F5] to-white p-4 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black">
      {showConfetti && width > 0 && height > 0 && (
        <>
          <Confetti
            width={width}
            height={height}
            recycle={true}
            numberOfPieces={200}
            gravity={0.1}
          />
          <Confetti
            width={width}
            height={height}
            recycle={true}
            numberOfPieces={50}
            gravity={0.03}
            drawShape={drawHeart}
            initialVelocityY={-10}
          />
        </>
      )}

      <div className="absolute -left-20 -top-20 z-0 h-80 w-80 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30" />
      <div className="absolute -right-20 -bottom-20 z-0 h-80 w-80 rounded-full bg-rose-500/20 blur-3xl dark:bg-rose-500/30" />

      <Card className="z-10 w-full max-w-lg animate-in fade-in zoom-in-90 duration-700 rounded-2xl border border-primary/30 bg-card p-6 text-center shadow-2xl shadow-primary/30">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-lg">
            <PartyPopper size={40} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mt-4 bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
            Congratulations!
          </h1>
          <p className="text-muted-foreground pt-2">
            You've successfully completed the verification process. Welcome to the Femigo community!
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            {verifiedSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-center text-left gap-3 animate-in fade-in-0 slide-in-from-left-4 duration-500"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{step}</span>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground px-4">
              Now let's fill some basic details to let the others know about you, pal.
            </p>
            <Button
              onClick={() => router.push("/onboarding/details")}
              className="w-full rounded-xl bg-gradient-to-r from-[#EC008C] to-[#FF55A5] py-3 text-lg font-semibold text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-primary/40 focus:outline-none"
            >
              Let's Go!
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
