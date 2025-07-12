

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, CheckCircle2, ChevronRight, ChevronsUpDown, Check, Copy, ClipboardPaste } from "lucide-react"
import { doc, updateDoc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"
import { auth, db, firebaseError } from "@/lib/firebase"
import { countries, type Country } from "@/lib/countries"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

function CustomOtpNotification({ otp, visible }: { otp: string, visible: boolean }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(otp);
    }

    return (
        <div className={cn(
            "fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm p-4 transition-transform duration-500 ease-in-out",
            visible ? "translate-y-4" : "-translate-y-full"
        )}>
            <div className="bg-white text-black rounded-xl shadow-2xl p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm font-semibold text-blue-600">Femigo Verification</p>
                        <p className="text-2xl font-bold tracking-widest mt-1 text-black">{otp}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleCopy}>
                        <Copy className="h-5 w-5 text-blue-600" />
                    </Button>
                </div>
            </div>
        </div>
    )
}


export default function PhoneVerificationPage() {
  const router = useRouter()
  const { toast, dismiss } = useToast()
  
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const [demoOtp, setDemoOtp] = useState("");
  const [showOtpNotification, setShowOtpNotification] = useState(false);

  // Get user country from local storage to set a default
  useEffect(() => {
    const userCountryValue = localStorage.getItem("userCountry") || 'india';
    const country = countries.find(c => c.value === userCountryValue);
    if (country) {
      setSelectedCountry(country);
    } else {
      setSelectedCountry(countries.find(c => c.value === 'india')!); // Fallback to India
    }
  }, []);
  
  // This effect runs when the component switches to the 'otp' step
  useEffect(() => {
    if (step === 'otp') {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setDemoOtp(newOtp);

        const showTimeout = setTimeout(() => {
            setShowOtpNotification(true);
        }, 500);

        // Hide notification after 15 seconds
        const hideTimeout = setTimeout(() => {
            setShowOtpNotification(false);
        }, 15000);

        return () => {
            clearTimeout(showTimeout);
            clearTimeout(hideTimeout);
        }
    }
  }, [step]);


  const onSendOtp = async () => {
    if (!selectedCountry) {
        toast({variant: 'destructive', title: 'Country Not Selected', description: 'Please select a country code.'});
        return;
    }

    if (selectedCountry.phoneLength && phone.length !== selectedCountry.phoneLength) {
        toast({
            variant: 'destructive', 
            title: 'Invalid Phone Number', 
            description: `Phone number for ${selectedCountry.label} must be ${selectedCountry.phoneLength} digits.`
        });
        return;
    }

    if (phone.length < 5) { // Generic fallback validation
        toast({variant: 'destructive', title: 'Invalid Phone Number', description: 'Please enter a valid phone number.'});
        return;
    }

    setIsSubmitting(true);
    
    const sentToast = toast({
        title: "OTP Sent!",
        description: `We've sent a verification code to +${selectedCountry.phone}${phone}`,
    });

    setTimeout(() => {
        setIsSubmitting(false);
        setStep('otp');
        // Immediately dismiss the "OTP Sent" toast before the page fully renders the next step
        if (sentToast?.id) {
            dismiss(sentToast.id);
        }
    }, 1500);
  }

  const onVerifyOtp = async (value: string) => {
    if (value.length < 6) return;
    setIsSubmitting(true);

    const user = auth.currentUser;
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in. Please start over.' });
        setIsSubmitting(false);
        router.push('/signup');
        return;
    }

    setTimeout(async () => {
        if (value === demoOtp) {
            if(selectedCountry) {
                const fullPhoneNumber = `+${selectedCountry.phone}${phone}`;
                try {
                    const userDocRef = doc(db, "users", user.uid);
                    await updateDoc(userDocRef, { phone: fullPhoneNumber });
                    localStorage.setItem("userPhone", fullPhoneNumber); // still useful for immediate UI needs
                    setIsVerified(true);
                    toast({title: 'Phone Verified!', description: 'Your phone number has been successfully verified.', variant: 'success'});
                } catch (error) {
                    console.error("Failed to save phone number:", error);
                    toast({variant: 'destructive', title: 'Save Failed', description: "Could not save your phone number. Please try again."});
                }
            }
        } else {
            toast({variant: 'destructive', title: 'Verification Failed', description: "The OTP you entered is incorrect."});
            setOtp(""); // Clear the input on failure
        }
        setIsSubmitting(false);
    }, 500);
  }
  
  const handleOtpChange = (newOtp: string) => {
    setOtp(newOtp);
    if (newOtp.length === 6 && !isSubmitting) {
        onVerifyOtp(newOtp);
    }
  }

  const handlePaste = async () => {
    try {
        const text = await navigator.clipboard.readText();
        if (text && /^\d{6}$/.test(text)) {
            handleOtpChange(text);
        } else {
            toast({ variant: 'destructive', title: 'Invalid Paste', description: 'Clipboard does not contain a valid 6-digit OTP.' });
        }
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        toast({ variant: 'destructive', title: 'Paste Error', description: 'Could not access clipboard.' });
    }
  };


  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-white">
        <CustomOtpNotification otp={demoOtp} visible={showOtpNotification} />
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
                    <p className="text-sm text-muted-foreground">Your phone number is confirmed.</p>
                    <Button onClick={() => router.push('/onboarding/details')} className="w-full bg-primary mt-4">
                        Move to next step
                    </Button>
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
                                    {selectedCountry ? `+${selectedCountry.phone}` : 'Code'}
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
                                            value={`${country.label} (+${country.phone})`}
                                            onSelect={() => {
                                                setSelectedCountry(country);
                                                setPopoverOpen(false);
                                            }}
                                            >
                                            <Check
                                                className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedCountry?.value === country.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span className="mr-2">{country.emoji}</span>
                                            {country.label} (+{country.phone})
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
                            <Input 
                                type="tel" 
                                placeholder="Phone number" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                className="focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">An OTP will be sent via SMS to verify your mobile number.</p>
                    </div>
                    <Button onClick={onSendOtp} className="w-full bg-primary py-3 text-lg font-semibold group" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Continue"}
                        {!isSubmitting && <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
                    </Button>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Step 4: OTP Verification</h1>
                        <p className="text-muted-foreground max-w-xs mx-auto">A 6-digit code has been sent to your device. Check the notification and enter the code below.</p>
                    </div>
                    <div className="space-y-2 pt-4">
                        <label className="text-sm font-medium text-left w-full block">Verification Code</label>
                         <div className="flex justify-center relative group">
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
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-md">
                                <Button variant="ghost" onClick={handlePaste}>
                                    <ClipboardPaste className="mr-2 h-4 w-4" />
                                    Paste OTP
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Button onClick={() => onVerifyOtp(otp)} className="w-full bg-primary py-3 text-lg" disabled={isSubmitting || otp.length < 6}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Verify & Continue"}
                    </Button>
                     <div className="text-center text-sm">
                        <span className="text-muted-foreground">Didn't receive the code? </span>
                        <Button variant="link" className="text-primary p-0 h-auto" onClick={() => setStep('phone')}>Resend OTP</Button>
                    </div>
                </div>
            )}
            </div>
        </div>
    </main>
  )
}
