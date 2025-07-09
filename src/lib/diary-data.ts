
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
    themeUrl?: string;
};

export type Folder = {
  id: string;
  name: string;
  imageUrl: string;
  imageHint: string;
};

export const themesList = [
    "https://i.pinimg.com/564x/4f/4a/92/4f4a92955f1a32943498305d3c86144e.jpg", // Pink sparkle
    "https://i.pinimg.com/564x/b8/97/81/b897813583c26927a731d6a365448386.jpg", // Purple galaxy
    "https://i.pinimg.com/564x/6c/e0/a1/6ce0a142138a74e54ad3a14a38f03783.jpg", // Blue clouds
    "https://i.pinimg.com/564x/e7/0d/18/e70d186c2a4f4b9f1d07b79143890333.jpg", // Orange sunset
    "https://i.pinimg.com/564x/c4/86/e1/c486e118c7c938f8e022f87a3715e7a9.jpg", // Green leaves
    "https://i.pinimg.com/564x/77/82/39/77823930b8d5a1913f89836365a44371.jpg", // Rainy window
];


export const placeholderFolders: Omit<Folder, 'id' | 'name'>[] = [
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'abstract landscape' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'serene nature' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'mountain view' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'calm water' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'forest path' },
];

    