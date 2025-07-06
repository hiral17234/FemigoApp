
"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Camera, ShieldCheck, User, Loader2, RefreshCcw, AlertTriangle, Upload, FileCheck } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { verifyAadhaar, AadhaarVerificationOutput } from "@/ai/flows/aadhaar-verification-flow"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function VerifyAadhaarPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [name, setName] = useState("")
  const [extractedData, setExtractedData] = useState<AadhaarVerificationOutput | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [activeTab, setActiveTab] = useState("camera")
  const [cameraTrigger, setCameraTrigger] = useState(0)

  useEffect(() => {
    const savedName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
    if (savedName) {
      setName(savedName);
    }
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const getCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }

      try {
        setHasCameraPermission(null);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera permissions to use this feature.",
        });
      }
    };

    if (activeTab === "camera" && !imageDataUrl) {
      getCamera();
    }

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    }
  }, [activeTab, imageDataUrl, cameraTrigger, toast]);

  const capturePhoto = () => {
    if (videoRef.current?.srcObject && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext("2d")
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        const dataUrl = canvas.toDataURL("image/jpeg")
        setImageDataUrl(dataUrl)
        setExtractedData(null);
      }
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageDataUrl(e.target?.result as string);
        setExtractedData(null);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetState = (isCameraTab: boolean) => {
    setImageDataUrl(null);
    setExtractedData(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (isCameraTab) {
        setCameraTrigger(c => c + 1);
    }
  }
  
  const handleOcr = async () => {
    if (!imageDataUrl || !name) return;

    setIsVerifying(true);
    setExtractedData(null);

    try {
        const result = await verifyAadhaar({ photoDataUri: imageDataUrl, name });
        setExtractedData(result);
    } catch (error) {
        console.error("OCR failed:", error)
        toast({
            variant: "destructive",
            title: "OCR Failed",
            description: "Could not read the document. Please try again with a clearer image.",
        })
    } finally {
        setIsVerifying(false);
    }
  }

  const handleFinalVerification = () => {
    if (!extractedData) return;

    if (!extractedData.isAadhaarCard) {
      toast({ variant: 'destructive', title: 'Verification Failed', description: 'Could not detect a valid Aadhaar card. Please capture a clear image.' });
    } else if (!extractedData.isAadhaarValid) {
      toast({ variant: 'destructive', title: 'Invalid Aadhaar Card', description: `The Aadhaar number appears to be invalid. Please use a valid card.` });
    } else if (extractedData.gender !== 'female') {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'This platform is for female users only.' });
    } else if (!extractedData.isNameMatch) {
      toast({ variant: 'destructive', title: 'Name Mismatch', description: `The name on the card ("${extractedData.extractedName}") does not match the name you entered.` });
    } else {
      toast({ title: 'Aadhaar Verified Successfully ✅', description: 'Proceeding to next step.', className: 'bg-green-500 text-white' });
      router.push('/verify-phone');
    }
  }
  
  const renderCameraView = () => {
    if (imageDataUrl) {
      return <Image src={imageDataUrl} alt="Captured Aadhaar photo" layout="fill" objectFit="contain" />
    }

    if(hasCameraPermission === false) {
      return <div className="flex flex-col items-center gap-2 p-4 text-destructive"><AlertTriangle className="w-12 h-12" /><p className="text-center">Camera access was denied or is not available. Try uploading a file instead.</p></div>
    }

    if(hasCameraPermission === null) {
      return <div className="flex flex-col items-center gap-2 text-white/70"><Loader2 className="w-12 h-12 animate-spin" /><p>Starting camera...</p></div>
    }

    return <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
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
            <Card className="w-full">
            <CardContent className="p-6 space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold">Step 2: Aadhaar Verification</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                       Provide a photo of your Aadhaar card using your camera or by uploading a file.
                    </p>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="name">Name as per Aadhaar card</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="name"
                            placeholder="Your Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10"
                            disabled={isVerifying || !!extractedData}
                        />
                    </div>
                </div>

                <Tabs defaultValue="camera" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="camera">Use Camera</TabsTrigger>
                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                  </TabsList>
                  <TabsContent value="camera" className="space-y-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black flex items-center justify-center text-center">
                       {renderCameraView()}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    {!imageDataUrl ? (
                      <Button onClick={capturePhoto} disabled={hasCameraPermission !== true || isVerifying} className="w-full bg-[#EC008C] hover:bg-[#d4007a]">
                        <Camera className="mr-2"/> Capture Photo
                      </Button>
                    ) : (
                      <Button onClick={() => resetState(true)} variant="outline" className="w-full"><RefreshCcw className="mr-2"/>Retake</Button>
                    )}
                  </TabsContent>
                  <TabsContent value="upload">
                    <Label htmlFor="file-upload" className={cn("flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent", fileName && "border-green-500")}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {fileName ? <FileCheck className="w-8 h-8 mb-2 text-green-500" /> : <Upload className="w-8 h-8 mb-2 text-muted-foreground" />}
                            <p className="mb-1 text-sm text-muted-foreground">
                                {fileName ? <span className="font-semibold text-green-500">{fileName}</span> : <span>Click to upload or drag and drop</span>}
                            </p>
                            {!fileName && <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 5MB)</p>}
                        </div>
                        <Input id="file-upload" type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" />
                    </Label>
                    {imageDataUrl && <Button onClick={() => resetState(false)} variant="outline" className="w-full mt-4"><RefreshCcw className="mr-2"/>Change File</Button>}
                  </TabsContent>
                </Tabs>

                {imageDataUrl && !extractedData && (
                  <div className="pt-4 space-y-2">
                    <Button onClick={handleOcr} disabled={isVerifying || !name} className="w-full bg-[#EC008C] hover:bg-[#d4007a]">
                      {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                      Extract Information
                    </Button>
                    {!name && (
                      <p className="text-xs text-center text-red-400">Please enter your name to enable verification.</p>
                    )}
                  </div>
                )}

                {extractedData && (
                  <div className="space-y-4 pt-4 border-t">
                     <h3 className="font-semibold text-lg">Extracted Information</h3>
                     <div className="space-y-2 text-sm">
                       <p><strong>Aadhaar Number:</strong> {extractedData.extractedAadhaarNumber}</p>
                       <p><strong>Full Name:</strong> {extractedData.extractedName}</p>
                       <p><strong>Gender:</strong> <span className="capitalize">{extractedData.gender}</span></p>
                     </div>
                     <Button onClick={handleFinalVerification} className="w-full bg-green-600 hover:bg-green-700">
                       <ShieldCheck className="mr-2"/> Verify Now
                     </Button>
                  </div>
                )}
            </CardContent>
            </Card>
        </div>
    </div>
  )
}
