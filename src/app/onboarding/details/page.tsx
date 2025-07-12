

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { countries } from "@/lib/countries"
import { locationData } from "@/lib/location-data"

const detailsSchema = z.object({
  age: z.coerce
    .number({ invalid_type_error: "Please enter a valid age." })
    .min(13, { message: "You must be at least 13 years old to use this service." })
    .max(120, { message: "Please enter a valid age." }),
  nickname: z.string().optional(),
  address1: z.string().min(3, "Address line is too short."),
  state: z.string().min(1, "Please select your state/ut."),
  city: z.string().min(1, "Please select your city."),
  altPhone: z.string().optional(),
})

type DetailsFormValues = z.infer<typeof detailsSchema>

export default function DetailsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [userCountry, setUserCountry] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string>("")
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
        altPhone: ''
    }
  })

  useEffect(() => {
    const country = localStorage.getItem("userCountry")
    if (!country) {
        toast({ variant: 'destructive', title: 'Error', description: 'Country not found. Please start over.' });
        router.push('/signup');
        return;
    }
    setUserCountry(country)
  }, [router, toast])
  
  const countryConfig = userCountry ? locationData[userCountry] : null

  const onSubmit: SubmitHandler<DetailsFormValues> = async (data) => {
    setIsSubmitting(true)
    
    try {
        // Save details to localStorage
        localStorage.setItem("userAge", data.age.toString());
        localStorage.setItem("userAddress1", data.address1);
        localStorage.setItem("userState", data.state);
        localStorage.setItem("userCity", data.city);
        if (data.nickname) localStorage.setItem("userNickname", data.nickname);
        if (data.altPhone) localStorage.setItem("userAltPhone", data.altPhone);

        toast({
            title: "Details Saved!",
            description: "Proceeding to the next step.",
        })
        router.push("/onboarding/email-verification")

    } catch (error) {
        console.error("Failed to save details to localStorage:", error);
        toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save your details. Please try again.' });
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-white">
      <div className="absolute inset-x-0 top-0 h-1/2 w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-blue-950/10 to-transparent" />

      <div className="relative z-20 w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="absolute top-0 left-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
        </div>

        <div className="mb-8 mt-16 px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Tell Us About Yourself
          </h1>
           <p className="text-muted-foreground mt-2 text-sm">This information helps us personalize your experience.</p>
          <Progress value={(4 / 6) * 100} className="mt-4 h-2 bg-gray-700" />
        </div>

        <div className="w-full rounded-2xl border-none bg-black/50 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label htmlFor="age" className="text-sm font-medium">Age</label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Your Age"
                  {...register("age")}
                  className={errors.age ? "border-destructive" : ""}
                />
                {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="nickname" className="text-sm font-medium">Nickname (Optional)</label>
                <Input
                  id="nickname"
                  placeholder="e.g. Alex"
                  {...register("nickname")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="address1" className="text-sm font-medium">Address</label>
              <Input
                id="address1"
                placeholder="House No, Building, Street, Area"
                {...register("address1")}
                className={errors.address1 ? "border-destructive" : ""}
              />
               {errors.address1 && <p className="text-xs text-destructive">{errors.address1.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">State / UT</label>
                 <Select onValueChange={(value) => {
                     setValue("state", value, { shouldValidate: true });
                     setSelectedState(value);
                     setValue("city", "", { shouldValidate: true }); // Reset city on state change
                 }}>
                    <SelectTrigger className={errors.state ? "border-destructive" : ""}>
                        <SelectValue placeholder={`Select your ${countryConfig?.regionLabel || 'state / ut'}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {countryConfig?.regions?.map((region) => (
                            <SelectItem key={region.name} value={region.name}>{region.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
              </div>

               <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                 <Select onValueChange={(value) => setValue("city", value, { shouldValidate: true })} value={watch("city")}>
                    <SelectTrigger className={errors.city ? "border-destructive" : ""} disabled={!selectedState}>
                        <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                        {countryConfig?.regions?.find(r => r.name === selectedState)?.cities.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>
            </div>

             <div className="space-y-2">
                <label htmlFor="altPhone" className="text-sm font-medium">Alternate Phone Number (Optional)</label>
                 <div className="flex gap-2">
                    <Select defaultValue={countries.find(c => c.value === userCountry)?.phone || '91'}>
                        <SelectTrigger className="w-28">
                            <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                             {countries.map(c => <SelectItem key={c.code} value={c.phone}>+{c.phone}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input id="altPhone" type="tel" placeholder="Phone number" {...register("altPhone")} />
                 </div>
            </div>


            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-3 text-lg" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Next Step"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
