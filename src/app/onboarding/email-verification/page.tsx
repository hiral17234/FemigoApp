
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { sendSignInLinkToEmail } from "firebase/auth"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { auth, firebaseError } from "@/lib/firebase"


const FormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})


export default function EmailVerificationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (firebaseError || !auth) {
        toast({
            variant: "destructive",
            title: "Configuration Error",
            description: "Firebase is not configured correctly.",
        });
        return;
    }
    
    setIsSubmitting(true)
    
    // Store email in localStorage for the next step.
    localStorage.setItem('userEmail', data.email);

    const actionCodeSettings = {
        // This is the URL where the user will be redirected back to.
        // It must be in the authorized domains list in the Firebase Console.
        url: `${window.location.origin}/onboarding/details`,
        handleCodeInApp: true,
    };

    try {
        await sendSignInLinkToEmail(auth, data.email, actionCodeSettings);
        
        toast({
            title: "Verification Email Sent!",
            description: `A magic link has been sent to ${data.email}. Please check your inbox to continue.`,
        })

        // It's common to show a "check your email" message and wait here.
        // For this prototype, we'll auto-redirect to the next step to keep the flow moving.
        // In a real app, you would wait for the user to click the link.
        router.push("/onboarding/details")

    } catch (error: any) {
        console.error("Error sending email link:", error);
        
        let errorMessage = "An unexpected error occurred. Please try again."
        if (error.code === 'auth/invalid-email') {
            errorMessage = "The email address is not valid."
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = "Too many requests. Please try again later."
        }

        toast({
            variant: "destructive",
            title: "Could Not Send Email",
            description: errorMessage,
        })
    } finally {
        setIsSubmitting(false)
    }
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
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
        </div>

        <div className="mb-8 mt-16 px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Verify Your Email</h1>
          <p className="text-muted-foreground mt-2 text-sm">We'll send a magic link to your inbox to continue.</p>
          <Progress value={(4 / 7) * 100} className="mt-4 h-2 bg-gray-700" />
        </div>

        <div className="w-full rounded-2xl border border-white/10 bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary py-3 text-lg" disabled={isSubmitting}>
                 {isSubmitting ? <Loader2 className="animate-spin" /> : "Send Verification Link"}
              </Button>
            </form>
          </Form>
        </div>
        <div className="mt-4 text-center">
             <Button variant="link" onClick={() => router.push('/onboarding/details')} className="text-muted-foreground">Skip for now</Button>
        </div>
      </div>
    </main>
  )
}
