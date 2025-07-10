
"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

export default function WelcomePage() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#FFE1E9] to-white p-4 text-gray-800">
      <div className="w-full max-w-sm rounded-2xl bg-white/80 p-8 text-center shadow-2xl shadow-pink-200/50 backdrop-blur-lg">
        <Image
          src="https://i.ibb.co/RptYQ4Hm/Whats-App-Image-2025-07-09-at-11-21-29-ca10852e.jpg"
          data-ai-hint="logo abstract"
          alt="Femigo Logo"
          width={120}
          height={120}
          className="mx-auto mb-6 rounded-full border-4 border-white/80 shadow-lg"
        />

        <h1 className="text-5xl font-bold tracking-tight text-[#1F2937]">
          Femigo
        </h1>
        <p className="mt-4 text-lg text-[#6B7280]">
          Your trusted companion for safety and empowerment.
        </p>

        <div className="mt-12 w-full space-y-4">
          <button
            onClick={() => router.push('/signup')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EC008C] to-[#FF55A5] py-4 text-lg font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-pink-500/50 focus:outline-none"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </button>

          <p className="pt-4 text-sm text-[#666666]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#EC008C] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
