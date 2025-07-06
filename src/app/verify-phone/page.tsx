"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  countryCode: z.string().min(1, { message: "Please select a country code." }),
  phone: z.string().min(5, {
    message: "Please enter a valid phone number.",
  }),
})

export default function VerifyPhonePage() {
  const router = useRouter()
  const [backUrl, setBackUrl] = useState("/verify");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      countryCode: "+91",
      phone: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const phoneNumber = `${values.countryCode}${values.phone}`;

    // Simulate sending OTP
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("userPhone", phoneNumber);
      }
      toast({
        title: "OTP Sent!",
        description: `We've sent a verification code to ${phoneNumber}. (Hint: use 123456)`,
      });
      router.push("/verify-otp");
      setIsSubmitting(false);
    }, 1000)
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#FFF1F5] to-white p-4 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black">
       <Card className="relative w-full max-w-sm rounded-2xl p-6 shadow-xl">
        <Link href={backUrl} className="absolute left-4 top-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary md:left-6 md:top-6">
            <ArrowLeft className="h-4 w-4" />
            Back
        </Link>
        <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
              Step 3: Phone Verification
            </CardTitle>
            <CardDescription className="pt-2">
                Enter your phone number to receive a verification code.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-4"
            >
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <div className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <FormItem className="w-[130px]">
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Code" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <ScrollArea className="h-72">
                               <SelectItem value="+91">🇮🇳 India (+91)</SelectItem>
                               <SelectItem value="+1">🇺🇸 USA (+1)</SelectItem>
                               <SelectItem value="+44">🇬🇧 UK (+44)</SelectItem>
                               <SelectItem value="+1">🇨🇦 Canada (+1)</SelectItem>
                               <SelectItem value="+61">🇦🇺 Australia (+61)</SelectItem>
                               <SelectItem value="+49">🇩🇪 Germany (+49)</SelectItem>
                               <SelectItem value="+33">🇫🇷 France (+33)</SelectItem>
                               <SelectItem value="+81">🇯🇵 Japan (+81)</SelectItem>
                               <SelectItem value="+55">🇧🇷 Brazil (+55)</SelectItem>
                               <SelectItem value="+27">🇿🇦 South Africa (+27)</SelectItem>
                               <SelectItem value="+86">🇨🇳 China (+86)</SelectItem>
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                            <Input
                                placeholder="Enter number"
                                type="tel"
                                {...field}
                                disabled={isSubmitting}
                            />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormItem>
               <p className="text-xs text-muted-foreground">
                An OTP will be sent via SMS to verify your mobile number.
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
    </main>
  )
}
