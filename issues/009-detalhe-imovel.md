# 009 — Detalhe do Imóvel

**Módulo:** Property Detail
**Prioridade:** 🔴 Crítica
**Dependências:** 008

## Descrição

Tela full-page de detalhe do imóvel com: foto em destaque, informações completas (título, preço, endereço, tipo, área, quartos, vagas), botão "abrir no site original", seção de status com botões para mudar, e edição inline dos campos. Ações: mudar status, editar, excluir (com dialog de confirmação).

## Checklist

- [ ] Criar `PropertyDetailPage.tsx` — rota `/property/:id`
- [ ] Criar `PropertyHeader.tsx` — foto grande (aspect-video), botão voltar, botão link externo
- [ ] Exibir infos: título, preço, modalidade, endereço, tipo, área, quartos, banheiros, vagas
- [ ] Botão "Abrir no site original" (abre URL em nova aba)
- [ ] Criar `StatusActions.tsx` — botões para mudar status (interesse, agendado, visitado, favorito, descartar)
- [ ] Edição inline: tap no campo → input editável → save
- [ ] Dialog de confirmação para excluir imóvel
- [ ] Update no Supabase ao mudar status ou editar campo
- [ ] Toast de feedback nas ações
- [ ] Verificar: detalhe carrega, status muda, edição funciona, exclusão funciona
