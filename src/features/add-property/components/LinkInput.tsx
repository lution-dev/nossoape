import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ClipboardPaste, Link as LinkIcon, Loader2 } from "lucide-react"

interface LinkInputProps {
  value: string
  onChange: (url: string) => void
  onUrlDetected?: (url: string) => void
  isExtracting?: boolean
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function LinkInput({ value, onChange, onUrlDetected, isExtracting }: LinkInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastDetectedRef = useRef<string>("")

  const detectUrl = (url: string) => {
    const trimmed = url.trim()
    if (isValidUrl(trimmed) && trimmed !== lastDetectedRef.current) {
      lastDetectedRef.current = trimmed
      onUrlDetected?.(trimmed)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").trim()
    if (isValidUrl(pasted)) {
      e.preventDefault()
      onChange(pasted)
      detectUrl(pasted)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Detect URL on blur (user finished typing)
    detectUrl(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      detectUrl(value)
      inputRef.current?.blur()
    }
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed transition-colors",
        isFocused
          ? "border-foreground/30 bg-secondary/50"
          : "border-border bg-secondary/20"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-4">
        {isExtracting ? (
          <Loader2 className="h-5 w-5 shrink-0 text-muted-foreground animate-spin" />
        ) : (
          <LinkIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
        )}
        <Input
          ref={inputRef}
          type="url"
          placeholder="Cole o link do imóvel aqui"
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="border-0 bg-transparent px-0 text-base shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
        />
        <ClipboardPaste className="h-5 w-5 shrink-0 text-muted-foreground/40" />
      </div>
    </div>
  )
}
