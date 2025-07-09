
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus, Search, ChevronRight, BookOpenText, AreaChart } from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { mockFolders, moods, type DiaryEntry, type Mood } from "@/lib/diary-data"
import { format } from "date-fns"

export default function DiaryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    try {
      const savedEntriesString = localStorage.getItem("diaryEntries")
      const savedEntries: DiaryEntry[] = savedEntriesString
        ? JSON.parse(savedEntriesString)
        : []
      setEntries(savedEntries)

      if (savedEntries.length > 0) {
        const recentEntries = savedEntries.slice(0, 7).reverse()
        const moodMap: Record<Mood, number> = {
          happy: 5,
          calm: 4,
          love: 5,
          angry: 1,
          sad: 2,
        }

        const generatedChartData = recentEntries.map((entry) => ({
          name: new Date(entry.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          mood: moodMap[entry.mood] || 3,
        }))

        setChartData(generatedChartData)
      }
    } catch (error) {
      console.error("Failed to load entries from localStorage", error)
    }
  }, [])

  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-2xl space-y-8 p-4 sm:p-6 md:p-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">My Diary</h1>
          <p className="text-muted-foreground">
            Your personal space to reflect, grow, and remember.
          </p>
        </header>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search your journal..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Journals</h2>
          {mockFolders.length > 0 ? (
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-4 pb-4">
                {mockFolders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="w-40 shrink-0 overflow-hidden group"
                  >
                    <Link href="#">
                      <div className="relative h-24">
                        <Image
                          src={folder.imageUrl}
                          data-ai-hint={folder.imageHint}
                          alt={folder.name}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold truncate">{folder.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {folder.entryCount} Entries
                        </p>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/20 p-8 rounded-lg">
              <BookOpenText className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold">
                Your Journals Will Appear Here
              </h3>
              <p className="text-sm mt-1">
                Create different journals for travel, thoughts, or anything you
                like!
              </p>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Recent Entries</h2>
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          {filteredEntries.length > 0 ? (
            <div className="space-y-4">
              {filteredEntries.slice(0, 3).map((entry) => (
                <Card
                  key={entry.id}
                  className="flex items-start gap-4 p-4 hover:bg-card/80 transition-colors"
                >
                  <div className="text-4xl">{moods[entry.mood].sticker}</div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(entry.date), "MMMM d, yyyy")}
                    </p>
                    <h3 className="font-semibold text-lg">{entry.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.content}
                    </p>
                  </div>
                  {entry.photos && entry.photos.length > 0 && (
                    <div className="relative h-20 w-20 shrink-0">
                      <Image
                        src={entry.photos[0].url}
                        data-ai-hint="diary photo"
                        alt="Diary photo"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
              <p className="font-semibold">You haven't written anything yet.</p>
              <p className="text-sm mt-1">
                Click the '+' button below to start your first entry.
              </p>
            </div>
          )}
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Mood Tracker</CardTitle>
              <CardDescription>
                Your emotional trends over the last 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                      domain={[0, 5]}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--card))" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                      }}
                    />
                    <Bar
                      dataKey="mood"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
                  <AreaChart className="h-12 w-12 mb-4" />
                  <h3 className="font-semibold">No Mood Data Yet</h3>
                  <p className="text-sm mt-1">
                    Write entries with moods to see your trends here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <div className="sticky bottom-6 flex justify-center">
        <Link href="/diary/new">
          <Button size="lg" className="rounded-full shadow-lg h-16 w-16">
            <Plus className="h-8 w-8" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
