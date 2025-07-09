
export type Mood = "happy" | "calm" | "sad" | "angry" | "love";

export const moods: Record<Mood, { emoji: string; bg: string; sticker: string }> = {
  happy: { emoji: '😄', bg: 'bg-happy-gradient', sticker: '🌅' },
  calm: { emoji: '😌', bg: 'bg-calm-gradient', sticker: '🌌' },
  sad: { emoji: '😢', bg: 'bg-sad-gradient', sticker: '🌧️' },
  angry: { emoji: '😠', bg: 'bg-angry-gradient', sticker: '🔥' },
  love: { emoji: '😍', bg: 'bg-love-gradient', sticker: '💖' },
};

export const themesList: string[] = [
    "https://i.pinimg.com/736x/55/c2/a6/55c2a6e3784e70fe66cd0ebb75dfa534.jpg",
    "https://i.pinimg.com/736x/a9/1a/41/a91a410afc787f2b4e8a786adcea7d90.jpg",
    "https://i.pinimg.com/736x/1f/7a/9d/1f7a9d4c26e57e11224319d5de3c880e.jpg",
    "https://i.pinimg.com/736x/4a/f7/ab/4af7ab16c42f8b5bb0e1d553382c46f2.jpg",
    "https://i.pinimg.com/736x/68/11/d6/6811d6ebbc4c10d952e706dad8474e5a.jpg",
    "https://i.pinimg.com/736x/91/e8/7b/91e87bf57fa6a5b09e486e5914e13421.jpg",
    "https://i.pinimg.com/736x/9b/01/65/9b016559bde0cf5c33b31eec7d6e3437.jpg",
    "https://i.pinimg.com/736x/a5/84/ed/a584ed18deed4622dff514c8a666916e.jpg",
    "https://i.pinimg.com/736x/91/fb/84/91fb842d042ab80c40f516a5b64983bb.jpg",
];

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
    themeUrl?: string;
};

export type Folder = {
  id: string;
  name: string;
  entryCount: number;
  imageUrl: string;
  imageHint: string;
};

// Placeholder images for new journals
export const placeholderFolders: Omit<Folder, 'id' | 'name' | 'entryCount'>[] = [
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'abstract landscape' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'serene nature' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'mountain view' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'calm water' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'forest path' },
];

// Data is now empty to allow users to start fresh.
// In a real app, this would be fetched from a database.
export const mockFolders: Folder[] = [];

export const mockEntries: DiaryEntry[] = [];

export const mockChartData: any[] = [];
