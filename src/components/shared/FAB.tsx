import { useState } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { AddPropertyDrawer } from "@/features/add-property/components/AddPropertyDrawer"

const REAL_ESTATE_DOMAINS = [
  "zapimoveis", "quintoandar", "vivareal", "imovelweb",
  "chavesnamao", "olx.com.br", "imoview", "loft.com",
  "netimóveis", "sinagimoveis", "grupozap", "imobiliaria",
  "imoveis", "alugue", "compre",
]

function isRealEstateUrl(text: string): boolean {
  if (!text || !text.startsWith("http")) return false
  return REAL_ESTATE_DOMAINS.some((d) => text.includes(d))
}

export function FAB() {
  const [open, setOpen] = useState(false)
  const [initialUrl, setInitialUrl] = useState<string | undefined>(undefined)

  const handleFabClick = () => {
    setOpen(true)
  }

  return (
    <>
      <motion.button
        onClick={handleFabClick}
        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <AddPropertyDrawer
        open={open}
        onOpenChange={setOpen}
        initialUrl={initialUrl}
        onInitialUrlConsume={() => setInitialUrl(undefined)}
      />
    </>
  )
}

