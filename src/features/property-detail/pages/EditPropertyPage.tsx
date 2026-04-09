import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { usePropertyStore } from "@/stores/propertyStore"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"
import { MODALITY_LABELS, TYPE_LABELS } from "@/lib/constants"
import type { Property } from "@/lib/types"
import type { PropertyType } from "@/lib/constants"

export function EditPropertyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { properties, updateProperty } = usePropertyStore()
  const [property, setProperty] = useState<Property | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Editable fields
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [modality, setModality] = useState<"rent" | "buy">("rent")
  const [type, setType] = useState<PropertyType>("apartment")
  const [neighborhood, setNeighborhood] = useState("")
  const [address, setAddress] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [parkingSpots, setParkingSpots] = useState("")
  const [area, setArea] = useState("")
  const [url, setUrl] = useState("")
  const [notes, setNotes] = useState("")

  // Load property data
  useEffect(() => {
    const found = properties.find((p) => p.id === id)
    if (found) {
      setProperty(found)
      setTitle(found.title || "")
      setPrice(found.price || "")
      setModality(found.modality || "rent")
      setType(found.type || "apartment")
      setNeighborhood(found.neighborhood || "")
      setAddress(found.address || "")
      setBedrooms(found.bedrooms?.toString() || "")
      setBathrooms(found.bathrooms?.toString() || "")
      setParkingSpots(found.parking_spots?.toString() || "")
      setArea(found.area?.toString() || "")
      setUrl(found.url || "")
      setNotes(found.notes || "")
    }
  }, [id, properties])

  const handleSubmit = async () => {
    if (!property || !title.trim()) {
      toast.error("Preencha pelo menos o título")
      return
    }

    setIsSubmitting(true)
    try {
      const updates = {
        title: title.trim(),
        price: price || null,
        modality: modality,
        type: type,
        neighborhood: neighborhood || null,
        address: address || null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        parking_spots: parkingSpots ? parseInt(parkingSpots) : null,
        area: area ? parseInt(area) : null,
        url: url || "",
        notes: notes || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", property.id)

      if (error) throw error

      updateProperty(property.id, updates)
      toast.success("Imóvel atualizado! ✓")
      navigate(`/property/${property.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!property) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">Imóvel não encontrado</p>
      </div>
    )
  }

  return (
    <div className="pb-[calc(2rem+env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 h-14 backdrop-blur-sm">
        <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium">Editar Imóvel</span>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          <Save className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <div className="px-4 py-6 space-y-5">
        {/* Image preview (read-only) */}
        {property.image_url && (
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
            <img src={property.image_url} alt={property.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Título <span className="text-destructive">*</span></Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">Link do anúncio</Label>
          <Input id="url" type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="price">Preço</Label>
            <Input id="price" placeholder="R$ 2.500" value={price} onChange={(e) => setPrice(e.target.value)} />
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as PropertyType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input id="neighborhood" placeholder="Ex: Centro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input id="address" placeholder="Rua, número" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-2">
            <Label htmlFor="bedrooms" className="text-xs">Quartos</Label>
            <Input id="bedrooms" type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms" className="text-xs">Banh.</Label>
            <Input id="bathrooms" type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parkingSpots" className="text-xs">Vagas</Label>
            <Input id="parkingSpots" type="number" value={parkingSpots} onChange={(e) => setParkingSpots(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area" className="text-xs">m²</Label>
            <Input id="area" type="number" value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <textarea
            id="notes"
            placeholder="Anotações sobre o imóvel..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <Button
          className="w-full h-12 text-base"
          onClick={handleSubmit}
          disabled={!title.trim() || isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "✓ Salvar Alterações"}
        </Button>
      </div>
    </div>
  )
}
