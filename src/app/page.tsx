import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#FFF1F5] to-white p-4 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black">
      <div className="w-full max-w-xs rounded-2xl bg-card px-8 py-12 shadow-xl">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-2">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground">
              Femigo
            </h1>
            <p className="text-sm text-muted-foreground">
              Your trusted companion for safety and empowerment.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-full p-2 shadow-md" style={{ background: 'linear-gradient(to top right, #e9fbf9, #d1f2eb)' }}>
              <Image
                src="https://i.imgur.com/DFegeIc.jpeg"
                alt="A stylized illustration of a woman"
                width={180}
                height={180}
                className="rounded-full object-cover"
              />
            </div>
          </div>

          <div className="w-full space-y-4 pt-6">
            <Button asChild className="w-full rounded-xl bg-gradient-to-r from-[#EC008C] to-[#FF55A5] py-3 text-lg text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-0">
              <Link href="/signup">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Link
              href="/login"
              className="inline-block pt-2 text-sm text-muted-foreground hover:underline"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
