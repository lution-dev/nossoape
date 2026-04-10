import { useState, useEffect, useMemo } from "react"
import { usePropertyStore } from "@/stores/propertyStore"
import { useAuthStore } from "@/stores/authStore"
import { useRealtimeProperties } from "@/hooks/useRealtime"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { PropertyCard } from "@/components/shared/PropertyCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { FAB } from "@/components/shared/FAB"
import { ScheduleCalendar } from "../components/ScheduleCalendar"
import { STATUS_LABELS, type PropertyStatus } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useNavigate, useSearchParams } from "react-router"
import { Home, Calendar, Search, X } from "lucide-react"

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
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [searchParams] = useSearchParams()
  const isScheduleFromUrl = searchParams.get("view") === "schedule"
  const [mainView, setMainView] = useState<MainView>(isScheduleFromUrl ? "schedule" : "home")
  const [activeTab, setActiveTab] = useState<TabFilter>("all")
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Mobile-only local search state
  const [mobileSearchQuery, setMobileSearchQuery] = useState("")
  const navigate = useNavigate()

  // Desktop: read search from URL params (Header writes ?q=)
  // Mobile: use local state
  const searchQuery = isDesktop
    ? (searchParams.get("q") || "")
    : mobileSearchQuery

  // Sync view from URL param (sidebar nav uses ?view=schedule)
  useEffect(() => {
    setMainView(isScheduleFromUrl ? "schedule" : "home")
  }, [isScheduleFromUrl])

  useEffect(() => {
    if (!board?.id) return
    if (properties.length > 0) return
    fetchProperties(board.id)
  }, [board?.id, fetchProperties, properties.length])

  useRealtimeProperties(board?.id)

  // Filter by status tab
  const tabFiltered =
    activeTab === "all"
      ? properties
      : properties.filter((p) => p.status === activeTab)

  // Filter by search query
  const filtered = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return tabFiltered
    const q = searchQuery.toLowerCase().trim()
    return tabFiltered.filter((p) =>
      p.title?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q) ||
      p.neighborhood?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q) ||
      p.source?.toLowerCase().includes(q)
    )
  }, [tabFiltered, searchQuery])

  const getCount = (key: TabFilter) =>
    key === "all"
      ? properties.length
      : properties.filter((p) => p.status === key).length

  const scheduledCount = properties.filter((p) => p.status === "scheduled").length

  return (
    <div className={cn("relative", !isDesktop && "pb-16")}>
      {mainView === "home" ? (
        <>
          {/* Search + Status Tabs Bar */}
          <div className={cn(
            "sticky z-20 bg-background/95 backdrop-blur-sm overflow-x-auto no-scrollbar",
            isDesktop ? "top-14 py-3 px-0" : "top-14 px-4 py-3 space-y-3"
          )}>
            {/* Search Input — Mobile only (desktop search is in the navbar) */}
            {!isDesktop && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar imóveis..."
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card pl-9 pr-9 h-9 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
                {mobileSearchQuery && (
                  <button
                    onClick={() => setMobileSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Status Tabs */}
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

          {/* Property Grid/List */}
          <div className={cn(isDesktop ? "py-4" : "px-4 py-2")}>
            {isLoading ? (
              <div className={cn(
                isDesktop
                  ? "grid grid-cols-2 xl:grid-cols-3 gap-4"
                  : "space-y-3"
              )}>
                {[1, 2, 3, 4, 5, 6].slice(0, isDesktop ? 6 : 3).map((i) => (
                  <div key={i} className="rounded-xl border bg-card overflow-hidden animate-pulse">
                    <div className="aspect-video bg-muted" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-3 w-1/3 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              searchQuery.trim().length >= 2 ? (
                <EmptyState
                  message={`Nenhum resultado para "${searchQuery}"`}
                  description="Tente buscar por outro termo"
                />
              ) : (
                <EmptyState
                  message={activeTab === "all" ? "Nenhum imóvel ainda" : `Nenhum imóvel ${STATUS_LABELS[activeTab as PropertyStatus]?.toLowerCase()}`}
                  description={activeTab === "all" ? "Adicione seu primeiro imóvel para começar" : "Mude o status de um imóvel para vê-lo aqui"}
                  onAddClick={activeTab === "all" ? () => setDrawerOpen(true) : undefined}
                />
              )
            ) : (
              <div className={cn(
                isDesktop
                  ? "grid grid-cols-2 xl:grid-cols-3 gap-4"
                  : "space-y-3"
              )}>
                {filtered.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Schedule View */
        <div className={cn(isDesktop ? "py-4" : "px-4 py-4")}>
          <ScheduleCalendar
            properties={properties.filter((p) => p.status === "scheduled")}
            onPropertyClick={(p) => navigate(`/property/${p.id}`)}
            isDesktop={isDesktop}
          />
        </div>
      )}

      {/* Bottom Tab Bar — Mobile only */}
      {!isDesktop && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
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
                <span className="absolute top-0.5 left-1/2 ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-bold text-background">
                  {scheduledCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      )}

      {/* FAB — Mobile only */}
      {!isDesktop && (
        <FAB drawerOpen={drawerOpen} onDrawerOpenChange={setDrawerOpen} />
      )}
    </div>
  )
}
