# Plan 007 — Edge Function: Extração de Meta Tags

**Issue:** [007-edge-function-extracao.md](../issues/007-edge-function-extracao.md)
**Módulo:** Backend / Extração
**Referências:** BUSINESS_RULES.md (seção 5)

---

## Descrição

Criar Edge Function no Supabase (Deno) que recebe uma URL, faz fetch do HTML, parseia meta tags e retorna dados estruturados. Integrar no frontend para exibir preview ao colar link.

---

## Arquivos

### [NEW]
- `supabase/functions/extract-link/index.ts` — Edge Function (Deno runtime)

### [MODIFY]
- `src/features/add-property/components/LinkInput.tsx` — ao detectar URL, chamar edge function
- `src/features/add-property/components/PropertyPreview.tsx` — exibir dados extraídos em card
- `src/features/add-property/hooks/useAddProperty.ts` — adicionar useLinkExtractor

### [NEW]
- `src/features/add-property/hooks/useLinkExtractor.ts` — hook que chama a edge function

---

## Edge Function — Implementação

```typescript
// supabase/functions/extract-link/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  const { url } = await req.json()
  
  // 1. Fetch com headers de browser
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NossoApe/1.0)',
      'Accept': 'text/html',
    }
  })
  const html = await response.text()
  
  // 2. Parse OG tags via regex (sem DOM parser no edge)
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/)
  const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/)
  const ogDesc = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/)
  
  // 3. Fallbacks
  const title = ogTitle?.[1] || html.match(/<title>([^<]*)<\/title>/)?.[1] || ''
  const imageUrl = ogImage?.[1] || ''
  const description = ogDesc?.[1] || ''
  
  // 4. Regex de preço
  const priceMatch = html.match(/R\$\s*[\d.,]+/)
  const price = priceMatch?.[0] || ''
  
  // 5. Source
  const source = new URL(url).hostname.replace('www.', '')
  
  return new Response(JSON.stringify({
    title: title.trim(),
    imageUrl,
    description: description.trim(),
    price,
    source,
    url,
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

---

## Frontend — Fluxo

```
1. User cola URL no LinkInput
2. onPaste detecta URL válida
3. Setar isExtracting = true → exibir Skeleton no PropertyPreview
4. Chamar supabase.functions.invoke('extract-link', { body: { url } })
5. Receber dados → popular PropertyPreview com imagem, título, preço
6. User revisa, edita se necessário
7. Clica "Salvar" → dados do preview + edições manuais → insert
```

---

## Checklist

- [ ] Criar Edge Function `extract-link` em Deno
- [ ] Implementar parsing de OG tags (title, image, description)
- [ ] Implementar regex de preço (R$ xxx)
- [ ] Implementar fallback para meta tags padrão e <title>
- [ ] Criar hook useLinkExtractor que invoca a function
- [ ] Integrar no LinkInput: onPaste → chamar extrator
- [ ] Atualizar PropertyPreview: skeleton durante loading → card com dados
- [ ] Popular form com dados extraídos (editáveis)
- [ ] Fallback: se extração falha → toast de warning + form vazio
- [ ] Deploy da function no Supabase
- [ ] Verificar: colar link do ZAP → preview com foto e título aparece
