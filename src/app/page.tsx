"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-30"
        src="https://videos.pexels.com/video-files/5661979/5661979-hd_1920_1080_30fps.mp4"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <main className="relative z-20 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
            {/* Logo */}
            <Image
              src="https://i.imgur.com/DFegeIc.jpeg"
              data-ai-hint="logo"
              alt="Femigo Logo"
              width={120}
              height={120}
              className="mx-auto mb-6 rounded-full border-4 border-white/20 shadow-lg"
            />
            
            {/* Header */}
            <h1 className="text-5xl font-bold tracking-tight text-white">
              Femigo
            </h1>
            <p className="mt-4 text-lg text-purple-200/80">
              Your trusted companion for safety and empowerment.
            </p>

            {/* Action Buttons */}
            <div className="mt-12 w-full space-y-4">
              <button
                onClick={() => router.push('/signup')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-pink-500/50 focus:outline-none"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </button>

              <p className="pt-4 text-sm text-purple-200/70">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-pink-400 hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
        </div>
      </main>
    </div>
  )
}
