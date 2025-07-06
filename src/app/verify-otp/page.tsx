"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { ConfirmationResult } from "firebase/auth"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  pin: z.string().min(4, {
    message: "Your one-time password must be 4 characters.",
  }),
})

export default function VerifyOtpPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    const storedPhone = typeof window !== "undefined" ? localStorage.getItem("userPhone") : ""
    if (storedPhone) {
      setPhone(storedPhone)
    } else {
        router.push('/verify-phone');
    }
  }, [router])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pin: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsVerifying(true)
    const confirmationResult = (window as any).confirmationResult as ConfirmationResult | undefined

    if (!confirmationResult) {
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: "Could not find verification session. Please go back and try sending the OTP again.",
      });
      setIsVerifying(false)
      return
    }

    try {
      await confirmationResult.confirm(data.pin)
      toast({
        title: "Phone Verified! ✅",
        description: "Your phone number has been successfully verified.",
        className: "bg-green-500 text-white",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Error verifying OTP:", error)
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "The code you entered is incorrect. Please try again.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 pt-20">
       <div className="absolute left-4 top-4 flex items-center gap-2 text-sm text-foreground transition-colors hover:text-primary md:left-8 md:top-8">
         <Link href="/verify-phone" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
        </Link>
      </div>
      
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-foreground">Femigo</h1>
        <div className="mt-2 h-1 w-12 mx-auto bg-primary rounded-full" />
      </div>

      <div className="mt-12 w-full max-w-sm rounded-2xl bg-card p-8 shadow-xl">
        <div className="flex flex-col space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Enter OTP
            </h2>
            <p className="text-sm text-muted-foreground">
              A 4-digit code has been sent to {phone}.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={4} {...field} disabled={isVerifying}>
                        <InputOTPGroup className="mx-auto">
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isVerifying}
                className="w-full rounded-xl bg-[#EC008C] py-3 text-lg font-normal text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-[#d4007a] focus:outline-none"
              >
                {isVerifying && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Verify & Continue
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            <button className="text-primary hover:underline font-medium" onClick={() => router.push('/verify-phone')}>
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
