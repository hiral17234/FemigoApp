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

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCameraInitializing, setIsCameraInitializing] = useState(true)

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  useEffect(() => {
    if (capturedImage || error) {
      stopStream()
      return
    }

    let isMounted = true
    const getCameraStream = async () => {
      setIsCameraInitializing(true)
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        })
        if (isMounted) {
          setStream(mediaStream)
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
        if (isMounted) {
          const errorMessage = "Camera access denied. Please enable permissions and refresh the page."
          setError(errorMessage)
          toast({
            variant: "destructive",
            title: "Camera Access Denied",
            description: "Please enable permissions and refresh the page.",
          })
        }
      }
    }

    getCameraStream()

    return () => {
      isMounted = false
      stopStream()
    }
  }, [capturedImage, error, stopStream, toast])

  const handleVideoReady = () => {
    if (videoRef.current && videoRef.current.readyState > 0) {
        setIsCameraInitializing(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || isCameraInitializing) {
      toast({
        variant: "destructive",
        title: "Camera not ready",
        description: "Please wait for the camera to initialize.",
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
    setError(null) 
  }

  const handleContinue = () => {
    if (!capturedImage) return

    const country =
      typeof window !== "undefined" ? localStorage.getItem("userCountry") : null
    if (country === "india") {
      router.push("/verify-aadhaar")
    } else {
      router.push("/verify-phone")
    }
  }

  const renderCameraView = () => {
    if (error) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Camera Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    if (capturedImage) {
      return (
        <Image
          src={capturedImage}
          alt="Captured photo of user"
          layout="fill"
          objectFit="cover"
        />
      )
    }

    return (
      <>
        <video
          ref={videoRef}
          className="h-full w-full -scale-x-100 object-cover"
          autoPlay
          muted
          playsInline
          onLoadedData={handleVideoReady}
        />
        {isCameraInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-white/80">
            <Loader2 className="h-12 w-12 animate-spin" />
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
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Step 1: Photo Capture
          </h1>
          <p className="text-muted-foreground">
            Please take a clear picture of your face.
          </p>
        </header>

        <Card className="w-full">
          <CardContent className="space-y-4 p-6">
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-black text-center">
              {renderCameraView()}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-4">
              {!capturedImage ? (
                <Button
                  onClick={capturePhoto}
                  disabled={isCameraInitializing || !!error}
                  className="w-full bg-[#EC008C] hover:bg-[#d4007a]"
                >
                  {isCameraInitializing && !error ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2" />
                      Capture Photo
                    </>
                  )}
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCcw className="mr-2" />
                    Retake
                  </Button>
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
