# Plan 009 — Detalhe do Imóvel

**Issue:** [009-detalhe-imovel.md](../issues/009-detalhe-imovel.md)
**Módulo:** Property Detail
**Referências:** DESIGN.md (seção 7), BUSINESS_RULES.md (seções 2.3, 3)

---

## Descrição

Tela full-page de detalhe com foto, informações completas, botão para site original, botões de mudança de status e edição inline de campos. Deletar imóvel com confirmação via Dialog.

---

## Arquivos

### [NEW]
- `src/features/property-detail/pages/PropertyDetailPage.tsx` — substitui placeholder
- `src/features/property-detail/components/PropertyHeader.tsx` — foto + botão voltar + link externo
- `src/features/property-detail/components/PropertyInfo.tsx` — infos: tipo, quartos, area, vagas
- `src/features/property-detail/components/StatusActions.tsx` — botões de mudança de status
- `src/features/property-detail/components/EditableField.tsx` — campo com modo leitura/edição
- `src/features/property-detail/components/DeleteDialog.tsx` — confirmação de exclusão
- `src/features/property-detail/hooks/usePropertyDetail.ts` — fetch single + update + delete

### [MODIFY]
- `src/stores/propertyStore.ts` — adicionar updateProperty, deleteProperty actions

---

## Design — PropertyDetailPage

```
Scroll vertical, sem BottomNav (tela específica)

Header (sticky):
  - Back arrow (← navigate back)
  - Ícones right: Link externo 🔗, Delete 🗑️

Foto: full-width, aspect-video, object-cover
  - Fallback: bg-muted h-48 com ícone Home

Infos (px-4, py-4):
  - Title: text-xl font-semibold
  - Price + modalidade: text-lg text-muted-foreground
  - Address: text-sm text-muted-foreground, ícone MapPin
  - Separator
  - Grid 2x2: 🛏 Quartos, 🚿 Banheiros, 🚗 Vagas, 📏 Área
  - "Abrir no site original" — Button variant outline com ícone ExternalLink

Status Actions (px-4):
  - Title: "Status" (text-sm font-medium)
  - Grid de botões: Interesse, Agendado, Visitado, Favorito, Descartar
  - Botão ativo: variant default (sólido)
  - Botões inativos: variant outline
  - Tap muda status → update Supabase → toast

Edição (px-4):
  - Cada campo editável: tap → input aparece → salvar → update
  - Campos: título, preço, endereço, bairro, tipo, área, quartos

Notas (px-4):
  - Textarea para observações livres
  - Auto-save com debounce 1s

Bottom padding: pb-8 (safe area)
```

---

## StatusActions — Transições

```typescript
const statusButtons = [
  { status: 'interest', label: 'Interesse', icon: Star, color: 'status-interest' },
  { status: 'scheduled', label: 'Agendado', icon: Calendar, color: 'status-scheduled' },
  { status: 'visited', label: 'Visitado', icon: Check, color: 'status-visited' },
  { status: 'favorite', label: 'Favorito', icon: Heart, color: 'status-favorite' },
  { status: 'discarded', label: 'Descartar', icon: X, color: 'status-discarded' },
]
```

---

## Checklist

- [ ] Criar PropertyDetailPage com layout scroll vertical
- [ ] PropertyHeader: foto full-width, back button, link externo, delete icon
- [ ] PropertyInfo: título, preço, endereço, grid de features (quartos, vagas, etc)
- [ ] Botão "Abrir no site original" (window.open em nova aba)
- [ ] StatusActions: grid de botões para mudar status, ativo com estilo sólido
- [ ] Update status no Supabase + toast de feedback
- [ ] EditableField: componente de campo com toggle leitura/edição
- [ ] DeleteDialog: Dialog shadcn com confirmação "Tem certeza?"
- [ ] Delete no Supabase + navigate back após confirmar
- [ ] Hook usePropertyDetail: fetch por ID, update, delete
- [ ] Verificar: detalhe carrega, status muda, edição funciona, delete funciona
