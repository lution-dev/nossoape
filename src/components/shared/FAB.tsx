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

  const handleFabClick = async () => {
    // On mobile (especially iOS), clipboard can only be read during a user gesture.
    // So we read it here — on the tap — which is the only reliable cross-platform approach.
    let urlFromClipboard: string | undefined = undefined

    try {
      const text = (await navigator.clipboard.readText()).trim()
      const lastSeen = localStorage.getItem("last_clipboard_url") || ""

      if (isRealEstateUrl(text) && text !== lastSeen) {
        localStorage.setItem("last_clipboard_url", text)
        urlFromClipboard = text
      }
    } catch {
      // Clipboard permission denied or not available — open drawer normally
    }

    // Set initialUrl first, then open the drawer on the next tick,
    // so the drawer's useEffect sees initialUrl already set when open becomes true.
    setInitialUrl(urlFromClipboard)
    setTimeout(() => setOpen(true), 0)
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

