# Plan 002 — Design System Base

**Issue:** [002-design-system-base.md](../issues/002-design-system-base.md)
**Módulo:** UI / Layout
**Referências:** DESIGN.md (seções 5, 6, 7), ARCHITECTURE.md (seção 2)

---

## Descrição

Instalar componentes shadcn/ui do MVP, criar componentes de layout mobile-first (AppShell, BottomNav, Header) e configurar React Router com páginas placeholder. O resultado é um app navegável com bottom nav funcional.

---

## Arquivos

### [NEW] Componentes de layout
- `src/components/layout/AppShell.tsx` — wrapper responsivo (bottom nav mobile, sidebar desktop futuro)
- `src/components/layout/BottomNav.tsx` — 4 tabs fixos: Home, Adicionar, Buscar, Perfil
- `src/components/layout/Header.tsx` — top bar com "Nosso Apê" + avatar placeholder

### [NEW] Páginas placeholder
- `src/features/dashboard/pages/DashboardPage.tsx` — "Home" placeholder
- `src/features/add-property/pages/AddPropertyPage.tsx` — "Adicionar" placeholder
- `src/features/search/pages/SearchPage.tsx` — "Buscar" placeholder
- `src/features/profile/pages/ProfilePage.tsx` — "Perfil" placeholder
- `src/features/property-detail/pages/PropertyDetailPage.tsx` — placeholder
- `src/features/auth/pages/LoginPage.tsx` — placeholder

### [NEW] Router
- `src/app/Router.tsx` — definição de rotas com React Router

### [MODIFY]
- `src/app/App.tsx` — importar Router + AppShell

### shadcn components instalados via CLI
```
button card input badge dialog tabs sheet separator skeleton avatar select label
```
Nota: shadcn usa `sonner` para toasts (não `toast`).
```
sonner
```

---

## Design — Especificações do BottomNav

```
Height: h-16 (64px)
Position: fixed bottom-0
Background: bg-background (preto)
Border-top: border-t border-border
Safe area: pb-[env(safe-area-inset-bottom)]

Tab item:
  - Ícone Lucide (24px): Home, Plus, Search, User
  - Label: text-[11px] font-medium
  - Inactive: text-muted-foreground
  - Active: text-foreground (branco)
  - O tab "Adicionar" (Plus) tem destaque visual (ícone maior ou bg accent)
```

## Design — Especificações do Header

```
Height: h-14 (56px)
Position: sticky top-0
Background: bg-background/80 backdrop-blur-sm
Border-bottom: border-b border-border
Content: "Nosso Apê" (text-lg font-semibold) à esquerda, Avatar à direita
```

---

## Checklist

- [ ] Instalar componentes shadcn: button, card, input, badge, dialog, tabs, sheet, separator, skeleton, avatar, select, label, sonner
- [ ] Criar `BottomNav.tsx` com 4 tabs (Home, Plus, Search, User) usando Lucide icons
- [ ] Criar `Header.tsx` com título "Nosso Apê" + avatar placeholder
- [ ] Criar `AppShell.tsx` wrapping Header + children + BottomNav
- [ ] Criar `Router.tsx` com rotas: /, /add, /search, /profile, /property/:id, /login
- [ ] Criar páginas placeholder para cada rota (título da página centralizado)
- [ ] Integrar Router + AppShell no App.tsx
- [ ] Verificar: bottom nav navega entre 4 telas, estilo shadcn dark mode
