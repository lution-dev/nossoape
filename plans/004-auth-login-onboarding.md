# Plan 004 — Auth: Login + Onboarding

**Issue:** [004-auth-login-onboarding.md](../issues/004-auth-login-onboarding.md)
**Módulo:** Auth
**Referências:** BUSINESS_RULES.md (seção 6), DESIGN.md (seção 1), ARCHITECTURE.md (seção 5)

---

## Descrição

Implementar login (Google OAuth + Email/Senha), AuthProvider para estado de sessão, proteção de rotas, e tela de onboarding pós-login onde o user cria um board ou entra com código de convite.

---

## Arquivos

### [NEW]
- `src/app/providers/AuthProvider.tsx` — context com sessão Supabase, loading, user
- `src/app/providers/SupabaseProvider.tsx` — provider do cliente Supabase
- `src/stores/authStore.ts` — Zustand store: user, board, isAuthenticated, isLoading
- `src/features/auth/pages/LoginPage.tsx` — tela de login estilo shadcn
- `src/features/auth/pages/OnboardingPage.tsx` — criar board ou entrar com código
- `src/features/auth/components/LoginForm.tsx` — form email + senha
- `src/features/auth/components/GoogleButton.tsx` — botão "Continuar com Google"
- `src/features/auth/hooks/useAuth.ts` — hook com login, logout, signUp

### [MODIFY]
- `src/app/App.tsx` — envolver com AuthProvider + SupabaseProvider
- `src/app/Router.tsx` — adicionar PrivateRoute wrapper, redirect para /login

---

## Design — Tela de Login

```
Background: bg-background (#000)
Layout: centralizado vertical e horizontal
Logo: "Nosso Apê" (text-2xl font-semibold) + subtítulo "por Lumi" (text-muted-foreground)

[Botão Google] — variant outline, w-full, ícone Google à esquerda
[Separador] — "ou" com linhas
[Input email] — shadcn Input
[Input senha] — shadcn Input type=password
[Botão Entrar] — variant default (branco), w-full
[Link "Criar conta"] — text-sm text-muted-foreground underline
```

## Design — Tela de Onboarding

```
Título: "Bem-vindo(a)! 🏠" (text-2xl)
Subtítulo: "Vamos começar a busca pelo apê ideal" (text-muted-foreground)

Card 1: "Criar novo board"
  - Descrição: "Comece e convide seu par"
  - Input: display_name
  - Botão: "Criar board"

Card 2: "Entrar com código"
  - Descrição: "Seu par já criou? Cole o código aqui"
  - Input: código de 6 chars (uppercase, auto-format)
  - Botão: "Entrar no board"
```

---

## Fluxo de Auth

```
1. App inicia → AuthProvider verifica sessão Supabase
2. Se NÃO autenticado → redirect /login
3. Se autenticado MAS sem board_id → redirect /onboarding
4. Se autenticado E com board_id → renderiza app normal (/)
5. Login com Google → Supabase OAuth → callback → check profile
6. Login com Email → Supabase signInWithPassword
7. SignUp com Email → Supabase signUp → auto-login → onboarding
```

---

## Checklist

- [ ] Criar AuthProvider com onAuthStateChange do Supabase
- [ ] Criar authStore (Zustand): user, profile, board, isLoading
- [ ] Criar hook useAuth com: login, loginWithGoogle, signUp, logout
- [ ] Criar LoginPage com estética shadcn dark
- [ ] Implementar login com Google OAuth
- [ ] Implementar login/signup com Email+Senha
- [ ] Criar PrivateRoute: se !auth → /login, se !board → /onboarding
- [ ] Criar OnboardingPage com opções de criar board ou entrar com código
- [ ] Criar lógica de insert users_profile pós-login (via hook)
- [ ] Verificar: login funciona, redirect correto, sessão persistida
