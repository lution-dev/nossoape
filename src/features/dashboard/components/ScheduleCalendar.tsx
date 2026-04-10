import { useMemo, useState } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Property } from "@/lib/types"

interface ScheduleCalendarProps {
  properties: Property[] // Should be filtered to only scheduled properties
  onPropertyClick?: (property: Property) => void
  isDesktop?: boolean
}

export function ScheduleCalendar({ properties, onPropertyClick, isDesktop = false }: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())

  // Helper to generate days of the month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() // 0-11
  
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = new Date(year, month, 1).getDay() // 0 (Sun) to 6 (Sat)
  // Shift to Monday first: 0 (Mon) to 6 (Sun)
  const shift = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: shift }, (_, i) => i)

  // Map properties to their scheduled dates
  const propertiesByDate = useMemo(() => {
    const map = new Map<number, Property[]>()
    properties.forEach((p) => {
      // Try extras.agendamento first, fallback to updated_at date
      const dateStr = p.extras?.agendamento || p.updated_at
      if (!dateStr) return

      const dateParts = dateStr.split("T")[0].split("-")
      const pYear = parseInt(dateParts[0])
      const pMonth = parseInt(dateParts[1]) - 1
      const pDay = parseInt(dateParts[2])

      if (pYear === year && pMonth === month) {
        const list = map.get(pDay) || []
        list.push(p)
        map.set(pDay, list)
      }
    })
    return map
  }, [properties, year, month])

  const goPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToday = () => {
    setCurrentDate(new Date())
  }

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  // Upcoming list for mobile
  const upcomingProperties = useMemo(() => {
    return properties
      .map((p) => {
        const dateStr = p.extras?.agendamento || p.updated_at
        return { ...p, _scheduleDate: dateStr }
      })
      .sort((a, b) => (a._scheduleDate || "").localeCompare(b._scheduleDate || ""))
  }, [properties])

  const calendarCard = (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold capitalize">{monthName}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={goPrevMonth} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={goToday} className="px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            Hoje
          </button>
          <button onClick={goNextMonth} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {/* Week day headers */}
        {weekDays.map(d => (
          <div key={d} className={cn(
            "text-center font-medium uppercase tracking-wider text-muted-foreground border-b border-border",
            isDesktop ? "py-2.5 text-xs" : "py-2 text-[10px]"
          )}>
            {isDesktop ? d : d.charAt(0)}
          </div>
        ))}

        {/* Blank days */}
        {blanks.map(b => (
          <div key={`blank-${b}`} className={cn(
            "border-b border-border/30 bg-muted/10",
            isDesktop ? "h-24" : "h-12"
          )} />
        ))}

        {/* Days */}
        {days.map(day => {
          const dayProps = propertiesByDate.get(day) || []
          const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year
          const hasEvents = dayProps.length > 0

          return (
            <div
              key={day}
              className={cn(
                "flex flex-col border-b border-border/30 transition-colors",
                isDesktop ? "h-24 p-1.5" : "h-12 items-center justify-center gap-0.5",
                hasEvents && "cursor-pointer",
                hasEvents && "bg-purple-500/5"
              )}
              onClick={() => {
                if (dayProps.length === 1) onPropertyClick?.(dayProps[0])
              }}
            >
              <span className={cn(
                "font-medium flex items-center justify-center rounded-full transition-colors",
                isDesktop ? "text-xs w-6 h-6 mb-0.5" : "text-sm w-7 h-7",
                isToday && "bg-foreground text-background font-bold",
                hasEvents && !isToday && "text-purple-500 font-bold"
              )}>
                {day}
              </span>
              {/* Desktop: show property titles in cells */}
              {isDesktop && hasEvents && (
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {dayProps.slice(0, 2).map((p) => {
                    const time = p.extras?.agendamento?.includes("T")
                      ? p.extras.agendamento.split("T")[1]
                      : null
                    return (
                      <button
                        key={p.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onPropertyClick?.(p)
                        }}
                        className="truncate rounded bg-purple-500/15 px-1 py-0.5 text-left text-[10px] font-medium text-purple-400 hover:bg-purple-500/25 transition-colors"
                      >
                        {time && <span className="text-purple-500/70">{time} </span>}
                        {p.title}
                      </button>
                    )
                  })}
                  {dayProps.length > 2 && (
                    <span className="text-[9px] text-muted-foreground px-1">+{dayProps.length - 2} mais</span>
                  )}
                </div>
              )}
              {/* Mobile: dots only */}
              {!isDesktop && hasEvents && (
                <div className="flex gap-0.5">
                  {dayProps.slice(0, 3).map((p, idx) => (
                    <div key={`dot-${p.id}-${idx}`} className="w-1 h-1 rounded-full bg-purple-500" />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  const upcomingList = (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground px-1">Visitas agendadas</h3>
      {upcomingProperties.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhuma visita agendada</p>
      ) : (
        <div className="space-y-2">
          {upcomingProperties.map((p) => {
            const dateStr = p._scheduleDate
            const formatted = dateStr
              ? new Date(dateStr.includes("T") ? dateStr : dateStr + "T12:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' })
              : "Sem data"
            const time = dateStr?.includes("T") && p.extras?.agendamento?.includes("T")
              ? dateStr.split("T")[1]
              : null

            return (
              <button
                key={p.id}
                onClick={() => onPropertyClick?.(p)}
                className="flex items-center gap-3 w-full rounded-xl border border-border bg-card p-3 text-left hover:bg-secondary/50 transition-colors"
              >
                {/* Image */}
                <div className="h-12 w-12 shrink-0 rounded-lg bg-muted overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CalendarIcon className="h-3 w-3 text-purple-500" />
                    <span className="text-xs text-muted-foreground capitalize">{formatted}</span>
                    {time && <span className="text-xs text-muted-foreground">· {time}</span>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  // Desktop: side-by-side layout
  if (isDesktop) {
    return (
      <div className="grid grid-cols-[1fr_340px] gap-6">
        {calendarCard}
        {upcomingList}
      </div>
    )
  }

  // Mobile: stacked layout (original)
  return (
    <div className="space-y-4">
      {calendarCard}
      {upcomingList}
    </div>
  )
}
