import { useState, useEffect } from "react"
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
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer"
import { toast } from "sonner"
import { ChevronDown, ChevronUp } from "lucide-react"
import { MODALITY_LABELS } from "@/lib/constants"

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return ""
  }
}

interface AddPropertyDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialUrl?: string
  onInitialUrlConsume?: () => void
}

export function AddPropertyDrawer({ open, onOpenChange, initialUrl, onInitialUrlConsume }: AddPropertyDrawerProps) {
  const { addProperty } = usePropertyStore()
  const { board, user } = useAuthStore()
  const [linkUrl, setLinkUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const { data: extractedData, isExtracting, error: extractError, extract, reset } = useLinkExtractor()

  // Editable fields - populated from extraction
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [parkingSpots, setParkingSpots] = useState("")
  const [area, setArea] = useState("")
  const [modality, setModality] = useState<"rent" | "buy">("rent")
  const [notes, setNotes] = useState("")

  // Reset form on close
  useEffect(() => {
    if (!open) {
      setLinkUrl("")
      setTitle("")
      setPrice("")
      setNeighborhood("")
      setBedrooms("")
      setBathrooms("")
      setParkingSpots("")
      setArea("")
      setModality("rent")
      setNotes("")
      setShowEdit(false)
      setIsSubmitting(false)
      reset()
    }
  }, [open, reset])

  // When a URL comes in from clipboard (FAB), pre-fill and auto-extract
  useEffect(() => {
    if (initialUrl && open) {
      setLinkUrl(initialUrl)
      extract(initialUrl)
      onInitialUrlConsume?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl])

  // When extractor returns data, populate fields
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

      // Try with all extended fields first, fallback without them if columns don't exist yet
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
        // Column doesn't exist yet — embed breakdown in notes as fallback persistence
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

      // Ensure extended fields are available in the store even if DB doesn't have the columns yet
      const savedProperty = {
        ...result.data,
        price_breakdown: result.data.price_breakdown ?? extractedData?.priceBreakdown ?? null,
        extras: result.data.extras ?? extractedData?.extras ?? null,
      }

      addProperty(savedProperty)
      toast.success("Imóvel adicionado! 🏠")
      onOpenChange(false)
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh]">
        <DrawerTitle className="sr-only">Adicionar imóvel</DrawerTitle>
        <div className="overflow-y-auto px-4 pt-2 pb-12 space-y-6">
          {/* Link Input */}
          <LinkInput
            value={linkUrl}
            onChange={setLinkUrl}
            onUrlDetected={handleUrlDetected}
            isExtracting={isExtracting}
          />

          {/* Preview */}
          {(isExtracting || extractedData || extractError) && (
            <PropertyPreview
              data={extractedData}
              isLoading={isExtracting}
              error={extractError}
            />
          )}

          {/* Toggle for manual fields */}
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

          {/* Editable Fields */}
          {showEdit && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="drawer-title">Título <span className="text-destructive">*</span></Label>
                <Input
                  id="drawer-title"
                  placeholder="Ex: Apartamento 2 quartos Centro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="drawer-price">Preço</Label>
                  <Input
                    id="drawer-price"
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
                <Label htmlFor="drawer-neighborhood">Bairro</Label>
                <Input
                  id="drawer-neighborhood"
                  placeholder="Ex: Centro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="drawer-bedrooms" className="text-xs">Quartos</Label>
                  <Input id="drawer-bedrooms" type="number" placeholder="2" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drawer-bathrooms" className="text-xs">Banh.</Label>
                  <Input id="drawer-bathrooms" type="number" placeholder="1" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drawer-parking" className="text-xs">Vagas</Label>
                  <Input id="drawer-parking" type="number" placeholder="1" value={parkingSpots} onChange={(e) => setParkingSpots(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drawer-area" className="text-xs">m²</Label>
                  <Input id="drawer-area" type="number" placeholder="65" value={area} onChange={(e) => setArea(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="drawer-notes">Observações</Label>
                <textarea
                  id="drawer-notes"
                  placeholder="Anotações sobre o imóvel..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          {hasData && (
            <Button
              className="w-full h-12 text-base"
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "✓ Salvar Imóvel"}
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
