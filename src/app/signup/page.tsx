

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { ArrowLeft, User, Globe, ChevronsUpDown, Check, Loader2 } from "lucide-react"
import { signInAnonymously } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { countries } from "@/lib/countries"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { auth, db, firebaseError } from "@/lib/firebase"

const signupSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  country: z.string({ required_error: "Please select your country." }),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const { toast, dismiss } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true)

    if (firebaseError) {
        toast({
            variant: "destructive",
            title: "Configuration Error",
            description: firebaseError,
        });
        setIsSubmitting(false);
        return;
    }
    
    try {
      // 1. Sign in anonymously to get a UID
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // 2. Save initial data to Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName: data.fullName,
        country: data.country,
        createdAt: new Date().toISOString(),
        isAnonymous: true, // Flag to indicate this is a temporary anonymous user
      });
      
      // 3. Save name and country to localStorage for non-DB dependent steps
      localStorage.setItem("userName", data.fullName)
      localStorage.setItem("userCountry", data.country)

      const welcomeToast = toast({
        title: `Welcome, ${data.fullName}!`,
        description: "Let's get you set up.",
        action: (
            <Button size="sm" onClick={() => {
                dismiss(welcomeToast.id);
                router.push("/onboarding/live-photo");
            }}>
                Next Step
            </Button>
        ),
        duration: Infinity
      })

    } catch (error) {
      console.error("Anonymous sign-in or data save failed", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not start the signup process. Please try again."
      });
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-white">
       <div className="absolute inset-x-0 top-0 h-1/2 w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-blue-950/10 to-transparent" />
      
       <div className="absolute top-8 left-8 z-10">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

      <div className="relative z-20 w-full max-w-sm animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="w-full rounded-2xl bg-black/50 p-8 shadow-2xl backdrop-blur-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
            <p className="text-muted-foreground mt-2 text-sm">Join Femigo and be part of our community.</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="Your Name"
                  {...register("fullName")}
                  className={cn("pl-9", errors.fullName && "border-destructive")}
                />
              </div>
              {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
               <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between pl-9 relative",
                          !field.value && "text-muted-foreground",
                          errors.country && "border-destructive"
                        )}
                      >
                         <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        {field.value
                          ? countries.find(
                              (country) => country.value === field.value
                            )?.label
                          : "Select your country"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0 country-list-popover">
                       <Command>
                          <CommandInput placeholder="Search country..." />
                          <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {countries.map((country) => (
                                <CommandItem
                                  key={country.value}
                                  value={country.label}
                                  onSelect={() => {
                                    setValue("country", country.value)
                                    setPopoverOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === country.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                   <span className="mr-2">{country.emoji}</span>
                                  {country.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                        <div className="p-2 text-center border-t border-border">
                            <p className="text-xs font-bold text-red-500">Press enter to select.</p>
                        </div>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.country && <p className="text-xs text-destructive mt-1">{errors.country.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-3 text-lg" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="pt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
