import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ClipboardPaste, Link2, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

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

type InputState = "idle" | "focused" | "extracting" | "success" | "error"

export function LinkInput({ value, onChange, onUrlDetected, isExtracting }: LinkInputProps) {
  const [inputState, setInputState] = useState<InputState>("idle")
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
    // Clear success state when user edits
    if (inputState === "success" || inputState === "error") {
      setInputState("focused")
    }
  }

  const handleBlur = () => {
    setInputState("idle")
    detectUrl(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      detectUrl(value)
      inputRef.current?.blur()
    }
  }

  const handleClipboardPaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (isValidUrl(text.trim())) {
        onChange(text.trim())
        detectUrl(text.trim())
        toast.success("Link colado!")
      } else {
        toast.error("Nenhum link válido na área de transferência")
      }
    } catch {
      toast.error("Permissão negada para acessar área de transferência")
    }
  }

  // Derive state from props + local state
  const effectiveState: InputState = isExtracting
    ? "extracting"
    : inputState

  const stateStyles = {
    idle: "border-border/50 bg-muted/30",
    focused: "border-foreground/25 bg-muted/50 shadow-[0_0_0_3px] shadow-foreground/5",
    extracting: "border-primary/40 bg-muted/50 shadow-[0_0_0_3px] shadow-primary/10",
    success: "border-green-500/50 bg-green-500/5 shadow-[0_0_0_3px] shadow-green-500/10",
    error: "border-destructive/50 bg-destructive/5",
  }

  const leadingIcon = {
    idle: <Link2 className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-colors" />,
    focused: <Link2 className="h-4 w-4 shrink-0 text-foreground/60 transition-colors" />,
    extracting: (
      <Loader2 className="h-4 w-4 shrink-0 text-primary animate-spin" />
    ),
    success: <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />,
    error: <XCircle className="h-4 w-4 shrink-0 text-destructive" />,
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border transition-all duration-200",
        stateStyles[effectiveState]
      )}
    >
      <div className="flex items-center gap-3 px-5 py-3.5">
        {/* Leading icon — reacts to state */}
        <span className="transition-all duration-200">
          {leadingIcon[effectiveState]}
        </span>

        {/* Main input */}
        <Input
          ref={inputRef}
          type="url"
          placeholder="Cole o link do imóvel aqui"
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setInputState("focused")}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="border-0 bg-transparent px-0 text-sm shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 font-medium"
        />

        {/* Clipboard button — functional */}
        {!isExtracting && (
          <button
            type="button"
            onClick={handleClipboardPaste}
            className={cn(
              "shrink-0 rounded-md p-1.5 transition-all duration-150",
              "text-muted-foreground/40 hover:text-foreground/70 hover:bg-foreground/8",
              "active:scale-90"
            )}
            title="Colar da área de transferência"
          >
            <ClipboardPaste className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Extracting progress bar */}
      {isExtracting && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl overflow-hidden">
          <div className="h-full bg-primary/60 animate-[extracting_1.4s_ease-in-out_infinite]" />
        </div>
      )}
    </div>
  )
}
