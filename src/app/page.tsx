
"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

export default function WelcomePage() {
  const router = useRouter()

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0C0A09] p-4 text-white">
      <div className="absolute top-0 left-0 h-1/2 w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/40 via-violet-900/10 to-transparent" />
      
      <div className="relative z-10 w-full max-w-sm animate-in fade-in zoom-in-95 duration-700">
        <div className="rounded-2xl border border-white/10 bg-[#161616]/80 p-8 text-center shadow-2xl shadow-primary/10 backdrop-blur-lg">
          <Image
            src="https://i.ibb.co/RptYQ4Hm/Whats-App-Image-2025-07-09-at-11-21-29-ca10852e.jpg"
            data-ai-hint="woman illustration"
            alt="Femigo Logo"
            width={120}
            height={120}
            className="mx-auto mb-6 rounded-full border-2 border-white/10 shadow-lg"
            priority
          />

          <h1 className="text-5xl font-bold tracking-tight text-white">
            Femigo
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Your trusted companion for safety and empowerment.
          </p>

          <div className="mt-12 w-full space-y-4">
            <button
              onClick={() => router.push('/signup')}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EC008C] to-[#BF55E6] py-4 text-lg font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Get Started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="pt-4 text-sm text-white/50">
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
