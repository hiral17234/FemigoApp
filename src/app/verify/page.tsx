"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, RefreshCcw, Loader2 } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { verifyGender } from "@/ai/flows/gender-verification-flow"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VerifyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null
    const getCameraPermission = async () => {
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
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        setHasCameraPermission(true)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
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
    getCameraPermission()

    return () => {
        stream?.getTracks().forEach(track => track.stop());
    }
  }, [toast])

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
        setCapturedImage(dataUrl)
      }
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
  }

  const handleVerify = async () => {
    if (!capturedImage) return
    setIsVerifying(true)
    try {
      const result = await verifyGender({ photoDataUri: capturedImage })
      if (result.gender === "female") {
        toast({
          title: "Verification Successful ✅",
          description: "You can now proceed.",
          variant: "default",
        })
        router.push("/dashboard")
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "This platform is reserved for female users only.",
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

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#f0f2ff] to-[#fff0f5] p-4 dark:from-gray-900 dark:to-black">
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-xl text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Verify Your Identity
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Please take a clear picture of your face to continue.
          </p>
        </div>

        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg bg-black">
          {capturedImage ? (
            <Image src={capturedImage} alt="Captured photo" fill={true} objectFit="cover" />
          ) : (
             <>
                <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                {hasCameraPermission === null && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                )}
             </>
          )}
        </div>
        
        {hasCameraPermission === false && (
            <Alert variant="destructive" className="text-left">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser settings to use this feature.
              </AlertDescription>
            </Alert>
        )}


        <canvas ref={canvasRef} className="hidden" />

        <div className="flex flex-col gap-4">
          {capturedImage ? (
            <>
              <Button
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full rounded-xl bg-gradient-to-r from-[#EC008C] to-[#FF55A5] py-3 text-lg font-normal text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl focus:outline-none"
              >
                {isVerifying ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : null}
                {isVerifying ? "Verifying..." : "Verify Now"}
              </Button>
              <Button
                onClick={retakePhoto}
                variant="outline"
                className="w-full rounded-xl"
                disabled={isVerifying}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retake
              </Button>
            </>
          ) : (
            <Button
              onClick={capturePhoto}
              disabled={!hasCameraPermission}
              className="w-full rounded-xl bg-[#EC008C] py-3 text-lg font-normal text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-[#d4007a] focus:outline-none"
            >
              <Camera className="mr-2 h-5 w-5" />
              Take Picture
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
