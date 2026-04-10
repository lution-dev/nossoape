import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { AddPropertyDrawer } from "@/features/add-property/components/AddPropertyDrawer"

interface FABProps {
  drawerOpen: boolean
  onDrawerOpenChange: (open: boolean) => void
}

export function FAB({ drawerOpen, onDrawerOpenChange }: FABProps) {
  return (
    <>
      <motion.button
        onClick={() => onDrawerOpenChange(true)}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <AddPropertyDrawer
        open={drawerOpen}
        onOpenChange={onDrawerOpenChange}
      />
    </>
  )
}
