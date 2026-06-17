# BACKLOG.md — Lumi Imóveis
> Tasks ativas. Quando concluída, mova para archive/changelog.md.

## Tasks Ativas

#### T-AD-03: Fix detecção de modalidade (compra vs aluguel) e preço para imóveis de venda
**Arquivo:** src/features/add-property/hooks/useLinkExtractor.ts
**Critérios:**
- [ ] URLs com `/comprar/` ou `/venda/` devem setar modality="buy"
- [ ] Para modality="buy", não exibir price_breakdown mensal como preço principal
- [ ] Para modality="buy", usar o preço de venda do título como price
- [ ] price_breakdown pode ter condo para compra (é info útil), mas total mensal NÃO é o preço principal
**Status:** 🔄 Em andamento
