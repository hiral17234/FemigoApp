

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, type SubmitHandler, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Loader2, ChevronsUpDown, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

import { useToast } from "@/hooks/use-toast"
import { locationData } from "@/lib/location-data"
import { cn } from "@/lib/utils"

const detailsSchema = z.object({
  age: z.coerce
    .number({ invalid_type_error: "Please enter a valid age." })
    .min(3, { message: "You must be at least 3 years old to use this service." })
    .max(120, { message: "Please enter a valid age." }),
  nickname: z.string().optional(),
  address1: z.string().min(3, "Address line is too short."),
  address2: z.string().optional(),
  address3: z.string().optional(),
  state: z.string().min(1, "Please select or enter your state/ut."),
  city: z.string().min(1, "Please select or enter your city."),
  altPhone: z.string().optional(),
  otherState: z.string().optional(),
  otherCity: z.string().optional(),
}).refine(data => {
    if (data.state === 'Other' && !data.otherState) return false;
    return true;
}, {
    message: "Please enter your state.",
    path: ["otherState"],
}).refine(data => {
    if (data.city === 'Other' && !data.otherCity) return false;
    return true;
}, {
    message: "Please enter your city.",
    path: ["otherCity"],
});

type DetailsFormValues = z.infer<typeof detailsSchema>

