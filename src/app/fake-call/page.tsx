
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function FakeCallPage() {
    const router = useRouter();
    const [audio] = useState(typeof Audio !== 'undefined' ? new Audio('https://cdn.pixabay.com/audio/2022/02/08/audio_3f762b3224.mp3') : null);
    const [callState, setCallState] = useState<'incoming' | 'active'>('incoming');
    const [callDuration, setCallDuration] = useState(0);

    // Effect for ringing sound
    useEffect(() => {
        if (audio && callState === 'incoming') {
            audio.loop = true;
            audio.play().catch(error => console.error("Ringtone playback failed:", error));
        }
        return () => audio?.pause();
    }, [audio, callState]);
    
    // Effect for call timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (callState === 'active') {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callState]);

    const handleAcceptCall = () => {
        setCallState('active');
    };

    const handleEndCall = () => {
        // Navigate to the check-safe page without query params to break the loop
        router.push('/check-safe');
    };
    
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    if (callState === 'active') {
        return (
            <div className="relative h-screen w-full bg-black">
                <video 
                    src="https://v1.pinimg.com/videos/mc/720p/bb/01/43/bb0143851b757a015768a0f7b462609e.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover"
                />
                 <div className="absolute inset-0 bg-black/30" />
                 <div className="relative h-full flex flex-col justify-between p-8 text-white">
                    <div className="text-center">
                        <p className="text-2xl font-semibold">Mom</p>
                        <p className="text-gray-300">{formatDuration(callDuration)}</p>
                    </div>

                    <div className="flex w-full justify-evenly items-center">
                        <Button size="icon" className="h-14 w-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"><Mic className="h-7 w-7" /></Button>
                        <Button size="icon" className="h-14 w-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"><VideoOff className="h-7 w-7" /></Button>
                        <Button size="icon" className="h-14 w-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"><Volume2 className="h-7 w-7" /></Button>
                        <Button size="icon" className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700" onClick={handleEndCall}><PhoneOff className="h-8 w-8" /></Button>
                    </div>
                 </div>
            </div>
        )
    }

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
                        onClick={handleAcceptCall}
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
