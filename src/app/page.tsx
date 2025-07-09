"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

export default function WelcomePage() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/20 p-8 text-center shadow-2xl shadow-pink-500/10 backdrop-blur-xl">
        <Image
          src="https://i.imgur.com/DFegeIc.jpeg"
          data-ai-hint="logo abstract"
          alt="Femigo Logo"
          width={120}
          height={120}
          className="mx-auto mb-6 rounded-full border-4 border-white/20 shadow-lg"
        />

        <h1 className="text-5xl font-bold tracking-tight text-white">
          Femigo
        </h1>
        <p className="mt-4 text-lg text-purple-200/80">
          Your trusted companion for safety and empowerment.
        </p>

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
  )
}
