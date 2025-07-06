"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"

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
import { ScrollArea } from "@/components/ui/scroll-area"
import { auth } from "@/lib/firebase"

const formSchema = z.object({
  countryCode: z.string().min(1, { message: "Please select a country code." }),
  phone: z.string().min(5, {
    message: "Please enter a valid phone number.",
  }),
})

// Store the confirmation result on the window object to pass it between pages.
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: any;
  }
}

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

  // Initialize reCAPTCHA
  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
  }, []);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const phoneNumber = `${values.countryCode}${values.phone}`;
    const appVerifier = window.recaptchaVerifier;

    if (!appVerifier) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "reCAPTCHA not initialized. Please refresh.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      // Pass the confirmationResult to the next page
      window.confirmationResult = confirmationResult;

      if (typeof window !== "undefined") {
        localStorage.setItem("userPhone", phoneNumber);
      }
      toast({
        title: "OTP Sent!",
        description: `We've sent a verification code to ${phoneNumber}.`,
      });
      router.push("/verify-otp");

    } catch (error: any) {
      console.error("SMS not sent:", error);
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: error.message || "Please check the phone number and try again.",
      });
    } finally {
        setIsSubmitting(false);
    }
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
              
              <div id="recaptcha-container"></div>

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
        </div>
      </div>
    </div>
  )
}
