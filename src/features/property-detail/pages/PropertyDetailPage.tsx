import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import { usePropertyStore } from "@/stores/propertyStore"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { ArrowLeft, ExternalLink, Trash2, Pencil, Home, MapPin, Bed, Bath, Car, Ruler, Star, Calendar, Eye, Heart, X, Receipt, Building, Dog, Sofa, TrainFront, Waves, Dumbbell, Flame, TreePine, WashingMachine, Fence, ShieldCheck, Info } from "lucide-react"
import { STATUS_LABELS, MODALITY_LABELS, TYPE_LABELS } from "@/lib/constants"
import type { PropertyStatus } from "@/lib/constants"
import type { Property, PriceBreakdown } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Extract price_breakdown from notes fallback tag */
function hydrateBreakdown(p: Property): Property {
  if (p.price_breakdown) return p
  if (!p.notes) return p
  const match = p.notes.match(/<!--BREAKDOWN:(.*?)-->/)
  if (!match) return p
  try {
    const breakdown = JSON.parse(match[1]) as PriceBreakdown
    return {
      ...p,
      price_breakdown: breakdown,
      notes: p.notes.replace(/\n?<!--BREAKDOWN:.*?-->/, "").trim() || null,
    }
  } catch {
    return p
  }
}
/** Clean BREAKDOWN tag from notes for display */
function cleanDisplayNotes(notes: string | null): string | null {
  if (!notes) return null
  return notes.replace(/\n?<!--BREAKDOWN:.*?-->/, "").trim() || null
}

const statusButtons: { status: PropertyStatus; label: string; icon: React.ElementType }[] = [
  { status: "interest", label: "Interesse", icon: Star },
  { status: "scheduled", label: "Agendado", icon: Calendar },
  { status: "visited", label: "Visitado", icon: Eye },
  { status: "favorite", label: "Favorito", icon: Heart },
  { status: "discarded", label: "Descartar", icon: X },
]

