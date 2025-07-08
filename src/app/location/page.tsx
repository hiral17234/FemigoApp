
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LocationPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#06010F] text-white">
      <div className="absolute top-4 left-4">
        <Link href="/dashboard">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold">Location Tracking</h1>
        <p className="mt-2 text-muted-foreground">This feature is under construction.</p>
      </div>
    </div>
  );
}
