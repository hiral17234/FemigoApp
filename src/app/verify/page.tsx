
"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Camera, ShieldCheck, Heart, Loader2, RefreshCcw, AlertTriangle } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { verifyGender } from "@/ai/flows/gender-verification-flow"
import { Card, CardContent } from "@/components/ui/card"

export default function VerifyPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    // This effect handles getting and cleaning up the camera stream
    if (capturedImage) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    let isMounted = true;
    const getCameraStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (isMounted) {
          setStream(mediaStream);
          setHasCameraPermission(true);
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        if (isMounted) {
          setHasCameraPermission(false);
          toast({
            variant: "destructive",
            title: "Camera Access Denied",
            description: "Please enable camera permissions in your browser settings to continue.",
          });
        }
      }
    };

    getCameraStream();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage]);

  useEffect(() => {
    // This effect attaches the stream to the video element
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
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
  }
  
  const handleVerify = async () => {
    if (!capturedImage) return
    
    setIsVerifying(true)
    try {
      const result = await verifyGender({
        photoDataUri: capturedImage,
      })
      
      if (result.isPerson && result.gender === "female") {
        toast({
          title: "Verification Successful ✅",
          description: "Proceeding to the next step.",
          className: "bg-green-500 text-white",
        })
        
        const userCountry = typeof window !== 'undefined' ? localStorage.getItem('userCountry') : null;
        if (userCountry === 'india') {
          router.push("/verify-aadhaar")
        } else {
          router.push("/verify-phone")
        }

      } else {
        let description = "This platform is reserved for female users only."
        if (!result.isPerson) {
          description = "No person was detected in the photo. Please use a clear photo of your face."
        }
        toast({
          variant: "destructive",
          title: "Access Denied",
          description,
        })
        retakePhoto();
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

  const renderCameraView = () => {
    if (capturedImage) {
      return <Image src={capturedImage} alt="Captured photo" layout="fill" objectFit="cover" />
    }
    
    if (hasCameraPermission === false) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 p-4 text-destructive text-center">
                <AlertTriangle className="w-12 h-12" />
                <p>Camera access was denied.</p>
                <p className="text-xs">You may need to grant permission in your browser settings and refresh the page.</p>
            </div>
        )
    }

    if (!stream) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 text-white/70">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p>Starting camera...</p>
            </div>
        )
    }

    return (
        <video 
            ref={videoRef} 
            className="h-full w-full object-cover transform -scale-x-100" 
            autoPlay 
            muted 
            playsInline
        />
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
                       {renderCameraView()}
                    </div>
                    
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="mt-4">
                        {!capturedImage ? (
                           <Button onClick={capturePhoto} disabled={!stream || isVerifying} className="w-full col-span-2 bg-[#EC008C] hover:bg-[#d4007a]">
                            <Camera className="mr-2"/>
                            Capture Photo
                           </Button>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Button onClick={retakePhoto} variant="outline" className="w-full" disabled={isVerifying}><RefreshCcw className="mr-2"/>Retake</Button>
                                <Button
                                    onClick={handleVerify}
                                    disabled={isVerifying}
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
