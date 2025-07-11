
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Eye, EyeOff, Check, X } from "lucide-react"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
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
import { cn } from "@/lib/utils"

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .refine((password) => /[a-z]/.test(password), {
        message: "Password must contain a lowercase letter.",
      })
      .refine((password) => /[A-Z]/.test(password), {
        message: "Password must contain an uppercase letter.",
      })
      .refine((password) => /\d/.test(password), {
        message: "Password must contain a number.",
      })
      .refine((password) => /[^a-zA-Z0-9]/.test(password), {
        message: "Password must contain a special character.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  
type PasswordValidation = {
  rule: string;
  regex: RegExp;
  met: boolean;
}

export default function OnboardingPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [validations, setValidations] = useState<PasswordValidation[]>([
      { rule: 'At least 8 characters long', regex: /.{8,}/, met: false },
      { rule: 'Contains an uppercase letter', regex: /[A-Z]/, met: false },
      { rule: 'Contains a lowercase letter', regex: /[a-z]/, met: false },
      { rule: 'Contains a number', regex: /\d/, met: false },
      { rule: 'Contains a special character', regex: /[^a-zA-Z0-9]/, met: false },
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: 'onChange'
  })

  const password = form.watch("password")

  useEffect(() => {
    setValidations(prev => 
        prev.map(v => ({ ...v, met: v.regex.test(password) }))
    )
  }, [password])


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
      // Retrieve all the data from localStorage first
      const storedEmail = localStorage.getItem("userEmail")
      const storedName = localStorage.getItem("userName")
      const storedCountry = localStorage.getItem("userCountry")
      const storedPhone = localStorage.getItem("userPhone")
      const storedLivePhoto = localStorage.getItem("userLivePhoto")
      const storedAadhaarImage = localStorage.getItem("aadhaarImage")
      const onboardingDetailsJSON = localStorage.getItem("onboardingDetails");
      const onboardingDetails = onboardingDetailsJSON ? JSON.parse(onboardingDetailsJSON) : {};

      if (!storedEmail || !storedName || !storedCountry) {
        throw new Error("Core user information is missing. Please restart the signup process.")
      }

      // Step 1: Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        storedEmail,
        values.password
      )
      const user = userCredential.user

      // Step 2: Update the auth user's profile with the display name
      await updateProfile(user, { displayName: storedName });
      
      // Step 3: Compile all data into a user profile object for Firestore
      const userProfile = {
        uid: user.uid,
        displayName: storedName,
        email: storedEmail,
        country: storedCountry,
        phone: storedPhone || "",
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
        photoURL: "", // Will be updated later from profile page
        // We are not storing the raw live photo or aadhaar image data uris in firestore
        // for privacy and storage cost reasons. This can be changed if needed.
      }

      // Step 4: Save the compiled profile to its Firestore document
      await setDoc(doc(db, "users", user.uid), userProfile)

      // Step 5: Clear localStorage after successful creation to clean up
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
      } else if (error.message.includes("Core user information")) {
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

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
        <video
            src="https://videos.pexels.com/video-files/26621651/11977308_2560_1440_30fps.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-1/2 left-1/2 w-full h-full min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0 opacity-40"
        />
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
            <div className="w-full rounded-2xl border border-white/10 bg-transparent p-8 shadow-2xl backdrop-blur-xl">
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
                      </FormItem>
                    )} />

                    <div className="space-y-2">
                        {validations.map((item) => (
                            <div key={item.rule} className={cn(
                                "flex items-center gap-2 text-sm transition-colors",
                                item.met ? "text-green-400" : "text-muted-foreground"
                            )}>
                                {item.met ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                <span>{item.rule}</span>
                            </div>
                        ))}
                    </div>

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
