# Plan 010 — Supabase Realtime Sync

**Issue:** [010-realtime-sync.md](../issues/010-realtime-sync.md)
**Módulo:** Infraestrutura / Sync
**Referências:** ARCHITECTURE.md (seções 4.2, 5.4), BUSINESS_RULES.md (seção 6)

---

## Descrição

Configurar subscriptions de Realtime na tabela `properties` filtrado por `board_id`. Implementar optimistic updates: ação reflete na UI antes do Supabase confirmar, com rollback em caso de erro.

---

## Arquivos

### [NEW]
- `src/hooks/useRealtime.ts` — hook genérico de Realtime subscription

### [MODIFY]
- `src/stores/propertyStore.ts` — adicionar syncFromRealtime, optimistic update pattern
- `src/features/dashboard/hooks/useProperties.ts` — ativar subscription on mount
- `src/features/add-property/hooks/useAddProperty.ts` — optimistic insert
- `src/features/property-detail/hooks/usePropertyDetail.ts` — optimistic update/delete

---

## Implementação — useRealtime

```typescript
// src/hooks/useRealtime.ts
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { usePropertyStore } from '@/stores/propertyStore'

export function useRealtimeProperties(boardId: string | null) {
  const { addProperty, updateProperty, removeProperty } = usePropertyStore()

  useEffect(() => {
    if (!boardId) return

    const channel = supabase
      .channel(`properties:${boardId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'properties',
        filter: `board_id=eq.${boardId}`
      }, (payload) => {
        addProperty(payload.new)
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'properties',
        filter: `board_id=eq.${boardId}`
      }, (payload) => {
        updateProperty(payload.new.id, payload.new)
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'properties',
        filter: `board_id=eq.${boardId}`
      }, (payload) => {
        removeProperty(payload.old.id)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [boardId])
}
```

## Optimistic Update Pattern

```typescript
// Em cada action do propertyStore:
updateStatus: async (id, status) => {
  // 1. Guardar estado anterior
  const prev = get().properties.find(p => p.id === id)
  
  // 2. Optimistic: atualizar UI imediatamente
  set(state => ({
    properties: state.properties.map(p =>
      p.id === id ? { ...p, status } : p
    )
  }))
  
  // 3. Enviar para Supabase
  const { error } = await supabase
    .from('properties')
    .update({ status })
    .eq('id', id)
  
  // 4. Rollback se falhar
  if (error) {
    set(state => ({
      properties: state.properties.map(p =>
        p.id === id ? { ...p, status: prev!.status } : p
      )
    }))
    toast.error('Erro ao atualizar status')
  }
}
```

## Evitar Loop

```
Problema: quando user A faz update → Supabase → Realtime manda de volta → user A re-processa
Solução: comparar payload.new com estado atual no store. Se igual, ignorar.
```

---

## Checklist

- [ ] Criar useRealtime hook com subscription por board_id
- [ ] Tratar eventos INSERT, UPDATE, DELETE
- [ ] Integrar no DashboardPage (ativar subscription on mount)
- [ ] Refatorar propertyStore para optimistic updates
- [ ] Implementar rollback pattern com toast de erro
- [ ] Desduplicar eventos (não re-processar se já aplicado)
- [ ] Cleanup: remover channel no unmount
- [ ] Verificar: abrir em 2 abas, adicionar imóvel → aparece na outra
- [ ] Verificar: mudar status em uma aba → reflete na outra
- [ ] Verificar: deletar em uma aba → some na outra
