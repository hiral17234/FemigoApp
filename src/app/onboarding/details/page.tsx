
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
import { indianStates, indianStatesList } from "@/lib/indian-states-cities"
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
  state: z.string({ required_error: "Please select a state." }),
  city: z.string({ required_error: "Please select a city." }),
  otherCity: z.string().optional(),
  altCountryCode: z.string().optional(),
  altPhone: z.string().optional(),
}).refine((data) => {
    if (data.city === "Other") {
        return !!data.otherCity && data.otherCity.trim().length > 0;
    }
    return true;
}, {
    message: "Please specify your city when 'Other' is selected.",
    path: ["otherCity"],
}).superRefine((data, ctx) => {
    if (data.altPhone) {
        if (!data.altCountryCode) {
            ctx.addIssue({
                path: ['altCountryCode'],
                message: 'Code is required.',
                code: z.ZodIssueCode.custom
            });
        }
        if (!/^\d{5,15}$/.test(data.altPhone)) {
             ctx.addIssue({
                path: ['altPhone'],
                message: 'Invalid number.',
                code: z.ZodIssueCode.custom
            });
        }
    } else if (data.altCountryCode) {
        ctx.addIssue({
            path: ['altPhone'],
            message: 'Number is required.',
            code: z.ZodIssueCode.custom
        });
    }
});

export default function OnboardingDetailsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      altCountryCode: "",
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

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField control={form.control} name="state" render={({ field }) => (
                       <FormItem className="flex flex-col">
                         <FormLabel>State</FormLabel>
                         <Popover open={statePopoverOpen} onOpenChange={setStatePopoverOpen}>
                           <PopoverTrigger asChild>
                             <FormControl>
                               <Button variant="outline" role="combobox" className={cn("w-full justify-between bg-transparent border-white/20 backdrop-blur-sm hover:bg-white/10 hover:text-white", !field.value && "text-muted-foreground")}>
                                 {field.value ? indianStatesList.find(s => s === field.value) : "Select your state"}
                                 <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                               </Button>
                             </FormControl>
                           </PopoverTrigger>
                           <PopoverContent
                             className="w-[--radix-popover-trigger-width] p-0 dark"
                             onPointerDownOutside={(e) => e.preventDefault()}
                           >
                             <Command>
                               <CommandInput placeholder="Search state..." />
                               <div className="border-t border-border p-2 text-center text-xs text-muted-foreground">
                                Press Enter to select.
                               </div>
                               <CommandList>
                                 <CommandEmpty>No state found.</CommandEmpty>
                                 <CommandGroup>
                                   {indianStatesList.map((state) => (
                                     <CommandItem
                                       value={state}
                                       key={state}
                                       onSelect={(currentValue) => {
                                         form.setValue("state", currentValue === field.value ? "" : currentValue)
                                         setStatePopoverOpen(false)
                                       }}
                                     >
                                       <Check className={cn("mr-2 h-4 w-4", state === field.value ? "opacity-100" : "opacity-0")} />
                                       {state}
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
                           <PopoverContent
                             className="w-[--radix-popover-trigger-width] p-0 dark"
                             onPointerDownOutside={(e) => e.preventDefault()}
                           >
                             <Command>
                               <CommandInput placeholder="Search city..." />
                                <div className="border-t border-border p-2 text-center text-xs text-muted-foreground">
                                 Press Enter to select.
                               </div>
                               <CommandList>
                                 <CommandEmpty>No city found.</CommandEmpty>
                                 <CommandGroup>
                                   {cities.map((city) => (
                                     <CommandItem
                                       value={city}
                                       key={city}
                                       onSelect={(currentValue) => {
                                         form.setValue("city", currentValue === field.value ? "" : currentValue)
                                         setCityPopoverOpen(false)
                                       }}
                                     >
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
                                    <div className="border-t border-border p-2 text-center text-xs text-muted-foreground">
                                      Press Enter to select.
                                    </div>
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
