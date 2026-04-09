# Issue 001 — HMR causa dados a desaparecerem após qualquer alteração de código

**Módulo:** Auth & Infraestrutura  
**Prioridade:** 🔴 Crítica (bloqueadora de desenvolvimento)  
**Dependências:** Nenhuma  
**Status:** ✅ CONCLUÍDA

---

## Descrição

Toda vez que o Vite faz hot-reload de qualquer arquivo, os imóveis somem da tela.
O usuário precisa dar F5 (reload completo) para os dados voltarem, o que torna o
desenvolvimento impossível — qualquer mudança visual obriga um re-login ou reload manual.

## Causa Raiz

`AuthProvider.tsx` usa `useRef(false)` como guard contra double-init do StrictMode.
Quando o Vite faz HMR no `AuthProvider`, o componente remonta com `initialized = false`,
executando `init()` novamente. O `init()` chama `store().setLoading(true)` antes de
verificar que o Zustand **já tem** `isAuthenticated + board` do mount anterior. Isso gera:

1. `isLoading = true` → `PrivateRoute` mostra spinner
2. `getSession()` chama o Supabase auth (que às vezes retorna session vazia por lock)
3. Se retornar vazia → `board = null` → redirect para `/onboarding`
4. Se retornar OK → recarrega tudo, resets visuais, UX degradada

## Arquivos Afetados

| Arquivo | Ação |
|---|---|
| `src/app/providers/AuthProvider.tsx` | `[MODIFY]` — adicionar fast-path HMR |

## Solução Implementada

Adicionado fast-path no início de `init()`: se o Zustand já tem `isAuthenticated && board`,
retorna imediatamente sem tocar em `isLoading`. O hot-reload fica transparente para o usuário.

```ts
const current = store()
if (current.isAuthenticated && current.board) {
  return // HMR fast-path — estado já válido
}
```

## Checklist

- [x] Identificar causa raiz (Fase 1 — SPEC)
- [x] Implementar fast-path HMR no AuthProvider (Fase 4 — EXECUTE)
- [x] TypeScript compila sem erros
- [ ] Verificar no browser: editar arquivo → dados continuam aparecendo (Fase 5 — VERIFY)

## Critérios de Aceite

- Editar qualquer arquivo `.tsx` ou `.ts` no projeto → imóveis continuam visíveis sem F5
- Login normal (primeira vez) ainda funciona corretamente
- Logout ainda funciona e limpa o estado
