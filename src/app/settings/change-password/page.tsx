
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Eye, EyeOff, KeyRound } from "lucide-react"
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth"

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
import { auth, firebaseError } from "@/lib/firebase"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"


const formSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required." }),
    newPassword: z.string().min(8, {
      message: "New password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export default function ChangePasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  function handleForgotPassword() {
    // Set a flag and redirect to the email verification flow
    if (typeof window !== "undefined") {
      localStorage.setItem("passwordResetFlow", "true");
    }
    router.push("/verify-email");
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    const user = auth?.currentUser;

    if (!user || !user.email) {
      toast({ variant: "destructive", title: "Error", description: "You are not logged in." })
      setIsSubmitting(false)
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // If reauthentication is successful, update the password
      await updatePassword(user, values.newPassword);

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      })
      router.push("/settings")

    } catch (error: any) {
      console.error("Password change failed:", error)
      let errorMessage = "An unexpected error occurred. Please try again."
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "The current password you entered is incorrect."
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many attempts. Please try again later."
      }
      
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const watchedPassword = form.watch("newPassword")

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-y-auto bg-[#020617] p-4 text-white">
      <div className="absolute inset-x-0 top-0 h-1/2 w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-blue-950/10 to-transparent" />
      
        <div className="w-full max-w-md">
            <Link
              href="/settings"
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Settings
            </Link>
            <Card className="w-full rounded-2xl border-none bg-black/30 p-8 shadow-2xl shadow-primary/10 backdrop-blur-md">
                <CardHeader className="p-0 mb-6 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">Change Password</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Enter your current and new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            
                            <FormField control={form.control} name="currentPassword" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input 
                                            type={showCurrentPassword ? "text" : "password"} 
                                            placeholder="Enter your current password" 
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
                                      Forgot Password?
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                            )} />

                            <FormField control={form.control} name="newPassword" render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input 
                                            type={showNewPassword ? "text" : "password"} 
                                            placeholder="Enter a new strong password" 
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
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input 
                                            type={showConfirmPassword ? "text" : "password"} 
                                            placeholder="Confirm your new password" 
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
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Update Password"}
                        </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </main>
  )
}
