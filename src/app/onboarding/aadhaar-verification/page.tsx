
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Loader2, Upload, Camera, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { verifyAadhaar } from "@/ai/flows/aadhaar-verification-flow"
import { type AadhaarVerificationOutput } from "@/ai/types"

type VerificationState = "idle" | "camera" | "preview" | "verifying" | "success" | "failed" | "error"

export default function AadhaarVerificationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [verificationState, setVerificationState] = useState<VerificationState>("idle")
  const [verificationResult, setVerificationResult] = useState<AadhaarVerificationOutput | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (!name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User details not found. Redirecting to signup.",
      })
      router.push('/signup')
    } else {
        setUserName(name);
    }
  }, [router, toast])

  const startCamera = async () => {
    try {
      // Prefer the rear camera for documents
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsCameraOn(true)
      setVerificationState("camera");
    } catch (err) {
      console.error("Error accessing camera:", err)
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions and try again.",
      })
    }
  }

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraOn(false)
  }, [])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext("2d")
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        const dataUrl = canvas.toDataURL("image/jpeg")
        setImageDataUrl(dataUrl)
        setVerificationState("preview")
        stopCamera()
      }
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageDataUrl(e.target?.result as string)
        setVerificationState("preview")
      }
      reader.readAsDataURL(file)
    }
  }

  const resetState = () => {
    setImageDataUrl(null)
    setVerificationState("idle")
    setVerificationResult(null)
    stopCamera()
  }

  const handleVerification = useCallback(async () => {
    if (!imageDataUrl || !userName) {
      toast({ variant: 'destructive', title: 'Error', description: 'No image or user name provided.' });
      return;
    }

    setVerificationState("verifying")
    
    try {
      const result = await verifyAadhaar({ aadhaarPhotoDataUri: imageDataUrl, userName });
      setVerificationResult(result);
      if (result.verificationPassed) {
        setVerificationState("success");
        localStorage.setItem("userAadhaarDataUri", imageDataUrl);
        toast({ title: 'Aadhaar Verified!', description: result.reason });
        setTimeout(() => router.push('/onboarding/phone-verification'), 2000);
      } else {
        setVerificationState("failed");
        toast({ variant: 'destructive', title: 'Verification Failed', description: result.reason });
      }
    } catch (error: any) {
        console.error("Aadhaar verification flow failed:", error);
        setVerificationState("error");
        const errorMessage = error.message || 'An unexpected error occurred during verification.';
        setVerificationResult({ verificationPassed: false, reason: errorMessage });
        toast({
            variant: "destructive",
            title: "Verification Error",
            description: errorMessage,
        });
    }
  }, [imageDataUrl, router, toast, userName]);
  
  // Cleanup camera on unmount
  useEffect(() => {
      return () => {
          stopCamera();
      }
  }, [stopCamera]);

  const getCardContent = () => {
    switch (verificationState) {
        case 'success':
            return (
                <div className="text-center space-y-4 text-green-400">
                    <CheckCircle className="h-20 w-20 mx-auto animate-pulse" />
                    <h2 className="text-2xl font-bold">Verification Successful!</h2>
                    <p className="text-sm">{verificationResult?.reason}</p>
                    <p className="text-sm text-muted-foreground">Redirecting...</p>
                </div>
            )
        case 'failed':
        case 'error':
             return (
                <div className="text-center space-y-4 text-red-500">
                    <AlertTriangle className="h-20 w-20 mx-auto animate-pulse" />
                    <h2 className="text-2xl font-bold">Verification Failed</h2>
                    <p className="text-sm">{verificationResult?.reason}</p>
                    <Button onClick={resetState} className="mt-4">
                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                    </Button>
                </div>
            )
        case 'verifying':
            return (
                <div className="text-center space-y-4">
                    <Loader2 className="h-20 w-20 mx-auto animate-spin text-primary" />
                    <h2 className="text-2xl font-bold">Verifying Aadhaar...</h2>
                    <p className="text-muted-foreground">Our AI is analyzing your document. Please wait.</p>
                </div>
            )
        case 'camera':
            return (
                <div className="flex flex-col items-center gap-4 h-full">
                    <div className="relative w-full aspect-[16/10] bg-muted rounded-lg overflow-hidden border-2 border-primary">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={capturePhoto} size="lg" className="rounded-full h-16 w-16">
                            <Camera className="h-8 w-8" />
                        </Button>
                        <Button onClick={resetState} variant="destructive">Cancel</Button>
                    </div>
                </div>
            );
        case 'preview':
             return (
                <div className="flex flex-col items-center gap-4 h-full">
                    <Image src={imageDataUrl!} alt="Aadhaar Preview" width={400} height={250} className="rounded-lg max-w-full" />
                    <div className="flex gap-4 w-full">
                        <Button onClick={resetState} variant="secondary" className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" /> Retake
                        </Button>
                        <Button onClick={handleVerification} className="w-full">
                            Looks Good
                        </Button>
                    </div>
                </div>
            )
        default: // idle
            return (
                <div className="flex flex-col items-center justify-center gap-6 h-full p-8 text-center">
                    <h2 className="text-2xl font-semibold">Upload Your Aadhaar Card</h2>
                    <p className="text-muted-foreground">You can either upload a photo of the front of your card or use your phone's camera.</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <div className="w-full space-y-4">
                        <Button onClick={() => fileInputRef.current?.click()} size="lg" className="w-full">
                            <Upload className="mr-2 h-5 w-5" /> Upload Photo
                        </Button>
                        <Button onClick={startCamera} size="lg" variant="secondary" className="w-full">
                            <Camera className="mr-2 h-5 w-5" /> Use Camera
                        </Button>
                    </div>
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

      <div className="relative z-20 w-full max-w-lg animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="absolute top-0 left-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
        </div>

        <div className="mb-8 mt-16 px-4">
            <h1 className="text-center text-3xl font-bold tracking-tight">Step 3: Aadhaar Verification</h1>
            <Progress value={(3 / 7) * 100} className="mt-4 h-2 bg-gray-700" />
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
