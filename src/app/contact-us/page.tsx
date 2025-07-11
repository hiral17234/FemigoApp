
"use client"

import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export default function ContactUsPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0C0A09] p-4 text-white">
      <div className="absolute top-0 left-0 h-1/2 w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/40 via-violet-900/10 to-transparent" />
      
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="relative z-10 w-full max-w-sm animate-in fade-in zoom-in-95 duration-700 rounded-2xl border-none bg-black p-8 text-center shadow-2xl shadow-primary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-6 space-y-6 text-left">
          <div className="flex items-start gap-4">
            <Mail className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">Email Us</h3>
              <p className="text-muted-foreground">support@femigo.app</p>
            </div>
          </div>
          <Separator className="bg-border/50" />
          <div className="flex items-start gap-4">
            <Phone className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">Call Us</h3>
              <p className="text-muted-foreground">+1 (555) 123-4567</p>
            </div>
          </div>
          <Separator className="bg-border/50" />
          <div className="flex items-start gap-4">
            <MapPin className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">Our Office</h3>
              <p className="text-muted-foreground">123 Safety Lane, Empowerment City, 11202</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
