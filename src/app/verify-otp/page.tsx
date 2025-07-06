
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription as FormDescriptionHint,
} from "@/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})

export default function VerifyOtpPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const DEMO_OTP = "123456"

  useEffect(() => {
    const storedPhone = typeof window !== "undefined" ? localStorage.getItem("userPhone") : ""
    if (storedPhone) {
      setPhone(storedPhone)
    } else {
      // If no phone number, something went wrong, go back.
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
    
    // Simulate OTP check
    setTimeout(() => {
        if (data.pin === DEMO_OTP) {
            toast({
                title: "Phone Verified! ✅",
                description: "Your phone number has been successfully verified.",
                className: "bg-green-500 text-white",
            });
            if (typeof window !== "undefined") {
              localStorage.removeItem("userEmail")
            }
            router.push("/dashboard");
        } else {
            toast({
                variant: "destructive",
                title: "Invalid OTP",
                description: "The code you entered is incorrect. Please try again.",
            });
            form.setError("pin", { message: "Invalid OTP" })
        }
        setIsVerifying(false)
    }, 1000);
  }

  return (
     <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#FFF1F5] to-white p-4 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black">
      <Card className="relative w-full max-w-md rounded-2xl p-6 shadow-xl">
        <Link
          href="/verify-phone"
          className="absolute left-4 top-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary md:left-6 md:top-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Step 5: OTP Verification
          </CardTitle>
          <CardDescription className="mx-auto max-w-sm pt-2">
            A 6-digit code has been sent to {phone}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field} disabled={isVerifying}>
                        <InputOTPGroup className="mx-auto">
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSeparator />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescriptionHint className="pt-2 text-center text-xs">
                      (For demo purposes, use code: 123456)
                    </FormDescriptionHint>
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

          <p className="pt-4 text-center text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            <button className="font-medium text-primary hover:underline" onClick={() => toast({ title: 'OTP Resent!', description: 'A new code has been sent (use 123456).'})}>
              Resend OTP
            </button>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
