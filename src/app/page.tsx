

"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  const router = useRouter()

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-foreground">
      <div className="absolute inset-x-0 top-0 h-1/2 w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-blue-950/10 to-transparent" />
      
      <div className="relative z-10 w-full max-w-sm animate-in fade-in zoom-in-95 duration-700">
        <div className="rounded-2xl bg-background/50 dark:bg-black/50 p-8 text-center shadow-2xl backdrop-blur-lg border border-border">
          <Image
            src="https://i.ibb.co/RptYQ4Hm/Whats-App-Image-2025-07-09-at-11-21-29-ca10852e.jpg"
            data-ai-hint="woman illustration"
            alt="Femigo Logo"
            width={120}
            height={120}
            className="mx-auto mb-6 rounded-full border-2 border-white/10 shadow-lg"
            priority
          />

          <h1 className="text-5xl font-bold tracking-tight">
            Femigo
          </h1>
          <p className="mt-4 text-lg text-foreground/70">
            Your trusted companion for safety and empowerment.
          </p>

          <div className="mt-12 w-full space-y-4">
            <Button
              onClick={() => router.push('/signup')}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-4 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Get Started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>

            <p className="pt-4 text-sm text-foreground/50">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary/90 transition-colors hover:text-primary hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
