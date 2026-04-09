# 002 — Design System Base

**Módulo:** UI / Layout
**Prioridade:** 🔴 Crítica
**Dependências:** 001

## Descrição

Instalar componentes shadcn/ui necessários pro MVP e criar componentes de layout (AppShell com BottomNav para mobile e Header). Configurar router com telas placeholder para cada rota.

## Checklist

- [ ] Instalar componentes shadcn: Button, Card, Input, Badge, Dialog, Tabs, Sheet, Separator, Skeleton, Toast, Select, Avatar
- [ ] Criar `AppShell.tsx` — layout wrapper responsivo (mobile: bottom nav, desktop: sidebar)
- [ ] Criar `BottomNav.tsx` — 4 tabs (Home, Adicionar, Buscar, Perfil) com ícones Lucide
- [ ] Criar `Header.tsx` — header top bar com nome do app e avatar
- [ ] Configurar React Router com rotas: `/`, `/add`, `/search`, `/profile`, `/property/:id`, `/login`
- [ ] Criar páginas placeholder para cada rota
- [ ] Verificar: navegação entre tabs funciona, layout responsivo, dark mode aplicado
