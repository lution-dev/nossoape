# Plan 005 — Board do Casal

**Issue:** [005-board-casal.md](../issues/005-board-casal.md)
**Módulo:** Auth / Board
**Referências:** BUSINESS_RULES.md (seções 2.2, 6)

---

## Descrição

Lógica de criação do board com invite code, vinculação do segundo membro, e tela de perfil com exibição/cópia do código. A maior parte da lógica de board é usada no OnboardingPage (issue 004), mas este plan foca na gestão pós-criação.

---

## Arquivos

### [NEW]
- `src/features/profile/pages/ProfilePage.tsx` — tela completa (substitui placeholder)
- `src/features/profile/components/InviteSection.tsx` — card com código + botão copiar
- `src/features/profile/components/BoardInfo.tsx` — nome do board, membros
- `src/features/profile/components/UserInfo.tsx` — avatar, nome, email
- `src/features/profile/hooks/useBoard.ts` — hook: getBoard, regenerateCode, getMembers
- `src/lib/invite-code.ts` — função de geração de código

### [MODIFY]
- `src/features/auth/pages/OnboardingPage.tsx` — integrar lógica real de board (create + join)

---

## Lógica do Invite Code

```typescript
// src/lib/invite-code.ts
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sem I,O,0,1 (ambíguos)
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}
```

## Fluxo de Criação

```
1. User escolhe "Criar board" no onboarding
2. Input: display_name (obrigatório)
3. Frontend gera invite code via generateInviteCode()
4. Insert board: { name: "Nosso Apê", invite_code, owner_id }
5. Update users_profile: { display_name, board_id }
6. Exibe tela de sucesso com código grande para compartilhar
```

## Fluxo de Join

```
1. User escolhe "Entrar com código" no onboarding
2. Input: display_name + invite code (6 chars)
3. Query board pelo invite_code
4. Validar: board existe? tem < 2 membros?
5. Update users_profile: { display_name, board_id }
6. Redirect para dashboard
```

---

## Design — ProfilePage

```
Header: fixed, "Perfil" centralizado
Sections:
  1. UserInfo: avatar (grande), display_name, email
  2. BoardInfo: "Nosso Apê", qtd membros, membro 2 (nome + avatar)
  3. InviteSection: Card com código grande (font-mono, text-2xl, tracking-widest)
     - Botão "Copiar código" → clipboard API + toast "Código copiado!"
     - Texto: "Compartilhe com seu par para conectar ao board"
  4. LogoutButton: variant destructive ghost, bottom
```

---

## Checklist

- [ ] Criar `generateInviteCode()` sem chars ambíguos
- [ ] Implementar criação do board no onboarding (insert board + update profile)
- [ ] Implementar join via código (query board + validar membros + update profile)
- [ ] Criar ProfilePage com UserInfo, BoardInfo, InviteSection
- [ ] Botão copiar código com clipboard API + toast
- [ ] Exibir info do parceiro (nome + avatar) quando board tem 2 membros
- [ ] Botão de logout
- [ ] Verificar: criar board, copiar código, outro user entra com código
