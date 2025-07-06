"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, User, Globe, Loader2 } from "lucide-react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { countries } from "@/lib/countries"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  country: z.string({ required_error: "Please select a country." }),
})

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      })
      router.push("/verify")
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#FFF1F5] to-white p-4 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <Card className="w-full max-w-md rounded-2xl p-4 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
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
                        <Input placeholder="Your Name" {...field} className="pl-10" disabled={isSubmitting} />
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
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select your country" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <ScrollArea className="h-72">
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-[#EC008C] py-3 text-lg font-normal text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-[#d4007a] focus:outline-none">
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
    </main>
  )
}
