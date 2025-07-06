
"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Camera, Loader2, RefreshCcw, AlertTriangle, CheckCircle, UserCheck } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VerifyIdentityPage() {
  const router = useRouter()
  const { toast } = useToast()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (capturedImage || hasCameraPermission === false) {
      return;
    }

    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [capturedImage, toast, hasCameraPermission]);


  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !hasCameraPermission) {
      toast({
        variant: "destructive",
        title: "Camera not ready",
        description: "Please grant camera permission and wait for the feed to appear.",
      })
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext("2d")

    if (context) {
      context.translate(video.videoWidth, 0)
      context.scale(-1, 1)
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
      const dataUrl = canvas.toDataURL("image/jpeg")
      setCapturedImage(dataUrl)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setHasCameraPermission(null)
  }
  
  const handleContinue = () => {
    if (!capturedImage) return;
    setIsProcessing(true);

    if (typeof window !== 'undefined') {
        localStorage.setItem('userLivePhoto', capturedImage);
    }

    toast({
        title: 'Photo Captured!',
        description: "Next, let's verify your identity document.",
        className: 'bg-green-500 text-white',
    });
    
    setTimeout(() => {
        const country = typeof window !== 'undefined' ? localStorage.getItem('userCountry') : null;
        if (country === 'india') {
        router.push('/verify-aadhaar');
        } else {
        router.push('/verify-phone');
        }
    }, 500);
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#FFF1F5] to-white p-4 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black">
      <div className="w-full max-w-lg">
        <Link
          href="/signup"
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Account Details
        </Link>
        <Card className="w-full rounded-2xl p-6 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight text-foreground">
              <UserCheck /> Step 2: Live Photo Capture
            </CardTitle>
            <CardDescription className="mx-auto max-w-sm pt-2">
               Please take a clear, live photo of your face. This will be compared with your ID in the next step.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-black text-center">
              {capturedImage ? (
                <Image
                  src={capturedImage}
                  alt="Captured photo of user"
                  fill
                  className="object-cover"
                />
              ) : (
                  <>
                      <video
                          ref={videoRef}
                          className="h-full w-full -scale-x-100 object-cover"
                          autoPlay
                          muted
                          playsInline
                      />
                      {hasCameraPermission === false && (
                          <Alert variant="destructive" className="absolute m-4 max-w-sm">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Camera Access Denied</AlertTitle>
                              <AlertDescription>Please enable camera permissions in your browser settings and refresh the page.</AlertDescription>
                          </Alert>
                      )}
                      {hasCameraPermission === null && !capturedImage && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-white/80">
                              <Loader2 className="h-12 w-12 animate-spin" />
                              <p>Starting camera...</p>
                          </div>
                      )}
                  </>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {!capturedImage ? (
              <Button
                  onClick={capturePhoto}
                  disabled={hasCameraPermission !== true || isProcessing}
                  className="w-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Photo
                </Button>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  disabled={isProcessing}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Retake
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-[#EC008C] to-[#FF55A5] text-primary-foreground shadow-lg transition-transform hover:scale-105"
                >
                  {isProcessing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save & Continue
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
