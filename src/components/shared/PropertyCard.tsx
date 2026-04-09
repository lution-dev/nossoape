import { useState } from "react"
import { useNavigate } from "react-router"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { MapPin, Home, Receipt, X, Bed, Bath, Car, Ruler } from "lucide-react"
import type { Property } from "@/lib/types"
import { MODALITY_LABELS } from "@/lib/constants"

const BREAKDOWN_LABELS: Record<string, string> = {
  rent: "Aluguel",
  condo: "Condomínio",
  iptu: "IPTU",
  insurance: "Seguro",
  tax: "Taxa",
  other: "Outros",
}

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const navigate = useNavigate()
  const [showBreakdown, setShowBreakdown] = useState(false)
  const breakdown = property.price_breakdown

  const displayPrice = breakdown
    ? `R$ ${breakdown.total.toLocaleString("pt-BR")}/mês`
    : property.price
      ? `${property.price}${property.modality === "rent" ? "/mês" : ""}`
      : null

  const handleBreakdownClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowBreakdown(!showBreakdown)
  }

  const hasSpecs = property.bedrooms != null || property.bathrooms != null ||
    property.parking_spots != null || property.area != null

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 transition-all hover:ring-foreground/20"
      onClick={() => navigate(`/property/${property.id}`)}
    >
      {/* Image — flush top, no gap */}
      <div className="relative aspect-video w-full bg-muted">
        {property.image_url ? (
          <img
            src={property.image_url}
            alt={property.title}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Home className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute right-2.5 top-2.5">
          <StatusBadge status={property.status} />
        </div>
        {property.status === "scheduled" && property.extras?.agendamento && (
          <div className="absolute left-2.5 top-2.5 rounded-full bg-purple-500/90 px-2 py-0.5 backdrop-blur-sm text-[10px] font-semibold text-white shadow-sm flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(property.extras.agendamento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })}
              {property.extras.agendamento.includes('T') && ` ${property.extras.agendamento.split('T')[1]}`}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 space-y-2">
        <h3 className="line-clamp-1 text-sm font-medium">{property.title}</h3>

        {/* Price row */}
        <div className="flex items-center gap-2">
          {displayPrice && (
            <span className="text-sm font-semibold text-foreground">
              {displayPrice}
            </span>
          )}
          {breakdown && (
            <button
              onClick={handleBreakdownClick}
              className="flex items-center gap-0.5 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              title="Ver detalhamento de custos"
            >
              {showBreakdown ? (
                <X className="h-2.5 w-2.5" />
              ) : (
                <Receipt className="h-2.5 w-2.5" />
              )}
            </button>
          )}
          <span className="text-xs text-muted-foreground">
            · {MODALITY_LABELS[property.modality]}
          </span>
        </div>

        {/* Inline Breakdown (toggle) */}
        {showBreakdown && breakdown && (
          <div className="rounded-lg bg-secondary/50 p-2.5 space-y-1" onClick={(e) => e.stopPropagation()}>
            {(Object.keys(BREAKDOWN_LABELS) as string[]).map((key) => {
              const value = breakdown[key as keyof typeof breakdown]
              if (value == null || key === "total" || value === 0) return null
              return (
                <div key={key} className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{BREAKDOWN_LABELS[key]}</span>
                  <span>R$ {value.toLocaleString("pt-BR")}</span>
                </div>
              )
            })}
            <div className="border-t border-border pt-1 flex items-center justify-between text-[11px] font-semibold">
              <span>Total</span>
              <span>R$ {breakdown.total.toLocaleString("pt-BR")}</span>
            </div>
          </div>
        )}

        {/* Specs badges */}
        {hasSpecs && (
          <div className="flex flex-wrap gap-1.5">
            {property.bedrooms != null && (
              <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0">
                <Bed className="h-2.5 w-2.5" />
                {property.bedrooms}
              </Badge>
            )}
            {property.bathrooms != null && (
              <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0">
                <Bath className="h-2.5 w-2.5" />
                {property.bathrooms}
              </Badge>
            )}
            {property.parking_spots != null && (
              <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0">
                <Car className="h-2.5 w-2.5" />
                {property.parking_spots}
              </Badge>
            )}
            {property.area != null && (
              <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0">
                <Ruler className="h-2.5 w-2.5" />
                {property.area}m²
              </Badge>
            )}
          </div>
        )}

        {/* Neighborhood */}
        {property.neighborhood && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {property.neighborhood}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
