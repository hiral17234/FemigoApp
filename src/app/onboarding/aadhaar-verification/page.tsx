
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Loader2, Upload, Camera, CheckCircle, AlertTriangle, RefreshCw, SwitchCamera } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { verifyAadhaar } from "@/ai/flows/aadhaar-verification-flow"
import { type AadhaarVerificationOutput } from "@/ai/types"
import { cn } from "@/lib/utils"

type VerificationState = "idle" | "camera" | "preview" | "verifying" | "success" | "failed" | "error"
type InputMode = "camera" | "upload"

export default function AadhaarVerificationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [verificationState, setVerificationState] = useState<VerificationState>("idle")
  const [inputMode, setInputMode] = useState<InputMode>("camera");
  const [verificationResult, setVerificationResult] = useState<AadhaarVerificationOutput | null>(null)
  const [userName, setUserName] = useState('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

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
  
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }, [])
  
  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
      stopCamera();
      if (verificationState !== 'idle' || inputMode !== 'camera') return;
      
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } })
          if (videoRef.current) {
              videoRef.current.srcObject = stream
              await videoRef.current.play();
          }
      } catch (err) {
          console.error("Error accessing camera:", err)
          toast({
              variant: "destructive",
              title: "Camera Error",
              description: "Could not access camera. Please check permissions.",
          })
      }
  }, [stopCamera, toast, inputMode, verificationState]);
  
  useEffect(() => {
    if (inputMode === 'camera' && verificationState === 'idle') {
        startCamera(facingMode);
    } else {
        stopCamera();
    }
    return () => {
        stopCamera();
    };
  }, [inputMode, verificationState, facingMode, startCamera, stopCamera]);


  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

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
        toast({ variant: 'success', title: 'Aadhaar Verified!', description: result.reason });
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
  

  const getCameraContent = () => {
    switch (verificationState) {
        case 'verifying':
            return <div className="flex flex-col items-center justify-center h-full text-center space-y-4"><Loader2 className="h-16 w-16 animate-spin text-primary" /><p className="text-muted-foreground">Verifying...</p></div>
        case 'success':
            return <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-green-400"><CheckCircle className="h-16 w-16" /><p>Success!</p></div>
        case 'failed':
        case 'error':
             return <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-red-500"><AlertTriangle className="h-16 w-16" /><p>{verificationResult?.reason || "An error occurred."}</p></div>
        case 'preview':
             return <Image src={imageDataUrl!} alt="Aadhaar Preview" layout="fill" objectFit="contain" className="rounded-lg" />
        default: // idle
            if (inputMode === 'camera') {
                return (
                    <>
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                         <Button variant="ghost" size="icon" onClick={switchCamera} className="absolute top-2 right-2 bg-black/30 text-white hover:bg-black/50 rounded-full z-10">
                            <SwitchCamera className="h-5 w-5" />
                        </Button>
                    </>
                )
            }
            if (inputMode === 'upload') {
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-primary/50 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
                        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="font-semibold">Click the button below to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG (MAX. 5MB)</p>
                    </div>
                )
            }
            return null;
    }
  }
  
  const getActionButton = () => {
    const handleButtonClick = () => {
      if (inputMode === 'camera') {
        capturePhoto();
      } else if (inputMode === 'upload') {
        fileInputRef.current?.click();
      }
    };
    
    switch (verificationState) {
        case 'verifying':
        case 'success':
            return <Button className="w-full" size="lg" disabled>Verifying...</Button>
        case 'failed':
        case 'error':
            return <Button className="w-full" size="lg" onClick={() => {setInputMode('camera'); resetState();}}><RefreshCw className="mr-2" /> Try Again</Button>
        case 'preview':
            return (
                <div className="flex gap-4">
                    <Button variant="secondary" className="w-full" size="lg" onClick={() => {setInputMode('camera'); resetState();}}>Retake</Button>
                    <Button className="w-full" size="lg" onClick={handleVerification}>Looks Good, Verify</Button>
                </div>
            )
        default: // idle
             return <Button 
                className="w-full" 
                size="lg" 
                onClick={handleButtonClick} 
                disabled={inputMode === 'camera' && !videoRef.current?.srcObject}>
                <Camera className="mr-2"/> 
                {inputMode === 'camera' ? 'Capture & Verify' : 'Select File to Verify'}
            </Button>
    }
  }


  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-white">
       <div className="absolute inset-x-0 top-0 h-1/2 w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-blue-950/10 to-transparent" />
      
      <div className="relative z-20 w-full max-w-sm animate-in fade-in-0 zoom-in-95 duration-500">
          <Button onClick={() => router.push('/onboarding/live-photo')} variant="ghost" className="absolute -top-10 left-0 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Live Photo
          </Button>

        <Card className="w-full rounded-2xl bg-black/50 p-8 shadow-2xl backdrop-blur-lg">
           <div className="text-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Step 3: Aadhaar Verification</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    As an additional step for users in India, please capture or upload a clear image of your Aadhaar card.
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <Button variant={inputMode === 'camera' ? 'secondary' : 'ghost'} onClick={() => {setInputMode('camera'); resetState();}}>
                    <Camera className="mr-2 h-4 w-4"/> Scan Card
                </Button>
                <Button variant={inputMode === 'upload' ? 'secondary' : 'ghost'} onClick={() => { setInputMode('upload'); resetState(); }}>
                    <Upload className="mr-2 h-4 w-4"/> Upload File
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>

            <div className="relative w-full aspect-video rounded-lg bg-muted overflow-hidden flex items-center justify-center border-2 border-primary/50">
               {getCameraContent()}
            </div>
            
             <div className="mt-6">
                {getActionButton()}
             </div>
        </Card>
      </div>
    </main>
  )
}
