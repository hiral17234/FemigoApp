
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Flashlight, Moon, Phone, Mic, Heart, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const translations = {
    en: {
        title: "Safe Mode",
        subtitle: "Activate Safe Mode - Your Personal Shield of Safety!",
        flashlight: "Flashlight",
        darkMode: "Dark Mode",
        lightMode: "Light Mode",
        fakeCall: "Fake Call",
        recordAudio: "Record Audio",
        stopRecording: "Stop Recording",
        activateButtonText: "ACTIVATE SAFE MODE",
        deactivateButtonText: "SAFE MODE ACTIVATED",
        footerText: "Stay calm. Your safety tools are now running silently!",
        toastFlashlight: {
            title: "Flashlight Unavailable",
            description: "This feature depends on your device and browser capabilities."
        },
        toastAudio: {
            title: "Audio Recording Started",
            description: "Recording will continue in the background."
        },
        toastAudioStop: {
            title: "Recording Stopped & Saved",
            description: "Your audio has been saved to My Recordings."
        },
        toastAudioError: {
            title: "Recording Error",
            description: "Could not access microphone. Please check permissions."
        }
    },
    hi: {
        title: "सेफ मोड",
        subtitle: "सेफ मोड सक्रिय करें - आपकी व्यक्तिगत सुरक्षा शील्ड!",
        flashlight: "टॉर्च",
        darkMode: "डार्क मोड",
        lightMode: "लाइट मोड",
        fakeCall: "फेक कॉल",
        recordAudio: "ऑडियो रिकॉर्ड करें",
        stopRecording: "रिकॉर्डिंग रोकें",
        activateButtonText: "सेफ मोड सक्रिय करें",
        deactivateButtonText: "सेफ मोड सक्रिय है",
        footerText: "शांत रहें। आपके सुरक्षा उपकरण अब चुपचाप चल रहे हैं!",
        toastFlashlight: {
            title: "टॉर्च अनुपलब्ध",
            description: "यह सुविधा आपके डिवाइस और ब्राउज़र क्षमताओं पर निर्भर करती है।"
        },
        toastAudio: {
            title: "ऑडियो रिकॉर्डिंग शुरू",
            description: "रिकॉर्डिंग पृष्ठभूमि में जारी रहेगी।"
        },
        toastAudioStop: {
            title: "रिकॉर्डिंग रुकी और सहेजी गई",
            description: "आपकी ऑडियो मेरी रिकॉर्डिंग में सहेज दी गई है।"
        },
        toastAudioError: {
            title: "रिकॉर्डिंग त्रुटि",
            description: "माइक्रोफ़ोन तक नहीं पहुंच सका। कृपया अनुमतियों की जांच करें।"
        }
    }
};

const ToolButton = ({ icon: Icon, label, onClick, isActive }: { icon: React.ElementType, label: string, onClick?: () => void, isActive?: boolean }) => (
    <div className="flex flex-col items-center gap-2">
        <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
                "h-16 w-16 rounded-full bg-primary/10 hover:bg-primary/20 text-primary",
                isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
            )} 
            onClick={onClick}
        >
            <Icon className="h-7 w-7" />
        </Button>
        <span className="text-xs font-medium text-foreground/80">{label}</span>
    </div>
);


export default function CheckSafePage() {
  const [language, setLanguage] = useState('en');
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const storedLang = localStorage.getItem('femigo-language') || 'en';
    setLanguage(storedLang);
  }, []);

  const t = translations[language as keyof typeof translations];
  const [isActivated, setIsActivated] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const handleFlashlight = () => {
    toast({
        variant: 'destructive',
        title: t.toastFlashlight.title,
        description: t.toastFlashlight.description
    });
  }

  const handleFakeCall = () => {
    router.push('/fake-call');
  }
  
  const handleRecordAudio = async () => {
    if (isRecording) {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        
        recordedChunksRef.current = []; // Clear previous chunks

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
            }
        };
        
        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64data = reader.result as string;
                const recordings = JSON.parse(localStorage.getItem('femigo-recordings') || '[]');
                const newRecording = {
                    id: Date.now(),
                    date: new Date().toISOString(),
                    dataUrl: base64data,
                };
                localStorage.setItem('femigo-recordings', JSON.stringify([newRecording, ...recordings]));
                toast({ title: t.toastAudioStop.title, description: t.toastAudioStop.description });
            };
            stream.getTracks().forEach(track => track.stop());
            recordedChunksRef.current = [];
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
        toast({ title: t.toastAudio.title, description: t.toastAudio.description });

    } catch (err) {
        console.error("Audio recording error:", err);
        toast({
            variant: "destructive",
            title: t.toastAudioError.title,
            description: t.toastAudioError.description,
        });
    }
  }

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
                 <div className={cn("absolute w-[150px] h-[150px] bg-primary/20 rounded-full blur-3xl", isActivated && "animate-pulse")} />
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
                    <ToolButton icon={Flashlight} label={t.flashlight} onClick={handleFlashlight} />
                    <ToolButton 
                        icon={theme === 'dark' ? Sun : Moon} 
                        label={theme === 'dark' ? t.lightMode : t.darkMode} 
                        onClick={handleToggleTheme}
                        isActive={theme === 'dark'} 
                    />
                    <ToolButton icon={Phone} label={t.fakeCall} onClick={handleFakeCall} />
                    <ToolButton 
                        icon={Mic} 
                        label={isRecording ? t.stopRecording : t.recordAudio} 
                        onClick={handleRecordAudio} 
                        isActive={isRecording} 
                    />
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
                    {isActivated ? t.deactivateButtonText : t.activateButtonText}
                </Button>
                
                {isActivated && <p className="text-xs text-muted-foreground animate-in fade-in">{t.footerText}</p>}
            </div>
        </div>
    </div>
  );
}
