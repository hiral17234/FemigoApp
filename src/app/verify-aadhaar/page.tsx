"use client"

import { useState, useRef, useEffect, useCallback, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Camera, Loader2, RefreshCcw, Upload, FileCheck2, AlertTriangle, ShieldCheck } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

export default function VerifyAadhaarPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCameraInitializing, setIsCameraInitializing] = useState(true)
  const [uploadedAadhaar, setUploadedAadhaar] = useState<File | null>(null);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('userCountry') !== 'india') {
      router.push('/verify-phone');
      return;
    }
    
    if (capturedImage || error) {
      stopStream()
      return
    }

    let isMounted = true
    const getCameraStream = async () => {
      setIsCameraInitializing(true)
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (isMounted) {
          setStream(mediaStream)
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
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
    };

    getCameraStream();

    return () => {
      isMounted = false;
      stopStream();
    };
  }, [capturedImage, error, stopStream, toast, router]);

  const handleVideoReady = () => {
    if (videoRef.current && videoRef.current.readyState > 0) {
        setIsCameraInitializing(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || isCameraInitializing) {
      toast({
        variant: "destructive",
        title: "Camera Not Ready",
        description: "Please wait for the camera to initialize.",
      });
      return
    }

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
  };
  
  const retakePhoto = () => {
    setCapturedImage(null);
    setError(null);
  }

  const handleAadhaarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'application/pdf')) {
        setUploadedAadhaar(file);
    } else {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload a JPG, PNG, or PDF file.",
        });
    }
  };
  
  const handleContinue = async () => {
    if (!capturedImage || !uploadedAadhaar) return;
    toast({
        title: "Details captured!",
        description: "Proceeding to phone verification.",
    });
    router.push("/verify-phone");
  };

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
      return <Image src={capturedImage} alt="Captured photo" layout="fill" objectFit="cover" />
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
        href="/verify"
        className="absolute left-4 top-4 flex items-center gap-2 text-sm text-foreground transition-colors hover:text-primary md:left-8 md:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Aadhaar Verification
            </h1>
            <p className="text-muted-foreground">Securely verify your identity.</p>
        </header>

        <Card className="w-full">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Camera className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold">Step 1: Live Photo</h2>
                </div>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black flex items-center justify-center text-center">
                    {renderCameraView()}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                 {!capturedImage ? (
                    <Button onClick={capturePhoto} disabled={isCameraInitializing || !!error} className="w-full bg-[#EC008C] hover:bg-[#d4007a]">
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
                    <Button onClick={retakePhoto} variant="outline" className="w-full"><RefreshCcw className="mr-2"/>Retake Photo</Button>
                )}
            </div>

             <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold">Step 2: Upload Aadhaar</h2>
                </div>
                <Input
                  id="aadhaar-upload"
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleAadhaarUpload}
                  accept="image/jpeg,image/png,application/pdf"
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                    <Upload className="mr-2"/> Upload Document
                </Button>
                {uploadedAadhaar && (
                    <div className="flex items-center justify-center rounded-md border border-dashed p-4 text-sm text-green-600">
                        <FileCheck2 className="mr-2" />
                        <p>{uploadedAadhaar.name} uploaded successfully!</p>
                    </div>
                )}
             </div>

            <Button
              onClick={handleContinue}
              disabled={!capturedImage || !uploadedAadhaar}
              className="w-full bg-[#EC008C] hover:bg-[#d4007a] mt-4"
            >
              Verify & Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
