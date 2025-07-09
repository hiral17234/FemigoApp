
"use client"

import { cn } from "@/lib/utils"
import { Bold, Italic, Palette, Paintbrush, Check } from "lucide-react"
import React, { useRef, useEffect, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { themesList } from "@/lib/diary-data"
import Image from 'next/image'


interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  selectedTheme: string | null
  onThemeChange: (theme: string | null) => void
}

const colors = [
  "#000000",
  "#ffffff", // White
  "#868e96", // Gray
  "#fa5252", // Red
  "#e64980", // Pink
  "#be4bdb", // Grape
  "#7950f2", // Violet
  "#4c6ef5", // Indigo
  "#228be6", // Blue
  "#15aabf", // Cyan
  "#12b886", // Teal
  "#40c057", // Green
  "#82c91e", // Lime
  "#fab005", // Yellow
  "#fd7e14", // Orange
]

export const RichTextEditor = ({ value, onChange, placeholder, selectedTheme, onThemeChange }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [themePopoverOpen, setThemePopoverOpen] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])
  
  const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
    onChange(event.currentTarget.innerHTML);
  };
  
  const executeAndUpdate = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    if(editorRef.current) {
        onChange(editorRef.current.innerHTML); 
        editorRef.current.focus(); 
    }
  };

  return (
    <div
      className="rounded-md border border-input bg-transparent overflow-hidden relative"
      style={{
        backgroundImage: selectedTheme ? `url(${selectedTheme})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
        <div className={cn(
            "bg-transparent",
            selectedTheme && 'bg-background/80 backdrop-blur-sm'
        )}>
            <div className="flex flex-wrap items-center gap-1 border-b p-2">
                <Button
                type="button"
                variant="ghost"
                size="icon"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeAndUpdate("bold")}
                aria-label="Bold"
                >
                <Bold className="h-4 w-4" />
                </Button>
                <Button
                type="button"
                variant="ghost"
                size="icon"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => executeAndUpdate("italic")}
                aria-label="Italic"
                >
                <Italic className="h-4 w-4" />
                </Button>
                <Popover>
                <PopoverTrigger asChild>
                    <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Text Color"
                    onMouseDown={(e) => e.preventDefault()}
                    >
                    <Palette className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                    <div className="grid grid-cols-5 gap-1">
                    {colors.map((color) => (
                        <Button
                        key={color}
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        style={{ backgroundColor: color, border: '1px solid #444' }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => executeAndUpdate("foreColor", color)}
                        aria-label={`Color ${color}`}
                        />
                    ))}
                    </div>
                </PopoverContent>
                </Popover>
                 <Popover open={themePopoverOpen} onOpenChange={setThemePopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" aria-label="Theme" onMouseDown={(e) => e.preventDefault()}>
                            <Paintbrush className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-3 gap-2">
                            {themesList.map((theme, index) => (
                                <button key={index} className="relative aspect-square w-20 h-20 rounded-md overflow-hidden ring-offset-background ring-offset-2 focus:outline-none focus:ring-2 focus:ring-ring" onClick={() => {
                                    onThemeChange(theme);
                                    setThemePopoverOpen(false);
                                }}>
                                    <Image src={theme} layout="fill" objectFit="cover" alt={`Theme ${index + 1}`} className="hover:scale-110 transition-transform" />
                                    {selectedTheme === theme && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Check className="text-white h-8 w-8" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        {selectedTheme && (
                            <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => onThemeChange(null)}>Clear Theme</Button>
                        )}
                    </PopoverContent>
                </Popover>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                suppressContentEditableWarning={true}
                className={cn(
                "min-h-[250px] w-full p-4 text-base focus-visible:outline-none prose-p:my-0",
                !value && "text-muted-foreground"
                )}
                data-placeholder={placeholder}
                style={{ whiteSpace: 'pre-wrap' }}
            />
        </div>
    </div>
  )
}
