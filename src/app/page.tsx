
"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { useTheme } from "next-themes"

export default function WelcomePage() {
  const router = useRouter()
  const { theme } = useTheme();

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-sm rounded-2xl bg-card/80 p-8 text-center shadow-2xl backdrop-blur-lg">
        <Image
          src={theme === 'light' ? 'https://i.ibb.co/hxw67qkn/Whats-App-Image-2025-07-01-at-15-37-58-9a9d376f.jpg' : 'https://i.ibb.co/RptYQ4Hm/Whats-App-Image-2025-07-09-at-11-21-29-ca10852e.jpg'}
          data-ai-hint="logo abstract"
          alt="Femigo Logo"
          width={120}
          height={120}
          className="mx-auto mb-6 rounded-full border-4 border-card shadow-lg"
        />

        <h1 className="text-5xl font-bold tracking-tight">
          Femigo
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your trusted companion for safety and empowerment.
        </p>

        <div className="mt-12 w-full space-y-4">
          <button
            onClick={() => router.push('/signup')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </button>

          <p className="pt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
