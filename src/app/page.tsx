"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#FFF1F5] to-white p-4 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black">
      <div className="flex items-center gap-2 text-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-lg">Redirecting to dashboard...</p>
      </div>
    </main>
  );
}
