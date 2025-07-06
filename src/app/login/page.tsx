"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react"
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
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Simulate network delay and DB check
    setTimeout(() => {
      if (typeof window !== "undefined") {
        const storedEmail = localStorage.getItem("userEmail")

        // Since password isn't stored, we'll only check for the email for this demo.
        if (storedEmail && storedEmail === values.email) {
          toast({
            title: "Logged In!",
            description: "Welcome back.",
            className: "bg-green-500 text-white",
          })
          router.push("/dashboard")
        } else {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: "No account found, please make a account.",
          })
        }
      }
      setIsSubmitting(false)
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
        src="https://videos.pexels.com/video-files/5661979/5661979-hd_1920_1080_30fps.mp4"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <main className="relative z-20 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-4 flex items-center gap-2 text-sm text-purple-300/70 transition-colors hover:text-purple-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="w-full rounded-2xl border border-white/10 bg-black/20 p-8 shadow-2xl shadow-pink-500/10 backdrop-blur-xl">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Log In
                </h1>
                <p className="text-sm text-purple-200/70">
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
                        <FormLabel className="text-purple-200/90">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300/70" />
                            <Input
                              placeholder="your.email@example.com"
                              {...field}
                              className="pl-10 bg-white/5 border-white/20"
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
                        <FormLabel className="text-purple-200/90">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-300/70" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Your Password"
                              {...field}
                              className="pl-10 pr-10 bg-white/5 border-white/20"
                              disabled={isSubmitting}
                            />
                             <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-purple-200/70 hover:text-purple-200"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 py-3 text-lg text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-pink-500/50 focus:outline-none"
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    )}
                    Log In
                  </Button>
                </form>
              </Form>

              <p className="pt-2 text-center text-sm text-purple-200/70">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-pink-400 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
