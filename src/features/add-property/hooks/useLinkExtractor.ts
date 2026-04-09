import { useState, useCallback } from "react"
import type { PriceBreakdown } from "@/lib/types"

export interface ExtractedData {
  title: string
  imageUrl: string
  price: string
  priceBreakdown: PriceBreakdown | null
  address: string
  neighborhood: string
  bedrooms: string
  bathrooms: string
  parkingSpots: string
  area: string
  source: string
  url: string
  modality: "rent" | "buy"
  extras: Record<string, string>  // dynamic: floor, pets, furnished, metro, etc.
}

// ─── Currency Helpers ───

/** Parse "R$ 1.380,00" or "R$ 1.380" → 1380 */
function parseBRL(raw: string): number | null {
  const cleaned = raw
    .replace(/R\$\s*/i, "")
    .replace(/\./g, "")       // remove thousands separator
    .replace(",", ".")        // decimal separator
    .trim()
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

/** Format 1380 → "R$ 1.380" */
function formatBRL(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ─── Price Breakdown Parsers ───

function parseQuintoAndarPrices(html: string): PriceBreakdown | null {
  const result: Partial<PriceBreakdown> = {}

  // Strip HTML tags so "Condomínio</span><span>R$ 288" becomes "Condomínio R$ 288"
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")

  // QuintoAndar format: "Aluguel R$ 1.380" / "Condomínio R$ 288" / etc.
  const patterns: { key: keyof Omit<PriceBreakdown, "total">; regex: RegExp }[] = [
    { key: "rent", regex: /Aluguel\s*R\$\s*([\d.,]+)/i },
    { key: "condo", regex: /Condom[ií]n[ií]o\s*R\$\s*([\d.,]+)/i },
    { key: "iptu", regex: /IPTU\s*R\$\s*([\d.,]+)/i },
    { key: "insurance", regex: /Seguro\s*(?:inc[eê]ndio)?\s*R\$\s*([\d.,]+)/i },
    { key: "tax", regex: /Taxa\s*(?:de\s*servi[çc]o)?\s*R\$\s*([\d.,]+)/i },
  ]

  for (const { key, regex } of patterns) {
    const match = text.match(regex)
    if (match) {
      const val = parseBRL(`R$ ${match[1]}`)
      if (val !== null) result[key] = val
    }
  }

  // Total explicit
  const totalMatch = text.match(/Total\s*R\$\s*([\d.,]+)/i)
  if (totalMatch) {
    const val = parseBRL(`R$ ${totalMatch[1]}`)
    if (val !== null) result.total = val
  }

  // Need at least rent to be considered valid
  if (result.rent == null && result.total == null) return null

  // Calculate total if not explicitly provided
  if (result.total == null) {
    result.total = (result.rent || 0) + (result.condo || 0) + (result.iptu || 0) +
      (result.insurance || 0) + (result.tax || 0) + (result.other || 0)
  }

  return result as PriceBreakdown
}

function parseImoviewPrices(html: string): PriceBreakdown | null {
  const result: Partial<PriceBreakdown> = {}

  // Strip HTML tags for cleaner text matching (same as generic parser)
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&\#\d+;/g, " ")
    .replace(/&\w+;/g, " ")
    .replace(/\s+/g, " ")

  // Imoview uses abbreviations: "Cond.: R$ 597,00", "IPTU: R$ 140,00"
  const labeledPatterns: { key: keyof Omit<PriceBreakdown, "total">; regex: RegExp }[] = [
    { key: "rent", regex: /(?:Aluguel|Valor)[.:]*\s*R\$\s*([\d.,]+)/i },
    { key: "condo", regex: /Cond(?:om[ií]n[ií]o)?[.:]*\s*R\$\s*([\d.,]+)/i },
    { key: "iptu", regex: /IPTU[.:]*\s*R\$\s*([\d.,]+)/i },
    { key: "insurance", regex: /Seg(?:uro)?(?:\s*inc[eê]ndio)?[.:]*\s*R\$\s*([\d.,]+)/i },
    { key: "tax", regex: /Taxa[.:]*\s*R\$\s*([\d.,]+)/i },
  ]

  for (const { key, regex } of labeledPatterns) {
    const match = text.match(regex)
    if (match) {
      const val = parseBRL(`R$ ${match[1]}`)
      if (val !== null) result[key] = val
    }
  }

  // If no labeled rent, try the main prominent price (usually the first large R$ value in heading)
  if (result.rent == null) {
    const headingPrice = html.match(/<h[1-3][^>]*>.*?R\$\s*([\d.,]+)/is)
    if (headingPrice) {
      const val = parseBRL(`R$ ${headingPrice[1]}`)
      if (val !== null) result.rent = val
    }
  }

  // Also try standalone prominent R$ value (Imoview shows rent as the main price without label)
  if (result.rent == null) {
    // Find the first R$ value in the text that is NOT already captured as condo/iptu/etc
    const allPrices = [...text.matchAll(/R\$\s*([\d.,]+)/gi)]
    for (const pm of allPrices) {
      const val = parseBRL(`R$ ${pm[1]}`)
      if (val !== null && val !== result.condo && val !== result.iptu &&
          val !== result.insurance && val !== result.tax) {
        result.rent = val
        break
      }
    }
  }

  if (result.rent == null && result.condo == null && result.iptu == null) return null

  result.total = (result.rent || 0) + (result.condo || 0) + (result.iptu || 0) +
    (result.insurance || 0) + (result.tax || 0) + (result.other || 0)

  return result as PriceBreakdown
}

/**
 * Generic price breakdown parser — works for any real estate site.
 * Scans the full HTML for labeled price patterns.
 */
function parseGenericPrices(html: string): PriceBreakdown | null {
  const result: Partial<PriceBreakdown> = {}

  // Strip HTML tags for cleaner text matching
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")

  // Generic labeled patterns (work across most real estate sites)
  // Handles: "Condomínio: R$ 288", "Cond.: R$ 597,00", "Cond R$ 288", etc.
  const patterns: { key: keyof Omit<PriceBreakdown, "total">; regex: RegExp }[] = [
    { key: "rent", regex: /(?:Aluguel|Valor\s*(?:do\s*)?(?:aluguel|loca[çc][aã]o))\.?\s*:?\s*R\$\s*([\d.,]+)/i },
    { key: "condo", regex: /Cond(?:om[ií]n[ií]o)?\.?\s*:?\s*R\$\s*([\d.,]+)/i },
    { key: "iptu", regex: /IPTU\.?\s*:?\s*R\$\s*([\d.,]+)/i },
    { key: "insurance", regex: /Seg(?:uro)?\s*(?:inc[eê]ndio|fian[çc]a)?\.?\s*:?\s*R\$\s*([\d.,]+)/i },
    { key: "tax", regex: /Taxa\s*(?:de\s*servi[çc]o|administrativa)?\.?\s*:?\s*R\$\s*([\d.,]+)/i },
  ]

  for (const { key, regex } of patterns) {
    const match = text.match(regex)
    if (match) {
      const val = parseBRL(`R$ ${match[1]}`)
      if (val !== null) result[key] = val
    }
  }

  // Try explicit total
  const totalMatch = text.match(/(?:Total|Valor\s*total)\s*:?\s*R\$\s*([\d.,]+)/i)
  if (totalMatch) {
    const val = parseBRL(`R$ ${totalMatch[1]}`)
    if (val !== null) result.total = val
  }

  // Need at least 2 components to be a valid breakdown, or 1 component + total
  const componentCount = [result.rent, result.condo, result.iptu, result.insurance, result.tax]
    .filter((v) => v != null).length

  if (componentCount < 1) return null

  // Calculate total if not explicitly provided
  if (result.total == null) {
    result.total = (result.rent || 0) + (result.condo || 0) + (result.iptu || 0) +
      (result.insurance || 0) + (result.tax || 0) + (result.other || 0)
  }

  return result as PriceBreakdown
}

/**
 * Main price breakdown parser — tries source-specific parsers first,
 * then falls back to generic parser.
 */
function parsePriceBreakdown(html: string, source: string): PriceBreakdown | null {
  // Try source-specific parsers first (more accurate)
  if (source.includes("quintoandar")) {
    const result = parseQuintoAndarPrices(html)
    if (result) return result
  }
  if (source.includes("imoview")) {
    const result = parseImoviewPrices(html)
    if (result) return result
  }

  // Fall back to generic parser (works for any site)
  return parseGenericPrices(html)
}

// ─── Parsing Helpers ───

function extractFromTitle(title: string): Partial<ExtractedData> {
  const result: Partial<ExtractedData> = {}

  // Price: R$ X.XXX or R$ X.XXX,XX
  const priceMatch = title.match(/R\$\s*[\d.,]+/)
  if (priceMatch) result.price = priceMatch[0].trim()

  // Modality
  const isRent = /alugu[eé]|alugar|locação/i.test(title)
  const isBuy = /vend[aer]|comprar/i.test(title)
  result.modality = isBuy && !isRent ? "buy" : "rent"

  // Bedrooms
  const bedroomMatch = title.match(/(\d+)\s*quarto/i)
  if (bedroomMatch) result.bedrooms = bedroomMatch[1]

  // Bathrooms
  const bathMatch = title.match(/(\d+)\s*banheir/i)
  if (bathMatch) result.bathrooms = bathMatch[1]

  // Parking
  const parkingMatch = title.match(/(\d+)\s*vaga/i)
  if (parkingMatch) result.parkingSpots = parkingMatch[1]

  // Area m²
  const areaMatch = title.match(/(\d+)\s*m[²2]/i)
  if (areaMatch) result.area = areaMatch[1]

  return result
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ")
}

function resolveUrl(src: string, baseUrl: string): string {
  if (!src) return ""
  if (src.startsWith("http://") || src.startsWith("https://")) return src
  if (src.startsWith("//")) return "https:" + src
  try {
    const base = new URL(baseUrl)
    if (src.startsWith("/")) return base.origin + src
    return base.origin + "/" + src
  } catch {
    return src
  }
}

function extractImageFromHtml(html: string, pageUrl: string): string {
  // 1. og:image
  const ogImg =
    html.match(/property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]
  if (ogImg) return resolveUrl(ogImg, pageUrl)

  // 2. twitter:image
  const twImg =
    html.match(/name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)?.[1]
  if (twImg) return resolveUrl(twImg, pageUrl)

  // 3. First large image in HTML (skip icons/logos by requiring real path)
  const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*/gi)
  for (const match of imgMatches) {
    const src = match[1]
    if (
      src &&
      !src.includes("logo") &&
      !src.includes("icon") &&
      !src.includes("svg") &&
      !src.includes("avatar") &&
      !src.includes("pixel") &&
      !src.includes("1x1") &&
      (src.includes(".jpg") || src.includes(".jpeg") || src.includes(".png") || src.includes(".webp") || src.includes("IMG") || src.includes("/img/") || src.includes("/image") || src.includes("cdn"))
    ) {
      return resolveUrl(src, pageUrl)
    }
  }

  // 4. JSON-LD image
  const jsonLdImg = html.match(/"image"\s*:\s*"([^"]+)"/i)?.[1]
  if (jsonLdImg) return resolveUrl(jsonLdImg, pageUrl)

  return ""
}

