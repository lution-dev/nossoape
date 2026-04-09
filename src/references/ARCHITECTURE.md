# Nosso Apê — Arquitetura do Sistema

> **Documento de referência técnica.** Consultar antes de qualquer implementação.

---

## 1. Stack Tecnológica

| Camada | Tecnologia | Versão | Justificativa |
|---|---|---|---|
| **Framework** | React | 19+ | Ecossistema, performance, hooks |
| **Linguagem** | TypeScript | 5.x | Type safety, DX, refactoring seguro |
| **Build** | Vite | 6+ | HMR rápido, ESBuild, ecosystem |
| **Routing** | React Router | 7+ | Standard da indústria, nested routes |
| **UI Components** | shadcn/ui | latest | Radix primitives, Tailwind-based, acessível |
| **CSS** | Tailwind CSS | v4 | Utilitário, padrão do shadcn, fast iteration |
| **Estado Global** | Zustand | 5+ | Leve (2kb), simples, sem boilerplate |
| **Auth & Database** | Supabase | latest | Auth social, PostgreSQL, Realtime, Edge Functions |
| **Ícones** | Lucide React | latest | Padrão do shadcn, 1000+ ícones, tree-shakeable |
| **Animações** | Framer Motion | 12+ | Layout animations, gestures, exit animations |
| **PWA** | vite-plugin-pwa | latest | Service worker, manifest, offline |
| **Deploy** | Vercel | — | Free tier, Edge, Supabase integration |
| **Fontes** | Geist Sans + Inter | — | Estética Vercel, fallback system-ui |

---

## 2. Estrutura de Pastas

```
src/
├── app/                        # App root (providers, router, layout)
│   ├── App.tsx                 # Root component
│   ├── Router.tsx              # Route definitions
│   └── providers/              # Context providers (auth, theme, etc)
│       ├── AuthProvider.tsx
│       ├── SupabaseProvider.tsx
│       └── ThemeProvider.tsx
│
├── components/                 # Componentes compartilhados
│   ├── ui/                     # shadcn/ui components (Button, Card, Input, etc)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── separator.tsx
│   │   └── ...
│   ├── layout/                 # Layout components
│   │   ├── BottomNav.tsx       # Mobile bottom navigation
│   │   ├── Sidebar.tsx         # Desktop sidebar
│   │   ├── Header.tsx          # Top header bar
│   │   └── AppShell.tsx        # Layout wrapper (responsive)
│   └── shared/                 # Componentes de negócio reutilizáveis
│       ├── PropertyCard.tsx    # Card do imóvel (lista + kanban)
│       ├── RatingStars.tsx     # Componente de rating com estrelas
│       ├── MatchBadge.tsx      # Badge de match/divergência
│       ├── StatusBadge.tsx     # Badge de status do imóvel
│       └── EmptyState.tsx      # Estado vazio com ilustração
│
├── features/                   # Feature modules (domain-driven)
│   ├── auth/                   # Autenticação
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── OnboardingPage.tsx
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── InviteCodeInput.tsx
│   │   └── hooks/
│   │       └── useAuth.ts
│   │
│   ├── dashboard/              # Tela Home (lista/kanban de imóveis)
│   │   ├── pages/
│   │   │   └── DashboardPage.tsx
│   │   ├── components/
│   │   │   ├── StatusTabs.tsx      # Tabs swipáveis (mobile)
│   │   │   ├── PropertyList.tsx    # Lista vertical de cards
│   │   │   ├── KanbanBoard.tsx     # Kanban (desktop only)
│   │   │   ├── KanbanColumn.tsx
│   │   │   └── SwipeableCard.tsx   # Card com swipe gestures
│   │   └── hooks/
│   │       └── useProperties.ts
│   │
│   ├── add-property/           # Tela de adicionar imóvel
│   │   ├── pages/
│   │   │   └── AddPropertyPage.tsx
│   │   ├── components/
│   │   │   ├── LinkInput.tsx       # Campo de input do link
│   │   │   ├── PropertyPreview.tsx # Preview com dados extraídos
│   │   │   └── ManualForm.tsx      # Formulário manual
│   │   └── hooks/
│   │       └── useLinkExtractor.ts
│   │
│   ├── property-detail/        # Tela de detalhe do imóvel
│   │   ├── pages/
│   │   │   └── PropertyDetailPage.tsx
│   │   ├── components/
│   │   │   ├── PropertyHeader.tsx
│   │   │   ├── RatingSection.tsx   # Avaliação individual + match
│   │   │   ├── ProsConsSection.tsx
│   │   │   ├── VisitSection.tsx
│   │   │   └── StatusActions.tsx
│   │   └── hooks/
│   │       └── usePropertyDetail.ts
│   │
│   ├── search/                 # Busca e filtros
│   │   ├── pages/
│   │   │   └── SearchPage.tsx
│   │   ├── components/
│   │   │   └── FilterPanel.tsx
│   │   └── hooks/
│   │       └── useFilters.ts
│   │
│   └── profile/                # Perfil e configurações
│       ├── pages/
│       │   └── ProfilePage.tsx
│       ├── components/
│       │   ├── InviteSection.tsx
│       │   └── ThemeToggle.tsx
│       └── hooks/
│           └── useBoard.ts
│
├── lib/                        # Utilitários e configurações
│   ├── supabase.ts             # Cliente Supabase configurado
│   ├── utils.ts                # cn() helper e utilidades gerais
│   ├── constants.ts            # Constantes do app (status, tipos, etc)
│   └── types.ts                # Types globais + database types
│
├── hooks/                      # Hooks globais
│   ├── useSupabase.ts          # Hook do cliente Supabase
│   ├── useRealtime.ts          # Hook de subscriptions Realtime
│   └── useMediaQuery.ts        # Hook de responsive breakpoints
│
├── stores/                     # Zustand stores
│   ├── propertyStore.ts        # Estado dos imóveis (com optimistic updates)
│   ├── authStore.ts            # Estado de autenticação
│   └── uiStore.ts              # Estado de UI (tema, sidebar, modals)
│
├── references/                 # Documentos de referência (este arquivo)
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   └── BUSINESS_RULES.md
│
├── styles/                     # Estilos globais
│   └── globals.css             # Tailwind imports + CSS variables + font imports
│
├── index.html
└── main.tsx                    # Entry point
```

