
"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus, Search, ChevronRight } from "lucide-react"
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
import { mockFolders, mockEntries, mockChartData, moods } from "@/lib/diary-data"

export default function DiaryPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEntries = mockEntries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="relative min-h-screen">
      <div className="mx-auto max-w-2xl space-y-8 p-4 sm:p-6 md:p-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">My Diary</h1>
          <p className="text-muted-foreground">Your personal space to reflect, grow, and remember.</p>
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
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 pb-4">
              {mockFolders.map((folder) => (
                <Card key={folder.id} className="w-40 shrink-0 overflow-hidden group">
                  <Link href="#">
                    <div className="relative h-24">
                       <Image src={folder.imageUrl} data-ai-hint={folder.imageHint} alt={folder.name} layout="fill" objectFit="cover" className="transition-transform group-hover:scale-105" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold truncate">{folder.name}</h3>
                      <p className="text-xs text-muted-foreground">{folder.entryCount} Entries</p>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Recent Entries</h2>
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {filteredEntries.slice(0, 3).map((entry) => (
              <Card key={entry.id} className="flex items-start gap-4 p-4 hover:bg-card/80 transition-colors">
                <div className="text-4xl">{moods[entry.mood].sticker}</div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                  <h3 className="font-semibold text-lg">{entry.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                </div>
                {entry.photoUrl && (
                  <div className="relative h-20 w-20 shrink-0">
                    <Image src={entry.photoUrl} data-ai-hint={entry.imageHint} alt="Diary photo" layout="fill" objectFit="cover" className="rounded-md" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        <section>
            <Card>
                <CardHeader>
                    <CardTitle>Mood Tracker</CardTitle>
                    <CardDescription>Your emotional trends over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={mockChartData}>
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
                            />
                            <Tooltip
                                cursor={{ fill: "hsl(var(--card))" }}
                                contentStyle={{ 
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))"
                                }}
                            />
                            <Bar dataKey="mood" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
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
