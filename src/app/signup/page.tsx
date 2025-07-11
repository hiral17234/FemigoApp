
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { countries } from "@/lib/countries"

const signupSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  country: z.string().min(1, { message: "Please select your country." }),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit: SubmitHandler<SignupFormValues> = (data) => {
    setIsSubmitting(true)
    
    // Save to localStorage for subsequent steps
    localStorage.setItem("userName", data.fullName)
    localStorage.setItem("userCountry", data.country)

    toast({
      title: "Welcome!",
      description: "Let's get you set up.",
    })
    
    // Redirect to the next step in the onboarding flow
    router.push("/onboarding/live-photo")
    
    setIsSubmitting(false)
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black p-4 text-white">
      <video
        src="https://media.istockphoto.com/id/1456520455/nl/video/sulfur-cosmos-flowers-bloom-in-the-garden.mp4?s=mp4-480x480-is&k=20&c=xbZAFUX4xgFK_GWD71mYxPUwCZr-qTb9wObCrWMB8ak="
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-1/2 left-1/2 w-full h-full min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0 opacity-40"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/60 to-transparent" />

      <div className="relative z-20 w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="absolute top-0 left-0">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
        </div>

        <div className="mb-8 mt-16 px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create Your Account</h1>
          <p className="text-muted-foreground mt-2 text-sm">Join Femigo and take a step towards a safer tomorrow.</p>
          <Progress value={(1 / 7) * 100} className="mt-4 h-2 bg-gray-700" />
        </div>

        <div className="w-full rounded-2xl border border-white/10 bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                {...register("fullName")}
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-medium">Country</label>
               <Select onValueChange={(value) => setValue("country", value, { shouldValidate: true })}>
                  <SelectTrigger className={errors.country ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                      {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                              <div className="flex items-center gap-2">
                                <span>{country.emoji}</span>
                                <span>{country.label}</span>
                              </div>
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
               {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-primary py-3 text-lg" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Continue"}
            </Button>
          </form>

          <p className="pt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
