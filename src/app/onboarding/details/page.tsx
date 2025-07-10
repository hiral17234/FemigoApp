
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, Loader2, ArrowLeft, ChevronsUpDown, Check } from "lucide-react"

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
import { useToast } from "@/hooks/use-toast"
import { locationData, type CountryConfig } from "@/lib/location-data"
import { countries } from "@/lib/countries"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"


const formSchema = z.object({
  age: z.coerce.number().min(3, "You must be at least 3 years old.").max(100),
  nickname: z.string().optional(),
  address1: z.string().min(3, "Address is required."),
  address2: z.string().optional(),
  address3: z.string().optional(),
  state: z.string().optional(),
  otherState: z.string().optional(),
  city: z.string().min(1, { message: "City is required." }),
  otherCity: z.string().optional(),
  altCountryCode: z.string().optional(),
  altPhone: z.string().optional(),
}).superRefine((data, ctx) => {
    const phoneProvided = !!data.altPhone;
    const codeProvided = !!data.altCountryCode;

    if (phoneProvided && !codeProvided) {
        ctx.addIssue({
            path: ['altCountryCode'],
            message: 'Code is required.',
            code: z.ZodIssueCode.custom
        });
    }

    if (!phoneProvided && codeProvided) {
        ctx.addIssue({
            path: ['altPhone'],
            message: 'Number is required.',
            code: z.ZodIssueCode.custom
        });
    }

    if (phoneProvided && !/^\d{5,15}$/.test(data.altPhone!)) {
         ctx.addIssue({
            path: ['altPhone'],
            message: 'Invalid number (5-15 digits).',
            code: z.ZodIssueCode.custom
        });
    }
    
    if (data.state === 'Other' && (!data.otherState || data.otherState.trim().length < 2)) {
        ctx.addIssue({
            path: ['otherState'],
            message: 'Please specify your region (at least 2 characters).',
            code: z.ZodIssueCode.custom
        });
    }

    if (data.city === 'Other' && (!data.otherCity || data.otherCity.trim().length < 2)) {
        ctx.addIssue({
            path: ['otherCity'],
            message: 'Please specify your city (at least 2 characters).',
            code: z.ZodIssueCode.custom
        });
    }
});

