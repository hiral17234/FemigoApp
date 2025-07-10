
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
    "https://i.pinimg.com/474x/77/fb/cf/77fbcf6a795187ed64cc80aa20235f43.jpg",
    "https://i.pinimg.com/736x/25/43/2a/25432a5ad0ac0508999c6816c4850e2f.jpg",
    "https://i.pinimg.com/736x/b1/13/69/b113694967b5f4c113a1ddde7d767a2d.jpg",
    "https://i.pinimg.com/736x/13/ba/44/13ba44beda97550f3cd1921b5d7f51c8.jpg",
    "https://i.pinimg.com/736x/15/ea/4a/15ea4a490a6a162a02c03745a1ff567b.jpg",
    "https://i.pinimg.com/736x/29/19/6a/29196a1450e9f60f3d8482ba30b9252d.jpg",
    "https://i.pinimg.com/736x/7d/6c/6c/7d6c6ce6bf4ff45c63b8ebce31ef5c3d.jpg",
    "https://i.pinimg.com/736x/66/26/2a/66262add3cd0e45a30ffbbc6cf1e6678.jpg",
    "https://i.pinimg.com/736x/f4/14/4d/f4144dad1c5446fd322c54a8e6e09b28.jpg",
    "https://i.pinimg.com/736x/4f/f8/44/4ff844f49052b4e9d2b3f7a9f9fa60fc.jpg",
    "https://i.pinimg.com/736x/5a/cb/39/5acb39fc16fb22d676b8a74531e900a6.jpg",
    "https://i.pinimg.com/736x/e3/1b/b8/e31bb8ab47b3b8c9a7604a03f4e02510.jpg"
];


export const placeholderFolders: Omit<Folder, 'id'>[] = [
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'abstract landscape' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'serene nature' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'mountain view' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'calm water' },
    { imageUrl: 'https://placehold.co/600x400.png', imageHint: 'forest path' },
];

export const placeholderEntries: Omit<DiaryEntry, 'id'>[] = [
  {
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    mood: 'happy',
    title: 'A Wonderful Day',
    content: '<p>Today was a fantastic day! I spent the afternoon at the park, enjoying the sunshine and reading a good book. It felt so refreshing to just disconnect and be present in the moment.</p>',
    photos: [],
    folderId: 'journal1'
  },
    {
    date: new Date(Date.now() - 86400000).toISOString(),
    mood: 'calm',
    title: 'Quiet Evening Thoughts',
    content: '<p>The evening was so peaceful. I listened to some lo-fi music and just let my mind wander. It\'s amazing how calming a bit of quiet can be after a hectic week. Feeling centered and ready for whatever comes next.</p>',
    photos: [
        { url: 'https://placehold.co/600x400.png', caption: 'My cozy corner' }
    ],
    folderId: 'journal2'
  },
    {
    date: new Date().toISOString(),
    mood: 'love',
    title: 'Feeling Grateful',
    content: '<p>Had a lovely video call with my family today. It\'s moments like these that remind me of how much love surrounds me. Feeling incredibly grateful for my support system. ❤️</p>',
    photos: [],
    folderId: 'journal1'
  },
];
