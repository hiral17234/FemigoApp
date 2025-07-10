
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, User, Globe, Loader2, ChevronsUpDown, Check } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { countries } from "@/lib/countries"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  country: z.string({ required_error: "Please select a country." }),
})

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Simulate API call before redirecting
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("userName", values.name)
        localStorage.setItem("userCountry", values.country)
      }
      toast({
        title: "Account Details Saved!",
        description: "Next, let's verify your identity.",
        className: "bg-green-600 text-white border-green-700"
      })
      router.push("/verify")
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#06010F] text-white p-4">
      <div className="w-full max-w-md">
        <div className="absolute top-8 left-8">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
            </Link>
        </div>

        <Card className="w-full max-w-md rounded-2xl bg-[#161616]/80 border border-white/10 p-2 sm:p-4">
            <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
                Create Account
            </CardTitle>
            <CardDescription>
                Join Femigo and be part of our community.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Your Name" {...field} className="pl-10 bg-gray-900/70 border-gray-700" disabled={isSubmitting} />
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Country</FormLabel>
                        <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                disabled={isSubmitting}
                                className={cn(
                                "w-full justify-between bg-gray-900/70 border-gray-700 hover:bg-gray-800",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    {field.value
                                    ? countries.find(
                                        (country) => country.value === field.value
                                    )?.label
                                    : "Select your country"}
                                </div>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-[--radix-popover-trigger-width] p-0"
                            onPointerDownOutside={(e) => e.preventDefault()}
                        >
                            <Command>
                            <CommandInput placeholder="Search country..." />
                            <CommandList>
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup>
                                {countries.map((country) => (
                                    <CommandItem
                                    value={country.label}
                                    key={country.value}
                                    onSelect={(currentValue) => {
                                        const selectedCountry = countries.find(c => c.label.toLowerCase() === currentValue.toLowerCase());
                                        if (selectedCountry) {
                                        form.setValue("country", selectedCountry.value);
                                        }
                                        setOpen(false)
                                    }}
                                    >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        country.value === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                    />
                                    {country.label}
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
                <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-gradient-to-r from-[#EC008C] to-[#BF55E6] py-3 text-lg font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Create Account
                </Button>
                </form>
            </Form>
            </CardContent>
            <CardFooter className="flex items-center justify-center pt-6">
            <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                Log in
                </Link>
            </p>
            </CardFooter>
        </Card>
      </div>
    </main>
  )
}
