import { Home, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"

interface EmptyStateProps {
  message?: string
  description?: string
}

export function EmptyState({
  message = "Nenhum imóvel ainda",
  description = "Adicione seu primeiro imóvel para começar",
}: EmptyStateProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
        <Home className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="mt-4 text-lg font-medium">{message}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <Button
        variant="outline"
        className="mt-6 gap-2"
        onClick={() => navigate("/add")}
      >
        <Plus className="h-4 w-4" />
        Adicionar imóvel
      </Button>
    </div>
  )
}
