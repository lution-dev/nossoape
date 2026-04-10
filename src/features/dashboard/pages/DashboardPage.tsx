import { useState, useEffect } from "react"
import { usePropertyStore } from "@/stores/propertyStore"
import { useAuthStore } from "@/stores/authStore"
import { useRealtimeProperties } from "@/hooks/useRealtime"
import { PropertyCard } from "@/components/shared/PropertyCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { FAB } from "@/components/shared/FAB"
import { ScheduleCalendar } from "../components/ScheduleCalendar"
import { STATUS_LABELS, type PropertyStatus } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router"
import { Home, Calendar } from "lucide-react"

type TabFilter = "all" | PropertyStatus
type MainView = "home" | "schedule"

const tabs: { key: TabFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "new", label: STATUS_LABELS.new },
  { key: "interest", label: STATUS_LABELS.interest },
  { key: "visited", label: STATUS_LABELS.visited },
  { key: "favorite", label: STATUS_LABELS.favorite },
  { key: "discarded", label: STATUS_LABELS.discarded },
]

export function DashboardPage() {
  const { properties, fetchProperties, isLoading } = usePropertyStore()
  const { board } = useAuthStore()
  const [mainView, setMainView] = useState<MainView>("home")
  const [activeTab, setActiveTab] = useState<TabFilter>("all")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!board?.id) return
    if (properties.length > 0) return
    fetchProperties(board.id)
  }, [board?.id, fetchProperties, properties.length])

  useRealtimeProperties(board?.id)

  const filtered =
    activeTab === "all"
      ? properties
      : properties.filter((p) => p.status === activeTab)

  const getCount = (key: TabFilter) =>
    key === "all"
      ? properties.length
      : properties.filter((p) => p.status === key).length

  const scheduledCount = properties.filter((p) => p.status === "scheduled").length

  return (
    <div className="relative pb-16">
      {mainView === "home" ? (
        <>
          {/* Status Tabs */}
          <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm px-4 py-3 overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const count = getCount(tab.key)
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span className={cn("ml-1", isActive ? "text-background/70" : "text-muted-foreground/60")}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Property List */}
          <div className="px-4 py-2">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border bg-card overflow-hidden animate-pulse">
                    <div className="aspect-video bg-muted" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-3 w-1/3 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                message={activeTab === "all" ? "Nenhum imóvel ainda" : `Nenhum imóvel ${STATUS_LABELS[activeTab as PropertyStatus]?.toLowerCase()}`}
                description={activeTab === "all" ? "Adicione seu primeiro imóvel para começar" : "Mude o status de um imóvel para vê-lo aqui"}
                onAddClick={activeTab === "all" ? () => setDrawerOpen(true) : undefined}
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Schedule View */
        <div className="px-4 py-4">
          <ScheduleCalendar
            properties={properties.filter((p) => p.status === "scheduled")}
            onPropertyClick={(p) => navigate(`/property/${p.id}`)}
          />
        </div>
      )}

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-[#141416]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-around">
          <button
            onClick={() => setMainView("home")}
            className={cn(
              "flex flex-col items-center gap-0.5 px-6 py-1.5 transition-colors",
              mainView === "home" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Home className={cn("h-5 w-5", mainView === "home" && "stroke-[2.5px]")} />
            <span className="text-[10px] font-medium">Início</span>
          </button>
          <button
            onClick={() => setMainView("schedule")}
            className={cn(
              "relative flex flex-col items-center gap-0.5 px-6 py-1.5 transition-colors",
              mainView === "schedule" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Calendar className={cn("h-5 w-5", mainView === "schedule" && "stroke-[2.5px]")} />
            <span className="text-[10px] font-medium">Agendamentos</span>
            {scheduledCount > 0 && (
              <span className="absolute top-0.5 left-1/2 ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-500 px-1 text-[9px] font-bold text-white">
                {scheduledCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* FAB */}
      <FAB drawerOpen={drawerOpen} onDrawerOpenChange={setDrawerOpen} />
    </div>
  )
}
