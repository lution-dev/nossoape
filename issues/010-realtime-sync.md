# 010 — Supabase Realtime Sync

**Módulo:** Infraestrutura / Sync
**Prioridade:** 🟡 Alta
**Dependências:** 008

## Descrição

Configurar Realtime subscriptions no Supabase para a tabela `properties` filtrado por `board_id`. Quando um membro adiciona, edita ou move um imóvel, o outro vê a mudança em tempo real sem refresh. Optimistic updates no Zustand com rollback em caso de erro.

## Checklist

- [ ] Criar `useRealtime.ts` — hook genérico de subscription Realtime
- [ ] Subscribir na tabela `properties` com filtro `board_id`
- [ ] Tratar eventos: INSERT (novo card), UPDATE (status/edição), DELETE (remoção)
- [ ] Atualizar Zustand store quando receber evento do Realtime
- [ ] Implementar optimistic updates: ação reflete na UI antes do server confirmar
- [ ] Implementar rollback: se o update falha no Supabase, reverte o estado local + toast de erro
- [ ] Evitar loop: não re-processar evento que o próprio user disparou
- [ ] Verificar: abrir app em 2 dispositivos/abas, adicionar imóvel em um → aparece no outro
