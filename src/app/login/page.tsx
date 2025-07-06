"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Lock, Mail, Loader2 } from "lucide-react"
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

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    // Simulate network delay
    setTimeout(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("userPhone")
            localStorage.setItem("userEmail", values.email)
        }

        toast({
            title: "Logged In!",
            description: "Welcome back.",
            className: "bg-green-500 text-white",
        })

        router.push("/dashboard")
        setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
       <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="w-full rounded-2xl bg-card p-8 shadow-xl">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Log In
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back! Please enter your details.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6 text-left"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="your.email@example.com"
                            {...field}
                            className="pl-10"
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                       <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Your Password"
                            {...field}
                            className="pl-10"
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-[#EC008C] py-3 text-lg text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-[#d4007a] focus:outline-none"
                >
                   {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Log In
                </Button>
              </form>
            </Form>

            <p className="pt-2 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[#EC008C] hover:underline dark:text-pink-400"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
