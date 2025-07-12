
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { auth, db } from "@/lib/firebase"
import { cn } from "@/lib/utils"

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function PasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // A quick check to see if email was stored from a previous step (magic link flow)
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
        setUserEmail(storedEmail);
    } else {
        // Fallback for direct navigation or if email step was skipped
        toast({
            title: "Email Required",
            description: "We need your email to create an account. Redirecting...",
            variant: "destructive"
        })
        router.push('/onboarding/email-verification');
    }
  }, [router, toast]);

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    const subscription = watch((value) => setPassword(value.password || ""));
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit: SubmitHandler<PasswordFormValues> = async (data) => {
    setIsSubmitting(true)
    
    if (!userEmail) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Your email is missing. Please start the signup process over.",
      })
      router.push("/signup")
      setIsSubmitting(false)
      return
    }

    try {
      // 1. Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, userEmail, data.password);
      const user = userCredential.user;

      // 2. Gather all data from localStorage
      const userDataFromStorage = {
        displayName: localStorage.getItem('userName') || "User",
        country: localStorage.getItem('userCountry') || "unknown",
        phone: localStorage.getItem('userPhone') || "",
        photoURL: localStorage.getItem('userPhotoDataUri') || "",
        aadhaarPhotoURL: localStorage.getItem('userAadhaarDataUri') || "",
        // Add other details fields here if they were stored in localStorage
        age: Number(localStorage.getItem('userAge')) || null,
        address1: localStorage.getItem('userAddress1') || "",
        state: localStorage.getItem('userState') || "",
        city: localStorage.getItem('userCity') || "",
        nickname: localStorage.getItem('userNickname') || "",
      };

      // 3. Update the user's Auth profile
      await updateProfile(user, {
        displayName: userDataFromStorage.displayName,
        photoURL: userDataFromStorage.photoURL
      });

      // 4. Create the document in Firestore with all collected data
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        isAnonymous: false,
        createdAt: new Date().toISOString(),
        ...userDataFromStorage
      });

      router.push("/congratulations")

    } catch (error: any) {
      console.error("Account creation failed:", error)
      let errorMessage = "An unexpected error occurred. Please try again."
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please log in or use a different email."
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak. Please choose a stronger password."
      }
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-white">
      <div className="absolute inset-x-0 top-0 h-1/2 w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-blue-950/10 to-transparent" />

      <div className="relative z-20 w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="absolute top-0 left-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
        </div>

        <div className="mb-8 mt-16 px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Set Your Password</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            This is the final step! Choose a strong, secure password.
          </p>
          <Progress value={(6 / 7) * 100} className="mt-4 h-2 bg-gray-700" />
        </div>

        <div className="w-full rounded-2xl border-none bg-black/50 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                />
                 <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

             <div className="space-y-2 pt-2">
                <ul className="space-y-1.5 text-xs">
                    <li className={cn("flex items-center gap-2 transition-colors", checks.length ? "text-green-400" : "text-muted-foreground")}>
                        <CheckCircle2 className="h-4 w-4" /> At least 8 characters
                    </li>
                    <li className={cn("flex items-center gap-2 transition-colors", checks.uppercase ? "text-green-400" : "text-muted-foreground")}>
                        <CheckCircle2 className="h-4 w-4" /> An uppercase letter (A-Z)
                    </li>
                     <li className={cn("flex items-center gap-2 transition-colors", checks.lowercase ? "text-green-400" : "text-muted-foreground")}>
                        <CheckCircle2 className="h-4 w-4" /> A lowercase letter (a-z)
                    </li>
                    <li className={cn("flex items-center gap-2 transition-colors", checks.number ? "text-green-400" : "text-muted-foreground")}>
                        <CheckCircle2 className="h-4 w-4" /> A number (0-9)
                    </li>
                    <li className={cn("flex items-center gap-2 transition-colors", checks.special ? "text-green-400" : "text-muted-foreground")}>
                        <CheckCircle2 className="h-4 w-4" /> A special character (!@#$%)
                    </li>
                </ul>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword">Confirm Password</label>
               <div className="relative">
                 <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...register("confirmPassword")}
                    className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                 />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-3 text-lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
