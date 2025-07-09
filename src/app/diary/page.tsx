
"use client"

import { useState, useEffect, useRef, ChangeEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus, Search, ChevronRight, BookOpenText, AreaChart, Pencil } from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
} from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { moods, type DiaryEntry, type Folder, placeholderFolders } from "@/lib/diary-data"
import { format } from "date-fns"


const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const moodValue = payload[0].value as number
    const moodName = Object.keys(moods).find(key => {
        const moodMap: Record<string, number> = { happy: 5, calm: 4, love: 5, angry: 1, sad: 2 };
        return moodMap[key as keyof typeof moodMap] === moodValue
    }) || "Unknown"
    const moodEmoji = moodName !== "Unknown" ? moods[moodName as keyof typeof moods].emoji : '🤔'

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Date
            </span>
            <span className="font-bold text-muted-foreground">{label}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Mood ({moodValue}/5)
            </span>
            <span className="font-bold">
              {moodEmoji} {moodName.charAt(0).toUpperCase() + moodName.slice(1)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};


export default function DiaryPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newJournalName, setNewJournalName] = useState("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [folderToEdit, setFolderToEdit] = useState<string | null>(null)

  useEffect(() => {
    try {
      const savedEntriesString = localStorage.getItem("diaryEntries")
      const savedEntries: DiaryEntry[] = savedEntriesString
        ? JSON.parse(savedEntriesString)
        : []
      setEntries(savedEntries)

      const savedFoldersString = localStorage.getItem("diaryFolders")
      const savedFolders: Folder[] = savedFoldersString
        ? JSON.parse(savedFoldersString)
        : []
      setFolders(savedFolders)

      if (savedEntries.length > 0) {
        const recentEntries = savedEntries.slice(0, 7).reverse()
        const moodMap: Record<string, number> = {
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
          mood: moodMap[entry.mood as keyof typeof moodMap] || 3,
        }))

        setChartData(generatedChartData)
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error)
    }
  }, [])

  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateJournal = () => {
    if (newJournalName.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Journal name must be at least 3 characters long.",
      })
      return
    }

    const randomPlaceholder = placeholderFolders[Math.floor(Math.random() * placeholderFolders.length)];

    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newJournalName.trim(),
      entryCount: 0,
      imageUrl: randomPlaceholder.imageUrl,
      imageHint: randomPlaceholder.imageHint,
    }

    const updatedFolders = [...folders, newFolder]
    setFolders(updatedFolders)
    localStorage.setItem("diaryFolders", JSON.stringify(updatedFolders))

    toast({
      title: "Journal Created!",
      description: `"${newFolder.name}" has been added.`,
    })

    setNewJournalName("")
    setIsDialogOpen(false)
  }
  
  const handleEditCoverClick = (folderId: string) => {
    setFolderToEdit(folderId)
    fileInputRef.current?.click()
  }

  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && folderToEdit) {
      const file = e.target.files[0]
      const newImageUrl = URL.createObjectURL(file)

      const updatedFolders = folders.map(f => {
        if (f.id === folderToEdit) {
          // If the old URL was a blob, revoke it to prevent memory leaks
          if (f.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(f.imageUrl);
          }
          return { ...f, imageUrl: newImageUrl, imageHint: 'custom cover' }
        }
        return f
      });

      setFolders(updatedFolders)
      localStorage.setItem("diaryFolders", JSON.stringify(updatedFolders))
      toast({ title: "Cover Photo Updated!" })
      setFolderToEdit(null)
    }
    // Clear the input value so the same file can be selected again
    if(fileInputRef.current) fileInputRef.current.value = ""
  }


  return (
    <div className="relative min-h-screen">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCoverImageChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Your Journals</h2>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" /> New Journal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Journal</DialogTitle>
                  <DialogDescription>
                    Give your new journal a name to categorize your entries.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input 
                    value={newJournalName}
                    onChange={(e) => setNewJournalName(e.target.value)}
                    placeholder="e.g., Travel Diary, Daily Reflections..."
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateJournal}>Create Journal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {folders.length > 0 ? (
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-4 pb-4">
                {folders.map((folder) => (
                  <div key={folder.id} className="relative group">
                     <Card className="w-40 shrink-0 overflow-hidden">
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
                      <button 
                        onClick={() => handleEditCoverClick(folder.id)}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        aria-label="Edit Journal Cover"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                  </div>
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
                <Link href={`/diary/${entry.id}`} key={entry.id}>
                    <Card
                    className="flex items-start gap-4 p-4 hover:bg-card/80 transition-colors cursor-pointer"
                    >
                    <div className="text-4xl">{moods[entry.mood].sticker}</div>
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.date), "MMMM d, yyyy")}
                        </p>
                        <h3 className="font-semibold text-lg">{entry.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {entry.content.replace(/<[^>]*>?/gm, '')}
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
                </Link>
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
                Your emotional trends over the last 7 entries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                      ticks={[0, 1, 2, 3, 4, 5]}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--card))" }}
                      content={<CustomTooltip />}
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
