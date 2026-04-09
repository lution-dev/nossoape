import { Search } from "lucide-react"

export function SearchPage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      <Search className="h-12 w-12 text-muted-foreground/40" />
      <h2 className="mt-4 text-lg font-medium">Buscar</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Filtre e encontre imóveis
      </p>
    </div>
  )
}
