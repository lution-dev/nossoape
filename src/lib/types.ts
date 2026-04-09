// ══════════════════════════════════════════
// Nosso Apê — Database Types
// Placeholder — will be replaced with generated types from Supabase (Issue 003)
// ══════════════════════════════════════════

import type {
  PropertyStatus,
  PropertyType,
  Modality,
  VisitMood,
} from "./constants"

// ─── Auth & Board ───

export interface UserProfile {
  id: string
  display_name: string
  avatar_url: string | null
  board_id: string | null
  created_at: string
}

export interface Board {
  id: string
  name: string
  invite_code: string
  owner_id: string
  created_at: string
}

// ─── Price Breakdown ───

export interface PriceBreakdown {
  rent?: number       // Aluguel
  condo?: number      // Condomínio
  iptu?: number       // IPTU
  insurance?: number  // Seguro incêndio
  tax?: number        // Taxa de serviço
  other?: number      // Outros custos
  total: number       // Valor total mensal
}

// ─── Property ───

export interface Property {
  id: string
  board_id: string
  url: string
  title: string
  image_url: string | null
  price: string | null
  price_breakdown: PriceBreakdown | null
  modality: Modality
  address: string | null
  neighborhood: string | null
  type: PropertyType
  area: number | null
  bedrooms: number | null
  bathrooms: number | null
  parking_spots: number | null
  status: PropertyStatus
  added_by: string
  source: string | null
  notes: string | null
  extras: Record<string, string> | null  // dynamic extracted data (floor, pets, furnished, etc.)
  created_at: string
  updated_at: string
}

// ─── Rating ───

export interface Rating {
  id: string
  property_id: string
  user_id: string
  stars: number // 1-5
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Visit ───

export interface Visit {
  id: string
  property_id: string
  scheduled_date: string
  completed: boolean
  impressions: string | null
  mood: VisitMood | null
  created_at: string
}

// ─── Pro/Con ───

export interface ProCon {
  id: string
  property_id: string
  type: "pro" | "con"
  text: string
  added_by: string
  created_at: string
}
