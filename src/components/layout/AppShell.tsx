import { useState } from "react"
import { Outlet, useLocation } from "react-router"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { AddPropertyDrawer } from "@/features/add-property/components/AddPropertyDrawer"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

// Pages that should NOT show the default header
const STANDALONE_PAGES = ["/login", "/onboarding"]
// Pages that should show a back button in the header
const BACK_PAGES = ["/search", "/profile"]

export function AppShell() {
  const location = useLocation()
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const isStandalone = STANDALONE_PAGES.some((p) => location.pathname.startsWith(p))
  const isPropertyDetail = location.pathname.startsWith("/property/")
  const showBack = BACK_PAGES.some((p) => location.pathname === p)

  // Desktop "Add Property" dialog state
  const [desktopDrawerOpen, setDesktopDrawerOpen] = useState(false)

  // Standalone pages (login, onboarding) render without shell
  if (isStandalone) {
    return <Outlet />
  }

  // Property detail has its own header
  if (isPropertyDetail) {
    return (
      <div className="min-h-svh bg-background">
        {isDesktop && <Sidebar onAddProperty={() => setDesktopDrawerOpen(true)} />}
        <div className={isDesktop ? "pl-60" : ""}>
          <Outlet />
        </div>
        {/* Desktop Add Property Dialog */}
        {isDesktop && (
          <DesktopAddDialog open={desktopDrawerOpen} onOpenChange={setDesktopDrawerOpen} />
        )}
      </div>
    )
  }

  // Desktop layout: Sidebar + expanded content
  if (isDesktop) {
    return (
      <div className="min-h-svh bg-background">
        <Sidebar onAddProperty={() => setDesktopDrawerOpen(true)} />
        <div className="pl-60">
          <Header showBack={showBack} isDesktop />
          <main className="mx-auto max-w-6xl px-6 pb-6">
            <Outlet />
          </main>
        </div>
        <DesktopAddDialog open={desktopDrawerOpen} onOpenChange={setDesktopDrawerOpen} />
      </div>
    )
  }

  // Mobile layout: Header + content + bottom nav (unchanged)
  return (
    <div className="min-h-svh bg-background">
      <Header showBack={showBack} />
      <main className="mx-auto max-w-lg pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
    </div>
  )
}

/**
 * Desktop-only Dialog wrapper for Add Property.
 * On mobile the FAB + Drawer is used instead.
 */
function DesktopAddDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">Adicionar imóvel</DialogTitle>
        <div className="p-6">
          <AddPropertyInlineForm onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Inline add property form for desktop dialog.
 * Reuses the same logic as AddPropertyDrawer but without the Drawer wrapper.
 */
import { LinkInput } from "@/features/add-property/components/LinkInput"
import { PropertyPreview } from "@/features/add-property/components/PropertyPreview"
import { useLinkExtractor } from "@/features/add-property/hooks/useLinkExtractor"
import { usePropertyStore } from "@/stores/propertyStore"
import { useAuthStore } from "@/stores/authStore"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ChevronDown, ChevronUp } from "lucide-react"
import { MODALITY_LABELS } from "@/lib/constants"
import { useEffect } from "react"

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return ""
  }
}

