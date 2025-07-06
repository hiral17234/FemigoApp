"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Camera, Loader2, RefreshCcw, AlertTriangle } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VerifyPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (capturedImage) {
        stopStream();
        return;
    }

    let isMounted = true;
    const getCameraStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (isMounted) {
          setHasCameraPermission(true);
          setStream(mediaStream);
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        if (isMounted) {
          setHasCameraPermission(false);
          toast({
              variant: "destructive",
              title: "Camera Access Denied",
              description: "Please enable camera permissions in your browser settings.",
          })
        }
      }
    };

    getCameraStream();

    return () => {
      isMounted = false;
      stopStream();
    };
  }, [capturedImage, stopStream, toast]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 3) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.translate(video.videoWidth, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Camera Not Ready",
        description: "The camera is still initializing. Please wait a moment and try again.",
      });
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsCameraReady(false);
  }
  
  const handleContinue = () => {
    if (!capturedImage) return
    
    // In a real app, you'd save the image dataUrl to state or send to a server
    // For now, we'll just navigate based on country
    
    const country = typeof window !== 'undefined' ? localStorage.getItem('userCountry') : null;
    if (country === 'india') {
      router.push("/verify-aadhaar");
    } else {
      router.push("/verify-phone");
    }
  }

  const renderCameraView = () => {
    if (hasCameraPermission === false) {
        return (
            <Alert variant="destructive" className="m-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Access Denied</AlertTitle>
                <AlertDescription>
                    You must grant camera permission in your browser settings to continue.
                </AlertDescription>
            </Alert>
        )
    }
    
    if (hasCameraPermission === null && !capturedImage) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-white/70 h-full">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p>Requesting camera access...</p>
        </div>
      )
    }

    if (capturedImage) {
      return <Image src={capturedImage} alt="Captured photo" layout="fill" objectFit="cover" />
    }

    return (
        <>
            <video 
                ref={videoRef} 
                className="h-full w-full object-cover transform -scale-x-100" 
                autoPlay 
                muted 
                playsInline
                onCanPlay={() => setIsCameraReady(true)}
            />
            {!isCameraReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70 bg-black/50">
                    <Loader2 className="w-12 h-12 animate-spin" />
                    <p>Starting camera...</p>
                </div>
            )}
        </>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-4">
        <Link
            href="/signup"
            className="absolute left-4 top-4 flex items-center gap-2 text-sm text-foreground transition-colors hover:text-primary md:left-8 md:top-8"
        >
            <ArrowLeft className="h-4 w-4" />
            Back
        </Link>
        <div className="w-full max-w-md">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Step 1: Photo Capture
                </h1>
                <p className="text-muted-foreground">Please take a clear picture of your face.</p>
            </header>

            <Card className="w-full">
            <CardContent className="p-6 space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black flex items-center justify-center text-center">
                    {renderCameraView()}
                </div>
                
                <canvas ref={canvasRef} className="hidden" />

                <div className="mt-4">
                    {!capturedImage ? (
                        <Button onClick={capturePhoto} disabled={!isCameraReady} className="w-full bg-[#EC008C] hover:bg-[#d4007a]">
                        {!isCameraReady && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {isCameraReady ? <><Camera className="mr-2"/>Capture Photo</> : 'Initializing Camera...' }
                        </Button>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <Button onClick={retakePhoto} variant="outline" className="w-full"><RefreshCcw className="mr-2"/>Retake</Button>
                            <Button
                                onClick={handleContinue}
                                className="w-full bg-[#EC008C] hover:bg-[#d4007a]"
                            >
                                Continue
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
            </Card>
        </div>
    </div>
  )
}
