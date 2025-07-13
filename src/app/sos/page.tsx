
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const translations = {
    en: {
        title: "SOS Mode",
        description: "This page is under construction. SOS features will be implemented here.",
        backToDashboard: "Back to Dashboard"
    },
    hi: {
        title: "एसओएस मोड",
        description: "यह पृष्ठ निर्माणाधीन है। एसओएस सुविधाएँ यहाँ लागू की जाएँगी।",
        backToDashboard: "डैशबोर्ड पर वापस"
    }
}

export default function SosPage() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('femigo-language') || 'en';
    setLanguage(storedLang);
  }, []);

  const t = translations[language as keyof typeof translations];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">{t.title}</h1>
        <p className="mt-4 text-muted-foreground">{t.description}</p>
        <Link href="/dashboard" className="mt-8 inline-block">
            <Button>{t.backToDashboard}</Button>
        </Link>
      </div>
    </div>
  );
}
