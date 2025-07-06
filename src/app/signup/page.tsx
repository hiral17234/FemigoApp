"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Globe, User, Mail, Lock, CheckSquare } from "lucide-react"
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
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required." }),
  lastName: z.string().min(2, { message: "Last name is required." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and policy.",
  }),
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});


export default function SignupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    console.log(values)
    if (typeof window !== "undefined") {
      localStorage.setItem("userName", `${values.firstName} ${values.lastName}`)
      localStorage.setItem("userEmail", values.email)
      // Since country is not in this form, we remove it to avoid conflicts in later steps
      localStorage.removeItem("userCountry")
    }
    toast({
      title: "Account Created!",
      description: "Next, let's verify your identity.",
    })
    
    // Simulate API call before redirecting
    setTimeout(() => {
        router.push("/verify")
        setIsSubmitting(false)
    }, 1000)
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-[#4c0f6c] to-[#2c1e6d] p-4 text-white">
      <div className="w-full max-w-sm">
        <div className="w-full rounded-3xl bg-pink-500/80 p-8 shadow-2xl shadow-pink-500/20 backdrop-blur-lg">
          <div className="flex flex-col items-center space-y-4 text-center">
            
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-pink-300/50 bg-white/20">
                <span className="text-2xl font-bold text-white">R</span>
            </div>
            
            <div className="space-y-1">
              <h1 className="font-headline text-2xl font-bold tracking-tight">
                Create your account
              </h1>
              <p className="text-xs text-pink-100">
                It's free and only takes a minute.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-4 text-left"
              >
                <div className="flex gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl><Input placeholder="First Name" {...field} className="rounded-full bg-pink-400/50 border-0 placeholder-pink-200" disabled={isSubmitting} /></FormControl>
                            <FormMessage className="text-xs px-2" />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl><Input placeholder="Last Name" {...field} className="rounded-full bg-pink-400/50 border-0 placeholder-pink-200" disabled={isSubmitting} /></FormControl>
                             <FormMessage className="text-xs px-2" />
                        </FormItem>
                    )} />
                </div>
                
                <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem><FormControl><div className="relative"><User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-200" /><Input placeholder="Username" {...field} className="pl-11 rounded-full bg-pink-400/50 border-0 placeholder-pink-200" disabled={isSubmitting} /></div></FormControl><FormMessage className="text-xs px-2" /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormControl><div className="relative"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-200" /><Input type="email" placeholder="Email" {...field} className="pl-11 rounded-full bg-pink-400/50 border-0 placeholder-pink-200" disabled={isSubmitting} /></div></FormControl><FormMessage className="text-xs px-2" /></FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormControl><div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-200" /><Input type="password" placeholder="Password" {...field} className="pl-11 rounded-full bg-pink-400/50 border-0 placeholder-pink-200" disabled={isSubmitting} /></div></FormControl><FormMessage className="text-xs px-2" /></FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem><FormControl><div className="relative"><Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-200" /><Input type="password" placeholder="Confirm Password" {...field} className="pl-11 rounded-full bg-pink-400/50 border-0 placeholder-pink-200" disabled={isSubmitting} /></div></FormControl><FormMessage className="text-xs px-2" /></FormItem>
                )} />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                       <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-pink-300 data-[state=checked]:bg-white data-[state=checked]:text-pink-500"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                         <p className="text-xs text-pink-100">
                            I accept the Terms of Use and Privacy Policy
                        </p>
                        <FormMessage className="text-xs" />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[#4a1d96] py-3 text-base font-bold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-[#5f25c7] focus:outline-none"
                >
                  SIGN UP
                </Button>
              </form>
            </Form>

            <p className="pt-2 text-center text-xs text-pink-200">
              Already a member?{" "}
              <Link
                href="/login"
                className="font-bold text-white hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
