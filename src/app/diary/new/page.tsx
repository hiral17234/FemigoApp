
"use client"

import { useState, useRef, ChangeEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Camera, ImagePlus, Send, X, Mic, Folder } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { moods, type Mood, type DiaryEntry, type Folder as JournalFolder, type DiaryPhoto } from "@/lib/diary-data"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export default function NewDiaryEntryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [photos, setPhotos] = useState<DiaryPhoto[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [folders, setFolders] = useState<JournalFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>("uncategorized");

  useEffect(() => {
    try {
      const savedFoldersString = localStorage.getItem("diaryFolders");
      if (savedFoldersString) {
        setFolders(JSON.parse(savedFoldersString));
      }
    } catch (error) {
        console.error("Could not load folders", error);
    }
  }, []);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (photos.length + e.target.files.length > 5) {
        toast({
          variant: "destructive",
          title: "Too many photos",
          description: "You can upload a maximum of 5 photos per entry.",
        })
        return
      }
      const newFiles = Array.from(e.target.files)
      const newPhotos = newFiles.map(file => ({
        url: URL.createObjectURL(file),
        caption: ""
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  }

  const handleRemovePhoto = (index: number) => {
    const photoToRemove = photos[index];
    if (photoToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(photoToRemove.url);
    }
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }
  
  const handleCaptionChange = (index: number, caption: string) => {
    setPhotos(prev => prev.map((photo, i) => i === index ? { ...photo, caption } : photo));
  }

  const handleAddVoiceNote = () => {
    toast({
        title: "Feature Coming Soon!",
        description: "Voice note recording will be available in a future update.",
    })
  }
  
  const handleSave = () => {
    if (!selectedMood) {
        toast({ variant: "destructive", title: "Please select a mood" });
        return;
    }
    if (!title.trim()) {
        toast({ variant: "destructive", title: "Please add a title" });
        return;
    }
    if (!content.trim() || content === '<p><br></p>') {
        toast({ variant: "destructive", title: "Please write something in your journal" });
        return;
    }

    const newEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      mood: selectedMood,
      title: title.trim(),
      content: content,
      photos: photos,
      voiceNotes: [],
      folderId: selectedFolderId === 'uncategorized' ? undefined : selectedFolderId,
    };

    try {
      const existingEntriesString = localStorage.getItem('diaryEntries') || '[]';
      const existingEntries: DiaryEntry[] = JSON.parse(existingEntriesString);
      
      const updatedEntries = [newEntry, ...existingEntries];

      localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));

      toast({ title: "Entry Saved!", description: "Your thoughts are safe with us." });
      router.push("/diary");
    } catch (error) {
        console.error("Failed to save entry to localStorage", error);
        toast({ variant: "destructive", title: "Save Failed", description: "Could not save your entry." });
    }
  }

  const moodDetails = selectedMood ? moods[selectedMood] : null;

  return (
    <main className={cn( "min-h-screen w-full bg-background transition-colors duration-700" )}>
      {moodDetails && <div className={cn("fixed inset-0 -z-10", moodDetails.bg)} />}
      <div className="mx-auto max-w-2xl p-4 sm:p-6 md:p-8">
        <header className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/diary')}>
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-bold">New Entry</h1>
          <div className="flex items-center gap-2">
            <Button size="icon" className="bg-primary/80 hover:bg-primary" onClick={handleSave}>
                <Send />
            </Button>
          </div>
        </header>

        <Card className="rounded-2xl shadow-lg overflow-hidden transition-colors duration-500 bg-card/80 dark:bg-background/80 backdrop-blur-sm border-black/10 dark:border-white/10">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-3">How are you feeling today?</h2>
                <div className="flex justify-center items-center gap-3 sm:gap-4">
                  {Object.keys(moods).map((moodKey) => {
                    const mood = moods[moodKey as Mood]
                    return (
                      <button
                        key={moodKey}
                        onClick={() => setSelectedMood(moodKey as Mood)}
                        className={cn(
                          "text-3xl sm:text-4xl p-2 rounded-full transition-all duration-300",
                          selectedMood === moodKey ? 'bg-primary/30 scale-125 ring-2 ring-primary' : 'hover:scale-110 hover:bg-muted'
                        )}
                      >
                        {mood.emoji}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="w-full sm:w-auto">
                 <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Folder className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Select a journal" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="uncategorized">Uncategorized</SelectItem>
                        {folders.map(folder => (
                            <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
              </div>
            </div>

            <Input 
                placeholder="Give your entry a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold bg-transparent border-0 border-b-2 rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary"
            />
            
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="What's on your mind today?"
            />

            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <ImagePlus className="mr-2" /> Add Photos
                    </Button>
                    <Button variant="outline" onClick={handleAddVoiceNote}>
                        <Mic className="mr-2" /> Add Voice Note
                    </Button>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    multiple 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden" 
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                        <div key={index} className="relative group aspect-square">
                            <Image
                                src={photo.url}
                                alt={`Uploaded photo ${index + 1}`}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col p-2">
                                <button onClick={() => handleRemovePhoto(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X className="h-4 w-4" /></button>
                                <Input 
                                    placeholder="Caption..."
                                    value={photo.caption}
                                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                                    className="mt-auto bg-black/60 text-white border-white/20 text-xs h-8"
                                />
                            </div>
                        </div>
                    ))}
                     {photos.length < 5 && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <Camera className="h-8 w-8"/>
                            <span className="text-sm mt-1">Add Photo</span>
                        </button>
                    )}
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
