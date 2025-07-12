
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Bell, MapPin, ChevronRight, LogOut, Moon, Sun, Loader2, KeyRound, Check } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const languages = [
    { code: 'en', name: 'English (US)' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
]

const translations = {
    en: {
        settings: "Settings",
        profile: "Profile",
        editProfile: "Edit Profile",
        security: "Security",
        changePassword: "Change Password",
        notifications: "Notifications",
        emergencyAlerts: "Emergency Alerts",
        appUpdates: "App Updates",
        regional: "Regional",
        languageRegion: "Language & Region",
        theme: "Theme",
        lightMode: "Light Mode",
        darkMode: "Dark Mode",
        logout: "Logout",
        languageUpdated: "Language Updated",
        languageUpdatedDesc: (lang: string) => `Language set to ${lang}.`,
        loggedOut: "Logged Out",
        loggedOutDesc: "You have been successfully logged out.",
        logoutFailed: "Logout Failed",
    },
    hi: {
        settings: "सेटिंग्स",
        profile: "प्रोफ़ाइल",
        editProfile: "प्रोफ़ाइल संपादित करें",
        security: "सुरक्षा",
        changePassword: "पासवर्ड बदलें",
        notifications: "सूचनाएं",
        emergencyAlerts: "आपातकालीन अलर्ट",
        appUpdates: "ऐप अपडेट",
        regional: "क्षेत्रीय",
        languageRegion: "भाषा और क्षेत्र",
        theme: "थीम",
        lightMode: "लाइट मोड",
        darkMode: "डार्क मोड",
        logout: "लॉग आउट",
        languageUpdated: "भाषा अपडेट की गई",
        languageUpdatedDesc: (lang: string) => `भाषा ${lang} पर सेट की गई है।`,
        loggedOut: "लॉग आउट",
        loggedOutDesc: "आप सफलतापूर्वक लॉग आउट हो गए हैं।",
        logoutFailed: "लॉगआउट विफल",
    }
}

export default function SettingsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { theme, setTheme } = useTheme()
    
    const [userData, setUserData] = useState<{ displayName?: string; email?: string, photoURL?: string } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedLang, setSelectedLang] = useState('en');

    useEffect(() => {
        const storedLang = localStorage.getItem('femigo-language') || 'en';
        setSelectedLang(storedLang);
    }, []);

    const t = translations[selectedLang as keyof typeof translations];

    const handleLanguageChange = (langCode: string) => {
        setSelectedLang(langCode);
        localStorage.setItem('femigo-language', langCode);
        const newT = translations[langCode as keyof typeof translations];
        const langName = languages.find(l => l.code === langCode)?.name || 'the selected language';
        router.refresh();
        toast({ title: newT.languageUpdated, description: newT.languageUpdatedDesc(langName)})
    }

    useEffect(() => {
        const profileJson = localStorage.getItem('femigo-user-profile');
        if (profileJson) {
            try {
                const profile = JSON.parse(profileJson);
                setUserData({
                    displayName: profile.displayName,
                    email: profile.email,
                    photoURL: profile.photoURL,
                });
            } catch (e) {
                router.push('/login');
            }
        } else {
            router.push('/login');
        }
        setIsLoading(false);
    }, [router]);

    const handleLogout = async () => {
        try {
            localStorage.removeItem('femigo-is-logged-in');
            localStorage.removeItem('femigo-user-profile');
            localStorage.removeItem('userName');
            toast({ title: t.loggedOut, description: t.loggedOutDesc });
            router.push('/login');
        } catch (error) {
            console.error("Logout failed:", error);
            toast({ variant: 'destructive', title: 'Logout Failed' });
        }
    }

    const userInitial = userData?.displayName?.charAt(0).toUpperCase() || 'U';

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-[#020617]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

  return (
    <main className="relative flex min-h-full w-full flex-col items-center overflow-y-auto bg-[#020617] p-4 text-white">
      <div className="absolute inset-x-0 top-0 h-1/2 w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-blue-950/10 to-transparent" />
      
      <div className="w-full max-w-2xl">
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-accent/20 hover:text-primary rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <h1 className="my-6 text-center text-3xl font-bold tracking-tight">{t.settings}</h1>
      
          <Card className="w-full rounded-2xl border-none bg-black/30 p-6 shadow-2xl shadow-primary/10 backdrop-blur-md">
            <CardContent className="p-0">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Avatar className="h-24 w-24 border-4 border-primary/50">
                        <AvatarImage data-ai-hint="woman face" src={userData?.photoURL} alt={userData?.displayName} />
                        <AvatarFallback className="text-4xl bg-primary/20 text-primary">{userInitial}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold">{userData?.displayName}</h2>
                        <p className="text-muted-foreground">{userData?.email}</p>
                    </div>
                </div>

                <Separator className="my-6 bg-border/20" />

                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">{t.profile}</h3>
                        <Link href="/settings/profile">
                            <div className="flex cursor-pointer items-center justify-between rounded-lg bg-black/20 p-4 hover:bg-black/30">
                                <div className="flex items-center gap-4">
                                    <User className="h-5 w-5 text-primary" />
                                    <span>{t.editProfile}</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </Link>
                    </div>

                    {/* Security Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">{t.security}</h3>
                         <Link href="/settings/change-password">
                            <div className="flex cursor-pointer items-center justify-between rounded-lg bg-black/20 p-4 hover:bg-black/30">
                                <div className="flex items-center gap-4">
                                    <KeyRound className="h-5 w-5 text-primary" />
                                    <span>{t.changePassword}</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </Link>
                    </div>

                    {/* Notifications Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">{t.notifications}</h3>
                        <div className="rounded-lg bg-black/20 p-4 space-y-4">
                           <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Bell className="h-5 w-5 text-primary" />
                                    <span>{t.emergencyAlerts}</span>
                                </div>
                                <Switch id="emergency-alerts" defaultChecked />
                            </div>
                            <Separator className="bg-border/20" />
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Bell className="h-5 w-5 text-primary" />
                                    <span>{t.appUpdates}</span>
                                </div>
                                <Switch id="app-updates" defaultChecked />
                            </div>
                        </div>
                    </div>

                    {/* Regional Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">{t.regional}</h3>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex cursor-pointer items-center justify-between rounded-lg bg-black/20 p-4 hover:bg-black/30">
                                    <div className="flex items-center gap-4">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <span>{t.languageRegion}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">{languages.find(l => l.code === selectedLang)?.name}</span>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                {languages.map(lang => (
                                    <DropdownMenuItem key={lang.code} onSelect={() => handleLanguageChange(lang.code)}>
                                        {lang.name}
                                        {selectedLang === lang.code && <Check className="ml-auto h-4 w-4" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                     {/* Theme Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">{t.theme}</h3>
                        <div className="flex items-center justify-between rounded-lg bg-black/20 p-4">
                            <div className="flex items-center gap-4">
                                {theme === 'light' ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
                                <span>{theme === 'light' ? t.lightMode : t.darkMode}</span>
                            </div>
                            <Switch id="theme-mode" checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
                        </div>
                    </div>

                </div>

                <Separator className="my-6 bg-border/20" />

                <div className="flex justify-start">
                    <Button variant="destructive" className="bg-red-900/50 border border-red-500/50 hover:bg-red-900/80" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        {t.logout}
                    </Button>
                </div>

            </CardContent>
          </Card>
      </div>
    </main>
  )
}
