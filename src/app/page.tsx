import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#FFF1F5] to-white p-4 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black">
      <div className="flex w-full max-w-md flex-col items-center space-y-8 text-center">
        <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Femigo
        </h1>

        <p className="text-lg text-muted-foreground">
          Your trusted companion for safety and empowerment.
        </p>

        <div className="relative">
          <div className="bg-gradient-to-tr from-mint-gradient-from to-mint-gradient-to p-2 rounded-full shadow-lg" style={{ background: 'linear-gradient(to top right, #e0f2f1, #b2dfdb)' }}>
            <Image
              src="https://placehold.co/160x160.png"
              alt="A stylized illustration of a woman"
              width={160}
              height={160}
              className="rounded-full object-cover"
              data-ai-hint="woman vector"
            />
          </div>
        </div>

        <div className="w-full space-y-4 pt-4">
          <Button asChild size="lg" className="w-full rounded-full bg-gradient-to-r from-[#EC008C] to-[#FF55A5] py-6 text-lg font-semibold text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black">
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
    </main>
  );
}
