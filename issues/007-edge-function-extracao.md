# 007 — Edge Function: Extração de Meta Tags

**Módulo:** Backend / Extração
**Prioridade:** 🟡 Alta
**Dependências:** 006

## Descrição

Supabase Edge Function (Deno) que recebe URL via POST, faz fetch do HTML, parseia e extrai dados via Open Graph tags, JSON-LD e regex. Integração no frontend: ao colar link, chama a function e exibe preview com dados extraídos antes de salvar.

## Checklist

- [ ] Criar `supabase/functions/extract-link/index.ts` (Deno)
- [ ] Implementar fetch da URL com headers de browser (User-Agent)
- [ ] Parser de OG tags (og:title, og:image, og:description)
- [ ] Parser de JSON-LD (schema.org RealEstateListing)
- [ ] Regex para extração de preço (`R\$\s*[\d.,]+`)
- [ ] Extração do source (hostname da URL)
- [ ] Retornar JSON: { title, imageUrl, description, price, address, source }
- [ ] Criar `PropertyPreview.tsx` — card com dados extraídos + skeleton loading
- [ ] Integrar no `LinkInput.tsx`: ao detectar URL, chamar edge function e popular preview
- [ ] Fallback: se extração falha, exibir form manual com campos vazios
- [ ] Deploy da function no Supabase
- [ ] Verificar: colar link do ZAP/OLX → preview com foto e título aparece
