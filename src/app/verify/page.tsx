"use client"

import { useState, useRef, useEffect, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Camera, ShieldCheck, Heart, Loader2, Upload, RefreshCcw } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { verifyGender } from "@/ai/flows/gender-verification-flow"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

const toDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function VerifyPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [photoState, setPhotoState] = useState<'initial' | 'streaming' | 'captured'>('initial')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    }
  }, [stream])

  const handleStartCamera = async () => {
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
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream);
      setHasCameraPermission(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setPhotoState('streaming')
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
        setPhotoState('captured')
        stream?.getTracks().forEach(track => track.stop());
      }
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setPhotoState('initial')
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAadhaarFile(e.target.files[0])
    }
  }

  const handleVerify = async () => {
    if (!capturedImage || !fullName || !aadhaarFile) return
    
    setIsVerifying(true)
    try {
      const aadhaarPhotoDataUri = await toDataUri(aadhaarFile);
      const result = await verifyGender({
        photoDataUri: capturedImage,
        fullName,
        aadhaarPhotoDataUri,
      })
      
      if (result.gender === "female") {
        toast({
          title: "Verification Successful ✅",
          description: "You can now proceed.",
          className: "bg-green-500 text-white",
        })
        router.push("/dashboard")
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "This platform is reserved for female users only.",
        })
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
  
  const isVerifiable = capturedImage && fullName && aadhaarFile;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
              Femigo <Heart className="text-primary" fill="currentColor" />
            </h1>
            <p className="text-muted-foreground">Your Personal Safety Companion</p>
        </header>

        <Card className="w-full bg-card/50">
          <CardContent className="p-6 space-y-6">
            <div>
              <Progress value={33} className="mb-4 h-2" />
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">Step 1: Identity Verification</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                For community safety, we use AI to verify your identity. Please complete all sub-steps.
              </p>
            </div>

            <div className="space-y-4">
              {/* Part 1 */}
              <div>
                <h3 className="font-semibold mb-2">Part 1: Live Photo Verification</h3>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black flex items-center justify-center text-center">
                  {photoState === 'initial' && (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Camera className="w-12 h-12" />
                      <p>Click below to start your camera for a live photo.</p>
                    </div>
                  )}
                  {photoState === 'streaming' && <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />}
                  {photoState === 'captured' && capturedImage && <Image src={capturedImage} alt="Captured photo" fill={true} objectFit="cover" />}
                </div>
                {hasCameraPermission === false && (
                    <Alert variant="destructive" className="text-left mt-2">
                      <AlertTitle>Camera Access Required</AlertTitle>
                      <AlertDescription>
                        Please allow camera access in your browser settings to use this feature.
                      </AlertDescription>
                    </Alert>
                )}
                <canvas ref={canvasRef} className="hidden" />

                <div className="mt-4">
                    {photoState === 'initial' && <Button onClick={handleStartCamera} className="w-full bg-blue-500 hover:bg-blue-600"><Camera className="mr-2"/>Start Camera</Button>}
                    {photoState === 'streaming' && <Button onClick={capturePhoto} className="w-full"><Camera className="mr-2"/>Capture Photo</Button>}
                    {photoState === 'captured' && <Button onClick={retakePhoto} variant="outline" className="w-full"><RefreshCcw className="mr-2"/>Retake Photo</Button>}
                </div>
              </div>

              {/* Part 2 */}
              <div>
                <h3 className="font-semibold mb-2">Part 2: Full Name (as on Aadhaar card)</h3>
                <Input 
                  placeholder="e.g., Priya Singh" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isVerifying}
                />
              </div>

              {/* Part 3 */}
              <div>
                <h3 className="font-semibold mb-2">Part 3: Aadhaar Card Photo</h3>
                <Input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={isVerifying}
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full" disabled={isVerifying}>
                  <Upload className="mr-2" />
                  {aadhaarFile ? aadhaarFile.name : 'Choose File'}
                </Button>
              </div>
            </div>

            <Button
              onClick={handleVerify}
              disabled={!isVerifiable || isVerifying}
              className="w-full bg-blue-500 hover:bg-blue-600 text-lg py-6"
            >
              {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2" />}
              {isVerifying ? "Verifying..." : "Verify My Identity"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
