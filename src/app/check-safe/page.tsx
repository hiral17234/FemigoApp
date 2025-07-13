
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

const CustomShieldIcon = () => (
    <svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 0L100 25V65C100 100 75 115 50 120C25 115 0 100 0 65V25L50 0Z" fill="url(#shield-gradient)"/>
        <defs>
            <linearGradient id="shield-gradient" x1="50" y1="0" x2="50" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="hsl(var(--primary) / 0.7)"/>
                <stop offset="1" stopColor="hsl(var(--primary) / 0.5)"/>
            </linearGradient>
        </defs>
        <g transform="translate(25, 30) scale(0.6)">
            <path d="M49.9999 58.3333C63.807 58.3333 75 47.1404 75 33.3333C75 19.5262 63.807 8.33331 49.9999 8.33331C36.1928 8.33331 25 19.5262 25 33.3333C25 47.1404 36.1928 58.3333 49.9999 58.3333Z" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M50 75C66.5685 75 80 61.5685 80 45H20C20 61.5685 33.4315 75 50 75Z" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
    </svg>
)

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
                 <div className="absolute w-[300px] h-[300px] bg-primary/20 rounded-full blur-3xl" />
                 <CustomShieldIcon />
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
