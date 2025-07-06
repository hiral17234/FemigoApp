import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#f0f2ff] to-[#fff0f5] p-4 dark:from-gray-900 dark:to-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Welcome to Femigo!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            You have successfully verified your identity.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
