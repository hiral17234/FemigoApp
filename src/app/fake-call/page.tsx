
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, PhoneOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function FakeCallPage() {
    const router = useRouter();
    const [audio] = useState(typeof Audio !== 'undefined' ? new Audio('https://cdn.pixabay.com/audio/2022/02/08/audio_3f762b3224.mp3') : null);

    useEffect(() => {
        if (audio) {
            audio.loop = true;
            audio.play().catch(error => {
                console.error("Audio playback failed:", error);
            });
        }
        return () => {
            audio?.pause();
        };
    }, [audio]);

    const handleEndCall = () => {
        router.back();
    };

    return (
        <div className="h-screen w-full flex flex-col items-center justify-between bg-gray-800 text-white p-8">
            <div className="text-center mt-12">
                <p className="text-2xl font-semibold">Mom</p>
                <p className="text-gray-400">calling...</p>
            </div>

            <div className="relative flex items-center justify-center">
                 <div className="absolute animate-pulse w-48 h-48 bg-green-500/30 rounded-full blur-3xl" />
                 <Image
                    src="https://placehold.co/200x200.png"
                    data-ai-hint="woman mother"
                    alt="Caller"
                    width={150}
                    height={150}
                    className="rounded-full shadow-2xl"
                 />
            </div>
            
            <div className="flex w-full justify-around items-center">
                <div className="flex flex-col items-center gap-2">
                    <Button 
                        size="icon" 
                        className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600"
                        onClick={handleEndCall}
                    >
                        <Phone className="h-8 w-8" />
                    </Button>
                    <span className="text-sm">Accept</span>
                </div>
                 <div className="flex flex-col items-center gap-2">
                    <Button 
                        size="icon" 
                        className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700"
                        onClick={handleEndCall}
                    >
                        <PhoneOff className="h-8 w-8" />
                    </Button>
                    <span className="text-sm">Decline</span>
                </div>
            </div>
        </div>
    );
}
