// supabase/functions/extract-link/index.ts
// Deploy via: supabase functions deploy extract-link
// Ou cole este código no Supabase Dashboard > Edge Functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// ─── Currency Helpers ───

function parseBRL(raw: string): number | null {
  const cleaned = raw
    .replace(/R\$\s*/i, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim()
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

interface PriceBreakdown {
  rent?: number
  condo?: number
  iptu?: number
  insurance?: number
  tax?: number
  other?: number
  total: number
}

// ─── Price Breakdown Parsers ───

function parseQuintoAndarPrices(html: string): PriceBreakdown | null {
  const result: Record<string, number | undefined> = {}

  // Strip HTML tags for cleaner matching
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")

  const patterns: { key: string; regex: RegExp }[] = [
    { key: "rent", regex: /Aluguel\.?\s*:?\s*R\$\s*([\d.,]+)/i },
    { key: "condo", regex: /Cond(?:om[ií]n[ií]o)?\.?\s*:?\s*R\$\s*([\d.,]+)/i },
    { key: "iptu", regex: /IPTU\.?\s*:?\s*R\$\s*([\d.,]+)/i },
    { key: "insurance", regex: /Seg(?:uro)?\s*(?:inc[eê]ndio)?\.?\s*:?\s*R\$\s*([\d.,]+)/i },
    { key: "tax", regex: /Taxa\s*(?:de\s*servi[çc]o)?\.?\s*:?\s*R\$\s*([\d.,]+)/i },
  ]

  for (const { key, regex } of patterns) {
    const match = text.match(regex)
    if (match) {
      const val = parseBRL(`R$ ${match[1]}`)
      if (val !== null) result[key] = val
    }
  }

  const totalMatch = text.match(/Total\s*R\$\s*([\d.,]+)/i)
  if (totalMatch) {
    const val = parseBRL(`R$ ${totalMatch[1]}`)
    if (val !== null) result.total = val
  }

  if (result.rent == null && result.total == null) return null

  if (result.total == null) {
    result.total = (result.rent || 0) + (result.condo || 0) + (result.iptu || 0) +
      (result.insurance || 0) + (result.tax || 0) + (result.other || 0)
  }

  return result as unknown as PriceBreakdown
}

function parseGenericPrices(html: string): PriceBreakdown | null {
  const result: Record<string, number | undefined> = {}

  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")

  const patterns: { key: string; regex: RegExp }[] = [
    { key: "rent", regex: /(?:Aluguel|Valor\s*(?:do\s*)?(?:aluguel|loca[çc][ãa]o))\.?\s*:?\s*R\$\s*([\d.,]+)/i },
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

  const totalMatch = text.match(/(?:Total|Valor\s*total)\s*:?\s*R\$\s*([\d.,]+)/i)
  if (totalMatch) {
    const val = parseBRL(`R$ ${totalMatch[1]}`)
    if (val !== null) result.total = val
  }

  const componentCount = [result.rent, result.condo, result.iptu, result.insurance, result.tax]
    .filter((v) => v != null).length

  if (componentCount < 1) return null

  if (result.total == null) {
    result.total = (result.rent || 0) + (result.condo || 0) + (result.iptu || 0) +
      (result.insurance || 0) + (result.tax || 0) + (result.other || 0)
  }

  return result as unknown as PriceBreakdown
}

function parsePriceBreakdown(html: string, source: string): PriceBreakdown | null {
  if (source.includes("quintoandar")) {
    const result = parseQuintoAndarPrices(html)
    if (result) return result
  }
  return parseGenericPrices(html)
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Fetch HTML with browser-like headers
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    })

    const html = await response.text()

    // ─── Parse OG tags ───
    const getMetaContent = (property: string): string => {
      const propMatch = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"))
      if (propMatch) return propMatch[1]

      const nameMatch = html.match(new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"))
      if (nameMatch) return nameMatch[1]

      const revMatch = html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, "i"))
      if (revMatch) return revMatch[1]

      return ""
    }

    // Title: OG > <title>
    const ogTitle = getMetaContent("og:title")
    const htmlTitle = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || ""
    const title = (ogTitle || htmlTitle).trim()

    // Image
    const imageUrl = getMetaContent("og:image")

    // Description
    const ogDesc = getMetaContent("og:description")
    const metaDesc = getMetaContent("description")
    const description = (ogDesc || metaDesc).trim()

    // Source hostname
    const source = new URL(url).hostname.replace("www.", "")

    // Price breakdown
    const priceBreakdown = parsePriceBreakdown(html, source)

    // Price via regex (R$ patterns) — fallback if no breakdown
    const pricePatterns = [
      /R\$\s*[\d.,]+(?:\s*(?:\/\s*m[eê]s|\/mês))?/i,
      /(?:pre[çc]o|valor|aluguel)[:\s]*R?\$?\s*[\d.,]+/i,
    ]
    let price = ""
    if (priceBreakdown) {
      price = `R$ ${priceBreakdown.total.toLocaleString("pt-BR")}`
    } else {
      for (const pattern of pricePatterns) {
        const match = html.match(pattern)
        if (match) {
          price = match[0].trim()
          break
        }
      }
    }

    // Address from structured data or meta
    const addressMatch = html.match(/"streetAddress"\s*:\s*"([^"]+)"/i)
    const address = addressMatch?.[1] || ""

    // Neighborhood
    const neighborhoodMatch = html.match(/"addressLocality"\s*:\s*"([^"]+)"/i)
    const neighborhood = neighborhoodMatch?.[1] || ""

    const result = {
      title,
      imageUrl,
      description,
      price,
      priceBreakdown,
      address,
      neighborhood,
      source,
      url,
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to extract data" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
