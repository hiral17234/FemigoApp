
export type Mood = "happy" | "calm" | "sad" | "angry" | "love";

export const moods: Record<Mood, { emoji: string; bg: string; sticker: string }> = {
  happy: { emoji: '😄', bg: 'bg-happy-gradient', sticker: '🌅' },
  calm: { emoji: '😌', bg: 'bg-calm-gradient', sticker: '🌌' },
  sad: { emoji: '😢', bg: 'bg-sad-gradient', sticker: '🌧️' },
  angry: { emoji: '😠', bg: 'bg-angry-gradient', sticker: '🔥' },
  love: { emoji: '😍', bg: 'bg-love-gradient', sticker: '💖' },
};

export type DiaryPhoto = {
  url: string;
  caption: string;
}

export type VoiceNote = {
  url: string;
  name: string;
}

export type DiaryEntry = {
    id: string;
    date: string;
    mood: Mood;
    title: string;
    content: string;
    photos: DiaryPhoto[];
    voiceNotes?: VoiceNote[];
    folderId?: string;
};

export type Folder = {
  id: string;
  name: string;
  entryCount: number;
  imageUrl: string;
  imageHint: string;
};

export const placeholderFolders: Omit<Folder, 'id' | 'name' | 'entryCount'>[] = [
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'abstract landscape' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'serene nature' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'mountain view' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'calm water' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'forest path' },
];

export const mockFolders: Folder[] = [];
export const mockEntries: DiaryEntry[] = [];
export const mockChartData: any[] = [];
