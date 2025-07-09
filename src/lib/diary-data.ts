
export type Mood = "happy" | "calm" | "sad" | "angry" | "love";

export const moods: Record<Mood, { emoji: string; bg: string; sticker: string }> = {
  happy: { emoji: '😄', bg: 'bg-happy-gradient', sticker: '🌅' },
  calm: { emoji: '😌', bg: 'bg-calm-gradient', sticker: '🌌' },
  sad: { emoji: '😢', bg: 'bg-sad-gradient', sticker: '🌧️' },
  angry: { emoji: '😠', bg: 'bg-angry-gradient', sticker: '🔥' },
  love: { emoji: '😍', bg: 'bg-love-gradient', sticker: '💖' },
};

// Data is now empty to allow users to start fresh.
// In a real app, this would be fetched from a database.
export const mockFolders: any[] = [];

export const mockEntries: any[] = [];

export const mockChartData: any[] = [];
