import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link2, X } from "lucide-react"
import { AddPropertyDrawer } from "@/features/add-property/components/AddPropertyDrawer"

const REAL_ESTATE_DOMAINS = [
  "zapimoveis", "quintoandar", "vivareal", "imovelweb",
  "chavesnamao", "olx.com.br", "imoview", "loft.com",
  "netimóveis", "sinagimoveis", "grupozap", "imobiliaria",
  "imoveis",
]

function isRealEstateUrl(text: string): boolean {
  if (!text || !text.startsWith("http")) return false
  return REAL_ESTATE_DOMAINS.some((d) => text.includes(d))
}

/**
 * ClipboardBanner — shows a subtle banner when the user returns to the app
 * with a real estate URL copied. Tapping "Adicionar" is the user gesture
 * that unlocks clipboard access on iOS.
 */
export function ClipboardBanner() {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [initialUrl, setInitialUrl] = useState<string | undefined>(undefined)
  const lastSeenRef = useRef(localStorage.getItem("last_clipboard_url") || "")

  const checkClipboard = useCallback(async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim()
      if (isRealEstateUrl(text) && text !== lastSeenRef.current) {
        setBannerUrl(text)
      }
    } catch {
      // iOS blocks passive clipboard read — banner won't show, that's OK
    }
  }, [])

  useEffect(() => {
    // Check when app first loads
    checkClipboard()

    // Check every time user switches back to the app tab
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        checkClipboard()
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [checkClipboard])

  const handleAdd = async () => {
    // This is a user gesture — iOS allows clipboard read here
    let url = bannerUrl

    if (!url) {
      try {
        const text = (await navigator.clipboard.readText()).trim()
        if (isRealEstateUrl(text)) url = text
      } catch { /* ignore */ }
    }

    if (url) {
      lastSeenRef.current = url
      localStorage.setItem("last_clipboard_url", url)
      setBannerUrl(null)
      // Open drawer first, then set URL — both trigger extraction in AddPropertyDrawer
      setDrawerOpen(true)
      setInitialUrl(url)
    }
  }

  const handleDismiss = () => {
    if (bannerUrl) {
      lastSeenRef.current = bannerUrl
      localStorage.setItem("last_clipboard_url", bannerUrl)
    }
    setBannerUrl(null)
  }

  return (
    <>
      <AnimatePresence>
        {bannerUrl && (
          <motion.div
            key="clipboard-banner"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed top-[calc(3.5rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg"
          >
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-md">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                <Link2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">Link de imóvel copiado</p>
                <p className="truncate text-xs text-muted-foreground">
                  {(() => { try { return new URL(bannerUrl).hostname.replace("www.", "") } catch { return bannerUrl } })()}
                </p>
              </div>
              <button
                onClick={handleAdd}
                className="shrink-0 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
              >
                Adicionar
              </button>
              <button
                onClick={handleDismiss}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddPropertyDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialUrl={initialUrl}
        onInitialUrlConsume={() => setInitialUrl(undefined)}
      />
    </>
  )
}