export default function DetailsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [userCountry, setUserCountry] = useState<string | null>(null)
  const [statePopoverOpen, setStatePopoverOpen] = useState(false)
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false)
  
  const stateTriggerRef = useRef<HTMLButtonElement>(null);
  const cityTriggerRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
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
  const selectedState = watch("state");
  const selectedCity = watch("city");

  const onSubmit: SubmitHandler<DetailsFormValues> = async (data) => {
    setIsSubmitting(true)
    
    const finalState = data.state === 'Other' ? data.otherState : data.state;
    const finalCity = data.city === 'Other' ? data.otherCity : data.city;

    try {
        localStorage.setItem("userAge", data.age.toString());
        localStorage.setItem("userAddress1", data.address1);
        if (data.address2) localStorage.setItem("userAddress2", data.address2);
        if (data.address3) localStorage.setItem("userAddress3", data.address3);
        if(finalState) localStorage.setItem("userState", finalState);
        if(finalCity) localStorage.setItem("userCity", finalCity);
        if (data.nickname) localStorage.setItem("userNickname", data.nickname);
        if (data.altPhone) localStorage.setItem("userAltPhone", data.altPhone);

        toast({
            title: "Details Saved!",
            description: "Proceeding to the next step.",
        })
        router.push("/onboarding/password")

    } catch (error) {
        console.error("Failed to save details to localStorage:", error);
        toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save your details. Please try again.' });
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4 text-white">
      <video
        src="https://videos.pexels.com/video-files/26621651/11977308_2560_1440_30fps.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-1/2 left-1/2 w-full h-full min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0 opacity-50"
      />
      <div className="absolute inset-0 z-10 bg-black/30" />

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
          <Progress value={(5 / 6) * 100} className="mt-4 h-2 bg-gray-700" />
        </div>

        <div className="w-full rounded-2xl border border-white/30 p-8 shadow-[0_0_20px_theme(colors.white/0.3)]">
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
                placeholder="Address Line 1"
                {...register("address1")}
                className={errors.address1 ? "border-destructive" : ""}
              />
              <Input
                id="address2"
                placeholder="Address Line 2 (Optional)"
                {...register("address2")}
              />
              <Input
                id="address3"
                placeholder="Address Line 3 (Optional)"
                {...register("address3")}
              />
               {errors.address1 && <p className="text-xs text-destructive">{errors.address1.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">State / UT</label>
                 <Controller
                    control={control}
                    name="state"
                    render={({ field }) => (
                        <Popover open={statePopoverOpen} onOpenChange={setStatePopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button ref={stateTriggerRef} variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground", errors.state && "border-destructive")}>
                                    {field.value ? (field.value === 'Other' ? 'Other' : countryConfig?.regions?.find(r => r.name === field.value)?.name) : `Select ${countryConfig?.regionLabel || 'state'}`}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 country-list-popover">
                                <Command>
                                    <CommandInput placeholder={`Search ${countryConfig?.regionLabel || 'state'}...`} />
                                    <CommandList>
                                        <CommandEmpty>No region found.</CommandEmpty>
                                        <CommandGroup>
                                            {countryConfig?.regions?.map((region) => (
                                                <CommandItem key={region.name} value={region.name} onSelect={() => { setValue("state", region.name, { shouldValidate: true }); setValue("city", "", { shouldValidate: true }); setStatePopoverOpen(false); stateTriggerRef.current?.blur(); }}>
                                                    <Check className={cn("mr-2 h-4 w-4", field.value === region.name ? "opacity-100" : "opacity-0")} />
                                                    {region.name}
                                                </CommandItem>
                                            ))}
                                            <CommandItem key="Other" value="Other" onSelect={() => { setValue("state", "Other", { shouldValidate: true }); setStatePopoverOpen(false); stateTriggerRef.current?.blur(); }}>
                                                 <Check className={cn("mr-2 h-4 w-4", field.value === "Other" ? "opacity-100" : "opacity-0")} />
                                                 Other
                                            </CommandItem>
                                        </CommandGroup>
                                    </CommandList>
                                    <div className="p-2 text-center border-t border-border">
                                        <p className="text-xs font-bold text-red-500">Please press enter to select.</p>
                                    </div>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    )}
                 />
                 {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
                 {selectedState === 'Other' && (
                    <div className="mt-2">
                        <Input placeholder="Please enter your state" {...register("otherState")} className={errors.otherState ? "border-destructive" : ""} />
                        {errors.otherState && <p className="text-xs text-destructive">{errors.otherState.message}</p>}
                    </div>
                 )}
              </div>

               <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                 <Controller
                    control={control}
                    name="city"
                    render={({ field }) => (
                        <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button ref={cityTriggerRef} variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground", errors.city && "border-destructive")} disabled={!selectedState || selectedState === 'Other'}>
                                    {field.value ? field.value : "Select city"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 country-list-popover">
                                <Command>
                                    <CommandInput placeholder="Search city..." />
                                    <CommandList>
                                        <CommandEmpty>No city found.</CommandEmpty>
                                        <CommandGroup>
                                            {countryConfig?.regions?.find(r => r.name === selectedState)?.cities.map((city) => (
                                                <CommandItem key={city} value={city} onSelect={() => { setValue("city", city, { shouldValidate: true }); setCityPopoverOpen(false); cityTriggerRef.current?.blur(); }}>
                                                    <Check className={cn("mr-2 h-4 w-4", field.value === city ? "opacity-100" : "opacity-0")} />
                                                    {city}
                                                </CommandItem>
                                            ))}
                                            <CommandItem key="Other" value="Other" onSelect={() => { setValue("city", "Other", { shouldValidate: true }); setCityPopoverOpen(false); cityTriggerRef.current?.blur(); }}>
                                                 <Check className={cn("mr-2 h-4 w-4", field.value === "Other" ? "opacity-100" : "opacity-0")} />
                                                 Other
                                            </CommandItem>
                                        </CommandGroup>
                                    </CommandList>
                                    <div className="p-2 text-center border-t border-border">
                                        <p className="text-xs font-bold text-red-500">Please press enter to select.</p>
                                    </div>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    )}
                />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                {selectedCity === 'Other' && (
                    <div className="mt-2">
                        <Input placeholder="Please enter your city" {...register("otherCity")} className={errors.otherCity ? "border-destructive" : ""} />
                        {errors.otherCity && <p className="text-xs text-destructive">{errors.otherCity.message}</p>}
                    </div>
                )}
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
