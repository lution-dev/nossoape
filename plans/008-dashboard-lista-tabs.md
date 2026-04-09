# Plan 008 — Dashboard: Lista de Cards com Tabs

**Issue:** [008-dashboard-lista-tabs.md](../issues/008-dashboard-lista-tabs.md)
**Módulo:** Dashboard
**Referências:** DESIGN.md (seções 5.6, 7.1), BUSINESS_RULES.md (seção 3)

---

## Descrição

Tela home com tabs horizontais de status, lista vertical de PropertyCards, empty state, e FAB para adicionar. O foco é mobile-first: tabs scrolláveis, cards full-width, FAB no canto inferior direito.

---

## Arquivos

### [NEW]
- `src/features/dashboard/pages/DashboardPage.tsx` — substitui placeholder
- `src/features/dashboard/components/StatusTabs.tsx` — tabs horizontais de status
- `src/features/dashboard/components/PropertyList.tsx` — lista vertical de cards
- `src/features/dashboard/hooks/useProperties.ts` — hook: fetch + filtro por status
- `src/components/shared/PropertyCard.tsx` — card reutilizável do imóvel
- `src/components/shared/StatusBadge.tsx` — badge colorido por status
- `src/components/shared/EmptyState.tsx` — estado vazio com CTA
- `src/components/shared/FAB.tsx` — floating action button

### [MODIFY]
- `src/stores/propertyStore.ts` — adicionar fetchProperties, filteredProperties

---

## Design — StatusTabs

```
Container: overflow-x-auto, no-scrollbar, px-4
Tabs: flex gap-2, horizontal scroll
Tab item: 
  - text-xs font-medium
  - Inactive: bg-secondary text-muted-foreground rounded-full px-3 py-1.5
  - Active: bg-foreground text-background rounded-full px-3 py-1.5
  - Cada tab exibe: "Label (N)" — ex: "Interesse (3)"
```

## Design — PropertyCard

```
Container: bg-card rounded-lg border overflow-hidden
Image: aspect-video w-full object-cover (fallback: bg-muted + Home icon)
Content: p-4
  - Title: text-sm font-medium line-clamp-1
  - Price + modalidade: text-xs text-muted-foreground
  - Location: text-xs text-muted-foreground, ícone MapPin
  - StatusBadge: canto superior direito da imagem (absolute)
```

## Design — FAB

```
Position: fixed bottom-20 right-4 (acima do BottomNav)
Size: h-14 w-14 rounded-full
Style: bg-foreground text-background shadow-lg
Icon: Plus (Lucide), 24px
Animation: scale on press (Framer Motion)
Action: navigate('/add')
```

## Design — EmptyState

```
Container: flex flex-col items-center justify-center py-20
Icon: Home (Lucide), 48px, text-muted-foreground
Title: "Nenhum imóvel ainda" (text-lg font-medium)
Subtitle: "Adicione seu primeiro imóvel para começar" (text-sm text-muted-foreground)
CTA: Button "Adicionar imóvel" (variant outline)
```

---

## Dados — Fetch

```typescript
// useProperties.ts
const { data } = await supabase
  .from('properties')
  .select('*')
  .eq('board_id', boardId)
  .order('created_at', { ascending: false })

// Filtro por tab ativa (frontend)
const filtered = activeTab === 'all' 
  ? properties 
  : properties.filter(p => p.status === activeTab)
```

---

## Checklist

- [ ] Criar StatusTabs com scroll horizontal e contadores
- [ ] Criar PropertyCard com imagem, título, preço, bairro, StatusBadge
- [ ] Criar EmptyState com ícone, texto e CTA
- [ ] Criar FAB com animação de press
- [ ] Criar PropertyList renderizando cards em lista vertical
- [ ] Criar DashboardPage integrando Header + StatusTabs + PropertyList + FAB
- [ ] Hook useProperties: fetch do Supabase + filtro por status
- [ ] Filtro por tab ativa no frontend
- [ ] Navigate para /property/:id ao tap no card
- [ ] Navigate para /add ao tap no FAB
- [ ] Verificar: dashboard exibe cards, tabs filtram, empty state funciona
