

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { auth, db } from "@/lib/firebase"
import { PasswordStrength } from "@/components/ui/password-strength"

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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
        password: '',
        confirmPassword: ''
    }
  })

  const watchedPassword = watch("password")

  const onSubmit: SubmitHandler<PasswordFormValues> = async (data) => {
    setIsSubmitting(true)
    
    const finalEmail = localStorage.getItem('userEmail');
    if (!finalEmail) {
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
      const userCredential = await createUserWithEmailAndPassword(auth, finalEmail, data.password);
      const user = userCredential.user;

      // 2. Gather all data from localStorage, ensuring we only include fields that have values.
      // CRITICAL FIX: DO NOT save large data URIs (userPhotoDataUri, userAadhaarDataUri) to Firestore.
      // This was causing the document size to exceed the 1MiB limit and fail the creation.
      const userDataToSave: { [key: string]: any } = {
        uid: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
        displayName: localStorage.getItem('userName') || "User",
        country: localStorage.getItem('userCountry') || "unknown",
        phone: localStorage.getItem('userPhone') || "",
        age: Number(localStorage.getItem('userAge')) || null,
        address1: localStorage.getItem('userAddress1') || "",
        state: localStorage.getItem('userState') || "",
        city: localStorage.getItem('userCity') || "",
      };

      // Add optional fields only if they exist in localStorage
      const optionalFields = ['nickname', 'address2', 'address3', 'altPhone'];
      const lsKeys: { [key: string]: string } = {
          nickname: 'userNickname',
          address2: 'userAddress2',
          address3: 'userAddress3',
          altPhone: 'userAltPhone'
      }

      optionalFields.forEach(field => {
          const lsKey = lsKeys[field];
          const value = localStorage.getItem(lsKey);
          if (value) {
              userDataToSave[field] = value;
          }
      });
      
      // 3. Update the user's Auth profile (we can store a placeholder here if needed later)
      await updateProfile(user, {
        displayName: userDataToSave.displayName
      });

      // 4. Create the document in Firestore with the curated data
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, userDataToSave);

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
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4 text-white">
      <video
        src="https://videos.pexels.com/video-files/26621651/11977308_2560_1440_30fps.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-1/2 left-1/2 w-full h-full min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0 opacity-50"
      />
      <div className="absolute inset-0 z-10 bg-black/30" />

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
          <Progress value={(6 / 6) * 100} className="mt-4 h-2 bg-gray-700" />
        </div>

        <div className="w-full rounded-2xl border border-white/30 p-8 shadow-[0_0_20px_theme(colors.white/0.3)]">
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
            </div>

            <PasswordStrength password={watchedPassword} />

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
