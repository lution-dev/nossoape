# 008 — Dashboard: Lista de Cards com Tabs

**Módulo:** Dashboard
**Prioridade:** 🔴 Crítica
**Dependências:** 006

## Descrição

Tela home com tabs horizontais swipáveis de status (Todos, Interesse, Agendado, Visitado, Favorito, Descartado). PropertyCard com foto, título, preço, bairro e badge de status. Lista vertical scrollável. Empty state quando sem imóveis. FAB "+" no canto inferior direito.

## Checklist

- [ ] Criar `DashboardPage.tsx` com header "Nosso Apê" e saudação
- [ ] Criar `StatusTabs.tsx` — tabs horizontais com scroll, filtro por status
- [ ] Criar `PropertyCard.tsx` — card shadcn com: imagem 16:9, título, preço, bairro, badge de status
- [ ] Criar `PropertyList.tsx` — lista vertical com gap entre cards
- [ ] Criar `EmptyState.tsx` — ilustração + texto "Nenhum imóvel ainda" + CTA para adicionar
- [ ] Criar FAB "+" flutuante (bottom-right, acima do BottomNav)
- [ ] Fetch de imóveis do Supabase pelo board_id
- [ ] Filtro dos cards por tab ativa (status)
- [ ] Contador de imóveis por tab
- [ ] Navegação: tap no card → `/property/:id`
- [ ] Verificar: dashboard exibe imóveis do board, tabs filtram corretamente
