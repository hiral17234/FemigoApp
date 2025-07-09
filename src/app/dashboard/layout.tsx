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
  Moon,
  Sun,
  LifeBuoy,
  Settings,
  LogOut,
  Loader2
} from "lucide-react"

import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { getFirebaseServices } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render a placeholder that matches the structure of the real component to avoid layout shifts.
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
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      tooltip={{ children: "Toggle Theme" }}
      className="w-full justify-start text-sm"
    >
      <Sun className={cn(
        "h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0",
        theme === 'light' ? 'text-primary' : 'text-muted-foreground'
      )} />
      <Moon className={cn(
        "absolute h-[1.5rem] w-[1.5rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100",
        theme === 'dark' ? 'text-primary' : 'text-muted-foreground'
      )} />
      <span className="group-data-[collapsible=icon]:hidden ml-2">
        {theme === "light" ? "Dark" : "Light"} Mode
      </span>
      <span className="sr-only">Toggle theme</span>
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
  
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null)
  const [userInitial, setUserInitial] = React.useState("")
  const [isLoadingUser, setIsLoadingUser] = React.useState(true)

  const firebase = getFirebaseServices();

  React.useEffect(() => {
    if (!firebase.auth || !firebase.db) {
      setIsLoadingUser(false)
      return;
    };

    const unsubscribe = onAuthStateChanged(firebase.auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(firebase.db, "users", currentUser.uid);
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
  }, [router, firebase.auth, firebase.db]);

  const handleLogout = async () => {
    if (!firebase.auth) return;
    try {
      await signOut(firebase.auth)
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
    { href: "#", icon: User, label: "My Profile" },
    { href: "/emergency", icon: Siren, label: "Emergency Contacts" },
    { href: "/location", icon: Map, label: "Live Map" },
    { href: "/verify", icon: Camera, label: "Camera & Uploads" },
    { href: "/verify-aadhaar", icon: FileText, label: "Aadhaar Verification" },
    { href: "#", icon: BookHeart, label: "My Diary" },
    { href: "#", icon: Sparkles, label: "My Corner" },
  ]
  
  const bottomMenuItems = [
    { href: "#", icon: LifeBuoy, label: "Contact Support" },
    { href: "#", icon: Settings, label: "Settings" },
  ]

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="border-r border-purple-900/50">
        <SidebarHeader>
           <div className={cn(
              "flex items-center gap-2 p-2",
              "group-data-[collapsible=icon]:justify-center"
            )}>
              <div className="flex items-center gap-1 text-2xl font-bold text-white group-data-[collapsible=icon]:hidden">
                Femigo
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
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-purple-900/50 bg-[#06010F]/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden text-white hover:bg-sidebar-accent hover:text-sidebar-primary transition-colors duration-300" />
            <div className="flex items-center gap-1 text-2xl font-bold text-white md:hidden">
              Femigo
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <div className="flex-1" />
          {isLoadingUser ? (
             <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
             <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-semibold text-white">{userName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-primary/50">
                    <AvatarImage data-ai-hint="logo abstract" src="https://i.imgur.com/DFegeIc.jpeg" alt="Femigo Logo" />
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
