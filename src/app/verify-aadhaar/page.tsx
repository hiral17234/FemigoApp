
"use client"

import { useState, useRef, useEffect, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Camera, Loader2, Upload, AlertTriangle, SwitchCamera, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { verifyAadhaar } from "@/ai/flows/aadhaar-verification-flow"
import { type AadhaarVerificationOutput } from "@/ai/types"

type CaptureMode = "camera" | "upload"
type FacingMode = "user" | "environment"
type VerificationStatus = "pending" | "processing" | "success" | "failed"

export default function VerifyAadhaarPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [captureMode, setCaptureMode] = useState<CaptureMode>("camera")
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [facingMode, setFacingMode] = useState<FacingMode>("environment")
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("pending")
  const [verificationResult, setVerificationResult] = useState<AadhaarVerificationOutput | null>(null)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_AI_KEY) {
      setApiKeyMissing(true)
    }
    
    const country = localStorage.getItem('userCountry')
    if (country !== 'india') {
      router.push('/verify-phone')
    }

    const name = localStorage.getItem('userName')
    if (name) {
      setUserName(name)
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'User name not found. Please go back to step 1.' })
    }
  }, [router, toast]);

  // Start/Stop Camera based on mode and permission
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
       if (captureMode !== 'camera' || capturedImage) {
        if (videoRef.current?.srcObject) {
          const mediaStream = videoRef.current.srcObject as MediaStream;
          mediaStream.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
        setHasCameraPermission(true)
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not access the camera. Please check permissions.' });
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  }, [captureMode, toast, facingMode, capturedImage]);

  const processImageAndContinue = async (aadhaarPhotoDataUri: string) => {
    setVerificationStatus("processing");

    try {
        const result = await verifyAadhaar({ aadhaarPhotoDataUri, userName });
        setVerificationResult(result);
        if (result.verificationPassed) {
            setVerificationStatus("success");
            toast({ title: "Verification Successful!", className: "bg-green-500 text-white" });
            localStorage.setItem('aadhaarImage', aadhaarPhotoDataUri); 
        } else {
            setVerificationStatus("failed");
            toast({ variant: "destructive", title: "Verification Failed", description: result.reason });
        }
    } catch (error) {
        console.error('Verification failed:', error);
        
        let reason = 'An unexpected error occurred. Please try again.';
        if (error instanceof Error) {
            reason = error.message;
        }

        setVerificationStatus("failed");
        setVerificationResult({ reason, verificationPassed: false });
        toast({ variant: "destructive", title: "Verification Error", description: reason });
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setCapturedImage(dataUrl);
        processImageAndContinue(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    if (!videoRef.current || !hasCameraPermission) {
        toast({ variant: "destructive", title: "Camera not ready" })
        return
    }
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext("2d")
    if (context) {
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
      const dataUrl = canvas.toDataURL("image/jpeg")
      setCapturedImage(dataUrl);
      processImageAndContinue(dataUrl);
    }
  }

  const handleToggleFacingMode = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }

  const resetVerification = () => {
    setVerificationStatus("pending");
    setVerificationResult(null);
    setCapturedImage(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const isProcessing = verificationStatus === "processing";

  const renderContent = () => {
    if (isProcessing || verificationStatus === "success" || verificationStatus === "failed") {
        return (
            <div className="space-y-4">
                {capturedImage && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                        <Image src={capturedImage} alt="Captured Aadhaar Card" layout="fill" objectFit="contain" />
                    </div>
                )}
                
                {isProcessing && (
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <h3 className="text-lg font-semibold">Verifying your Aadhaar...</h3>
                        <p className="text-sm text-muted-foreground">This may take a moment. Please don't close the page.</p>
                        <div className="w-full space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                )}

                {verificationStatus === "success" && verificationResult && (
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <div className="flex items-center gap-2 text-2xl font-bold text-green-500">
                          <CheckCircle className="h-8 w-8" />
                          <h3>Verification Successful</h3>
                        </div>

                        <div className="w-full space-y-3 rounded-lg border bg-background p-4 text-left text-foreground">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Name Matched</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{verificationResult.extractedName}</span>
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Gender Verified</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">Female</span>
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Aadhaar Number Valid</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-semibold tracking-wider">{verificationResult.extractedAadhaarNumber ? `**** **** ${verificationResult.extractedAadhaarNumber.slice(-4)}` : 'N/A'}</span>
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                            </div>
                        </div>

                        <Button onClick={() => router.push('/verify-phone')} className="w-full">
                            Continue to Next Step
                        </Button>
                         <Button onClick={resetVerification} className="w-full" variant="outline">
                            Verify Another
                        </Button>
                    </div>
                )}

                {verificationStatus === "failed" && verificationResult && (
                    <div className="flex flex-col items-center justify-center gap-4 text-center text-destructive">
                        <XCircle className="h-16 w-16" />
                        <h3 className="text-2xl font-bold">Verification Failed</h3>
                        <p className="text-red-700 dark:text-red-300 max-w-sm">{verificationResult.reason}</p>
                        <Button onClick={resetVerification} className="w-full" variant="outline">
                            Try Again
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    // Default view: Tabs for camera or upload
    return (
        <Tabs value={captureMode} onValueChange={(value) => setCaptureMode(value as CaptureMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="camera"><Camera className="mr-2 h-4 w-4" />Scan Card</TabsTrigger>
                <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" />Upload File</TabsTrigger>
            </TabsList>
            <TabsContent value="camera" className="mt-4">
                <div className="space-y-4">
                    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-black text-center">
                        <video 
                            ref={videoRef} 
                            className="h-full w-full object-cover"
                            autoPlay muted playsInline 
                        />
                        {hasCameraPermission && captureMode === 'camera' && (
                            <Button size="icon" variant="ghost" className="absolute bottom-2 right-2 bg-black/50 text-white hover:bg-black/75 rounded-full z-10" onClick={handleToggleFacingMode}>
                                <SwitchCamera className="h-5 w-5" />
                                <span className="sr-only">Switch Camera</span>
                            </Button>
                        )}
                        {hasCameraPermission === false && (
                            <Alert variant="destructive" className="absolute m-4 max-w-sm">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Camera Access Denied</AlertTitle>
                            </Alert>
                        )}
                    </div>
                    <Button onClick={capturePhoto} disabled={hasCameraPermission !== true || apiKeyMissing} className="w-full">
                        <Camera className="mr-2 h-4 w-4" /> Capture & Verify
                    </Button>
                </div>
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
                <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 5MB)</p>
                </div>
                <Input id="aadhaar-upload" type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/jpeg,image/png" disabled={apiKeyMissing} />
            </TabsContent>
        </Tabs>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#FFF1F5] to-white p-4 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black">
      <div className="w-full max-w-lg">
        <Link
          href="/verify"
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Live Photo
        </Link>
        <Card className="w-full rounded-2xl bg-card p-8 shadow-xl">
          <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
              Step 3: Aadhaar Verification
              </CardTitle>
              <CardDescription className="mx-auto max-w-sm pt-2">
                As an additional step for users in India, please capture or upload a clear image of your Aadhaar card.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              {apiKeyMissing && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Configuration Error</AlertTitle>
                  <AlertDescription>
                    The Google AI API key is missing. Please set it in your environment variables to proceed.
                  </AlertDescription>
                </Alert>
              )}
              {renderContent()}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
