import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#FFF1F5] to-white p-4 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black">
      <div className="w-full max-w-xs rounded-2xl bg-card px-6 py-10 shadow-xl sm:px-8">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              Femigo
            </h1>
            <p className="text-sm text-muted-foreground">
              Your trusted companion for safety and empowerment.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-full bg-gradient-to-tr from-mint-gradient-from to-mint-gradient-to p-1.5 shadow-md" style={{ background: 'linear-gradient(to top right, #e0f2f1, #b2dfdb)' }}>
              <Image
                src="https://i.imgur.com/DFegeIc.jpeg"
                alt="A stylized illustration of a woman"
                width={140}
                height={140}
                className="rounded-full object-cover"
              />
            </div>
          </div>

          <div className="w-full space-y-3 pt-2">
            <Button asChild size="lg" className="w-full rounded-full bg-gradient-to-r from-[#EC008C] to-[#FF55A5] py-6 text-lg font-semibold text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black">
              <Link href="/signup">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Link
              href="/login"
              className="inline-block text-sm text-muted-foreground hover:underline"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
