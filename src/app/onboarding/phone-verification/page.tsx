
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, CheckCircle2, ChevronRight, ChevronsUpDown, Check } from "lucide-react"
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"
import { auth, firebaseError } from "@/lib/firebase"
import { countries } from "@/lib/countries"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"


declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier
    confirmationResult: any
  }
}

export default function PhoneVerificationPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  // Get user country from local storage to set a default
  useEffect(() => {
    const userCountryValue = localStorage.getItem("userCountry") || 'india';
    const country = countries.find(c => c.value === userCountryValue);
    if (country) {
      setCountryCode(`+${country.phone}`);
    }
  }, []);

  useEffect(() => {
    if (firebaseError || !auth) {
      // Error handled on the page, but prevent recaptcha setup
      return;
    }
    // Make sure recaptcha container is on the page
    const recaptchaContainer = document.getElementById("recaptcha-container");
    if (recaptchaContainer && !window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          'size': "invisible",
          'callback': (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          },
        });
    }
  }, [])
  
  const onSendOtp = async () => {
    if (phone.length < 8) {
        toast({variant: 'destructive', title: 'Invalid Phone Number', description: 'Please enter a valid phone number.'});
        return;
    }
    setIsSubmitting(true);
    const fullPhoneNumber = countryCode + phone;
    const appVerifier = window.recaptchaVerifier;

    try {
        const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;
        setStep("otp");
        toast({
            title: 'OTP Sent!', 
            description: `We've sent a verification code to ${fullPhoneNumber}`
        });
    } catch(error: any) {
        console.error("Error sending OTP", error);
        let errorMessage = "Failed to send OTP. Please try again.";
        if (error.code === 'auth/invalid-phone-number') {
            errorMessage = "The phone number is not valid. Please check and try again.";
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = "Too many requests. Please try again later.";
        }
        toast({variant: 'destructive', title: 'Error', description: errorMessage});
    } finally {
        setIsSubmitting(false);
    }
  }

  const onVerifyOtp = async () => {
     if (otp.length !== 6) {
        toast({variant: 'destructive', title: 'Invalid OTP', description: 'Please enter the 6-digit OTP.'});
        return;
    }
    setIsSubmitting(true);
    try {
        await window.confirmationResult.confirm(otp);
        setIsVerified(true);
        // Save the verified phone number to localStorage
        localStorage.setItem("userPhone", countryCode + phone);
        toast({title: 'Phone Verified!', description: 'Your phone number has been successfully verified.'});
        setTimeout(() => router.push('/onboarding/details'), 2000);
    } catch(error: any) {
        console.error("Error verifying OTP", error);
         let errorMessage = "Failed to verify OTP. Please try again.";
        if (error.code === 'auth/invalid-verification-code') {
            errorMessage = "The OTP you entered is incorrect.";
        } else if (error.code === 'auth/code-expired') {
            errorMessage = "The OTP has expired. Please request a new one.";
        }
        toast({variant: 'destructive', title: 'Verification Failed', description: errorMessage});
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const handleOtpChange = (newOtp: string) => {
    setOtp(newOtp);
    if (newOtp.length === 6) {
        onVerifyOtp();
    }
  }


  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-white">
      <div className="absolute inset-x-0 top-0 h-1/2 w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-blue-950/10 to-transparent" />
      
      <div className="absolute top-8 left-8 z-10">
          <Button onClick={() => router.back()} variant="ghost" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
      </div>

      <div className="relative z-20 w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="w-full rounded-2xl bg-black/50 p-8 shadow-2xl backdrop-blur-lg">
          
          {firebaseError ? (
            <div className="text-center text-red-500">
                <h3 className="font-bold">Configuration Error</h3>
                <p className="text-sm">{firebaseError}</p>
            </div>
          ) : isVerified ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center text-green-400 min-h-[280px]">
                <CheckCircle2 className="h-16 w-16" />
                <h2 className="text-2xl font-bold">Verified!</h2>
                <p className="text-sm text-muted-foreground">Redirecting...</p>
            </div>
          ) : step === "phone" ? (
             <div className="space-y-8">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Step 4: Phone Verification</h1>
                    <p className="text-muted-foreground">Enter your phone number to receive a verification code.</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="flex gap-2">
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-36 justify-between"
                            >
                              {countryCode}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 country-list-popover">
                            <Command>
                                <CommandInput placeholder="Search country..." />
                                <CommandList>
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup>
                                    {countries.map((c) => (
                                    <CommandItem
                                        key={c.code}
                                        value={`${c.label} (+${c.phone})`}
                                        onSelect={() => {
                                            setCountryCode(`+${c.phone}`);
                                            setPopoverOpen(false);
                                        }}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", `+${c.phone}` === countryCode ? "opacity-100" : "opacity-0")} />
                                        <span className="mr-2">{c.emoji}</span>
                                        <span className="mr-2">{c.label}</span>
                                        <span className="text-muted-foreground">(+{c.phone})</span>
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                                <div className="p-2 text-center border-t border-border">
                                    <p className="text-xs font-bold text-red-500">Press enter to select.</p>
                                </div>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <Input 
                            type="tel" 
                            placeholder="Phone number" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="focus:ring-primary focus:border-primary"
                        />
                    </div>
                     <p className="text-xs text-muted-foreground pt-2">An OTP will be sent via SMS to verify your mobile number.</p>
                </div>
                <Button onClick={onSendOtp} className="w-full bg-primary py-3 text-lg font-semibold group" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Continue"}
                    {!isSubmitting && <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
                </Button>
                <div id="recaptcha-container"></div>
             </div>
          ) : (
            <div className="space-y-8 text-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Enter OTP</h1>
                    <p className="text-muted-foreground">Enter the 6-digit code sent to {countryCode}{phone}</p>
                </div>
                <div className="flex justify-center pt-2">
                  <InputOTP maxLength={6} value={otp} onChange={handleOtpChange}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                 <Button onClick={onVerifyOtp} className="w-full bg-primary py-3 text-lg" disabled={isSubmitting}>
                     {isSubmitting ? <Loader2 className="animate-spin" /> : "Verify"}
                 </Button>
                 <Button variant="link" onClick={() => setStep('phone')} className="text-muted-foreground">Change number</Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
