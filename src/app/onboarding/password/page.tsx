

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
    
    const email = localStorage.getItem('userEmail');
    const displayName = localStorage.getItem('userName');

    if (!email || !displayName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Your name or email is missing. Please start the signup process over.",
      })
      router.push("/signup")
      setIsSubmitting(false)
      return
    }

    try {
      // Step 1: Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
      const user = userCredential.user;

      // Step 2: Update their Auth profile with their name
      await updateProfile(user, {
        displayName: displayName,
      });

      // Step 3: Create a clean data object for Firestore
      const userDataToSave: { [key: string]: any } = {
        uid: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
        displayName: displayName,
      };
      
      const fieldsToSave = [
        { key: 'userCountry', dbKey: 'country' },
        { key: 'userPhone', dbKey: 'phone' },
        { key: 'userAge', dbKey: 'age' },
        { key: 'userAddress1', dbKey: 'address1' },
        { key: 'userAddress2', dbKey: 'address2' },
        { key: 'userAddress3', dbKey: 'address3' },
        { key: 'userState', dbKey: 'state' },
        { key: 'userCity', dbKey: 'city' },
        { key: 'userNickname', dbKey: 'nickname' },
        { key: 'userAltPhone', dbKey: 'altPhone' },
      ];
      
      fieldsToSave.forEach(field => {
        const value = localStorage.getItem(field.key);
        if (value) {
            // CRITICAL FIX: Convert age to a number before saving
            if (field.dbKey === 'age') {
                userDataToSave[field.dbKey] = Number(value);
            } else {
                userDataToSave[field.dbKey] = value;
            }
        }
      });
      
      // Step 4: Save the complete user profile to the Firestore database
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, userDataToSave);
      
      // Step 5: Clean up local storage AFTER all operations are successful
      const lsKeysToClean = [
        'userName', 'userCountry', 'userPhone', 'userEmail', 'userAge', 
        'userAddress1', 'userAddress2', 'userAddress3', 'userState', 
        'userCity', 'userNickname', 'userAltPhone',
        'userPhotoDataUri', 'userAadhaarDataUri' // Clean up image data as well
      ];
      lsKeysToClean.forEach(key => localStorage.removeItem(key));


      // Step 6: Success! Redirect to congratulations page.
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