---

## 3. Convenções de Código

### 3.1. Naming

| Tipo | Padrão | Exemplo |
|---|---|---|
| **Componentes** | PascalCase | `PropertyCard.tsx`, `MatchBadge.tsx` |
| **Hooks** | camelCase com `use` prefix | `useAuth.ts`, `useProperties.ts` |
| **Stores** | camelCase com `Store` suffix | `propertyStore.ts` |
| **Utilitários** | camelCase | `utils.ts`, `constants.ts` |
| **Tipos/Interfaces** | PascalCase | `Property`, `Visit`, `Rating` |
| **CSS variables** | kebab-case com `--` prefix | `--background`, `--card`, `--accent` |
| **Pastas de feature** | kebab-case | `add-property/`, `property-detail/` |
| **Páginas** | PascalCase com `Page` suffix | `DashboardPage.tsx` |

### 3.2. Padrões de Componente

```tsx
// Padrão: function component com TypeScript
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

export function PropertyCard({ 
  property, 
  onSwipeLeft, 
  onSwipeRight,
  className 
}: PropertyCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {/* ... */}
    </div>
  )
}
```

### 3.3. Imports

```tsx
// Ordem de imports (enforced by convention):
// 1. React
import { useState, useEffect } from 'react'

// 2. Libs externas
import { motion } from 'framer-motion'

// 3. Components internos (path alias @/)
import { Button } from '@/components/ui/button'
import { PropertyCard } from '@/components/shared/PropertyCard'

// 4. Hooks
import { useProperties } from '../hooks/useProperties'

// 5. Stores
import { usePropertyStore } from '@/stores/propertyStore'

// 6. Types
import type { Property } from '@/lib/types'

// 7. Utils / constants
import { cn } from '@/lib/utils'
```

### 3.4. Path Aliases

