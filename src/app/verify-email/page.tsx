
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Mail, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export default function VerifyEmailPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    // Simulate sending OTP
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("userEmail", values.email.trim())
      }
      toast({
        title: "OTP Sent!",
        description: `We've sent a verification code to ${values.email}.`,
      });
      router.push("/verify-email-otp")
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#FFF1F5] to-white p-4 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black">
      <div className="w-full max-w-sm">
        <Link href="/verify-otp" className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back
        </Link>
        <Card className="w-full rounded-2xl p-6 shadow-xl">
          <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                Step 5: Email Verification
              </CardTitle>
              <CardDescription className="pt-2">
                  Enter your email address to receive a verification code.
              </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="your.email@example.com"
                                type="email"
                                {...field}
                                disabled={isSubmitting}
                                className="pl-10"
                              />
                          </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  An OTP will be sent to your email to verify it.
                </p>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[#EC008C] py-3 text-lg font-normal text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-[#d4007a] focus:outline-none"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Continue <ChevronRight className="h-5 w-5" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