function extractFromHtml(html: string, pageUrl: string = ""): Partial<ExtractedData> {
  const result: Partial<ExtractedData> = {}

  // Image (multi-source extraction)
  result.imageUrl = extractImageFromHtml(html, pageUrl)

  // OG Title
  const ogTitle =
    html.match(/property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1] ||
    ""
  if (ogTitle) result.title = decodeHtmlEntities(ogTitle)

  // OG Description (might have more data)
  const ogDesc =
    html.match(/property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/content=["']([^"']+)["'][^>]+property=["']og:description["']/i)?.[1] ||
    ""

  // Try to extract data from OG description too
  if (ogDesc) {
    const descData = extractFromTitle(ogDesc)
    if (!result.price && descData.price) result.price = descData.price
    if (descData.bedrooms) result.bedrooms = descData.bedrooms
    if (descData.bathrooms) result.bathrooms = descData.bathrooms
    if (descData.area) result.area = descData.area
    if (descData.parkingSpots) result.parkingSpots = descData.parkingSpots
  }

  // Price from body (R$ patterns)
  if (!result.price) {
    const priceMatch = html.match(/R\$\s*[\d.,]+/i)
    if (priceMatch) result.price = priceMatch[0].trim()
  }

  // Area from body
  if (!result.area) {
    const areaMatch = html.match(/(\d+)\s*m[²2]/i)
    if (areaMatch) result.area = areaMatch[1]
  }

  // Bedrooms from body
  if (!result.bedrooms) {
    const bedroomMatch = html.match(/(\d+)\s*quarto/i)
    if (bedroomMatch) result.bedrooms = bedroomMatch[1]
  }

  // Bathrooms from body
  if (!result.bathrooms) {
    const bathMatch = html.match(/(\d+)\s*banheir/i)
    if (bathMatch) result.bathrooms = bathMatch[1]
  }

  // Parking from body
  if (!result.parkingSpots) {
    const parkingMatch = html.match(/(\d+)\s*vaga/i)
    if (parkingMatch) result.parkingSpots = parkingMatch[1]
  }

  // <title> tag as fallback
  if (!result.title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) result.title = decodeHtmlEntities(titleMatch[1].trim())
  }

  // Address extraction (multiple sources)
  if (!result.address) {
    // 1. JSON-LD structured data
    const streetMatch = html.match(/"streetAddress"\s*:\s*"([^"]+)"/i)
    if (streetMatch) {
      result.address = decodeHtmlEntities(streetMatch[1])
    }
  }
  if (!result.address) {
    // 2. Itemprop streetAddress
    const itemMatch = html.match(/itemprop=["']streetAddress["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/itemprop=["']streetAddress["'][^>]*>([^<]+)</i)
    if (itemMatch) result.address = decodeHtmlEntities(itemMatch[1].trim())
  }
  if (!result.address) {
    // 3. Meta geo tags
    const geoMatch = html.match(/name=["']geo\.placename["'][^>]+content=["']([^"']+)["']/i)
    if (geoMatch) result.address = decodeHtmlEntities(geoMatch[1])
  }
  if (!result.address) {
    // 4. Common Brazilian address patterns in text
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")
    // Require full keyword (word boundary) + proper name (starts with uppercase), reject R$ matches
    const addrMatch = text.match(/\b((?:Rua|Avenida|Alameda|Travessa|Praça|Estrada|Rodovia)\s+[A-ZÀ-Ú][^,\n]{3,50},?\s*(?:n[ºo°]?\s*)?\d+)/i)
    if (addrMatch && !addrMatch[1].includes("R$")) {
      result.address = decodeHtmlEntities(addrMatch[1].trim())
    }
  }

  return result
}

/**
 * Extract dynamic/optional data from HTML — anything found gets included.
 * Returns only what's available, never forces fields.
 */
function extractExtras(html: string): Record<string, string> {
  const extras: Record<string, string> = {}

  // Strip HTML tags for cleaner text matching
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")

  // Floor / Andar
  const floorMatch = text.match(/(\d+)[ºª°]?\s*andar/i) || text.match(/andar\s*:?\s*(\d+)/i)
  if (floorMatch) extras["Andar"] = `${floorMatch[1]}º andar`

  // Total floors
  const totalFloorsMatch = text.match(/(\d+)\s*andares/i)
  if (totalFloorsMatch) extras["Andares"] = `${totalFloorsMatch[1]} andares`

  // Suites
  const suiteMatch = text.match(/(\d+)\s*su[ií]te/i)
  if (suiteMatch) extras["Suítes"] = suiteMatch[1]

  // Furnished / Mobiliado
  if (/mobiliado/i.test(text) && !/sem\s*mob[ií]lia|n[aã]o\s*mobiliado/i.test(text)) {
    extras["Mobiliado"] = "Sim"
  } else if (/sem\s*mob[ií]lia|n[aã]o\s*mobiliado/i.test(text)) {
    extras["Mobiliado"] = "Não"
  }

  // Pets
  if (/aceita\s*(?:pet|animal|animais)/i.test(text)) {
    extras["Aceita pet"] = "Sim"
  } else if (/n[aã]o\s*aceita\s*(?:pet|animal|animais)/i.test(text)) {
    extras["Aceita pet"] = "Não"
  }

  // Metro / Proximity
  if (/pr[oó]x(?:imo)?\s*(?:ao|do|de)?\s*metr[oô]/i.test(text)) {
    extras["Próx. metrô"] = "Sim"
  }

  // Elevator
  if (/elevador/i.test(text) && !/sem\s*elevador/i.test(text)) {
    extras["Elevador"] = "Sim"
  } else if (/sem\s*elevador/i.test(text)) {
    extras["Elevador"] = "Não"
  }

  // Pool / Piscina
  if (/piscina/i.test(text)) {
    extras["Piscina"] = "Sim"
  }

  // Gym / Academia
  if (/academia|fitness/i.test(text)) {
    extras["Academia"] = "Sim"
  }

  // Gourmet area / Churrasqueira
  if (/churrasqueir|[aá]rea\s*gourmet|espa[çc]o\s*gourmet/i.test(text)) {
    extras["Churrasqueira"] = "Sim"
  }

  // Playground
  if (/playground|brinquedoteca/i.test(text)) {
    extras["Playground"] = "Sim"
  }

  // Laundry / Lavanderia
  if (/lavanderia|[aá]rea\s*de\s*servi[çc]o/i.test(text)) {
    extras["Lavanderia"] = "Sim"
  }

  // Balcony / Varanda / Sacada
  if (/varanda|sacada|balc[aã]o/i.test(text)) {
    extras["Varanda"] = "Sim"
  }

  // Portaria 24h
  if (/portaria\s*24/i.test(text)) {
    extras["Portaria 24h"] = "Sim"
  }

  // Year of construction
  const yearMatch = text.match(/(?:constru[ií]do|ano\s*(?:de\s*)?constru[çc][aã]o)\s*:?\s*(\d{4})/i)
  if (yearMatch) extras["Ano construção"] = yearMatch[1]

  // Solar orientation
  if (/nasc[ei]nte|face\s*norte/i.test(text)) {
    extras["Orientação"] = "Nascente"
  } else if (/poente|face\s*oeste/i.test(text)) {
    extras["Orientação"] = "Poente"
  }

  return extras
}
function extractNeighborhood(title: string): string {
  // Common pattern: "... em BAIRRO, CIDADE ..."
  const emMatch = title.match(/em\s+([^,]+),\s*([^-–]+)/i)
  if (emMatch) return emMatch[1].trim()

  // Pattern: "BAIRRO - CIDADE - UF"
  const dashMatch = title.match(/(\S+(?:\s+\S+)*)\s*[-–]\s*\w[\w\s]+\s*[-–]\s*\w{2}$/i)
  if (dashMatch) return dashMatch[1].trim()

  return ""
}

export function useLinkExtractor() {
  const [data, setData] = useState<ExtractedData | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const extract = useCallback(async (url: string) => {
    setIsExtracting(true)
    setError(null)
    setData(null)

    try {
      // In dev: use Vite proxy (/api/extract) which fetches server-side (no CORS)
      // In prod: will use Supabase Edge Function
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error("Não foi possível acessar o link")
      }

      const { html, error: fetchError } = await response.json()
      if (fetchError || !html) {
        throw new Error(fetchError || "Não foi possível acessar o link")
      }

      // Extract all available data
      const htmlData = extractFromHtml(html, url)
      const titleData = extractFromTitle(htmlData.title || "")
      const source = new URL(url).hostname.replace("www.", "")

      // Extract price breakdown
      const priceBreakdown = parsePriceBreakdown(html, source)

      // Extract dynamic extras (floor, pets, furnished, amenities, etc.)
      const extras = extractExtras(html)

      // Build result
      const result: ExtractedData = {
        title: htmlData.title || "",
        imageUrl: htmlData.imageUrl || "",
        price: priceBreakdown
          ? formatBRL(priceBreakdown.total)
          : htmlData.price || titleData.price || "",
        priceBreakdown,
        address: htmlData.address || "",
        neighborhood: extractNeighborhood(htmlData.title || ""),
        bedrooms: htmlData.bedrooms || titleData.bedrooms || "",
        bathrooms: htmlData.bathrooms || titleData.bathrooms || "",
        parkingSpots: htmlData.parkingSpots || titleData.parkingSpots || "",
        area: htmlData.area || titleData.area || "",
        source,
        url,
        modality: titleData.modality || "rent",
        extras,
      }

      setData(result)
      return result
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao extrair dados do link"
      setError(message)
      return null
    } finally {
      setIsExtracting(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsExtracting(false)
  }, [])

  return { data, isExtracting, error, extract, reset }
}
