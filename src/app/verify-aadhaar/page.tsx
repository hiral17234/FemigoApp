
"use client"

import { useState, useRef, useEffect, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Camera, Loader2, RefreshCcw, Upload, User, ShieldCheck, ScanLine, KeyRound, AlertTriangle, SwitchCamera } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { extractAadhaarData, type AadhaarOcrOutput } from "@/ai/flows/aadhaar-verification-flow"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type VerificationStep = "capture" | "verify"
type CaptureMode = "camera" | "upload"
type FacingMode = "user" | "environment"

export default function VerifyAadhaarPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<VerificationStep>("capture")
  const [captureMode, setCaptureMode] = useState<CaptureMode>("camera")
  const [aadhaarImage, setAadhaarImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<AadhaarOcrOutput | null>(null)
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [userName, setUserName] = useState("")
  const [facingMode, setFacingMode] = useState<FacingMode>("environment")

  // Redirect if not from India
  useEffect(() => {
    const country = localStorage.getItem('userCountry')
    const name = localStorage.getItem('userName')
    if (country !== 'india') {
      router.push('/verify-phone');
    }
    if (name) {
      setUserName(name);
    }
  }, [router]);

  // Start/Stop Camera based on mode and step
  useEffect(() => {
    // We only need the camera if we are in capture step and camera mode
    if (step !== 'capture' || captureMode !== 'camera' || aadhaarImage) {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      return
    }

    let stream: MediaStream | null = null;
    const startCamera = async () => {
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

    // Cleanup function to stop the camera stream
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  }, [step, captureMode, aadhaarImage, toast, facingMode]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        processImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
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
      // If using the front camera, we need to flip the canvas to un-mirror the image
      if (facingMode === 'user') {
          context.translate(video.videoWidth, 0)
          context.scale(-1, 1)
      }
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
      const dataUrl = canvas.toDataURL("image/jpeg")
      processImage(dataUrl)
    }
  }

  const processImage = async (dataUrl: string) => {
    setAadhaarImage(dataUrl);
    setStep("verify");
    setIsExtracting(true);
    try {
      const result = await extractAadhaarData({ photoDataUri: dataUrl });
      setExtractedData(result);
    } catch (error: any) {
      toast({ variant: "destructive", title: "OCR Failed", description: error.message || "Could not read data from the image." });
      resetCapture();
    } finally {
      setIsExtracting(false);
    }
  }

  const resetCapture = () => {
    setAadhaarImage(null);
    setExtractedData(null);
    setStep("capture");
    setIsExtracting(false);
    setIsVerifying(false);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleFinalVerification = () => {
    setIsVerifying(true);
    if (!extractedData || !userName) {
        toast({ variant: "destructive", title: "Error", description: "Verification data is missing." });
        setIsVerifying(false);
        return;
    }

    const aadhaarRegex = /^\d{4}\s\d{4}\s\d{4}$/;
    const isNumberValid = aadhaarRegex.test(extractedData.aadhaarNumber);

    if (!isNumberValid) {
        toast({ variant: "destructive", title: "Verification Failed", description: "Invalid Aadhaar number format." });
        setIsVerifying(false);
        return;
    }

    // A simple name check (case-insensitive, checks if stored name is part of extracted name)
    if (!extractedData.fullName.toLowerCase().includes(userName.toLowerCase())) {
        toast({ variant: "destructive", title: "Name Mismatch", description: "The name on the card does not match the registered name." });
        setIsVerifying(false);
        return;
    }

    if (extractedData.gender !== "Female") {
        toast({ variant: "destructive", title: "Access Denied", description: "This platform is for women only." });
        setIsVerifying(false);
        return;
    }

    // All checks passed
    toast({ title: "Aadhaar Verified", description: "You can now proceed to phone verification.", className: "bg-green-500 text-white" });
    router.push("/verify-phone");
  }

  const handleToggleFacingMode = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }

  const renderCaptureUI = () => (
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
                      className={cn(
                        "h-full w-full object-cover",
                        facingMode === 'user' && "-scale-x-100" // Conditionally mirror the video preview
                      )}
                      autoPlay 
                      muted 
                      playsInline 
                    />
                    
                    {hasCameraPermission && captureMode === 'camera' && (
                       <Button
                            size="icon"
                            variant="ghost"
                            className="absolute bottom-2 right-2 bg-black/50 text-white hover:bg-black/75 rounded-full z-10"
                            onClick={handleToggleFacingMode}
                        >
                            <SwitchCamera className="h-5 w-5" />
                            <span className="sr-only">Switch Camera</span>
                        </Button>
                    )}

                    {hasCameraPermission === false && (
                        <Alert variant="destructive" className="absolute m-4 max-w-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Camera Access Denied</AlertTitle>
                        <AlertDescription>Please enable camera permissions in your browser settings and refresh the page.</AlertDescription>
                        </Alert>
                    )}
                    {captureMode === 'camera' && hasCameraPermission === null && !aadhaarImage && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-white/80">
                            <Loader2 className="h-12 w-12 animate-spin" />
                            <p>Starting camera...</p>
                        </div>
                    )}
                </div>
                <canvas ref={canvasRef} className="hidden" />

                <Button onClick={capturePhoto} disabled={hasCameraPermission !== true} className="w-full">
                    <Camera className="mr-2 h-4 w-4" /> Capture Photo
                </Button>
            </div>
        </TabsContent>
        <TabsContent value="upload" className="mt-4">
            <div 
                className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 5MB)</p>
            </div>
            <Input
                id="aadhaar-upload"
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/jpeg,image/png"
            />
        </TabsContent>
    </Tabs>
  );

  const renderVerifyUI = () => (
    <div className="space-y-6">
        {aadhaarImage && (
            <Image src={aadhaarImage} width={400} height={250} alt="Aadhaar Card" className="rounded-lg w-full object-contain" />
        )}

        <Card className="bg-muted/30">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <ScanLine /> Extracted Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isExtracting ? (
                    <div className="space-y-4 p-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-8 w-1/2" />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            <KeyRound className="w-5 h-5 text-muted-foreground" />
                            <p className="flex-1 text-sm font-mono tracking-wider">{extractedData?.aadhaarNumber || 'Not found'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-muted-foreground" />
                            <p className="flex-1 text-sm">{extractedData?.fullName || 'Not found'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                            <p className="flex-1 text-sm">{extractedData?.gender || 'Not found'}</p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button onClick={resetCapture} variant="outline" disabled={isExtracting || isVerifying}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Recapture
            </Button>
            <Button onClick={handleFinalVerification} disabled={isExtracting || isVerifying || !extractedData} className="bg-gradient-to-r from-[#EC008C] to-[#FF55A5] text-primary-foreground shadow-lg transition-transform hover:scale-105">
                {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Now
            </Button>
        </div>
    </div>
  )


  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
       <Link
        href="/verify"
        className="absolute left-4 top-4 flex items-center gap-2 text-sm text-foreground transition-colors hover:text-primary md:left-8 md:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Photo ID
      </Link>

      <div className="w-full max-w-lg">
        <Card className="w-full rounded-2xl bg-card p-6 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                Step 2: Aadhaar Verification
              </CardTitle>
              <CardDescription className="mx-auto max-w-sm pt-2">
                {step === "capture" 
                    ? "Please capture or upload a clear image of your Aadhaar card."
                    : "Review the extracted information and verify."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {step === 'capture' ? renderCaptureUI() : renderVerifyUI()}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}

    

    