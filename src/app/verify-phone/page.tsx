
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ChevronRight, Loader2, ChevronsUpDown, Check } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { countries } from "@/lib/countries"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  countryCode: z.string().min(1, { message: "Please select a country code." }),
  phone: z.string().min(5, {
    message: "Please enter a valid phone number.",
  }),
})

export default function VerifyPhonePage() {
  const router = useRouter()
  const [backUrl, setBackUrl] = useState("/verify");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const country = typeof window !== 'undefined' ? localStorage.getItem('userCountry') : null;
    if (country === 'india') {
        setBackUrl('/verify-aadhaar');
    } else {
        setBackUrl('/verify');
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      countryCode: "91",
      phone: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const phoneNumber = `+${values.countryCode}${values.phone}`;

    // Simulate sending OTP
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("userPhone", phoneNumber);
      }
      toast({
        title: "OTP Sent!",
        description: `We've sent a verification code to ${phoneNumber}.`,
      });
      router.push("/verify-otp");
      setIsSubmitting(false);
    }, 1000)
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#FFF1F5] to-white p-4 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black">
      <div className="w-full max-w-sm">
        <Link href={backUrl} className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back
        </Link>
        <Card className="w-full rounded-2xl p-6 shadow-xl">
          <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                Step 4: Phone Verification
              </CardTitle>
              <CardDescription className="pt-2">
                  Enter your phone number to receive a verification code.
              </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-4"
              >
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <div className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem className="flex flex-col w-[150px]">
                           <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
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
                                            form.setValue("countryCode", selectedCountry.phone)
                                          }
                                          setOpen(false)
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
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                              <Input
                                  placeholder="Enter number"
                                  type="tel"
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
                <p className="text-xs text-muted-foreground">
                  An OTP will be sent via SMS to verify your mobile number.
                </p>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[#EC008C] py-3 text-lg font-normal text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-[#d4007a] focus:outline-none"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Continue <ChevronRight className="h-5 w-5" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
