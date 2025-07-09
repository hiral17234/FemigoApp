
"use client"

import { useState, useEffect, useRef, ChangeEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search, ChevronRight, BookOpenText, AreaChart, Pencil, Trash2, MoreVertical, Folder as FolderIcon, X } from "lucide-react"
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { moods, type DiaryEntry, type Folder, placeholderFolders } from "@/lib/diary-data"
import { format } from "date-fns"
import { cn } from "@/lib/utils"


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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("")
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  const [isNewJournalDialogOpen, setIsNewJournalDialogOpen] = useState(false)
  const [isRenameJournalDialogOpen, setIsRenameJournalDialogOpen] = useState(false)
  const [newJournalName, setNewJournalName] = useState("")
  const [folderToEdit, setFolderToEdit] = useState<Folder | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const savedEntriesString = localStorage.getItem("diaryEntries") || '[]';
      const savedEntries: DiaryEntry[] = JSON.parse(savedEntriesString);
      setEntries(savedEntries);

      const savedFoldersString = localStorage.getItem("diaryFolders") || '[]';
      let savedFolders: Folder[] = JSON.parse(savedFoldersString);

      savedFolders = savedFolders.map(folder => ({
        ...folder,
        entryCount: savedEntries.filter(entry => entry.folderId === folder.id).length
      }));
      setFolders(savedFolders);

      if (savedEntries.length > 0) {
        const recentEntries = savedEntries.slice(0, 7).reverse();
        const moodMap: Record<string, number> = { happy: 5, calm: 4, love: 5, angry: 1, sad: 2 };
        const generatedChartData = recentEntries.map((entry) => ({
          name: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          mood: moodMap[entry.mood as keyof typeof moodMap] || 3,
        }));
        setChartData(generatedChartData);
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load diary data.' });
    }
  }

  const filteredEntries = entries.filter((entry) => {
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entry.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFolder = !selectedFolder ? !entry.folderId || entry.folderId === 'uncategorized' : entry.folderId === selectedFolder.id;
      return matchesSearch && matchesFolder;
    }
  );

  const handleCreateJournal = () => {
    if (newJournalName.trim().length < 3) {
      toast({ variant: "destructive", title: "Invalid Name", description: "Journal name must be at least 3 characters long." });
      return;
    }
    const randomPlaceholder = placeholderFolders[Math.floor(Math.random() * placeholderFolders.length)];
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: newJournalName.trim(),
      entryCount: 0,
      imageUrl: randomPlaceholder.imageUrl,
      imageHint: randomPlaceholder.imageHint,
    };
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    localStorage.setItem("diaryFolders", JSON.stringify(updatedFolders));
    toast({ title: "Journal Created!", description: `"${newFolder.name}" has been added.` });
    setNewJournalName("");
    setIsNewJournalDialogOpen(false);
  }

  const handleRenameJournal = () => {
    if (!folderToEdit || newJournalName.trim().length < 3) {
      toast({ variant: "destructive", title: "Invalid Name", description: "Journal name must be at least 3 characters long." });
      return;
    }
    const updatedFolders = folders.map(f => f.id === folderToEdit.id ? { ...f, name: newJournalName.trim() } : f);
    setFolders(updatedFolders);
    localStorage.setItem("diaryFolders", JSON.stringify(updatedFolders));
    toast({ title: "Journal Renamed!" });
    setNewJournalName("");
    setFolderToEdit(null);
    setIsRenameJournalDialogOpen(false);
    loadData(); // Reload to reflect changes
  }

  const handleDeleteJournal = (folderId: string) => {
    const updatedEntries = entries.map(entry => {
        if (entry.folderId === folderId) {
            return { ...entry, folderId: undefined };
        }
        return entry;
    });
    setEntries(updatedEntries);
    localStorage.setItem("diaryEntries", JSON.stringify(updatedEntries));

    const updatedFolders = folders.filter(f => f.id !== folderId);
    setFolders(updatedFolders);
    localStorage.setItem("diaryFolders", JSON.stringify(updatedFolders));

    toast({ title: "Journal Deleted" });
    if (selectedFolder?.id === folderId) {
        setSelectedFolder(null); 
    }
    loadData();
  }

  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = entries.filter(e => e.id !== entryId);
    setEntries(updatedEntries);
    localStorage.setItem("diaryEntries", JSON.stringify(updatedEntries));
    toast({ title: "Entry Deleted" });
    loadData(); 
  }
  
  const handleEditCoverClick = (folder: Folder) => {
    setFolderToEdit(folder);
    fileInputRef.current?.click();
  }

  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && folderToEdit) {
      const file = e.target.files[0];
      const newImageUrl = URL.createObjectURL(file);
      const updatedFolders = folders.map(f => {
        if (f.id === folderToEdit.id) {
          if (f.imageUrl.startsWith('blob:')) URL.revokeObjectURL(f.imageUrl);
          return { ...f, imageUrl: newImageUrl, imageHint: 'custom cover' };
        }
        return f;
      });
      setFolders(updatedFolders);
      localStorage.setItem("diaryFolders", JSON.stringify(updatedFolders));
      toast({ title: "Cover Photo Updated!" });
      setFolderToEdit(null);
    }
    if(fileInputRef.current) fileInputRef.current.value = "";
  }


  return (
    <div className="relative min-h-screen">
      <input type="file" ref={fileInputRef} onChange={handleCoverImageChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
      <div className="mx-auto max-w-2xl space-y-8 p-4 sm:p-6 md:p-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">My Diary</h1>
          <p className="text-muted-foreground">Your personal space to reflect, grow, and remember.</p>
        </header>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search your journal..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Your Journals</h2>
             <Dialog open={isNewJournalDialogOpen} onOpenChange={setIsNewJournalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> New Journal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create a New Journal</DialogTitle><DialogDescription>Give your new journal a name to categorize your entries.</DialogDescription></DialogHeader>
                <div className="py-4"><Input value={newJournalName} onChange={(e) => setNewJournalName(e.target.value)} placeholder="e.g., Travel Diary, Daily Reflections..." /></div>
                <DialogFooter><Button onClick={handleCreateJournal}>Create Journal</Button></DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isRenameJournalDialogOpen} onOpenChange={setIsRenameJournalDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Rename Journal</DialogTitle><DialogDescription>Enter a new name for your journal.</DialogDescription></DialogHeader>
                    <div className="py-4"><Input value={newJournalName} onChange={(e) => setNewJournalName(e.target.value)} placeholder={folderToEdit?.name} /></div>
                    <DialogFooter><Button onClick={handleRenameJournal}>Rename</Button></DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
          
          {folders.length > 0 ? (
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-4 pb-4">
                 <div onClick={() => setSelectedFolder(null)} className={cn("relative group cursor-pointer border-2 rounded-lg", !selectedFolder ? "border-primary" : "border-transparent")}>
                    <Card className="w-40 shrink-0 overflow-hidden"><div className="relative h-24 bg-muted/20 flex items-center justify-center"><FolderIcon className="h-10 w-10 text-muted-foreground" /></div><div className="p-3"><h3 className="font-semibold truncate">All Entries</h3><p className="text-xs text-muted-foreground">{entries.filter(e => !e.folderId || e.folderId === 'uncategorized').length} Entries</p></div></Card>
                </div>
                {folders.map((folder) => (
                  <div key={folder.id} onClick={() => setSelectedFolder(folder)} className={cn("relative group cursor-pointer border-2 rounded-lg", selectedFolder?.id === folder.id ? "border-primary" : "border-transparent")}>
                     <Card className="w-40 shrink-0 overflow-hidden">
                        <div className="relative h-24"><Image src={folder.imageUrl} data-ai-hint={folder.imageHint} alt={folder.name} layout="fill" objectFit="cover" className="transition-transform group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /></div>
                        <div className="p-3"><h3 className="font-semibold truncate">{folder.name}</h3><p className="text-xs text-muted-foreground">{folder.entryCount} Entries</p></div>
                      </Card>
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="absolute top-1 right-1 bg-black/50 text-white rounded-full h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => { setFolderToEdit(folder); setNewJournalName(folder.name); setIsRenameJournalDialogOpen(true); }}><Pencil className="mr-2 h-4 w-4" />Rename</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleEditCoverClick(folder)}><FolderIcon className="mr-2 h-4 w-4" />Change Cover</DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will delete the "{folder.name}" journal. Entries in this journal will not be deleted but will become uncategorized. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteJournal(folder.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/20 p-8 rounded-lg">
              <BookOpenText className="h-12 w-12 mb-4" /><h3 className="text-lg font-semibold">Your Journals Will Appear Here</h3><p className="text-sm mt-1">Create different journals for travel, thoughts, or anything you like!</p>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">{selectedFolder ? selectedFolder.name : "Recent Entries"}</h2>
          </div>
          {filteredEntries.length > 0 ? (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="relative group">
                    <Card onClick={() => router.push(`/diary/${entry.id}`)} className="flex items-start gap-4 p-4 hover:bg-card/80 transition-colors cursor-pointer pr-12">
                        <div className="text-4xl">{moods[entry.mood].sticker}</div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs text-muted-foreground">{format(new Date(entry.date), "MMMM d, yyyy")}</p>
                            <h3 className="font-semibold text-lg truncate">{entry.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: entry.content }} />
                        </div>
                        {entry.photos && entry.photos.length > 0 && (
                            <div className="relative h-20 w-20 shrink-0"><Image src={entry.photos[0].url} data-ai-hint="diary photo" alt="Diary photo" layout="fill" objectFit="cover" className="rounded-md" /></div>
                        )}
                    </Card>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete Entry?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete the entry titled "{entry.title}"? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteEntry(entry.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
              <p className="font-semibold">{selectedFolder ? `No entries in "${selectedFolder.name}" yet.` : "You haven't written anything yet."}</p>
              <p className="text-sm mt-1">Click the '+' button below to start your first entry.</p>
            </div>
          )}
        </section>

        <section>
          <Card>
            <CardHeader><CardTitle>Mood Tracker</CardTitle><CardDescription>Your emotional trends over the last 7 entries.</CardDescription></CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} domain={[0, 5]} allowDecimals={false} ticks={[0, 1, 2, 3, 4, 5]} />
                    <Tooltip cursor={{ fill: "hsl(var(--card))" }} content={<CustomTooltip />} />
                    <Bar dataKey="mood" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground"><AreaChart className="h-12 w-12 mb-4" /><h3 className="font-semibold">No Mood Data Yet</h3><p className="text-sm mt-1">Write entries with moods to see your trends here.</p></div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <div className="sticky bottom-6 flex justify-center">
        <Link href="/diary/new"><Button size="lg" className="rounded-full shadow-lg h-16 w-16"><Plus className="h-8 w-8" /></Button></Link>
      </div>
    </div>
  )
}
