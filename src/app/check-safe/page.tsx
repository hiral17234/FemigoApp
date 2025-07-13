
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';

const translations = {
    en: {
        title: "Check Safe",
        wip: "Work in Progress",
        description: "This feature is currently under construction. Please check back later."
    },
    hi: {
        title: "सुरक्षित जांचें",
        wip: "कार्य प्रगति पर है",
        description: "यह सुविधा वर्तमान में निर्माणाधीन है। कृपया बाद में वापस देखें।"
    }
}

export default function CheckSafePage() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('femigo-language') || 'en';
    setLanguage(storedLang);
  }, []);

  const t = translations[language as keyof typeof translations];

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <header className="flex items-center justify-between p-4 shrink-0 border-b border-purple-900/50 bg-background/80 backdrop-blur-sm">
          <Link href="/dashboard" className="text-gray-400 hover:text-primary">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-white">{t.title}</h1>
          <div className="w-6" /> {/* Spacer */}
      </header>
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <Construction className="h-24 w-24 text-primary mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">{t.wip}</h2>
        <p className="text-muted-foreground max-w-sm">{t.description}</p>
      </div>
    </div>
  );
}
