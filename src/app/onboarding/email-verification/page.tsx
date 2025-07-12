

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, CheckCircle2, ChevronRight, Copy, ClipboardPaste, Mail } from "lucide-react"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"
import { firebaseError } from "@/lib/firebase"
import { cn } from "@/lib/utils"

const emailSchema = z.string().email({ message: "Please enter a valid email address." });

function CustomEmailOtpNotification({ otp, visible }: { otp: string, visible: boolean }) {
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


export default function EmailVerificationPage() {
  const router = useRouter()
  const { toast, dismiss } = useToast()
  
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"email" | "otp">("email")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const [demoOtp, setDemoOtp] = useState("");
  const [showOtpNotification, setShowOtpNotification] = useState(false);

  useEffect(() => {
    if (step === 'otp') {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setDemoOtp(newOtp);

        const showTimeout = setTimeout(() => {
            setShowOtpNotification(true);
        }, 500);

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
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
        toast({variant: 'destructive', title: 'Invalid Email', description: validation.error.errors[0].message});
        return;
    }

    setIsSubmitting(true);
    
    const sentToast = toast({
        title: "OTP Sent!",
        description: `We've sent a verification code to ${email}`,
    });

    setTimeout(() => {
        setIsSubmitting(false);
        setStep('otp');
        if (sentToast?.id) {
            dismiss(sentToast.id);
        }
    }, 1500);
  }

  const onVerifyOtp = async (value: string) => {
    if (value.length < 6) return;
    
    setIsSubmitting(true);

    setTimeout(async () => {
        if (value === demoOtp) {
            localStorage.setItem("userEmail", email); // Save to local storage
            setIsVerified(true);
            toast({title: 'Email Verified!', description: 'Your email address has been successfully verified.', variant: 'success'});
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
        <CustomEmailOtpNotification otp={demoOtp} visible={showOtpNotification} />
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
                    <p className="text-sm text-muted-foreground">Your email is confirmed.</p>
                    <Button onClick={() => router.push('/onboarding/details')} className="w-full bg-primary mt-4">
                        Move to next step
                    </Button>
                </div>
            ) : step === "email" ? (
                <div className="space-y-8">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Step 5: Email Verification</h1>
                        <p className="text-muted-foreground">Enter your email to receive a verification code.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                type="email" 
                                placeholder="your.email@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">An OTP will be sent to verify your email address.</p>
                    </div>
                    <Button onClick={onSendOtp} className="w-full bg-primary py-3 text-lg font-semibold group" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Continue"}
                        {!isSubmitting && <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
                    </Button>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Step 5: OTP Verification</h1>
                        <p className="text-muted-foreground max-w-xs mx-auto">A 6-digit code has been sent to your email. Check your inbox and enter the code below.</p>
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
                        <Button variant="link" className="text-primary p-0 h-auto" onClick={() => setStep('email')}>Resend OTP</Button>
                    </div>
                </div>
            )}
            </div>
        </div>
    </main>
  )
}
