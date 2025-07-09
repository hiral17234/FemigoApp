
"use client"

import { cn } from "@/lib/utils"
import { Bold, Italic, Palette } from "lucide-react"
import React, { useRef, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const colors = [
  "#000000", // Black
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

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
    onChange(event.currentTarget.innerHTML)
  }

  const executeAndUpdate = (command: string, val?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, val);
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="rounded-md border border-input bg-background/50">
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
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className={cn(
          "min-h-[250px] w-full bg-transparent p-4 text-base focus-visible:outline-none prose-p:my-0",
          !value && "text-muted-foreground"
        )}
        data-placeholder={placeholder}
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  )
}
