
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
      setRegions(config.regions.map(r => ({ name: r.name })));
    }
  }, []);

  const selectedState = form.watch("state")

  useEffect(() => {
    if (selectedState && countryConfig?.regions) {
      const regionData = countryConfig.regions.find(r => r.name === selectedState);
      setCities(regionData ? [...regionData.cities, "Other"] : ["Other"]);
      form.setValue("city", ""); // Reset city when state changes
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
            <div className="w-full rounded-2xl border border-white/10 bg-black/20 p-8 shadow-2xl shadow-pink-500/10 backdrop-blur-xl">
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
                                            <Button variant="outline" role="combobox" className={cn("w-full justify-between bg-transparent border-white/20 backdrop-blur-sm hover:bg-white/10 hover:text-white", !field.value && "text-muted-foreground")}>
                                                {field.value ? regions.find(s => s.name === field.value)?.name : `Select your ${countryConfig.regionLabel.toLowerCase()}`}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 dark" onPointerDownOutside={(e) => e.preventDefault()}>
                                            <Command>
                                            <CommandInput placeholder={`Search ${countryConfig.regionLabel.toLowerCase()}...`} />
                                            <CommandList>
                                                <CommandEmpty>No {countryConfig.regionLabel.toLowerCase()} found.</CommandEmpty>
                                                <CommandGroup>
                                                {regions.map((region) => (
                                                    <CommandItem value={region.name} key={region.name} onSelect={(currentValue) => {
                                                        form.setValue("state", currentValue === field.value ? "" : currentValue)
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
                                            <Button variant="outline" role="combobox" disabled={cities.length === 0} className={cn("w-full justify-between bg-transparent border-white/20 backdrop-blur-sm hover:bg-white/10 hover:text-white", !field.value && "text-muted-foreground")}>
                                                {field.value || "Select your city"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 dark" onPointerDownOutside={(e) => e.preventDefault()}>
                                            <Command>
                                            <CommandInput placeholder="Search city..." />
                                            <CommandList>
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
                                        <Input placeholder="Enter your city" {...field} className="bg-transparent border-white/20 backdrop-blur-sm" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                            )}
                        </div>

                        {form.watch("city") === "Other" && (
                             <FormField control={form.control} name="otherCity" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Please specify your city</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter city name" {...field} className="bg-transparent border-white/20 backdrop-blur-sm" />
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
                                    <Button variant="outline" role="combobox" className={cn("w-full justify-between bg-transparent border-white/20 backdrop-blur-sm hover:bg-white/10 hover:text-white", !field.value && "text-muted-foreground")}>
                                      {field.value ? `+${field.value}` : "Code"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-[250px] p-0 dark"
                                  onPointerDownOutside={(e) => e.preventDefault()}
                                >
                                  <Command>
                                    <CommandInput placeholder="Search country..." />
                                    <CommandList>
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
                                    className="bg-transparent border-white/20 backdrop-blur-sm"
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                 </FormItem>

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