```json
// vite.config.ts e tsconfig.json
{
  "@/*": ["./src/*"]
}
```

---

## 4. Padrões de Estado

### 4.1. Zustand Store Pattern

```tsx
import { create } from 'zustand'

interface PropertyState {
  properties: Property[]
  isLoading: boolean
  // Actions
  addProperty: (property: Property) => void
  updateStatus: (id: string, status: PropertyStatus) => void
  removeProperty: (id: string) => void
}

export const usePropertyStore = create<PropertyState>((set) => ({
  properties: [],
  isLoading: true,
  
  addProperty: (property) =>
    set((state) => ({ 
      properties: [...state.properties, property] 
    })),
    
  updateStatus: (id, status) =>
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === id ? { ...p, status } : p
      ),
    })),
    
  removeProperty: (id) =>
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
    })),
}))
```

### 4.2. Optimistic Updates

```
[User action] → [Update Zustand store immediately] → [Send to Supabase] → [On error, rollback]
```

Todas as ações devem parecer instantâneas. O sync com Supabase acontece em background.

---

## 5. Supabase Integration

### 5.1. Client Setup

```tsx
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### 5.2. Environment Variables

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

### 5.3. Row Level Security (RLS)

Todas as tabelas usam RLS. Políticas baseadas no `board_id`:
- Usuário só vê/edita dados do seu board
- Board é compartilhado entre os 2 membros do casal

### 5.4. Realtime Subscriptions

```tsx
// Padrão de subscription
useEffect(() => {
  const channel = supabase
    .channel('properties')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'properties',
      filter: `board_id=eq.${boardId}`
    }, (payload) => {
      // Update Zustand store
    })
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [boardId])
```

---

## 6. Routing

```tsx
// src/app/Router.tsx
const routes = [
  // Public
  { path: '/login',       component: LoginPage },
  { path: '/onboarding',  component: OnboardingPage },
  
  // Protected (require auth)
  { path: '/',            component: DashboardPage },
  { path: '/add',         component: AddPropertyPage },
  { path: '/property/:id', component: PropertyDetailPage },
  { path: '/search',      component: SearchPage },
  { path: '/profile',     component: ProfilePage },
]
```

---

## 7. Responsive Strategy

| Breakpoint | Classe Tailwind | Layout |
|---|---|---|
| **< 768px** | `default` | Mobile: bottom nav, lista vertical, tabs, swipe gestures |
| **768-1024px** | `md:` | Tablet: bottom nav, grid 2 colunas |
| **> 1024px** | `lg:` | Desktop: sidebar, kanban horizontal |

**Regra:** Escrever CSS mobile-first. Breakpoints só para expandir, nunca para restringir.

---

## 8. PWA Configuration

```tsx
// vite.config.ts — vite-plugin-pwa
{
  registerType: 'autoUpdate',
  manifest: {
    name: 'Nosso Apê',
    short_name: 'NossoApê',
    description: 'Encontre o lar perfeito juntos',
    theme_color: '#000000',
    background_color: '#000000',
    display: 'standalone',
    icons: [/* ... */]
  }
}
```

---

## 9. Edge Functions (Link Extraction)

```
supabase/functions/extract-link/index.ts
```

Função Deno que:
1. Recebe URL via POST
2. Faz fetch da URL
3. Parseia HTML com RegExp (sem DOM parser no edge)
4. Extrai: `og:title`, `og:image`, `og:description`, preço, endereço
5. Retorna JSON com dados extraídos

---

## 10. Regras Invioláveis

1. **TypeScript strict mode** — sem `any`, sem `@ts-ignore`
2. **shadcn/ui components** — nunca criar componente custom se shadcn tem equivalente
3. **Tailwind classes** — via `className`, nunca `style={{}}` inline
4. **`cn()` helper** — sempre usar para merge de classes condicionais
5. **Feature isolation** — cada feature na sua pasta, sem imports cruzados entre features
6. **Mobile first** — todo CSS parte do mobile, breakpoints expandem
7. **Dark mode default** — o app abre em dark, light mode é secondary
8. **Optimistic updates** — toda ação reflete instantaneamente na UI
