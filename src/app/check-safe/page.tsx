
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Flashlight, Moon, Phone, Mic, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const translations = {
    en: {
        title: "Safe Mode",
        subtitle: "Activate Safe Mode - Your Personal Shield of Safety!",
        flashlight: "Flashlight",
        darkMode: "Dark Mode",
        fakeCall: "Fake Call",
        recordAudio: "Record Audio",
        buttonText: "SAFE MODE ACTIVATED",
        footerText: "Stay calm. Your safety tools are now running silently!",
    },
    hi: {
        title: "सेफ मोड",
        subtitle: "सेफ मोड सक्रिय करें - आपकी व्यक्तिगत सुरक्षा शील्ड!",
        flashlight: "टॉर्च",
        darkMode: "डार्क मोड",
        fakeCall: "फेक कॉल",
        recordAudio: "ऑडियो रिकॉर्ड करें",
        buttonText: "सेफ मोड सक्रिय",
        footerText: "शांत रहें। आपके सुरक्षा उपकरण अब चुपचाप चल रहे हैं!",
    }
};

const ToolButton = ({ icon: Icon, label, onClick }: { icon: React.ElementType, label: string, onClick?: () => void }) => (
    <div className="flex flex-col items-center gap-2">
        <Button variant="ghost" size="icon" className="h-16 w-16 rounded-full bg-primary/10 hover:bg-primary/20 text-primary" onClick={onClick}>
            <Icon className="h-7 w-7" />
        </Button>
        <span className="text-xs font-medium text-foreground/80">{label}</span>
    </div>
);


export default function CheckSafePage() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('femigo-language') || 'en';
    setLanguage(storedLang);
  }, []);

  const t = translations[language as keyof typeof translations];
  const [isActivated, setIsActivated] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 via-background to-background -z-10" />

        <header className="flex items-center justify-between p-4 shrink-0">
          <Link href="/dashboard" className="text-foreground/80 hover:text-foreground">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center gap-1 text-2xl font-bold text-foreground">
            Femigo <Heart className="h-5 w-5 text-primary fill-primary" />
          </div>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <div className="flex-1 flex flex-col items-center justify-between text-center p-8 space-y-8">
            <div className="w-full">
                <h1 className="text-3xl font-bold">{t.title}</h1>
                <p className="text-muted-foreground mt-1 text-sm">{t.subtitle}</p>
            </div>

            <div className="relative flex items-center justify-center">
                 <div className="absolute animate-pulse w-[150px] h-[150px] bg-primary/20 rounded-full blur-3xl" />
                 <div className="relative rounded-full p-2 bg-gradient-to-br from-primary/30 to-secondary/30">
                    <Image
                        src="https://i.ibb.co/RptYQ4Hm/Whats-App-Image-2025-07-09-at-11-21-29-ca10852e.jpg"
                        data-ai-hint="woman illustration"
                        alt="Femigo Logo"
                        width={120}
                        height={120}
                        className="rounded-full border-2 border-background/50"
                    />
                 </div>
            </div>

            <div className="w-full space-y-6">
                <div className="grid grid-cols-4 gap-4">
                    <ToolButton icon={Flashlight} label={t.flashlight} />
                    <ToolButton icon={Moon} label={t.darkMode} />
                    <ToolButton icon={Phone} label={t.fakeCall} />
                    <ToolButton icon={Mic} label={t.recordAudio} />
                </div>
                
                <Button 
                    onClick={() => setIsActivated(!isActivated)}
                    className={cn(
                        "w-full h-14 text-lg font-bold rounded-full shadow-lg transition-all duration-300",
                        isActivated 
                            ? "bg-gradient-to-r from-primary to-green-400 text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                    )}
                >
                    {t.buttonText}
                </Button>
                
                <p className="text-xs text-muted-foreground">{t.footerText}</p>
            </div>
        </div>
    </div>
  );
}
