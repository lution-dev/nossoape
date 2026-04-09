# 004 — Auth: Login + Onboarding

**Módulo:** Auth
**Prioridade:** 🔴 Crítica
**Dependências:** 002, 003

## Descrição

Tela de login com Google OAuth e Email/Senha usando Supabase Auth. AuthProvider com proteção de rotas (redirect para login se não autenticado). Tela de onboarding pós-login (criar board ou entrar com código de convite). Zustand auth store.

## Checklist

- [ ] Criar `AuthProvider.tsx` com context de sessão Supabase
- [ ] Criar `authStore.ts` (Zustand) com estado do user + board
- [ ] Criar `LoginPage.tsx` — estética shadcn, botão Google + form email/senha
- [ ] Configurar Google OAuth no Supabase Dashboard
- [ ] Implementar proteção de rotas (PrivateRoute wrapper)
- [ ] Criar `OnboardingPage.tsx` — duas opções: "Criar board" ou "Entrar com código"
- [ ] Lógica de criação de `users_profile` pós-login (trigger ou frontend)
- [ ] Verificar: login funciona, redirect para onboarding, sessão persistida
