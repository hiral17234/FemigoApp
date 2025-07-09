
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
  Camera,
  FileText,
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

import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
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

function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
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

  return (
    <SidebarMenuButton
      onClick={handleToggle}
      tooltip={{ children: "Toggle Theme" }}
      className="w-full justify-start text-sm"
    >
      {theme === "light" ? (
        <Sun className="h-[1.5rem] w-[1.5rem] text-primary" />
      ) : (
        <Moon className="h-[1.5rem] w-[1.5rem] text-primary" />
      )}
      <span className="group-data-[collapsible=icon]:hidden ml-2">
        {theme === "light" ? "Dark" : "Light"} Mode
      </span>
      <span className="sr-only">Toggle theme</span>
    </SidebarMenuButton>
  )
}

function SidebarHeaderClose() {
    const { state, toggleSidebar } = useSidebar();
    
    if (state === "collapsed") return null;

    return (
        <Button variant="ghost" size="icon" className="absolute right-2 top-3 h-7 w-7" onClick={toggleSidebar}>
            <PanelLeftClose />
            <span className="sr-only">Close sidebar</span>
        </Button>
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

  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null)
  const [userInitial, setUserInitial] = React.useState("")
  const [isLoadingUser, setIsLoadingUser] = React.useState(true)

  React.useEffect(() => {
    if (!auth || !db) {
      setIsLoadingUser(false)
      return;
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          let nameToDisplay = "User";
          if (userDoc.exists()) {
            nameToDisplay = userDoc.data().displayName || "User";
          } else {
            nameToDisplay = currentUser.displayName || "User";
          }
          setUserName(nameToDisplay);
          setUserInitial(nameToDisplay.charAt(0).toUpperCase());
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            setUserName(currentUser.displayName || "User");
        } finally {
            setIsLoadingUser(false);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router, toast]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth)
      toast({ title: "Logged Out", description: "You have been successfully logged out." })
      router.push("/login")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred while logging out. Please try again.",
      })
    }
  }

  const menuItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard", icon: User, label: "My Profile" },
    { href: "/emergency", icon: Siren, label: "Emergency Contacts" },
    { href: "/location", icon: Map, label: "Live Map" },
    { href: "/verify", icon: Camera, label: "Camera & Uploads" },
    { href: "/verify-aadhaar", icon: FileText, label: "Aadhaar Verification" },
    { href: "/diary", icon: BookHeart, label: "My Diary" },
    { href: "/dashboard", icon: Flower2, label: "My Corner" },
    { href: "/ai-assistant", icon: Sparkles, label: "AI Assistant" },
  ]

  const bottomMenuItems = [
    { href: "/dashboard", icon: LifeBuoy, label: "Contact Support" },
    { href: "/dashboard", icon: Settings, label: "Settings" },
  ]

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="offcanvas" className="border-r border-purple-900/50">
        <SidebarHeader>
           <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-1 text-2xl font-bold text-white">
                Femigo
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor"/>
                </svg>
              </div>
           </div>
           <SidebarHeaderClose/>
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
                    <SidebarMenuButton tooltip={{ children: item.label }}>
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
                <SidebarMenuButton onClick={handleLogout} tooltip={{ children: "Logout" }}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-purple-900/50 bg-[#06010F]/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-white hover:bg-sidebar-accent hover:text-sidebar-primary transition-colors duration-300" />
            <div>
              <h1 className="text-3xl font-bold text-white">Femigo</h1>
              <p className="text-sm text-purple-300">Safety. Strength. Solidarity.</p>
            </div>
          </div>
          {isLoadingUser ? (
             <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-75 blur"></div>
                <Avatar className="relative h-10 w-10 border-2 border-white/20">
                    <AvatarImage data-ai-hint="logo" src="https://i.ibb.co/RptYQ4Hm/Whats-App-Image-2025-07-09-at-11-21-29-ca10852e.jpg" alt="Femigo Logo" />
                    <AvatarFallback className="bg-card text-primary">{userInitial}</AvatarFallback>
                </Avatar>
            </div>
          )}
        </header>
        <div className="flex-1 overflow-y-auto bg-[#06010F] text-white">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
