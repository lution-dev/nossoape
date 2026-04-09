// ══════════════════════════════════════════
// Nosso Apê — Constants
// ══════════════════════════════════════════

export const APP_NAME = "Nosso Apê" as const

// Status labels
export const STATUS_LABELS = {
  new: "Novo",
  interest: "Interesse",
  scheduled: "Agendado",
  visited: "Visitado",
  favorite: "Favorito",
  discarded: "Descartado",
} as const

export type PropertyStatus = keyof typeof STATUS_LABELS

// Property type labels
export const TYPE_LABELS = {
  apartment: "Apartamento",
  house: "Casa",
  land: "Terreno",
  commercial: "Comercial",
  other: "Outro",
} as const

export type PropertyType = keyof typeof TYPE_LABELS

// Modality labels
export const MODALITY_LABELS = {
  rent: "Aluguel",
  buy: "Compra",
} as const

export type Modality = keyof typeof MODALITY_LABELS

// Visit mood
export const MOOD_LABELS = {
  loved: "😍",
  thinking: "🤔",
  neutral: "😐",
  unsure: "😕",
  disliked: "👎",
} as const

export type VisitMood = keyof typeof MOOD_LABELS

// Match results
export const MATCH_LABELS = {
  super_match: "💕 Match Perfeito!",
  match: "💕 Match!",
  divergence: "⚡ Divergência",
  neutral: "",
} as const

export type MatchResult = keyof typeof MATCH_LABELS

// Invite code config
export const INVITE_CODE_LENGTH = 6
export const INVITE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // sem I,O,0,1

// Limits
export const MAX_BOARD_MEMBERS = 2
export const MAX_PROPERTIES_PER_BOARD = 200
export const MAX_PROS_CONS_PER_PROPERTY = 20
export const MAX_VISITS_PER_PROPERTY = 10
