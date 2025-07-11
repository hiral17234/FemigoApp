
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const BOTPRESS_CHAT_URL = "https://cdn.botpress.cloud/webchat/v3.1/shareable.html?configUrl=https://files.bpcontent.cloud/2025/07/09/16/20250709163052-TWTVWK7V.json";

const translations = {
    en: {
        title: "AI Assistant"
    },
    hi: {
        title: "एआई सहायक"
    }
}

export default function AiAssistantPage() {
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
      <iframe
        src={BOTPRESS_CHAT_URL}
        title="Femigo AI Assistant"
        className="flex-1 w-full border-none"
      />
    </div>
  );
}
