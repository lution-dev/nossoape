import { create } from "zustand"
import type { Property, PriceBreakdown } from "@/lib/types"
import { supabase } from "@/lib/supabase"

/**
 * Extract price_breakdown from notes field (fallback persistence)
 * Format: <!--BREAKDOWN:{"rent":1380,"condo":288,...}-->
 */
function extractBreakdownFromNotes(notes: string | null): PriceBreakdown | null {
  if (!notes) return null
  const match = notes.match(/<!--BREAKDOWN:(.*?)-->/)
  if (!match) return null
  try {
    return JSON.parse(match[1]) as PriceBreakdown
  } catch {
    return null
  }
}

/** Strip the breakdown tag from notes for display purposes */
function cleanNotes(notes: string | null): string | null {
  if (!notes) return null
  const cleaned = notes.replace(/\n?<!--BREAKDOWN:.*?-->/, "").trim()
  return cleaned || null
}

/** Hydrate a property with breakdown data from notes fallback */
function hydrateProperty(p: Property): Property {
  if (p.price_breakdown) return p
  const fromNotes = extractBreakdownFromNotes(p.notes)
  if (!fromNotes) return p
  return {
    ...p,
    price_breakdown: fromNotes,
    notes: cleanNotes(p.notes),
  }
}

interface PropertyState {
  properties: Property[]
  isLoading: boolean

  // Actions
  setProperties: (properties: Property[]) => void
  addProperty: (property: Property) => void
  updateProperty: (id: string, updates: Partial<Property>) => void
  removeProperty: (id: string) => void
  setLoading: (loading: boolean) => void

  // Async actions
  fetchProperties: (boardId?: string) => Promise<void>
}

export const usePropertyStore = create<PropertyState>((set) => ({
  properties: [],
  isLoading: false,

  setProperties: (properties) => set({ properties }),

  addProperty: (property) =>
    set((state) => ({
      properties: [hydrateProperty(property), ...state.properties],
    })),

  updateProperty: (id, updates) =>
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  removeProperty: (id) =>
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  fetchProperties: async (boardId?: string) => {
    set({ isLoading: true })
    try {
      let query = supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })

      if (boardId) {
        query = query.eq("board_id", boardId)
      }

      const { data, error } = await query

      if (error) throw error
      const fetched = ((data as Property[]) || []).map(hydrateProperty)

      // Preserve local price_breakdown data that may not be in DB yet
      set((state) => {
        const localMap = new Map(
          state.properties
            .filter((p) => p.price_breakdown)
            .map((p) => [p.id, p.price_breakdown])
        )
        const merged = fetched.map((p) => ({
          ...p,
          price_breakdown: p.price_breakdown ?? localMap.get(p.id) ?? null,
        }))
        return { properties: merged }
      })
    } finally {
      set({ isLoading: false })
    }
  },
}))
