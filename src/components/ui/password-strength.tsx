
"use client"

import { cn } from "@/lib/utils"

const checkPasswordStrength = (password: string) => {
  let score = 0
  if (!password) return score

  // Award points for different criteria
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  return score
}

const PasswordStrength = ({ password }: { password?: string }) => {
  const strength = checkPasswordStrength(password || "")

  const strengthLabel = ["", "Very Weak", "Weak", "Moderate", "Strong", "Very Strong"][strength]
  
  const strengthColors = [
    "bg-muted-foreground/30",   // 0
    "bg-red-500",               // 1
    "bg-orange-500",            // 2
    "bg-yellow-500",            // 3
    "bg-lime-500",              // 4
    "bg-green-500"              // 5
  ]

  const strengthTextColors = [
    "",                         // 0
    "text-red-500",             // 1
    "text-orange-500",          // 2
    "text-yellow-500",          // 3
    "text-lime-500",            // 4
    "text-green-500"            // 5
  ]

  return (
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
  )
}

export { PasswordStrength }
