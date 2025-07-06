"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, ShieldCheck, User, Loader2, RefreshCcw, AlertTriangle } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { verifyAadhaar } from "@/ai/flows/aadhaar-verification-flow"
import { Card, CardContent } from "@/components/ui/card"

export default function VerifyAadhaarPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [name, setName] = useState("")

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null);
    }
  }

  const startStream = async () => {
    setCapturedImage(null);
    setIsVerifying(false);
    
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Camera API not supported.")
      setHasCameraPermission(false)
      toast({
          variant: "destructive",
          title: "Unsupported Browser",
          description: "Your browser does not support the camera API.",
      })
      return;
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      setStream(newStream);
      setHasCameraPermission(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      setHasCameraPermission(false)
      toast({
        variant: "destructive",
        title: "Camera Access Denied",
        description: "Please enable camera permissions in your browser settings to continue.",
      })
    }
  }

  useEffect(() => {
    startStream()
    
    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext("2d")
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        const dataUrl = canvas.toDataURL("image/jpeg")
        setCapturedImage(dataUrl)
        stopStream()
      }
    } else {
        toast({
            variant: "destructive",
            title: "Camera Error",
            description: "Could not capture photo. Please ensure camera is enabled and try again.",
        })
    }
  }

  const retakePhoto = () => {
    startStream();
  }
  
  const handleVerify = async () => {
    if (!capturedImage || !name) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please enter your name and capture a photo of your Aadhaar card.",
        })
        return
    }
    
    setIsVerifying(true)
    try {
      const result = await verifyAadhaar({
        photoDataUri: capturedImage,
        name: name,
      })
      
      if (result.isAadhaarCard && result.isNameMatch) {
        toast({
          title: "Aadhaar Verified Successfully ✅",
          description: "Welcome to Femigo!",
          className: "bg-green-500 text-white",
        })
        router.push("/dashboard")
      } else {
        let description = "Verification failed. Please try again."
        if (!result.isAadhaarCard) {
            description = "Could not detect a valid Aadhaar card. Please capture a clear image."
        } else if (!result.isNameMatch) {
            description = `Name mismatch. We extracted "${result.extractedName}" from the card, which does not match the name you entered. Please check and try again.`
        }

        toast({
          variant: "destructive",
          title: "Verification Failed",
          description,
        })
      }
    } catch (error) {
      console.error("Aadhaar verification failed:", error)
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: "Something went wrong during verification. Please try again.",
      })
    } finally {
      setIsVerifying(false)
    }
  }
  
  const renderCameraView = () => {
    if(hasCameraPermission === null) {
        return (
            <div className="flex flex-col items-center gap-2 text-white/70">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p>Starting camera...</p>
            </div>
        )
    }

    if(hasCameraPermission === false) {
        return (
            <div className="flex flex-col items-center gap-2 text-destructive">
                <AlertTriangle className="w-12 h-12" />
                <p className="text-center">Camera access was denied.</p>
                <Button variant="outline" size="sm" onClick={startStream}>Try Again</Button>
            </div>
        )
    }

    if(capturedImage) {
        return <Image src={capturedImage} alt="Captured Aadhaar photo" layout="fill" objectFit="contain" />
    }

    return (
        <video 
            ref={videoRef} 
            className="h-full w-full object-cover" 
            autoPlay 
            muted 
            playsInline 
        />
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
            <Card className="w-full">
            <CardContent className="p-6 space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold">Step 2: Aadhaar Verification</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Enter your name exactly as it appears on your Aadhaar card, then capture a clear photo of the card.
                    </p>
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name as per Aadhaar card</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="name"
                            placeholder="Your Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10"
                            disabled={isVerifying || !!capturedImage}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black flex items-center justify-center text-center">
                       {renderCameraView()}
                    </div>
                    
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="mt-4">
                        {!capturedImage ? (
                           <Button onClick={capturePhoto} disabled={!stream} className="w-full col-span-2 bg-[#EC008C] hover:bg-[#d4007a]">
                            {!stream && hasCameraPermission !== false ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Camera className="mr-2"/>}
                            {stream ? "Capture Aadhaar Photo" : (hasCameraPermission === false ? "Camera Disabled" : "Waiting for camera...")}
                           </Button>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Button onClick={retakePhoto} variant="outline" className="w-full" disabled={isVerifying}><RefreshCcw className="mr-2"/>Retake</Button>
                                <Button
                                    onClick={handleVerify}
                                    disabled={!capturedImage || isVerifying || !name}
                                    className="w-full bg-[#EC008C] hover:bg-[#d4007a]"
                                >
                                    {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2" />}
                                    {isVerifying ? "Verifying..." : "Verify Aadhaar"}
                                </Button>
                           </div>
                        )}
                    </div>
                </div>
            </CardContent>
            </Card>
        </div>
    </div>
  )
}
