import { useMemo, useState } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MessageSquareShare } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Property } from "@/lib/types"

interface ScheduleCalendarProps {
  properties: Property[] // Should be filtered to only scheduled properties
  onPropertyClick?: (property: Property) => void
}

export function ScheduleCalendar({ properties, onPropertyClick }: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")

  // Helper to generate days of the month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Use UTC to prevent timezone shifts if matching "agendamento" which is YYYY-MM-DD
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
      const agendamento = p.extras?.agendamento
      if (agendamento) {
        // Simple match assuming YYYY-MM-DD format
        const dateParts = agendamento.split("T")[0].split("-")
        const pYear = parseInt(dateParts[0])
        const pMonth = parseInt(dateParts[1]) - 1
        const pDay = parseInt(dateParts[2])

        if (pYear === year && pMonth === month) {
          const list = map.get(pDay) || []
          list.push(p)
          map.set(pDay, list)
        }
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
    setView("month")
  }

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })
  
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="w-full h-full flex flex-col overflow-hidden bg-background">
        
        {/* Header (Top Bar) */}
        <div className="flex flex-row items-center justify-between p-3 md:p-6 border-b border-border/40 gap-2 md:gap-4 bg-white rounded-t-xl border-x border-t w-full">
          <div className="flex items-center gap-2 md:gap-4 flex-1 md:flex-none overflow-x-auto pb-0 no-scrollbar min-w-0">
            <div className="hidden md:flex items-center gap-2 pr-4 border-r border-border/40 shrink-0">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground truncate">Visitas Agendadas</h2>
            </div>
            <div className="flex items-center gap-0.5 md:gap-1 bg-muted/50 p-1 rounded-lg shrink-0">
              <button onClick={goPrevMonth} className="inline-flex items-center justify-center rounded-md transition-colors h-7 w-7 md:h-8 md:w-8 hover:bg-white">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={goToday} className="inline-flex items-center justify-center transition-colors min-h-8 rounded-md px-2 md:px-3 h-7 md:h-8 text-[11px] md:text-xs font-bold hover:bg-white text-foreground">
                Hoje
              </button>
              <button onClick={goNextMonth} className="inline-flex items-center justify-center rounded-md transition-colors h-7 w-7 md:h-8 md:w-8 hover:bg-white">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <h3 className="text-[12px] md:text-sm font-bold text-muted-foreground shrink-0 capitalize whitespace-nowrap">
              {monthName}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="hidden md:block">
              <div className="inline-flex items-center justify-center rounded-lg text-muted-foreground bg-muted/50 p-1 h-9">
                <button 
                  onClick={() => setView('month')}
                  className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md transition-all text-xs font-bold px-3 h-7", view === 'month' && "bg-white text-foreground border border-border/40 shadow-sm")}
                >Mês</button>
                <button 
                  onClick={() => setView('week')}
                  className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md transition-all text-xs font-bold px-3 h-7", view === 'week' && "bg-white text-foreground border border-border/40 shadow-sm")}
                >Semana</button>
                <button 
                  onClick={() => setView('day')}
                  className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md transition-all text-xs font-bold px-3 h-7", view === 'day' && "bg-white text-foreground border border-border/40 shadow-sm")}
                >Dia</button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid do Calendário */}
        <div className="p-0 flex-1 flex flex-col overflow-hidden bg-white border-x border-b rounded-b-xl border-border/40">
          <div className="flex-1 grid grid-cols-7 bg-white">
            
            {/* Headers da semana */}
            {weekDays.map(d => (
               <div key={d} className="py-2 sm:py-3 text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest sm:tracking-wider text-muted-foreground border-b border-border/40 bg-white sm:bg-muted/20">
                 <span className="sm:hidden">{d.charAt(0)}</span>
                 <span className="hidden sm:inline">{d}</span>
               </div>
            ))}

            {/* Dias em branco iniciais */}
            {blanks.map(b => (
              <div key={`blank-${b}`} className="min-h-[70px] sm:min-h-[120px] p-0.5 sm:p-2 border-b border-border/40 sm:border-r transition-all opacity-30 sm:bg-muted/10 sm:opacity-40" />
            ))}

            {/* Dias do mês */}
            {days.map(day => {
              const dayProps = propertiesByDate.get(day) || []
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year

              return (
                <div key={day} className={cn(
                  "min-h-[70px] sm:min-h-[120px] p-0.5 sm:p-2 border-b border-border/40 sm:border-r transition-all group relative hover:bg-primary/[0.02] flex flex-col items-center sm:block",
                  isToday && "bg-primary/5 sm:bg-primary/5"
                )}>
                  <div className="flex justify-center sm:justify-between items-start mb-1 sm:mb-1 w-full">
                    <div className="flex-1 flex justify-center sm:justify-start">
                      <span className={cn(
                        "text-[15px] sm:text-sm font-normal sm:font-bold w-8 h-8 flex items-center justify-center rounded-full sm:rounded-lg transition-colors text-foreground sm:text-muted-foreground sm:group-hover:bg-muted",
                        isToday && "bg-primary text-white sm:text-white font-bold"
                      )}>
                        {day}
                      </span>
                    </div>
                  </div>

                  {/* Desktop event view */}
                  <div className="hidden sm:flex flex-col gap-1 overflow-hidden mt-1">
                    {dayProps.slice(0, 3).map((p, idx) => (
                      <div 
                        key={`${p.id}-${idx}`}
                        title={p.title}
                        onClick={(e) => { e.stopPropagation(); onPropertyClick?.(p); }}
                        className="cursor-pointer px-2 py-1 rounded text-[10px] font-bold border truncate transition-all flex items-center gap-1.5 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                      >
                        <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-blue-500" />
                        {p.title}
                        {p.extras?.agendamento?.includes('T') && <span className="text-blue-500 hidden xl:inline ml-auto">{p.extras.agendamento.split('T')[1]}</span>}
                      </div>
                    ))}
                    {dayProps.length > 3 && (
                      <div className="text-[10px] font-bold text-muted-foreground pl-1 mt-0.5">+ {dayProps.length - 3} mais</div>
                    )}
                  </div>

                  {/* Mobile dots view */}
                  <div className="flex justify-center gap-1 sm:hidden mt-auto mb-1 flex-wrap px-1">
                   {dayProps.slice(0, 3).map((p, idx) => (
                     <div key={`dot-${p.id}-${idx}`} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                   ))}
                   {dayProps.length > 3 && (
                     <div className="text-[9px] leading-none text-muted-foreground font-bold ml-0.5">+{dayProps.length - 3}</div>
                   )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
