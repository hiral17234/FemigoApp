
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Home,
  User,
  Siren,
  Map,
  BookHeart,
  Sparkles,
  Flower2,
  Moon,
  Sun,
  LifeBuoy,
  Settings,
  LogOut,
  Loader2,
  PanelLeftClose
} from "lucide-react"

import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSidebar } from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"


const translations = {
    en: {
        theme: "Toggle Theme",
        loadingTheme: "Loading Theme...",
        loading: "Loading...",
        lightMode: "Light Mode",
        darkMode: "Dark Mode",
        home: "Home",
        myProfile: "My Profile",
        emergencyContacts: "Emergency Contacts",
        liveMap: "Live Map",
        myDiary: "My Diary",
        myCorner: "My Corner",
        aiAssistant: "AI Assistant",
        contactSupport: "Contact Support",
        settings: "Settings",
        logout: "Logout",
        loggedOut: "Logged Out",
        loggedOutDesc: "You have been successfully logged out.",
        logoutFailed: "Logout Failed",
        logoutFailedDesc: "An error occurred while logging out. Please try again.",
        headerSubtitle: "Safety. Strength. Solidarity."
    },
    hi: {
        theme: "थीम बदलें",
        loadingTheme: "थीम लोड हो रहा है...",
        loading: "लोड हो रहा है...",
        lightMode: "लाइट मोड",
        darkMode: "डार्क मोड",
        home: "होम",
        myProfile: "मेरी प्रोफाइल",
        emergencyContacts: "आपातकालीन संपर्क",
        liveMap: "लाइव मैप",
        myDiary: "मेरी डायरी",
        myCorner: "मेरा कोना",
        aiAssistant: "एआई सहायक",
        contactSupport: "सहायता संपर्क",
        settings: "सेटिंग्स",
        logout: "लॉग आउट",
        loggedOut: "लॉग आउट",
        loggedOutDesc: "आप सफलतापूर्वक लॉग आउट हो गए हैं।",
        logoutFailed: "लॉगआउट विफल",
        logoutFailedDesc: "लॉग आउट करते समय एक त्रुटि हुई। कृपया फिर से प्रयास करें।",
        headerSubtitle: "सुरक्षा। शक्ति। एकजुटता।"
    }
}


function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = React.useState('en');

  React.useEffect(() => {
    const storedLang = localStorage.getItem('femigo-language') || 'en';
    setLanguage(storedLang);
    setMounted(true)
  }, [])

  const handleToggle = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }
  
  if (!mounted) {
    return (
      <SidebarMenuButton
          disabled
          tooltip={{ children: "Loading Theme..." }}
          className="w-full justify-start text-sm"
      >
          <div className="h-[1.5rem] w-[1.5rem]" />
          <span className="group-data-[collapsible=icon]:hidden ml-2">Loading...</span>
          <span className="sr-only">Loading theme</span>
      </SidebarMenuButton>
    )
  }
  
  const t = translations[language as keyof typeof translations];

  return (
    <SidebarMenuButton
      onClick={handleToggle}
      tooltip={{ children: t.theme }}
      className="w-full justify-start text-sm"
    >
      {theme === "light" ? (
        <Sun className="h-[1.5rem] w-[1.5rem]" />
      ) : (
        <Moon className="h-[1.5rem] w-[1.5rem]" />
      )}
      <span className="group-data-[collapsible=icon]:hidden ml-2">
        {theme === "light" ? t.darkMode : t.lightMode}
      </span>
      <span className="sr-only">{t.theme}</span>
    </SidebarMenuButton>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const { theme } = useTheme();

  const [userName, setUserName] = React.useState<string | null>(null)
  const [userInitial, setUserInitial] = React.useState("")
  const [isLoadingUser, setIsLoadingUser] = React.useState(true)
  const [language, setLanguage] = React.useState('en');

  React.useEffect(() => {
    const storedLang = localStorage.getItem('femigo-language') || 'en';
    setLanguage(storedLang);
  }, []);

  const t = translations[language as keyof typeof translations];

  React.useEffect(() => {
    setIsLoadingUser(true);
    const isLoggedIn = localStorage.getItem('femigo-is-logged-in');
    
    if (isLoggedIn === 'true') {
        const profileJson = localStorage.getItem('femigo-user-profile');
        if (profileJson) {
            try {
                const profile = JSON.parse(profileJson);
                const nameToDisplay = profile.displayName || 'User';
                setUserName(nameToDisplay);
                setUserInitial(nameToDisplay.charAt(0).toUpperCase());
            } catch (e) {
                // Malformed profile, clear and redirect
                localStorage.removeItem('femigo-is-logged-in');
                localStorage.removeItem('femigo-user-profile');
                router.push("/login");
            }
        } else {
             // Logged in flag is true but no profile, redirect
             router.push("/login");
        }
    } else {
      router.push("/login");
    }
    setIsLoadingUser(false);
  }, [router, pathname]); // Depend on pathname to re-check on navigation

  const handleLogout = async () => {
    try {
        localStorage.removeItem('femigo-is-logged-in');
        localStorage.removeItem('femigo-user-profile');
        localStorage.removeItem('userName');
        toast({ title: t.loggedOut, description: t.loggedOutDesc })
        router.push('/login');
    } catch(error) {
        console.error("Logout failed:", error);
        toast({ variant: 'destructive', title: t.logoutFailed, description: t.logoutFailedDesc });
    }
  }

  const menuItems = [
    { href: "/dashboard", icon: Home, label: t.home },
    { href: "/settings/profile", icon: User, label: t.myProfile },
    { href: "/emergency", icon: Siren, label: t.emergencyContacts },
    { href: "/location/fullscreen", icon: Map, label: t.liveMap },
    { href: "/diary", icon: BookHeart, label: t.myDiary },
    { href: "/dashboard", icon: Flower2, label: t.myCorner },
    { href: "/ai-assistant", icon: Sparkles, label: t.aiAssistant },
  ]

  const bottomMenuItems = [
    { href: "/contact-us", icon: LifeBuoy, label: t.contactSupport },
    { href: "/settings", icon: Settings, label: t.settings },
  ]

  if (isLoadingUser || !userName) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="offcanvas" className="border-r border-border">
        <SidebarHeader>
           <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-1 text-2xl font-bold text-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor"/>
                </svg>
              </div>
           </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           <SidebarMenu>
             {bottomMenuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                    <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname === item.href} tooltip={{ children: item.label }}>
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                ))}
             <SidebarMenuItem>
                <ThemeToggle />
             </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={{ children: t.logout }}>
                    <LogOut />
                    <span>{t.logout}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-300" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Femigo</h1>
              <p className="text-sm text-secondary">{t.headerSubtitle}</p>
            </div>
          </div>
          {isLoadingUser ? (
             <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 opacity-75 blur"></div>
                <Avatar className="relative h-10 w-10 border-2 border-background">
                    <AvatarImage data-ai-hint="logo" src="https://i.ibb.co/W4PR2Pw2/Whats-App-Image-2025-07-09-at-11-21-29-ca10852e.jpg" alt="Femigo Logo" />
                    <AvatarFallback className="bg-card text-primary">{userInitial}</AvatarFallback>
                </Avatar>
            </div>
          )}
        </header>
        <div className="flex-1 overflow-y-auto bg-[#030211] text-foreground">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
