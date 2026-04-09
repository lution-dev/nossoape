import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Home, ExternalLink, CheckCircle, Receipt } from "lucide-react"
import type { ExtractedData } from "@/features/add-property/hooks/useLinkExtractor"
import { Badge } from "@/components/ui/badge"

interface PropertyPreviewProps {
  data: ExtractedData | null
  isLoading: boolean
  error: string | null
}

const BREAKDOWN_LABELS: Record<string, string> = {
  rent: "Aluguel",
  condo: "Condomínio",
  iptu: "IPTU",
  insurance: "Seguro",
  tax: "Taxa",
  other: "Outros",
}

export function PropertyPreview({ data, isLoading, error }: PropertyPreviewProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="aspect-video w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4">
        <p className="text-sm text-destructive">
          ⚠ Não foi possível extrair dados. Preencha manualmente abaixo.
        </p>
      </Card>
    )
  }

  if (!data) return null

  const breakdown = data.priceBreakdown

  return (
    <Card className="overflow-hidden">
      {/* Image */}
      <div className="relative aspect-video w-full bg-muted">
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={data.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Home className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
        {/* Extracted badge */}
        <div className="absolute left-2 top-2">
          <Badge variant="secondary" className="gap-1 bg-background/80 backdrop-blur-sm">
            <CheckCircle className="h-3 w-3" />
            Dados extraídos
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {data.title && (
          <h3 className="line-clamp-2 font-medium">{data.title}</h3>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {data.price && (
            <span className="text-sm font-medium text-accent">{data.price}/mês</span>
          )}
          {breakdown && (
            <Badge variant="outline" className="gap-1 text-[10px]">
              <Receipt className="h-2.5 w-2.5" />
              Detalhado
            </Badge>
          )}
          {data.neighborhood && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{data.neighborhood}</span>
            </>
          )}
        </div>

        {/* Price Breakdown Mini */}
        {breakdown && (
          <div className="rounded-lg bg-secondary/50 p-3 space-y-1.5">
            {(Object.keys(BREAKDOWN_LABELS) as (keyof typeof BREAKDOWN_LABELS)[]).map((key) => {
              const value = breakdown[key as keyof typeof breakdown]
              if (value == null || key === "total" || value === 0) return null
              return (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{BREAKDOWN_LABELS[key]}</span>
                  <span>R$ {value.toLocaleString("pt-BR")}</span>
                </div>
              )
            })}
            <div className="border-t border-border pt-1.5 flex items-center justify-between text-xs font-medium">
              <span>Total</span>
              <span>R$ {breakdown.total.toLocaleString("pt-BR")}</span>
            </div>
          </div>
        )}

        {/* Specs */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {data.bedrooms && (
            <Badge variant="outline" className="text-xs">{data.bedrooms} quartos</Badge>
          )}
          {data.bathrooms && (
            <Badge variant="outline" className="text-xs">{data.bathrooms} banh.</Badge>
          )}
          {data.parkingSpots && (
            <Badge variant="outline" className="text-xs">{data.parkingSpots} vaga</Badge>
          )}
          {data.area && (
            <Badge variant="outline" className="text-xs">{data.area} m²</Badge>
          )}
          {/* Dynamic extras */}
          {data.extras && Object.entries(data.extras).map(([key, value]) => (
            <Badge key={key} variant="outline" className="text-xs">
              {value === "Sim" ? key : value === "Não" ? `${key}: Não` : `${key}: ${value}`}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-1 pt-1">
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{data.source}</span>
        </div>
      </div>
    </Card>
  )
}
