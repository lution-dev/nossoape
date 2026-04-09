# Plan 001 — HMR causa dados a desaparecerem (Lumi Imóveis)

## Descrição

Após qualquer hot-reload do Vite (HMR), os imóveis somem da tela.
O usuário precisa de F5 para recuperar os dados. Bloqueia todo o desenvolvimento iterativo.

## Módulo Afetado

- **Auth & Infraestrutura** — sem módulo M1-M4 direto; afeta todos os módulos indiretamente
- Funcionalidade: inicialização de sessão (`AuthProvider`) + carregamento de dados (`propertyStore`)

---

## Arquivos

### [MODIFY] `src/app/providers/AuthProvider.tsx`

**O que muda:**  
Adicionado fast-path no início de `init()`. Antes de qualquer operação, verifica se o
Zustand já tem `isAuthenticated && board`. Se sim, retorna imediatamente — o estado
já é válido e não precisa de getSession() nem de setLoading(true).

**Por que não mexer em mais nada:**  
O `propertyStore.fetchProperties()` já é robusto — o problema não está nele, está no
`AuthProvider` resetando `isLoading` desnecessariamente no HMR.

---

## Dados / State

| Store | Campo | Comportamento antes | Comportamento depois |
|---|---|---|---|
| `authStore` | `isLoading` | Vai para `true` em todo re-mount | Permanece `false` se já autenticado |
| `authStore` | `board` | Pode ser zerado por getSession vazio | Preservado no HMR |
| `propertyStore` | `properties` | Re-fetched (às vezes vazio) | Preservado no HMR |

---

## Cenários

### Happy path — HMR normal
1. Dev edita `drawer.tsx` → Vite faz HMR
2. `AuthProvider` remonta → `initialized.current = false`
3. `init()` roda → verifica `store().isAuthenticated && store().board` → ambos true
4. Retorna imediatamente — nada muda na UI
5. ✅ Imóveis continuam visíveis

### Happy path — Primeiro login
1. Usuário abre o app pela primeira vez (ou após logout)
2. `store().isAuthenticated = false` → fast-path não ativa
3. `getSession()` roda normalmente → carrega perfil e board
4. `isLoading = false` → `PrivateRoute` renderiza o app
5. ✅ Login funciona igual a antes

### Edge case — HMR com sessão expirada
1. Token JWT expirado enquanto o dev está trabalhando
2. `store().isAuthenticated = true` mas `getSession()` retornaria vazio
3. Fast-path ativa → **não detecta a expiração**
4. `fetchProperties()` falha silenciosamente (Supabase retorna 401)
5. ⚠️ Mitigação aceitável: edge case raro em dev, o usuário pode dar F5 manualmente

### Edge case — Logout após HMR
1. Usuário clica "sair" → `SIGNED_OUT` dispara no `onAuthStateChange`
2. Store é resetado: `setUser(null)`, `setBoard(null)`
3. `PrivateRoute` redireciona para `/login`
4. ✅ Funciona normalmente — o fast-path só afeta `init()`, não o listener

---

## Design / UX

Sem mudanças visuais. O comportamento esperado pelo usuário é:
- **Antes:** editar arquivo → spinner → sumem os imóveis
- **Depois:** editar arquivo → nada muda visualmente

---

## Checklist de Implementação

- [x] Grep: confirmar que `useAuthStore.getState` retorna o estado atual (linha 17)
- [x] Verificar que o fast-path não interfere com o `onAuthStateChange` (linhas 87-112)
- [x] Garantir que `SIGNED_OUT` ainda limpa o estado (linha 104-110)
- [x] TypeScript sem erros: `npx tsc --noEmit` → 0 erros
- [ ] **VERIFY:** editar arquivo qualquer → imóveis permanecem visíveis

## Verificação Final (Fase 5)

```bash
# Rodar no terminal do projeto
npm run dev
# Abrir http://localhost:5174, logar, ver imóveis
# Editar src/index.css (ex: mudar uma cor)
# Confirmar: imóveis ainda aparecem SEM F5
```
