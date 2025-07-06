
"use client"

import { useState, useRef, useEffect, ChangeEvent } from "react"
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
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [uploadedAadhaar, setUploadedAadhaar] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('userCountry') !== 'india') {
      router.push('/verify-phone');
    }
  }, [router]);

  useEffect(() => {
    if (capturedImage) {
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
  }, [capturedImage, toast]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !hasCameraPermission) {
       toast({
        variant: "destructive",
        title: "Camera not ready",
        description: "Please grant camera permission and wait for the feed to appear.",
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
    setIsVerifying(true);
    toast({
        title: "Details captured!",
        description: "Proceeding to phone verification.",
    });
    router.push("/verify-phone");
  };


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
                    {capturedImage ? (
                        <Image src={capturedImage} alt="Captured photo" fill objectFit="cover" />
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
                            {hasCameraPermission === null && (
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
                    <Button onClick={capturePhoto} disabled={!hasCameraPermission || isVerifying} className="w-full bg-[#EC008C] hover:bg-[#d4007a]">
                      <Camera className="mr-2" />
                      Capture Photo
                    </Button>
                ) : (
                    <Button onClick={retakePhoto} variant="outline" className="w-full" disabled={isVerifying}><RefreshCcw className="mr-2"/>Retake Photo</Button>
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
                  disabled={isVerifying}
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full" disabled={isVerifying}>
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
              disabled={!capturedImage || !uploadedAadhaar || isVerifying}
              className="w-full bg-[#EC008C] hover:bg-[#d4007a] mt-4"
            >
              {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
