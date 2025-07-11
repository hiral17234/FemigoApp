
"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Loader2, Camera, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { genderCheck } from "@/ai/flows/gender-check-flow"
import { type GenderCheckOutput } from "@/ai/types"

type VerificationState = "idle" | "camera" | "preview" | "verifying" | "success" | "failed" | "error"

export default function LivePhotoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [verificationState, setVerificationState] = useState<VerificationState>("idle")
  const [verificationResult, setVerificationResult] = useState<GenderCheckOutput | null>(null)

  const startCamera = async () => {
    setVerificationState("camera")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
      })
      setVerificationState("idle")
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext("2d")
      if (context) {
        // Flip the image horizontally
        context.translate(video.videoWidth, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        const dataUrl = canvas.toDataURL("image/jpeg")
        setImageDataUrl(dataUrl)
        setVerificationState("preview")
        stopCamera()
      }
    }
  }
  
  const handleRetake = () => {
    setImageDataUrl(null)
    setVerificationResult(null)
    startCamera()
  }

  const handleVerification = useCallback(async () => {
    if (!imageDataUrl) {
      toast({ variant: 'destructive', title: 'Error', description: 'No image captured.' });
      return;
    }

    setVerificationState("verifying")
    
    try {
      const result = await genderCheck({ photoDataUri: imageDataUrl });
      setVerificationResult(result);

      if (result.isFemale) {
        setVerificationState("success");
        localStorage.setItem("userPhotoDataUri", imageDataUrl); // Save photo to localStorage
        toast({ title: 'Photo Verified!', description: result.reason });
        
        const country = localStorage.getItem('userCountry');
        // Conditionally route to Aadhaar verification for India
        if (country === 'india') {
            setTimeout(() => router.push('/onboarding/aadhaar-verification'), 2000);
        } else {
            setTimeout(() => router.push('/onboarding/phone-verification'), 2000);
        }

      } else {
        setVerificationState("failed");
        toast({ variant: 'destructive', title: 'Verification Failed', description: result.reason });
      }
    } catch (error: any) {
        console.error("Gender check flow failed:", error);
        setVerificationState("error");
        const errorMessage = error.message || 'An unexpected error occurred during verification.';
        setVerificationResult({ isFemale: false, reason: errorMessage });
        toast({
            variant: "destructive",
            title: "Verification Error",
            description: errorMessage,
        });
    }
  }, [imageDataUrl, router, toast]);

  const getCardContent = () => {
    switch (verificationState) {
        case 'success':
            return (
                <div className="text-center space-y-4 text-green-400">
                    <CheckCircle className="h-20 w-20 mx-auto animate-pulse" />
                    <h2 className="text-2xl font-bold">Verification Successful!</h2>
                    <p className="text-sm text-muted-foreground">Redirecting to the next step...</p>
                </div>
            )
        case 'failed':
        case 'error':
             return (
                <div className="text-center space-y-4 text-red-500">
                    <AlertTriangle className="h-20 w-20 mx-auto animate-pulse" />
                    <h2 className="text-2xl font-bold">Verification Failed</h2>
                    <p className="text-sm">{verificationResult?.reason}</p>
                    <Button onClick={handleRetake} className="mt-4">
                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                    </Button>
                </div>
            )
        case 'verifying':
            return (
                <div className="text-center space-y-4">
                    <Loader2 className="h-20 w-20 mx-auto animate-spin text-primary" />
                    <h2 className="text-2xl font-bold">Verifying...</h2>
                    <p className="text-muted-foreground">Our AI is checking your photo. Please wait.</p>
                </div>
            )
        case 'preview':
            return (
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-xl font-semibold">Your Captured Photo</h2>
                    <Image src={imageDataUrl!} alt="Captured live photo" width={320} height={240} className="rounded-lg" />
                     <div className="flex gap-4 mt-4">
                        <Button onClick={handleRetake} variant="secondary">
                            <RefreshCw className="mr-2 h-4 w-4" /> Retake
                        </Button>
                        <Button onClick={handleVerification}>
                            Looks Good, Verify
                        </Button>
                    </div>
                </div>
            )
        case 'camera':
            return (
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <Button onClick={capturePhoto} size="lg" className="rounded-full h-16 w-16">
                        <Camera className="h-8 w-8" />
                    </Button>
                </div>
            )
        default: // idle
            return (
                <div className="flex flex-col items-center justify-center gap-4 h-full p-8 text-center">
                    <Camera className="h-16 w-16 text-primary" />
                    <h2 className="text-2xl font-semibold">Live Photo Check</h2>
                    <p className="text-muted-foreground">We need to take a quick photo to verify you're a real person and confirm you are female, as this is a women's safety app.</p>
                    <Button onClick={startCamera} size="lg" className="mt-6">Enable Camera</Button>
                </div>
            )
    }
  }


  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black p-4 text-white">
      <video
        src="https://media.istockphoto.com/id/1456520455/nl/video/sulfur-cosmos-flowers-bloom-in-the-garden.mp4?s=mp4-480x480-is&k=20&c=xbZAFUX4xgFK_GWD71mYxPUwCZr-qTb9wObCrWMB8ak="
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-1/2 left-1/2 w-full h-full min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0 opacity-40"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/60 to-transparent" />

      <div className="relative z-20 w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="absolute top-0 left-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
        </div>

        <div className="mb-8 mt-16 px-4">
            <h1 className="text-center text-3xl font-bold tracking-tight">Identity Verification</h1>
            <Progress value={(2 / 7) * 100} className="mt-4 h-2 bg-gray-700" />
        </div>

        <Card className="w-full rounded-2xl border border-white/10 bg-card/80 p-8 shadow-2xl backdrop-blur-xl min-h-[400px]">
          <CardContent className="p-0 h-full flex items-center justify-center">
             {getCardContent()}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
