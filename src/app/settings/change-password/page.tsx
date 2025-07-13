
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { ArrowLeft, Loader2, Eye, EyeOff, KeyRound } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { PasswordStrength } from "@/components/ui/password-strength"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"


const baseSchema = {
    currentPassword: z.string().min(1, { message: "Current password is required." }),
    newPassword: z.string().min(8, {
      message: "New password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
}

const translations = {
    en: {
        formSchema: z.object(baseSchema).refine((data) => data.newPassword === data.confirmPassword, {
            message: "Passwords do not match.",
            path: ["confirmPassword"],
        }),
        title: "Change Password",
        description: "Enter your current and new password below.",
        currentPasswordLabel: "Current Password",
        currentPasswordPlaceholder: "Enter your current password",
        forgotPassword: "Forgot Password?",
        newPasswordLabel: "New Password",
        newPasswordPlaceholder: "Enter a new strong password",
        confirmPasswordLabel: "Confirm New Password",
        confirmPasswordPlaceholder: "Confirm your new password",
        updateButton: "Update Password",
        toastError: "Error",
        toastNotLoggedIn: "You are not logged in.",
        toastSuccessTitle: "Password Updated",
        toastSuccessDesc: "Your password has been changed successfully.",
        toastUpdateFailed: "Update Failed",
        toastErrorUnexpected: "An unexpected error occurred. Please try again.",
        toastErrorWrongPass: "The current password you entered is incorrect.",
        toastErrorTooManyRequests: "Too many attempts. Please try again later.",
    },
    hi: {
        formSchema: z.object({
            currentPassword: z.string().min(1, { message: "वर्तमान पासवर्ड आवश्यक है।" }),
            newPassword: z.string().min(8, { message: "नया पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।" }),
            confirmPassword: z.string(),
        }).refine((data) => data.newPassword === data.confirmPassword, {
            message: "पासवर्ड मेल नहीं खाते।",
            path: ["confirmPassword"],
        }),
        title: "पासवर्ड बदलें",
        description: "नीचे अपना वर्तमान और नया पासवर्ड दर्ज करें।",
        currentPasswordLabel: "वर्तमान पासवर्ड",
        currentPasswordPlaceholder: "अपना वर्तमान पासवर्ड दर्ज करें",
        forgotPassword: "पासवर्ड भूल गए?",
        newPasswordLabel: "नया पासवर्ड",
        newPasswordPlaceholder: "एक नया मजबूत पासवर्ड दर्ज करें",
        confirmPasswordLabel: "नए पासवर्ड की पुष्टि करें",
        confirmPasswordPlaceholder: "अपने नए पासवर्ड की पुष्टि करें",
        updateButton: "पासवर्ड अपडेट करें",
        toastError: "त्रुटि",
        toastNotLoggedIn: "आप लॉग इन नहीं हैं।",
        toastSuccessTitle: "पासवर्ड अपडेट किया गया",
        toastSuccessDesc: "आपका पासवर्ड सफलतापूर्वक बदल दिया गया है।",
        toastUpdateFailed: "अपडेट विफल",
        toastErrorUnexpected: "एक अप्रत्याशित त्रुटि हुई। कृपया फिर से प्रयास करें।",
        toastErrorWrongPass: "आपके द्वारा दर्ज किया गया वर्तमान पासवर्ड गलत है।",
        toastErrorTooManyRequests: "बहुत अधिक प्रयास। कृपया बाद में फिर से प्रयास करें।",
    }
}

const getFromStorage = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        return fallback;
    }
};

const saveToStorage = <T,>(key: string, value: T) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};


export default function ChangePasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('femigo-language') || 'en';
    setLanguage(storedLang);
  }, []);

  const t = translations[language as keyof typeof translations];
  const formSchema = t.formSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  function handleForgotPassword() {
    toast({
        title: "Forgot Password",
        description: "Password recovery instructions would be sent to your email.",
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    const profile = getFromStorage<any>('femigo-user-profile', null);
    if (!profile) {
      toast({ variant: "destructive", title: t.toastError, description: t.toastNotLoggedIn })
      setIsSubmitting(false)
      router.push('/login');
      return;
    }

    if (profile.password !== values.currentPassword) {
        toast({
            variant: "destructive",
            title: t.toastUpdateFailed,
            description: t.toastErrorWrongPass,
        });
        setIsSubmitting(false);
        return;
    }
    
    try {
        const updatedProfile = { ...profile, password: values.newPassword };

        // Update the master list of accounts
        const allAccounts = getFromStorage<any[]>('femigo-accounts', []);
        const accountIndex = allAccounts.findIndex(acc => acc.email === profile.email);
        if (accountIndex > -1) {
            allAccounts[accountIndex] = updatedProfile;
            saveToStorage('femigo-accounts', allAccounts);
        }

        // Update the currently logged-in user profile
        saveToStorage('femigo-user-profile', updatedProfile);

        toast({
            title: t.toastSuccessTitle,
            description: t.toastSuccessDesc,
        });
        router.push("/settings");

    } catch (error: any) {
        console.error("Password change failed:", error)
        toast({
            variant: "destructive",
            title: t.toastUpdateFailed,
            description: t.toastErrorUnexpected,
        })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const watchedPassword = form.watch("newPassword")

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-y-auto bg-background p-4 text-foreground">
      <div className="dark:absolute inset-x-0 top-0 h-1/2 w-full dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-blue-950/10 to-transparent" />
      
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <Link href="/settings" aria-label="Back to Settings">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-accent hover:text-primary rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

        <div className="w-full max-w-md">
            <Card className="w-full rounded-2xl border-border bg-card/80 dark:bg-black/30 p-8 shadow-2xl shadow-primary/10 backdrop-blur-md">
                <CardHeader className="p-0 mb-6 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">{t.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        {t.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            
                            <FormField control={form.control} name="currentPassword" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.currentPasswordLabel}</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input 
                                            type={showCurrentPassword ? "text" : "password"} 
                                            placeholder={t.currentPasswordPlaceholder} 
                                            {...field}
                                            className="pr-10" />
                                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground">
                                            {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <div className="text-right">
                                    <button
                                      type="button"
                                      onClick={handleForgotPassword}
                                      className="text-xs font-semibold text-red-500 transition-colors hover:text-red-400 disabled:opacity-50"
                                      style={{ textShadow: '0 0 8px hsl(0 100% 50% / 0.5)' }}
                                    >
                                      {t.forgotPassword}
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                            )} />

                            <FormField control={form.control} name="newPassword" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.newPasswordLabel}</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input 
                                            type={showNewPassword ? "text" : "password"} 
                                            placeholder={t.newPasswordPlaceholder} 
                                            {...field}
                                            className="pr-10" />
                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground">
                                            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                                <PasswordStrength password={watchedPassword} />
                            </FormItem>
                            )} />

                            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.confirmPasswordLabel}</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input 
                                            type={showConfirmPassword ? "text" : "password"} 
                                            placeholder={t.confirmPasswordPlaceholder}
                                            {...field} 
                                            className="pr-10" />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground">
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )} />

                        <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-lg font-semibold text-primary-foreground py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : t.updateButton}
                        </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </main>
  )
}
