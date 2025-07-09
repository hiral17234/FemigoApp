
export type Mood = "happy" | "calm" | "sad" | "angry" | "love";

export const moods: Record<Mood, { emoji: string; bg: string; sticker: string }> = {
  happy: { emoji: '😄', bg: 'bg-happy-gradient', sticker: '🌅' },
  calm: { emoji: '😌', bg: 'bg-calm-gradient', sticker: '🌌' },
  sad: { emoji: '😢', bg: 'bg-sad-gradient', sticker: '🌧️' },
  angry: { emoji: '😠', bg: 'bg-angry-gradient', sticker: '🔥' },
  love: { emoji: '😍', bg: 'bg-love-gradient', sticker: '💖' },
};

export const mockFolders = [
    {
        id: "1",
        name: "Travel Diary",
        entryCount: 12,
        imageUrl: "https://placehold.co/600x400.png",
        imageHint: "travel landscape"
    },
    {
        id: "2",
        name: "Personal Growth",
        entryCount: 5,
        imageUrl: "https://placehold.co/600x400.png",
        imageHint: "person meditating"
    },
    {
        id: "3",
        name: "Student Life",
        entryCount: 28,
        imageUrl: "https://placehold.co/600x400.png",
        imageHint: "books library"
    },
     {
        id: "4",
        name: "Relationship Thoughts",
        entryCount: 8,
        imageUrl: "https://placehold.co/600x400.png",
        imageHint: "couple holding hands"
    },
];

export const mockEntries = [
    {
        id: "e1",
        date: "July 9, 2024",
        title: "A wonderful day at the beach",
        content: "The sun was warm, the water was cool, and I felt so at peace. It was just what I needed to recharge my batteries and find some clarity. Listened to the waves for hours.",
        mood: "happy" as Mood,
        photoUrl: "https://placehold.co/400x400.png",
        imageHint: "beach sunset"
    },
    {
        id: "e2",
        date: "July 8, 2024",
        title: "Quiet evening with a book",
        content: "Finished reading 'The Midnight Library' and it was phenomenal. So many thoughts about life and the choices we make. Felt very calm and introspective afterwards.",
        mood: "calm" as Mood,
        photoUrl: null,
        imageHint: ""
    },
    {
        id: "e3",
        date: "July 7, 2024",
        title: "Feeling a bit down today",
        content: "Work was overwhelming and I miss my family. Just one of those days where everything feels a bit heavy. Hoping for a better tomorrow.",
        mood: "sad" as Mood,
        photoUrl: "https://placehold.co/400x400.png",
        imageHint: "rain window"
    },
];

export const mockChartData = [
  { name: "Mon", mood: 4 },
  { name: "Tue", mood: 3 },
  { name: "Wed", mood: 5 },
  { name: "Thu", mood: 4 },
  { name: "Fri", mood: 2 },
  { name: "Sat", mood: 5 },
  { name: "Sun", mood: 4 },
];
