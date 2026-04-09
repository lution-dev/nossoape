import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TYPE_LABELS, MODALITY_LABELS } from "@/lib/constants"
import type { PropertyType, Modality } from "@/lib/constants"

export interface PropertyFormData {
  title: string
  price: string
  modality: Modality
  type: PropertyType
  address: string
  neighborhood: string
  area: string
  bedrooms: string
  bathrooms: string
  parkingSpots: string
  notes: string
}

interface ManualFormProps {
  initialData?: Partial<PropertyFormData>
  onSubmit: (data: PropertyFormData) => void
  isSubmitting: boolean
}

const defaultData: PropertyFormData = {
  title: "",
  price: "",
  modality: "rent",
  type: "apartment",
  address: "",
  neighborhood: "",
  area: "",
  bedrooms: "",
  bathrooms: "",
  parkingSpots: "",
  notes: "",
}

export function ManualForm({ initialData, onSubmit, isSubmitting }: ManualFormProps) {
  const [form, setForm] = useState<PropertyFormData>({
    ...defaultData,
    ...initialData,
  })

  const update = (field: keyof PropertyFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ex: Apartamento 2 quartos Centro"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
      </div>

      {/* Price + Modality row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="price">Preço</Label>
          <Input
            id="price"
            placeholder="R$ 2.500"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>
            Modalidade <span className="text-destructive">*</span>
          </Label>
          <Select
            value={form.modality}
            onValueChange={(v) => update("modality", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MODALITY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select
          value={form.type}
          onValueChange={(v) => update("type", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Address + Neighborhood */}
      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          placeholder="Rua, número"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="neighborhood">Bairro</Label>
        <Input
          id="neighborhood"
          placeholder="Ex: Centro"
          value={form.neighborhood}
          onChange={(e) => update("neighborhood", e.target.value)}
        />
      </div>

      {/* Numbers grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="area">Área (m²)</Label>
          <Input
            id="area"
            type="number"
            placeholder="65"
            value={form.area}
            onChange={(e) => update("area", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Quartos</Label>
          <Input
            id="bedrooms"
            type="number"
            placeholder="2"
            value={form.bedrooms}
            onChange={(e) => update("bedrooms", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Banheiros</Label>
          <Input
            id="bathrooms"
            type="number"
            placeholder="1"
            value={form.bathrooms}
            onChange={(e) => update("bathrooms", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parkingSpots">Vagas</Label>
          <Input
            id="parkingSpots"
            type="number"
            placeholder="1"
            value={form.parkingSpots}
            onChange={(e) => update("parkingSpots", e.target.value)}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <textarea
          id="notes"
          placeholder="Anotações sobre o imóvel..."
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-12 text-base"
        disabled={!form.title.trim() || isSubmitting}
      >
        {isSubmitting ? "Salvando..." : "✓ Salvar Imóvel"}
      </Button>
    </form>
  )
}
