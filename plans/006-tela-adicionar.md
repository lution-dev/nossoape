# Plan 006 — Tela Adicionar: Input de Link

**Issue:** [006-tela-adicionar.md](../issues/006-tela-adicionar.md)
**Módulo:** Add Property
**Referências:** BUSINESS_RULES.md (seções 2.3, 5), DESIGN.md (seção 7)

---

## Descrição

Tela dedicada com campo grande para colar link e formulário manual para preencher dados do imóvel. Nesta issue, a extração automática ainda não funciona (issue 007) — o foco é o form manual + salvamento no Supabase.

---

## Arquivos

### [NEW]
- `src/features/add-property/pages/AddPropertyPage.tsx` — substitui placeholder
- `src/features/add-property/components/LinkInput.tsx` — campo de input com ícone clipboard
- `src/features/add-property/components/ManualForm.tsx` — form com todos os campos
- `src/features/add-property/components/PropertyPreview.tsx` — card preview (skeleton por enquanto)
- `src/features/add-property/hooks/useAddProperty.ts` — lógica de insert no Supabase
- `src/stores/propertyStore.ts` — Zustand store de properties

### [MODIFY]
- Nenhum (tela já roteada pela issue 002)

---

## Design — AddPropertyPage

```
Header: "← Adicionar Imóvel" (back button)
Layout: scroll vertical

Seção 1 — Link Input:
  - Input grande (text-lg, h-14) com placeholder "Cole o link do imóvel aqui"
  - Ícone clipboard à direita
  - Detecção onPaste: se URL válida, popula o campo automaticamente

Seção 2 — Separador:
  - "── ou ──"

Seção 3 — Manual Form:
  - Título* (Input)
  - Preço (Input, prefix "R$")
  - Modalidade* (Select: Aluguel / Compra)
  - Tipo* (Select: Apartamento / Casa / Terreno / Comercial / Outro)
  - Endereço (Input)
  - Bairro (Input)
  - Área m² (Input number)
  - Quartos (Input number)
  - Banheiros (Input number)
  - Vagas (Input number)
  - Observações (Textarea)

Seção 4 — Ação:
  - Botão "✓ Salvar Imóvel" (variant default, w-full, h-12)
  * = obrigatório
```

## Dados — Insert

```typescript
const newProperty = {
  board_id: currentBoardId,
  url: linkInput || '',
  title: form.title,
  image_url: null, // preenchido na issue 007
  price: form.price,
  modality: form.modality, // 'rent' | 'buy'
  address: form.address,
  neighborhood: form.neighborhood,
  type: form.type,
  area: form.area || null,
  bedrooms: form.bedrooms || null,
  bathrooms: form.bathrooms || null,
  parking_spots: form.parkingSpots || null,
  status: 'new',
  added_by: currentUserId,
  source: extractDomain(linkInput),
  notes: form.notes,
}
```

---

## Checklist

- [ ] Criar AddPropertyPage com layout mobile-first
- [ ] Criar LinkInput com onPaste handler e validação de URL
- [ ] Criar ManualForm com todos os campos (selects para tipo e modalidade)
- [ ] Validações: título obrigatório, modalidade obrigatória
- [ ] Criar propertyStore (Zustand) com lista de properties e addProperty action
- [ ] Hook useAddProperty: insert no Supabase + optimistic update no store
- [ ] Helper extractDomain(url) para popular `source`
- [ ] Toast de sucesso + navigate(-1) após salvar
- [ ] Verificar: preencher form manual → salvar → aparece no Supabase
