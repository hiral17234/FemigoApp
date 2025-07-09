
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useState } from "react"
import { CheckCircle, Circle, Loader2, ShieldCheck, ArrowLeft, Eye, EyeOff } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { auth, db } from "@/lib/firebase"


const passwordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/
);

const formSchema = z.object({
  password: z.string().refine((val) => passwordValidation.test(val), {
    message: "Password does not meet all requirements.",
  }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
})

const PasswordRequirement = ({ text, isMet }: { text: string, isMet: boolean }) => (
    <div className={cn("flex items-center gap-2 text-sm transition-colors", isMet ? "text-green-400" : "text-purple-200/50")}>
        {isMet ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        <span>{text}</span>
    </div>
)

export default function OnboardingPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })
  
  const password = form.watch("password")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    try {
      // Retrieve all user data from localStorage
      const email = localStorage.getItem("userEmail")
      const name = localStorage.getItem("userName")
      const country = localStorage.getItem("userCountry")
      const onboardingDetailsJSON = localStorage.getItem("onboardingDetails")

      if (!email || !name || !country || !onboardingDetailsJSON) {
        throw new Error("Missing user data from previous steps. Please start over.")
      }
      
      const onboardingDetails = JSON.parse(onboardingDetailsJSON)

      // 1. Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, values.password)
      const user = userCredential.user

      // 2. Update auth profile with name
      const displayName = onboardingDetails.nickname || name
      await updateProfile(user, { displayName })

      // 3. Create user document in Firestore
      const userDocRef = doc(db, "users", user.uid)
      
      const city = onboardingDetails.city === "Other" 
        ? (onboardingDetails.otherCity || "")
        : onboardingDetails.city;

      const altPhone = (onboardingDetails.altCountryCode && onboardingDetails.altPhone)
        ? `+${onboardingDetails.altCountryCode}${onboardingDetails.altPhone}`
        : "";

      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        name: name, // Original full name
        displayName: displayName, // Nickname if available, else full name
        country: country,
        age: onboardingDetails.age,
        address1: onboardingDetails.address1,
        address2: onboardingDetails.address2 || "",
        address3: onboardingDetails.address3 || "",
        state: onboardingDetails.state,
        city: city,
        altPhone: altPhone,
        createdAt: new Date().toISOString(),
      })

      // 4. Clear localStorage and redirect
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userName")
      localStorage.removeItem("userCountry")
      localStorage.removeItem("onboardingDetails")
      localStorage.removeItem("userLivePhoto")
      localStorage.removeItem("aadhaarImage")
      localStorage.removeItem("userPhone")

      toast({
        title: "Account Created & Secured!",
        description: "Your account is ready. Please log in to continue.",
        className: "bg-green-500 text-white",
      })

      router.push("/login")

    } catch (error: any) {
      console.error("Signup Error:", error)
      let errorMessage = "An unknown error occurred during signup."
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use. Please use a different email or log in."
      } else if (error instanceof Error) {
        errorMessage = error.message
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
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-30"
        src="https://videos.pexels.com/video-files/2806063/2806063-hd_1080_1920_30fps.mp4"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <main className="relative z-20 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Link
            href="/onboarding/details"
            className="mb-4 inline-flex items-center gap-2 text-sm text-purple-300/70 transition-colors hover:text-purple-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="w-full rounded-2xl border border-white/10 bg-black/20 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
            <h1 className="mb-2 text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Secure Your Account
            </h1>
            <p className="mb-8 text-center text-purple-200/70">
              Create a strong password to keep your account safe.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                       <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter a strong password"
                          {...field}
                          className="bg-white/5 border-white/20 pr-10"
                        />
                         <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-purple-200/70 hover:text-purple-200"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <div className="space-y-3 rounded-lg border border-white/10 p-4">
                  <PasswordRequirement text="Minimum 12 characters" isMet={password.length >= 12} />
                  <PasswordRequirement text="Includes an uppercase letter" isMet={/[A-Z]/.test(password)} />
                  <PasswordRequirement text="Includes a lowercase letter" isMet={/[a-z]/.test(password)} />
                  <PasswordRequirement text="Includes a number" isMet={/\d/.test(password)} />
                  <PasswordRequirement text="Includes a special character" isMet={/[^A-Za-z0-9]/.test(password)} />
                </div>
                
                <PasswordStrength password={password} />

                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                         <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter your password"
                          {...field}
                          className="bg-white/5 border-white/20 pr-10"
                         />
                         <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-purple-200/70 hover:text-purple-200"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                         >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                         </button>
                       </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-lg font-semibold text-white py-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Finish Setup"}
                  <ShieldCheck />
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  )
}
