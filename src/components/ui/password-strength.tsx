

"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

const PasswordStrength = ({ password }: { password?: string }) => {
  const checks = {
    length: (password || "").length >= 8,
    uppercase: /[A-Z]/.test(password || ""),
    lowercase: /[a-z]/.test(password || ""),
    number: /[0-9]/.test(password || ""),
    special: /[^A-Za-z0-9]/.test(password || ""),
  };

  const strength = Object.values(checks).filter(Boolean).length;

  const strengthLabel = ["", "Very Weak", "Weak", "Moderate", "Strong", "Very Strong"][strength]
  
  const strengthColors = [
    "bg-muted-foreground/30",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500"
  ]
  const strengthTextColors = [
    "",
    "text-red-500",
    "text-orange-500",
    "text-yellow-500",
    "text-lime-500",
    "text-green-500"
  ]

  const Requirement = ({ label, met }: { label: string, met: boolean }) => (
    <li className={cn("flex items-center gap-2 transition-colors", met ? "text-green-400" : "text-muted-foreground")}>
        <CheckCircle2 className="h-4 w-4" /> {label}
    </li>
  );

  return (
    <div className="space-y-4 rounded-lg bg-background/50 dark:bg-black/30 p-4">
       <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <Requirement label="At least 8 characters" met={checks.length} />
          <Requirement label="An uppercase letter (A-Z)" met={checks.uppercase} />
          <Requirement label="A lowercase letter (a-z)" met={checks.lowercase} />
          <Requirement label="A number (0-9)" met={checks.number} />
          <Requirement label="A special character (!@#$%)" met={checks.special} />
        </div>
        <div className="space-y-2">
            <div className="grid grid-cols-5 gap-x-2">
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                key={index}
                className={cn(
                    "h-2 rounded-full transition-colors",
                    index < strength ? strengthColors[strength] : "bg-muted/30"
                )}
                />
            ))}
            </div>
            {password && (
            <p className={cn("text-xs font-medium text-right", strengthTextColors[strength])}>
                {strengthLabel}
            </p>
            )}
      </div>
    </div>
  )
}

export { PasswordStrength }