function AddPropertyInlineForm({ onClose }: { onClose: () => void }) {
  const { addProperty } = usePropertyStore()
  const { board, user } = useAuthStore()
  const [linkUrl, setLinkUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const { data: extractedData, isExtracting, error: extractError, extract, reset } = useLinkExtractor()

  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [parkingSpots, setParkingSpots] = useState("")
  const [area, setArea] = useState("")
  const [modality, setModality] = useState<"rent" | "buy">("rent")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (extractedData) {
      setTitle(extractedData.title || "")
      setPrice(extractedData.price || "")
      setNeighborhood(extractedData.neighborhood || "")
      setBedrooms(extractedData.bedrooms || "")
      setBathrooms(extractedData.bathrooms || "")
      setParkingSpots(extractedData.parkingSpots || "")
      setArea(extractedData.area || "")
      setModality(extractedData.modality || "rent")
    }
  }, [extractedData])

  const handleUrlDetected = async (url: string) => {
    await extract(url)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Preencha pelo menos o título")
      return
    }

    setIsSubmitting(true)
    try {
      const baseProperty = {
        board_id: board?.id || "00000000-0000-0000-0000-000000000000",
        url: linkUrl || "",
        title: title.trim(),
        image_url: extractedData?.imageUrl || null,
        price: price || null,
        modality: modality,
        address: extractedData?.address || null,
        neighborhood: neighborhood || null,
        type: "apartment" as const,
        area: area ? parseInt(area) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        parking_spots: parkingSpots ? parseInt(parkingSpots) : null,
        status: "new" as const,
        added_by: user?.id || "00000000-0000-0000-0000-000000000000",
        source: extractDomain(linkUrl) || extractedData?.source || null,
        notes: notes || null,
      }

      const extendedFields = {
        price_breakdown: extractedData?.priceBreakdown || null,
        extras: (extractedData?.extras && Object.keys(extractedData.extras).length > 0)
          ? extractedData.extras
          : null,
      }

      let result = await supabase
        .from("properties")
        .insert({ ...baseProperty, ...extendedFields })
        .select()
        .single()

      if (result.error) {
        const breakdownJson = extractedData?.priceBreakdown
          ? `\n<!--BREAKDOWN:${JSON.stringify(extractedData.priceBreakdown)}-->`
          : ""
        const notesWithBreakdown = (baseProperty.notes || "") + breakdownJson

        result = await supabase
          .from("properties")
          .insert({ ...baseProperty, notes: notesWithBreakdown || null })
          .select()
          .single()
      }

      if (result.error) throw result.error

      const savedProperty = {
        ...result.data,
        price_breakdown: result.data.price_breakdown ?? extractedData?.priceBreakdown ?? null,
        extras: result.data.extras ?? extractedData?.extras ?? null,
      }

      addProperty(savedProperty)
      toast.success("Imóvel adicionado! 🏠")
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasData = !!extractedData || !!title.trim()
  const toggleLabel = extractedData ? "Editar dados" : "Adicionar manualmente"

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Adicionar Imóvel</h2>
        <p className="text-sm text-muted-foreground mt-1">Cole o link do anúncio ou preencha manualmente</p>
      </div>

      <LinkInput
        value={linkUrl}
        onChange={setLinkUrl}
        onUrlDetected={handleUrlDetected}
        isExtracting={isExtracting}
      />

      {(isExtracting || extractedData || extractError) && (
        <PropertyPreview
          data={extractedData}
          isLoading={isExtracting}
          error={extractError}
        />
      )}

      {!isExtracting && (
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <button
            onClick={() => setShowEdit(!showEdit)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showEdit ? "Ocultar" : toggleLabel}
            {showEdit ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <Separator className="flex-1" />
        </div>
      )}

      {showEdit && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="desktop-title">Título <span className="text-destructive">*</span></Label>
            <Input
              id="desktop-title"
              placeholder="Ex: Apartamento 2 quartos Centro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="desktop-price">Preço</Label>
              <Input
                id="desktop-price"
                placeholder="R$ 2.500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Modalidade</Label>
              <Select value={modality} onValueChange={(v) => setModality(v as "rent" | "buy")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(MODALITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desktop-neighborhood">Bairro</Label>
            <Input
              id="desktop-neighborhood"
              placeholder="Ex: Centro"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label htmlFor="desktop-bedrooms" className="text-xs">Quartos</Label>
              <Input id="desktop-bedrooms" type="number" placeholder="2" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desktop-bathrooms" className="text-xs">Banh.</Label>
              <Input id="desktop-bathrooms" type="number" placeholder="1" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desktop-parking" className="text-xs">Vagas</Label>
              <Input id="desktop-parking" type="number" placeholder="1" value={parkingSpots} onChange={(e) => setParkingSpots(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desktop-area" className="text-xs">m²</Label>
              <Input id="desktop-area" type="number" placeholder="65" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desktop-notes">Observações</Label>
            <textarea
              id="desktop-notes"
              placeholder="Anotações sobre o imóvel..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
      )}

      {hasData && (
        <Button
          className="w-full h-11"
          onClick={handleSubmit}
          disabled={!title.trim() || isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "✓ Salvar Imóvel"}
        </Button>
      )}
    </div>
  )
}
