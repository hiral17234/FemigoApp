
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Diary | Femigo",
  description: "Your personal space for thoughts and reflections.",
};

export default function DiaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-foreground">
        {children}
    </div>
  )
}
