
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2, Copy, Check, ClipboardPaste } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})

const OtpToastContent = ({ otp, theme }: { otp: string, theme?: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(otp);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000); // Revert back to copy icon after 2 seconds
  };

  const isLight = theme === 'light';

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div>
        <p className={`text-sm font-medium ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>Femigo Verification</p>
        <p className={`text-xl font-bold tracking-widest ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>{otp}</p>
      </div>
      <button
        onClick={handleCopy}
        className={`flex shrink-0 items-center justify-center rounded-md p-2 text-sm transition-colors ${isLight ? 'text-blue-600 hover:bg-blue-50' : 'text-blue-400 hover:bg-blue-900/50'}`}
      >
        {isCopied ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <Copy className="h-5 w-5" />
        )}
        <span className="sr-only">Copy OTP</span>
      </button>
    </div>
  );
};


export default function VerifyOtpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { theme } = useTheme()
  const [phone, setPhone] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [otp, setOtp] = useState("")

  const [isHovering, setIsHovering] = useState(false)
  const [pastePosition, setPastePosition] = useState({ x: 0, y: 0 });
  const otpContainerRef = useRef<HTMLDivElement>(null);


  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  const showOtpToast = (newOtp: string) => {
    toast({
      description: <OtpToastContent otp={newOtp} theme={theme} />,
      className: "bg-card border-border shadow-lg w-full",
    });
  }

  // Set initial OTP on the client-side and show initial toast
  useEffect(() => {
    const initialOtp = generateOtp();
    setOtp(initialOtp);
    showOtpToast(initialOtp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]); // Rerun if theme changes to update toast style

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
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && /^\d{0,6}$/.test(text)) {
        form.setValue("pin", text.slice(0, 6), { shouldValidate: true });
        toast({
            title: "Pasted from clipboard!",
        });
      } else {
          toast({
              variant: "destructive",
              title: "Invalid Paste Data",
              description: "Clipboard does not contain a valid OTP.",
          });
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      toast({
          variant: "destructive",
          title: "Paste Failed",
          description: "Could not read from clipboard. Please check permissions.",
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (otpContainerRef.current) {
        const rect = otpContainerRef.current.getBoundingClientRect();
        setPastePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsVerifying(true)
    
    // Simulate OTP check
    setTimeout(() => {
        if (data.pin === otp) {
            toast({
                title: "Phone Verified! ✅",
                description: "Next, let's verify your email.",
            });
            router.push("/verify-email");
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
  
  const handleResendOtp = () => {
    const newOtp = generateOtp();
    setOtp(newOtp);
    showOtpToast(newOtp);
  }

  return (
     <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link
          href="/verify-phone"
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Card className="w-full rounded-2xl bg-card p-8 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Step 4: OTP Verification
            </CardTitle>
            <CardDescription className="mx-auto max-w-sm pt-2">
              A 6-digit code has been sent to your device. Check the notification and enter the code below.
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
                       <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <div 
                          ref={otpContainerRef}
                          className="relative cursor-pointer"
                          onMouseEnter={() => setIsHovering(true)}
                          onMouseLeave={() => setIsHovering(false)}
                          onMouseMove={handleMouseMove}
                          onClick={handlePaste}
                        >
                          {isHovering && (
                            <div
                                className="absolute z-10 flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground shadow-lg pointer-events-none"
                                style={{ 
                                    left: pastePosition.x, 
                                    top: pastePosition.y,
                                    transform: 'translate(-50%, -150%)',
                                }}
                            >
                                <ClipboardPaste className="h-3 w-3" />
                                <span>Click to Paste</span>
                            </div>
                          )}
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
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full rounded-xl bg-primary py-3 text-lg font-normal text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105"
                >
                  {isVerifying && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Verify & Continue
                </Button>
              </form>
            </Form>

            <p className="pt-4 text-center text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              <button type="button" className="font-medium text-primary hover:underline" onClick={handleResendOtp} disabled={isVerifying}>
                Resend OTP
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
