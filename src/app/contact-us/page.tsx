

"use client"

import { useState, useEffect } from 'react';
import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

const translations = {
    en: {
        title: "Contact Us",
        emailUs: "Email Us",
        callUs: "Call Us",
        ourOffice: "Our Office",
        officeAddress: "Citycenter , Gwalior , 474011",
        footer: "Real details will be uploaded soon."
    },
    hi: {
        title: "हमसे संपर्क करें",
        emailUs: "हमें ईमेल करें",
        callUs: "हमें कॉल करें",
        ourOffice: "हमारा कार्यालय",
        officeAddress: "सिटीसेंटर, ग्वालियर, 474011",
        footer: "वास्तविक विवरण जल्द ही अपलोड किया जाएगा।"
    }
}

export default function ContactUsPage() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('femigo-language') || 'en';
    setLanguage(storedLang);
  }, []);

  const t = translations[language as keyof typeof translations];

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-foreground">
      <div className="dark:absolute inset-x-0 top-0 h-1/2 w-full dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-blue-950/10 to-transparent" />
      
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Card className="relative z-10 w-full max-w-sm animate-in fade-in zoom-in-95 duration-700 rounded-2xl border-border bg-card/80 dark:bg-black/50 p-8 text-center shadow-2xl dark:shadow-primary/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-6 space-y-6 text-left">
          <div className="flex items-start gap-4">
            <Mail className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">{t.emailUs}</h3>
              <a href="mailto:support@femigo.app" className="text-muted-foreground hover:underline">support@femigo.app</a>
            </div>
          </div>
          <Separator className="bg-border/50" />
          <div className="flex items-start gap-4">
            <Phone className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">{t.callUs}</h3>
              <a href="tel:+15551234567" className="text-muted-foreground hover:underline">+1 (555) 123-4567</a>
            </div>
          </div>
          <Separator className="bg-border/50" />
          <div className="flex items-start gap-4">
            <MapPin className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">{t.ourOffice}</h3>
              <p className="text-muted-foreground">{t.officeAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
        {t.footer}
      </div>
    </main>
  )
}
