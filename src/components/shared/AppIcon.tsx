import { cn } from "@/lib/utils"

interface AppIconProps {
  className?: string
}

/**
 * App icon (house with golden window) — no background, just the icon shape.
 * Uses currentColor for the house so it adapts to dark/light themes.
 */
export function AppIcon({ className }: AppIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={cn("h-7 w-7", className)}
    >
      <path
        d="M16 6L4 18h5v8h14v-8h5L16 6z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="13" y="18" width="6" height="6" rx="0.5" fill="#F5A623" />
    </svg>
  )
}
