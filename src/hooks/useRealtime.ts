import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { usePropertyStore } from "@/stores/propertyStore"
import type { Property } from "@/lib/types"

export function useRealtimeProperties(boardId: string | null | undefined) {
  const { addProperty, updateProperty, removeProperty } =
    usePropertyStore()

  useEffect(() => {
    if (!boardId) return

    const channel = supabase
      .channel(`properties:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "properties",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          const newProp = payload.new as Property
          // Avoid duplicates: only add if not already in store
          const exists = usePropertyStore
            .getState()
            .properties.some((p) => p.id === newProp.id)
          if (!exists) {
            addProperty(newProp)
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "properties",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          const updated = payload.new as Property
          const current = usePropertyStore
            .getState()
            .properties.find((p) => p.id === updated.id)

          // Only update if data actually changed (avoid self-loop)
          if (
            current &&
            current.updated_at !== updated.updated_at
          ) {
            updateProperty(updated.id, updated)
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "properties",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          const deleted = payload.old as { id: string }
          removeProperty(deleted.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [boardId, addProperty, updateProperty, removeProperty])
}