export default function OnboardingDetailsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userCountry, setUserCountry] = useState("")
  const [countryConfig, setCountryConfig] = useState<CountryConfig | null>(null)
  const [regions, setRegions] = useState<{ name: string }[]>([])
  const [cities, setCities] = useState<string[]>([])
  
  const [statePopoverOpen, setStatePopoverOpen] = useState(false)
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false)
  const [countryCodePopoverOpen, setCountryCodePopoverOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      address1: "",
      address2: "",
      address3: "",
      state: "",
      otherState: "",
      city: "",
      otherCity: "",
      altCountryCode: "",
      altPhone: "",
    },
  })

  useEffect(() => {
    const country = typeof window !== "undefined" ? localStorage.getItem("userCountry") : "default";
    setUserCountry(country || "default");
    const config = locationData[country || "default"] || locationData["default"];
    setCountryConfig(config);
    if (config?.regions) {
      setRegions([...config.regions.map(r => ({ name: r.name })), { name: "Other" }]);
    }
  }, []);

  const selectedState = form.watch("state")

  useEffect(() => {
    if (selectedState && countryConfig?.regions) {
      const regionData = countryConfig.regions.find(r => r.name === selectedState);
      setCities(regionData ? [...regionData.cities, "Other"] : ["Other"]);
      form.setValue("city", ""); // Reset city when state changes
    }

    if (selectedState !== "Other") {
      form.setValue("otherState", "");
    }
  }, [selectedState, countryConfig, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    // Manual validation for state/region
    if (countryConfig?.regions && !values.state) {
        form.setError("state", { message: `${countryConfig.regionLabel} is required.` });
        return;
    }

    setIsSubmitting(true)
    
    if (typeof window !== "undefined") {
      // Store all details to be used in the next step (password creation).
      localStorage.setItem("onboardingDetails", JSON.stringify(values));
    }

    toast({
      variant: "success",
      title: "Details Saved!",
      description: "Let's secure your account.",
    })

    setTimeout(() => {
      router.push("/onboarding/password")
    }, 1000)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
       <video
        src="https://videos.pexels.com/video-files/26621651/11977308_2560_1440_30fps.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-1/2 left-1/2 w-full h-full min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0 opacity-40"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/60 to-transparent" />

      <main className="relative z-20 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
            <Link
              href="/congratulations"
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="w-full rounded-2xl border border-white/10 bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
              <h1 className="mb-2 text-center text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Tell Us About Yourself
              </h1>
              <p className="mb-8 text-center text-muted-foreground">
                This information helps us personalize your experience.
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField control={form.control} name="age" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="nickname" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nickname (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="How should we call you?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="space-y-4">
                    <FormLabel>Address</FormLabel>
                    <FormField control={form.control} name="address1" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input placeholder="Address Line 1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="address2" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input placeholder="Address Line 2 (Optional)" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="address3" render={({ field }) => (
                      <FormItem>
                        <FormControl><Input placeholder="Address Line 3 (Optional)" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {countryConfig && (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {countryConfig.regions ? (
                                <>
                                    <FormField control={form.control} name="state" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{countryConfig.regionLabel}</FormLabel>
                                        <Popover open={statePopoverOpen} onOpenChange={setStatePopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                            <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                {field.value ? regions.find(s => s.name === field.value)?.name : `Select your ${countryConfig.regionLabel.toLowerCase()}`}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" onPointerDownOutside={(e) => e.preventDefault()}>
                                            <Command>
                                            <CommandInput placeholder={`Search ${countryConfig.regionLabel.toLowerCase()}...`} />
                                            <CommandList>
                                                <div className="my-1 mx-2 rounded-sm bg-red-900/50 p-1.5 text-center text-xs font-bold text-red-300">
                                                    Press Enter to select
                                                </div>
                                                <CommandEmpty>No {countryConfig.regionLabel.toLowerCase()} found.</CommandEmpty>
                                                <CommandGroup>
                                                {regions.map((region) => (
                                                    <CommandItem value={region.name} key={region.name} onSelect={(currentValue) => {
                                                        form.setValue("state", currentValue === field.value ? "" : region.name)
                                                        setStatePopoverOpen(false)
                                                    }}>
                                                    <Check className={cn("mr-2 h-4 w-4", region.name === field.value ? "opacity-100" : "opacity-0")} />
                                                    {region.name}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup>
                                            </CommandList>
                                            </Command>
                                        </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                    )} />

                                    <FormField control={form.control} name="city" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>City</FormLabel>
                                        <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                            <Button variant="outline" role="combobox" disabled={cities.length === 0} className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                {field.value || "Select your city"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" onPointerDownOutside={(e) => e.preventDefault()}>
                                            <Command>
                                            <CommandInput placeholder="Search city..." />
                                            <CommandList>
                                                <div className="my-1 mx-2 rounded-sm bg-red-900/50 p-1.5 text-center text-xs font-bold text-red-300">
                                                    Press Enter to select
                                                </div>
                                                <CommandEmpty>No city found.</CommandEmpty>
                                                <CommandGroup>
                                                {cities.map((city) => (
                                                    <CommandItem value={city} key={city} onSelect={(currentValue) => {
                                                        form.setValue("city", currentValue === field.value ? "" : currentValue)
                                                        setCityPopoverOpen(false)
                                                    }}>
                                                    <Check className={cn("mr-2 h-4 w-4", city === field.value ? "opacity-100" : "opacity-0")} />
                                                    {city}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup>
                                            </CommandList>
                                            </Command>
                                        </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                    )} />
                                </>
                            ) : (
                                <FormField control={form.control} name="city" render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your city" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                            )}
                        </div>

                        {form.watch("state") === "Other" && (
                           <FormField control={form.control} name="otherState" render={({ field }) => (
                               <FormItem>
                                   <FormLabel>Please specify your {countryConfig?.regionLabel || 'region'}</FormLabel>
                                   <FormControl>
                                       <Input placeholder={`Enter ${countryConfig?.regionLabel || 'region'}`} {...field} />
                                   </FormControl>
                                   <FormMessage />
                               </FormItem>
                           )} />
                        )}

                        {form.watch("city") === "Other" && (
                             <FormField control={form.control} name="otherCity" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Please specify your city</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter city name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}
                    </>
                  )}

                 <FormItem>
                    <FormLabel>Alternate Phone Number (Optional)</FormLabel>
                    <div className="flex items-start gap-2">
                        <FormField
                          control={form.control}
                          name="altCountryCode"
                          render={({ field }) => (
                            <FormItem className="flex flex-col w-[150px]">
                              <Popover open={countryCodePopoverOpen} onOpenChange={setCountryCodePopoverOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                      {field.value ? `+${field.value}` : "Code"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-[250px] p-0"
                                  onPointerDownOutside={(e) => e.preventDefault()}
                                >
                                  <Command>
                                    <CommandInput placeholder="Search country..." />
                                    <CommandList>
                                      <div className="my-1 mx-2 rounded-sm bg-red-900/50 p-1.5 text-center text-xs font-bold text-red-300">
                                        Press Enter to select
                                      </div>
                                      <CommandEmpty>No country found.</CommandEmpty>
                                      <CommandGroup>
                                        {countries.map((country) => (
                                          <CommandItem
                                            value={`${country.label} (+${country.phone})`}
                                            key={country.code}
                                            onSelect={(currentValue) => {
                                               const selectedCountry = countries.find(c => `${c.label} (+${c.phone})`.toLowerCase() === currentValue.toLowerCase());
                                               if (selectedCountry) {
                                                form.setValue("altCountryCode", selectedCountry.phone)
                                               }
                                              setCountryCodePopoverOpen(false)
                                            }}
                                          >
                                            <Check className={cn("mr-2 h-4 w-4", country.phone === field.value ? "opacity-100" : "opacity-0")} />
                                            <span className="mr-2">{country.emoji}</span>
                                            <span className="flex-1 truncate">{country.label}</span>
                                            <span className="text-xs text-muted-foreground/80">{`+${country.phone}`}</span>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                            control={form.control}
                            name="altPhone"
                            render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                <Input
                                    type="tel"
                                    placeholder="Enter number"
                                    {...field}
                                    disabled={isSubmitting}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                 </FormItem>

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-lg font-semibold text-primary-foreground py-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
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
