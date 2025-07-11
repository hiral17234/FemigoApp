
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

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
import { auth, db, firebaseError } from "@/lib/firebase"

const formSchema = z
  .object({
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export default function OnboardingPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (firebaseError || !auth || !db) {
        toast({
            variant: "destructive",
            title: "Configuration Error",
            description: firebaseError || "Firebase is not configured. Cannot create account."
        });
        return;
    }

    setIsSubmitting(true)
    try {
      const storedEmail = localStorage.getItem("userEmail")
      if (!storedEmail) {
        throw new Error("Email not found. Please restart the signup process.")
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        storedEmail,
        values.password
      )
      const user = userCredential.user

      const onboardingDetailsJSON = localStorage.getItem("onboardingDetails");
      const onboardingDetails = onboardingDetailsJSON ? JSON.parse(onboardingDetailsJSON) : {};

      // Compile all data into a user profile object
      const userProfile = {
        uid: user.uid,
        displayName: localStorage.getItem("userName") || "",
        email: storedEmail,
        country: localStorage.getItem("userCountry") || "",
        phone: localStorage.getItem("userPhone") || "",
        age: onboardingDetails.age || null,
        nickname: onboardingDetails.nickname || "",
        address1: onboardingDetails.address1 || "",
        address2: onboardingDetails.address2 || "",
        address3: onboardingDetails.address3 || "",
        state: onboardingDetails.state === 'Other' ? onboardingDetails.otherState : (onboardingDetails.state || ""),
        city: onboardingDetails.city === 'Other' ? onboardingDetails.otherCity : (onboardingDetails.city || ""),
        altPhone: onboardingDetails.altCountryCode && onboardingDetails.altPhone 
            ? `+${onboardingDetails.altCountryCode}${onboardingDetails.altPhone}`
            : "",
        createdAt: new Date().toISOString(),
        photoURL: ""
      }

      // Save the compiled profile to Firestore
      await setDoc(doc(db, "users", user.uid), userProfile)

      // Optionally, clear localStorage after successful creation
      localStorage.removeItem("userName")
      localStorage.removeItem("userCountry")
      localStorage.removeItem("userLivePhoto")
      localStorage.removeItem("aadhaarImage")
      localStorage.removeItem("userPhone")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("onboardingDetails")

      toast({
        title: "Account Created!",
        description: "Welcome to Femigo! Please log in to continue.",
      })

      router.push("/login")
    } catch (error: any) {
      console.error("Account creation failed:", error)
      let errorMessage = "An unexpected error occurred. Please try again."
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please log in instead."
      } else if (error.message.includes("Email not found")) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const watchedPassword = form.watch("password")
  
  useEffect(() => {
    setPassword(watchedPassword || "")
  }, [watchedPassword])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/60 to-transparent" />

      <main className="relative z-20 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
            <Link
              href="/onboarding/details"
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="w-full rounded-2xl border bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
              <h1 className="mb-2 text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Secure Your Account
              </h1>
              <p className="mb-8 text-center text-muted-foreground">
                Create a strong password to keep your account safe.
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Enter a strong password" 
                                    {...field}
                                    className="pr-10" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground">
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </FormControl>
                        <FormMessage />
                        <PasswordStrength password={password} />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="Confirm your password" 
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

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-lg font-semibold text-primary-foreground py-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Create Account & Finish"}
                  </Button>
                </form>
              </Form>
            </div>
        </div>
      </main>
    </div>
  )
}
