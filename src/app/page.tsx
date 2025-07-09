"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

export default function WelcomePage() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#FFE1E9] to-white p-6 text-center dark:bg-gradient-to-b dark:from-gray-900 dark:to-black">
      <div className="flex w-full max-w-sm flex-col items-center">
        {/* Illustration */}
        <Image
          src="https://placehold.co/600x400.png"
          data-ai-hint="women empowerment"
          alt="Illustration of women supporting each other"
          width={300}
          height={200}
          className="mb-8 rounded-lg"
        />

        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          Femigo
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Your trusted companion for safety and empowerment.
        </p>

        <div className="mt-12 w-full space-y-4">
          {/* Get Started Button */}
          <button
            onClick={() => router.push('/signup')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#EC008C] to-[#FF55A5] py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Existing User Link */}
          <Link
            href="/login"
            className="inline-block text-sm text-gray-600 hover:underline dark:text-gray-400"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </main>
  )
}
