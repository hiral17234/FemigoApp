"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, Loader2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { indianStates, indianStatesList } from "@/lib/indian-states-cities"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  age: z.coerce.number().min(18, "You must be at least 18 years old.").max(100),
  nickname: z.string().optional(),
  address1: z.string().min(3, "Address is required."),
  address2: z.string().optional(),
  address3: z.string().optional(),
  state: z.string({ required_error: "Please select a state." }),
  city: z.string({ required_error: "Please select a city." }),
  otherCity: z.string().optional(),
  altPhone: z.string().optional().refine((val) => !val || /^\d{10}$/.test(val), {
    message: "Please enter a valid 10-digit phone number.",
  }),
}).refine((data) => {
    if (data.city === "Other") {
        return !!data.otherCity && data.otherCity.trim().length > 0;
    }
    return true;
}, {
    message: "Please specify your city when 'Other' is selected.",
    path: ["otherCity"],
});

export default function OnboardingDetailsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      address1: "",
      address2: "",
      address3: "",
      altPhone: "",
      otherCity: "",
    },
  })

  const selectedState = form.watch("state")
  const selectedCity = form.watch("city")
  const [cities, setCities] = useState<string[]>([])

  useEffect(() => {
    if (selectedState) {
      const stateCities = indianStates[selectedState] || [];
      setCities([...stateCities, "Other"]);
      form.setValue("city", "")
    } else {
      setCities([])
    }
  }, [selectedState, form])


  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    console.log(values)
    toast({
      title: "Details Saved!",
      description: "Let's secure your account.",
    })
    
    setTimeout(() => {
      router.push("/onboarding/password")
    }, 1000)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-30"
        src="https://videos.pexels.com/video-files/2806063/2806063-hd_1080_1920_30fps.mp4"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <main className="relative z-20 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
            <Link
              href="/congratulations"
              className="mb-4 inline-flex items-center gap-2 text-sm text-purple-300/70 transition-colors hover:text-purple-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="w-full rounded-2xl border border-white/10 bg-black/10 p-8 shadow-2xl shadow-pink-500/10 backdrop-blur-xl">
              <h1 className="mb-2 text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Tell Us About Yourself
              </h1>
              <p className="mb-8 text-center text-purple-200/70">
                This information helps us personalize your experience.
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField control={form.control} name="age" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 25" {...field} className="bg-transparent border-white/20 backdrop-blur-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="nickname" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nickname (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="How should we call you?" {...field} className="bg-transparent border-white/20 backdrop-blur-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  
                  <div className="space-y-4">
                    <FormLabel>Address</FormLabel>
                    <FormField control={form.control} name="address1" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input placeholder="Address Line 1" {...field} className="bg-transparent border-white/20 backdrop-blur-sm" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="address2" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input placeholder="Address Line 2 (Optional)" {...field} className="bg-transparent border-white/20 backdrop-blur-sm" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="address3" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input placeholder="Address Line 3 (Optional)" {...field} className="bg-transparent border-white/20 backdrop-blur-sm" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-transparent border-white/20 backdrop-blur-sm"><SelectValue placeholder="Select your state" /></SelectTrigger>
                          </FormControl>
                          <SelectContent className="dark">
                            <ScrollArea className="h-72">
                              {indianStatesList.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={cities.length === 0}>
                           <FormControl>
                             <SelectTrigger className="bg-transparent border-white/20 backdrop-blur-sm"><SelectValue placeholder="Select your city" /></SelectTrigger>
                           </FormControl>
                           <SelectContent className="dark">
                             <ScrollArea className="h-72">
                               {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                             </ScrollArea>
                           </SelectContent>
                         </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  
                  {selectedCity === "Other" && (
                     <FormField control={form.control} name="otherCity" render={({ field }) => (
                        <FormItem>
                           <FormLabel>Please specify your city/village</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your city or village" {...field} className="bg-transparent border-white/20 backdrop-blur-sm" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                     )} />
                  )}

                  <FormField control={form.control} name="altPhone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternate Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="10-digit mobile number" {...field} className="bg-transparent border-white/20 backdrop-blur-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-lg font-semibold text-white py-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/50 hover:scale-105">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Next Step"}
                    <ChevronRight />
                  </Button>
                </form>
              </Form>
            </div>
        </div>
      </main>
    </div>
  )
}
