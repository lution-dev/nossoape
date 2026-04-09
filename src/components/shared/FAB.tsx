import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { AddPropertyDrawer } from "@/features/add-property/components/AddPropertyDrawer"

export function FAB() {
  const [open, setOpen] = useState(false)
  const [initialUrl, setInitialUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Keep track of the last URL we prompted for so we don't spam the user
    let lastSeenUrl = localStorage.getItem("last_clipboard_url") || ""

    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText()
        
        // Basic check if it's a URL and looks like a real estate portal
        if (
          text && 
          text.startsWith("http") && 
          (text.includes("zapimoveis") || 
           text.includes("quintoandar") || 
           text.includes("vivareal") || 
           text.includes("imovelweb") ||
           text.includes("chavesnamao") ||
           text.includes("imobiliaria"))
        ) {
          const url = text.trim()
          
          if (url !== lastSeenUrl) {
            lastSeenUrl = url
            localStorage.setItem("last_clipboard_url", url)

            // Dismiss any existing toast with this id to prevent piling up
            toast.dismiss("clipboard-url")
            
            toast.message("Link de imóvel detectado", {
              id: "clipboard-url",
              description: "Deseja extrair os dados deste imóvel?",
              duration: 10000,
              action: {
                label: "Sim, Adicionar",
                onClick: () => {
                  setInitialUrl(url)
                  setOpen(true)
                },
              },
              cancel: {
                label: "Ignorar",
                onClick: () => {},
              }
            })
          }
        }
      } catch (err) {
        // Silently fail if clipboard permissions are not granted or browser restricts it
      }
    }

    // Check once on mount (if already focused)
    if (document.hasFocus()) {
      checkClipboard()
    }

    window.addEventListener("focus", checkClipboard)
    return () => window.removeEventListener("focus", checkClipboard)
  }, [])

  return (
    <>
      <motion.button
        onClick={() => {
          setInitialUrl(undefined)
          setOpen(true)
        }}
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

