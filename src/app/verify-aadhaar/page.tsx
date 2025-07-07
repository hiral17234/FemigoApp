
"use client"

import { useState, useRef, useEffect, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Camera, Loader2, Upload, AlertTriangle, SwitchCamera } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type CaptureMode = "camera" | "upload"
type FacingMode = "user" | "environment"

export default function VerifyAadhaarPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [captureMode, setCaptureMode] = useState<CaptureMode>("camera")
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [facingMode, setFacingMode] = useState<FacingMode>("environment")

  // Redirect if not from India
  useEffect(() => {
    const country = localStorage.getItem('userCountry')
    if (country !== 'india') {
      router.push('/verify-phone');
    }
  }, [router]);

  // Start/Stop Camera based on mode
  useEffect(() => {
    if (captureMode !== 'camera') {
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

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  }, [captureMode, toast, facingMode]);

  const processImageAndContinue = (dataUrl: string) => {
    setIsProcessing(true);
    if (typeof window !== 'undefined') {
        localStorage.setItem('aadhaarImage', dataUrl);
    }
    toast({
        title: "Image Saved",
        description: "Proceeding to the next step.",
    });
    // AI check is removed, navigating to the next step.
    router.push("/verify-phone");
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
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
      if (facingMode === 'user') {
          context.translate(video.videoWidth, 0)
          context.scale(-1, 1)
      }
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
      const dataUrl = canvas.toDataURL("image/jpeg")
      processImageAndContinue(dataUrl)
    }
  }

  const handleToggleFacingMode = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
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
                                facingMode === 'user' && "-scale-x-100"
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
                                <AlertDescription>Please enable camera permissions and refresh the page.</AlertDescription>
                                </Alert>
                            )}
                            {captureMode === 'camera' && hasCameraPermission === null && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-white/80">
                                    <Loader2 className="h-12 w-12 animate-spin" />
                                    <p>Starting camera...</p>
                                </div>
                            )}
                        </div>

                        <Button onClick={capturePhoto} disabled={hasCameraPermission !== true || isProcessing} className="w-full">
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Camera className="mr-2 h-4 w-4" /> Capture & Continue
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
                     {isProcessing && <div className="mt-4 flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /><span>Processing...</span></div>}
                    <Input
                        id="aadhaar-upload"
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png"
                        disabled={isProcessing}
                    />
                </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
