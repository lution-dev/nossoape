# BACKLOG.md — Lumi Imóveis
> Tasks ativas. Quando concluída, mova para archive/changelog.md.

## Tasks Ativas

#### T-AD-01: Fix onboarding redirect para usuários existentes
**Arquivo:** src/app/providers/AuthProvider.tsx, src/features/auth/pages/OnboardingPage.tsx
**Critérios:**
- [x] AuthProvider.loadProfile faz retry 1x se RLS falhar
- [x] OnboardingPage.handleSetName redireciona para / se profile já tem board_id
- [x] Safety check usa import estático de supabase
**Status:** ✅ Concluído

#### T-AD-02: Fix "Erro ao salvar nome" no onboarding
**Arquivo:** src/features/auth/hooks/useAuth.ts
**Critérios:**
- [x] createProfile faz SELECT primeiro → INSERT ou UPDATE (sem upsert)
- [x] Funciona para perfis novos (INSERT)
- [x] Funciona para perfis existentes (UPDATE)
- [x] RLS-safe
**Status:** ✅ Concluído
