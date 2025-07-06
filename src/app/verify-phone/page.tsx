"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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
import { toast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  phone: z.string().min(10, {
    message: "Please enter a valid 10-digit phone number.",
  }).max(10, {
    message: "Please enter a valid 10-digit phone number.",
  }),
})

export default function VerifyPhonePage() {
  const router = useRouter()
  const [backUrl, setBackUrl] = useState("/signup");

  useEffect(() => {
    const country = typeof window !== 'undefined' ? localStorage.getItem('userCountry') : null;
    if (country === 'india') {
        setBackUrl('/verify-aadhaar');
    } else {
        setBackUrl('/verify');
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    if (typeof window !== "undefined") {
      localStorage.setItem("userPhone", `+91${values.phone}`)
    }
    toast({
      title: "OTP Sent!",
      description: "We've sent a 4-digit code to your number.",
    })
    router.push("/verify-otp")
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 pt-20">
      <div className="absolute left-4 top-4 flex items-center gap-2 text-sm text-foreground transition-colors hover:text-primary md:left-8 md:top-8">
        <Link href={backUrl} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
        </Link>
      </div>

      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-foreground">Femigo</h1>
        <div className="mt-2 h-1 w-12 mx-auto bg-primary rounded-full" />
      </div>

      <div className="mt-12 w-full max-w-sm rounded-2xl bg-card p-8 shadow-xl">
        <div className="flex flex-col space-y-6 text-left">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Your Phone!
            </h2>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-4"
            >
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <div className="w-[80px]">
                            <Select defaultValue="in">
                                <SelectTrigger className="w-full" aria-label="Country code">
                                    <SelectValue>
                                        <div className="flex items-center gap-2">
                                            <span>🇮🇳</span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="in">🇮🇳 +91</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative flex-1">
                          <Input
                            placeholder="Enter number"
                            type="tel"
                            {...field}
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <p className="text-xs text-muted-foreground">
                A 4 digit OTP will be sent via SMS to verify your mobile number!
              </p>

              <Button
                type="submit"
                className="w-full rounded-xl bg-[#EC008C] py-3 text-lg font-normal text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-[#d4007a] focus:outline-none"
              >
                Continue <ChevronRight className="h-5 w-5" />
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
