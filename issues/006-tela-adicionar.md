# 006 — Tela Adicionar: Input de Link

**Módulo:** Add Property
**Prioridade:** 🔴 Crítica
**Dependências:** 004

## Descrição

Tela dedicada com campo de input grande para colar link de imóvel. Detecção automática de URL ao colar (onPaste). Opção de adicionar manualmente com formulário completo. Campos: título, preço, endereço, bairro, tipo, modalidade (aluguel/compra), área, quartos, vagas. Salva no Supabase vinculado ao board.

## Checklist

- [ ] Criar `AddPropertyPage.tsx` com layout conforme DESIGN.md
- [ ] Criar `LinkInput.tsx` — campo grande com ícone clipboard e detecção onPaste
- [ ] Criar `ManualForm.tsx` — formulário completo com todos os campos do imóvel
- [ ] Validação: URL válida, título obrigatório, modalidade obrigatória
- [ ] Select de tipo (apartment, house, etc) e modalidade (rent, buy)
- [ ] Ação de salvar: insert no Supabase com board_id e added_by
- [ ] Toast de sucesso + redirect para dashboard após salvar
- [ ] Criar `propertyStore.ts` (Zustand) com addProperty action
- [ ] Verificar: imóvel pode ser criado manualmente e aparece no banco
