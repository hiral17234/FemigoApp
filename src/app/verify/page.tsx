"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Camera, ShieldCheck, Heart, Loader2, RefreshCcw, AlertTriangle } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { verifyGender } from "@/ai/flows/gender-verification-flow"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function VerifyPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    stopStream()
    setCapturedImage(null)
    setIsVerifying(false)
    setHasCameraPermission(null)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Camera API not supported.")
      setHasCameraPermission(false)
      toast({
          variant: "destructive",
          title: "Unsupported Browser",
          description: "Your browser does not support the camera API.",
      })
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
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
  }, [stopStream, toast])

  useEffect(() => {
    startCamera()
    return () => {
      stopStream()
    }
  }, [startCamera, stopStream])


  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
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
    startCamera();
  }
  
  const handleVerify = async () => {
    if (!capturedImage) return
    
    setIsVerifying(true)
    try {
      const result = await verifyGender({
        photoDataUri: capturedImage,
      })
      
      if (result.gender === "female") {
        toast({
          title: "Verification Successful ✅",
          description: "You can now proceed.",
          className: "bg-green-500 text-white",
        })
        router.push("/dashboard")
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "This platform is reserved for female users only.",
        })
      }
    } catch (error) {
      console.error("Verification failed:", error)
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const isVerifiable = !!capturedImage;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                Femigo <Heart className="text-primary" fill="currentColor" />
                </h1>
                <p className="text-muted-foreground">Your Personal Safety Companion</p>
            </header>

            <Card className="w-full">
            <CardContent className="p-6 space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold">Step 1: Identity Verification</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Please take a clear picture of your face. This helps us ensure a safe and supportive space for all.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black flex items-center justify-center text-center">
                        <video 
                            ref={videoRef} 
                            className={cn(
                                "h-full w-full object-cover transform -scale-x-100", 
                                { 'hidden': !!capturedImage }
                            )} 
                            autoPlay 
                            muted 
                            playsInline 
                        />

                        {capturedImage && (
                            <Image src={capturedImage} alt="Captured photo" layout="fill" objectFit="cover" className="transform -scale-x-100"/>
                        )}

                        {hasCameraPermission === null && !capturedImage && (
                            <div className="flex flex-col items-center gap-2 text-white/70">
                                <Loader2 className="w-12 h-12 animate-spin" />
                                <p>Starting camera...</p>
                            </div>
                        )}
                        
                         {hasCameraPermission === false && (
                            <div className="flex flex-col items-center gap-2 text-destructive">
                                <AlertTriangle className="w-12 h-12" />
                                <p>Camera access was denied.</p>
                                <Button variant="outline" size="sm" onClick={startCamera}>Try Again</Button>
                            </div>
                        )}
                    </div>
                    
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="mt-4">
                        {!capturedImage ? (
                           <Button onClick={capturePhoto} disabled={hasCameraPermission !== true} className="w-full col-span-2 bg-[#EC008C] hover:bg-[#d4007a]">
                            {hasCameraPermission !== true ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Camera className="mr-2"/>}
                            {hasCameraPermission === true ? "Capture Photo" : (hasCameraPermission === false ? "Camera Disabled" : "Waiting for camera...")}
                           </Button>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Button onClick={retakePhoto} variant="outline" className="w-full"><RefreshCcw className="mr-2"/>Retake</Button>
                                <Button
                                    onClick={handleVerify}
                                    disabled={!isVerifiable || isVerifying}
                                    className="w-full bg-[#EC008C] hover:bg-[#d4007a]"
                                >
                                    {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2" />}
                                    {isVerifying ? "Verifying..." : "Verify Now"}
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