// Icon mapping for dynamic extras
const EXTRAS_ICONS: Record<string, React.ElementType> = {
  "Andar": Building,
  "Andares": Building,
  "Suítes": Bed,
  "Mobiliado": Sofa,
  "Aceita pet": Dog,
  "Próx. metrô": TrainFront,
  "Elevador": Building,
  "Piscina": Waves,
  "Academia": Dumbbell,
  "Churrasqueira": Flame,
  "Playground": TreePine,
  "Lavanderia": WashingMachine,
  "Varanda": Fence,
  "Portaria 24h": ShieldCheck,
  "Ano construção": Calendar,
  "Orientação": Eye,
}
export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { properties, updateProperty, removeProperty } = usePropertyStore()
  const [property, setProperty] = useState<Property | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const found = properties.find((p) => p.id === id)
    if (found) {
      setProperty(hydrateBreakdown(found))
    } else if (id) {
      // Fallback: buscar do Supabase se não estiver no store
      supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          if (data) setProperty(hydrateBreakdown(data as Property))
        })
    }
  }, [id, properties])

  const handleStatusChange = async (status: PropertyStatus) => {
    if (!property) return

    const newStatus = property.status === status ? "new" : status
    updateProperty(property.id, { status: newStatus })
    setProperty((prev) => prev ? { ...prev, status: newStatus } : null)

    const { error } = await supabase
      .from("properties")
      .update({ status: newStatus })
      .eq("id", property.id)

    if (error) {
      updateProperty(property.id, { status: property.status })
      setProperty((prev) => prev ? { ...prev, status: property.status } : null)
      toast.error("Erro ao atualizar status")
    } else {
      toast.success(`Status: ${STATUS_LABELS[newStatus]}`)
    }
  }

  const handleDelete = async () => {
    if (!property) return
    setIsDeleting(true)

    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", property.id)

    if (error) {
      toast.error("Erro ao excluir")
      setIsDeleting(false)
    } else {
      removeProperty(property.id)
      toast.success("Imóvel removido")
      navigate("/")
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
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/property/${property.id}/edit`)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
            <Pencil className="h-4 w-4" />
          </button>
          {property.url && (
            <button onClick={() => window.open(property.url, "_blank")} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-4 w-4" />
            </button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir imóvel?</DialogTitle>
                <DialogDescription>Esta ação não pode ser desfeita.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>Cancelar</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Image */}
      <div className="aspect-video w-full bg-muted">
        {property.image_url ? (
          <img src={property.image_url} alt={property.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Home className="h-16 w-16 text-muted-foreground/20" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pt-4 space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-semibold leading-tight">{property.title}</h1>
            <StatusBadge status={property.status} />
          </div>
          <div className="mt-1 flex items-center gap-2">
            {property.price_breakdown ? (
              <span className="text-lg font-semibold text-foreground">
                R$ {property.price_breakdown.total.toLocaleString("pt-BR")}/mês
              </span>
            ) : (
              property.price && (
                <span className="text-lg font-semibold text-foreground">
                  {property.price}{property.modality === "rent" ? "/mês" : ""}
                </span>
              )
            )}
            <span className="text-sm text-muted-foreground">· {MODALITY_LABELS[property.modality]}</span>
          </div>
          {(property.address || property.neighborhood) && (
            <button
              onClick={() => {
                const query = [property.address, property.neighborhood].filter(Boolean).join(", ")
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank")
              }}
              className="mt-1.5 flex items-center gap-1 group cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground underline underline-offset-2 decoration-muted-foreground/30 group-hover:decoration-foreground/50 transition-colors">
                {[property.address, property.neighborhood].filter(Boolean).join(", ")}
              </span>
            </button>
          )}
        </div>

        {/* Price Breakdown / Cost Card */}
        {(property.price_breakdown || property.price) && (
          <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Custos Mensais</h3>
            </div>
            {property.price_breakdown ? (
              <>
                <div className="space-y-2">
                  {property.price_breakdown.rent != null && property.price_breakdown.rent > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Aluguel</span>
                      <span>R$ {property.price_breakdown.rent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {property.price_breakdown.condo != null && property.price_breakdown.condo > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Condomínio</span>
                      <span>R$ {property.price_breakdown.condo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {property.price_breakdown.iptu != null && property.price_breakdown.iptu > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">IPTU</span>
                      <span>R$ {property.price_breakdown.iptu.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {property.price_breakdown.insurance != null && property.price_breakdown.insurance > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Seguro incêndio</span>
                      <span>R$ {property.price_breakdown.insurance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {property.price_breakdown.tax != null && property.price_breakdown.tax > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Taxa de serviço</span>
                      <span>R$ {property.price_breakdown.tax.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {property.price_breakdown.other != null && property.price_breakdown.other > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Outros</span>
                      <span>R$ {property.price_breakdown.other.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-sm font-semibold">R$ {property.price_breakdown.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            ) : property.price ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {property.modality === "rent" ? "Aluguel" : "Valor"}
                </span>
                <span className="font-medium">{property.price}</span>
              </div>
            ) : null}
          </div>
        )}

        {/* Features */}
        {(property.area != null || property.bedrooms != null || property.bathrooms != null || property.parking_spots != null || (property.extras && Object.keys(property.extras).length > 0)) && (
          <div className="flex flex-wrap gap-x-5 gap-y-2.5 rounded-xl border border-border bg-secondary/30 px-4 py-3.5">
            {property.area != null && (
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{property.area} m²</span>
              </div>
            )}
            {property.bedrooms != null && (
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{property.bedrooms} {property.bedrooms === 1 ? 'quarto' : 'quartos'}</span>
              </div>
            )}
            {property.bathrooms != null && (
              <div className="flex items-center gap-2">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{property.bathrooms} {property.bathrooms === 1 ? 'banheiro' : 'banheiros'}</span>
              </div>
            )}
            {property.parking_spots != null && (
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{property.parking_spots} {property.parking_spots === 1 ? 'vaga' : 'vagas'}</span>
              </div>
            )}
            {/* Dynamic extras inline */}
            {property.extras && Object.entries(property.extras).map(([key, value]) => {
              const icon = EXTRAS_ICONS[key]
              const Icon = icon || Info
              const display = value === "Sim" ? key
                : value === "Não" ? `${key}: Não`
                : typeof value === "string" && /^\d+$/.test(value) ? `${value} ${key.toLowerCase()}`
                : `${value}`
              return (
                <div key={key} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{display}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Type + Source */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{TYPE_LABELS[property.type]}</span>
          {property.source && (
            <>
              <span>·</span>
              <span>{property.source}</span>
            </>
          )}
        </div>

        {/* Open Original */}
        {property.url && (
          <Button variant="outline" className="w-full gap-2" onClick={() => window.open(property.url, "_blank")}>
            <ExternalLink className="h-4 w-4" />
            Abrir no site original
          </Button>
        )}

        <Separator />

        {/* Status Actions */}
        <div>
          <h3 className="mb-3 text-sm font-medium">Status</h3>
          <div className="grid grid-cols-5 gap-2">
            {statusButtons.map((btn) => {
              const isActive = property.status === btn.status
              
              // Minimalist color styles for active state
              const getActiveColor = (status: string) => {
                switch (status) {
                  case 'interest': return 'bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/50'
                  case 'scheduled': return 'bg-purple-500/20 text-purple-500 ring-1 ring-purple-500/50'
                  case 'visited': return 'bg-emerald-500/20 text-emerald-500 ring-1 ring-emerald-500/50'
                  case 'favorite': return 'bg-rose-500/20 text-rose-500 ring-1 ring-rose-500/50'
                  case 'discarded': return 'bg-zinc-500/20 text-zinc-300 ring-1 ring-zinc-500/50'
                  default: return 'bg-foreground text-background'
                }
              }

              return (
                <button
                  key={btn.status}
                  onClick={() => handleStatusChange(btn.status)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg p-2.5 transition-all duration-200",
                    isActive
                      ? getActiveColor(btn.status)
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <btn.icon className="h-4 w-4" />
                  <span className="text-[10px] font-medium">{btn.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        {cleanDisplayNotes(property.notes) && (
          <>
            <Separator />
            <div>
              <h3 className="mb-2 text-sm font-medium">Observações</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{cleanDisplayNotes(property.notes)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
