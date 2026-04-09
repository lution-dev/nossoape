import { cn } from "@/lib/utils"
import { STATUS_LABELS, type PropertyStatus } from "@/lib/constants"

interface StatusBadgeProps {
  status: PropertyStatus
  className?: string
}

const statusStyles: Record<PropertyStatus, string> = {
  new: "bg-blue-500/90 text-white",
  interest: "bg-amber-500/90 text-white",
  scheduled: "bg-purple-500/90 text-white",
  visited: "bg-emerald-500/90 text-white",
  favorite: "bg-rose-500/90 text-white",
  discarded: "bg-zinc-500/90 text-white",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide shadow-sm backdrop-blur-sm",
        statusStyles[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
