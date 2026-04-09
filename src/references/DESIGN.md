# Nosso Apê — Design System

> **Documento de referência visual.** Todas as decisões de UI devem estar alinhadas com este documento.
> **Inspiração:** Vercel Dashboard + shadcn/ui

---

## 1. Referência Visual

A UI do Nosso Apê segue a estética **Vercel + shadcn/ui**:

- **Minimalista** — cada pixel tem propósito
- **Dark-first** — preto puro como base
- **Clean** — espaçamento generoso, tipografia limpa
- **Premium** — sensação de produto de alto nível
- **Funcional** — beleza a serviço da usabilidade

### 1.1. O que define a estética Vercel/shadcn

| Elemento | Padrão |
|---|---|
| Background | Preto puro `#000` ou `#0A0A0A` |
| Superfícies | `#111` a `#171717` com borda 1px translúcida |
| Bordas | `1px solid rgba(255,255,255,0.08)` — sutis, nunca pesadas |
| Cantos | `8px` (0.5rem) — médio, nunca muito arredondado |
| Tipografia | Geist Sans / Inter — pesos 400/500/600 |
| Texto primário | `#FAFAFA` (branco quase puro) |
| Texto secundário | `#A1A1AA` (zinc-400) |
| Texto muted | `#71717A` (zinc-500) |
| Botão primário | Fundo branco `#FAFAFA`, texto preto — **contraste invertido** |
| Botão secundário | Outline, borda fina, hover sutil |
| Inputs | Fundo `#0A0A0A`, borda `rgba(255,255,255,0.15)`, focus ring sutil |
| Sombras | Quase inexistentes — profundidade via bordas e backgrounds |
| Animações | 150-200ms, `ease-out`, nunca bouncy |
| Ícones | Lucide Icons, traço 1.5-2px |

### 1.2. Anti-patterns (NÃO fazer)

- ❌ Gradients coloridos no background
- ❌ Box-shadow pesado
- ❌ Cores saturadas como accent dominante
- ❌ Border-radius > 12px
- ❌ Fontes decorativas/display
- ❌ Animações longas (> 300ms) ou bouncy
- ❌ Backgrounds coloridos sólidos em cards
- ❌ Ícones com fill sólido (usar outline/stroke)

---

## 2. Design Tokens

### 2.1. Cores — CSS Variables (padrão shadcn HSL)

```css
:root {
  /* ══════════════════════════════════════════
     BASE — Dark Mode (DEFAULT)
     ══════════════════════════════════════════ */
  
  --background: 0 0% 0%;                /* #000000 */
  --foreground: 0 0% 98%;               /* #FAFAFA */
  
  /* Cards e superfícies */
  --card: 0 0% 7%;                      /* #111111 */
  --card-foreground: 0 0% 98%;
  --card-hover: 0 0% 9%;                /* #171717 */
  
  /* Popover / Dropdown */
  --popover: 0 0% 7%;
  --popover-foreground: 0 0% 98%;
  
  /* Primário — Botão branco (Vercel pattern) */
  --primary: 0 0% 98%;                  /* #FAFAFA */
  --primary-foreground: 0 0% 4%;        /* #0A0A0A */
  
  /* Secundário */
  --secondary: 0 0% 15%;                /* #262626 */
  --secondary-foreground: 0 0% 98%;
  
  /* Muted */
  --muted: 240 4% 16%;                  /* #27272A */
  --muted-foreground: 240 5% 65%;       /* #A1A1AA */
  
  /* Accent (gold — com moderação) */
  --accent: 37 90% 55%;                 /* ~#F5A623 */
  --accent-foreground: 0 0% 4%;
  
  /* Destructive */
  --destructive: 0 62% 30%;
  --destructive-foreground: 0 0% 98%;
  
  /* Bordas e Inputs */
  --border: 0 0% 15%;                   /* #262626 */
  --input: 0 0% 15%;
  --ring: 0 0% 98%;                     /* Focus ring */
  
  /* Radius */
  --radius: 0.5rem;                     /* 8px */
  
  /* ══════════════════════════════════════════
     STATUS COLORS
     ══════════════════════════════════════════ */
  
  --status-new: 217 91% 60%;            /* #4A9EFF — Azul */
  --status-interest: 37 90% 55%;        /* #F5A623 — Âmbar */
  --status-scheduled: 142 71% 45%;      /* #34C759 — Verde */
  --status-visited: 271 76% 53%;        /* #AF52DE — Roxo */
  --status-discarded: 240 4% 46%;       /* #71717A — Cinza */
  --status-favorite: 51 100% 50%;       /* #FFD700 — Dourado */
  
  /* ══════════════════════════════════════════
     MATCH SYSTEM
     ══════════════════════════════════════════ */
  
  --match: 51 100% 50%;                 /* Gold glow */
  --match-rose: 330 50% 77%;            /* #E8A0BF — Rose */
  --divergence: 0 84% 60%;              /* Vermelho sutil */
}
```

### 2.2. Light Mode (futuro — Fase 3)

```css
.light {
  --background: 0 0% 100%;              /* #FFFFFF */
  --foreground: 0 0% 4%;                /* #0A0A0A */
  --card: 0 0% 98%;                     /* #FAFAFA */
  --card-foreground: 0 0% 4%;
  --border: 0 0% 90%;                   /* #E5E5E5 */
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 46%;
  --primary: 0 0% 9%;                   /* Botão preto */
  --primary-foreground: 0 0% 98%;
  /* ... demais tokens invertidos */
}
```

---

## 3. Tipografia

### 3.1. Font Stack

```css
--font-sans: 'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
--font-mono: 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;
```

### 3.2. Escala Tipográfica

| Uso | Classe Tailwind | Size | Weight | Line-height |
|---|---|---|---|---|
| **Display** (hero) | `text-3xl` | 30px | 700 | 1.2 |
| **H1** (page title) | `text-2xl` | 24px | 600 | 1.3 |
| **H2** (section title) | `text-xl` | 20px | 600 | 1.4 |
| **H3** (card title) | `text-lg` | 18px | 500 | 1.4 |
| **Body** | `text-sm` | 14px | 400 | 1.5 |
| **Small** | `text-xs` | 12px | 400 | 1.5 |
| **Caption** | `text-[11px]` | 11px | 500 | 1.4 |

> **Nota:** No mobile, `text-sm` (14px) é o tamanho base de body. Não usar `text-base` (16px) como body no mobile para aproveitar espaço.

---

## 4. Espaçamento

### 4.1. Escala Base

O sistema usa a escala de 4px do Tailwind:

| Token | Valor | Uso |
|---|---|---|
| `space-1` | 4px | Gap mínimo entre ícone e texto |
| `space-2` | 8px | Padding interno de badges |
| `space-3` | 12px | Gap entre elementos inline |
| `space-4` | 16px | Padding de cards, gap de listas |
| `space-6` | 24px | Padding de seções |
| `space-8` | 32px | Margin entre seções |
| `space-12` | 48px | Margin entre blocos grandes |

### 4.2. Regras de Espaçamento

- **Cards**: `p-4` (16px) interno
- **Seções**: `py-6` (24px) vertical entre seções
- **Lista de cards**: `gap-3` (12px) entre cards
- **Bottom nav height**: `h-16` (64px) — safe area aware
- **Header height**: `h-14` (56px)
- **Page padding**: `px-4` (16px) no mobile, `px-6` no desktop

---

## 5. Componentes Base (shadcn/ui)

### 5.1. Componentes Necessários

| Componente | Uso no App |
|---|---|
| **Button** | CTAs, ações, status changes |
| **Card** | Property cards, seções de detalhe |
| **Input** | Link input, busca, formulários |
| **Badge** | Status, match, modalidade |
| **Dialog** | Modais de confirmação, agendamento |
| **Dropdown Menu** | Menu contextual (long press), ações |
| **Tabs** | Status tabs no dashboard |
| **Separator** | Divisores entre seções |
| **Avatar** | Foto do usuário no perfil |
| **Skeleton** | Loading states |
| **Toast** | Notificações inline (sucesso, erro) |
| **Sheet** | Bottom sheets (mobile-first modals) |
| **Select** | Tipo de imóvel, modalidade |
| **Switch** | Toggle de tema |

### 5.2. Componentes Custom (do app)

| Componente | Descrição | Composição |
|---|---|---|
| **PropertyCard** | Card do imóvel na lista/kanban | Card + Badge + Image |
| **SwipeableCard** | PropertyCard com swipe gestures | Framer Motion + PropertyCard |
| **RatingStars** | Input/display de estrelas 1-5 | Custom (Lucide Star icons) |
| **MatchBadge** | Badge de match/divergência | Badge + ícone |
| **StatusBadge** | Badge colorido por status | Badge com cores do status |
| **BottomNav** | Navigation bar mobile | Custom (tabs fixos) |
| **FAB** | Floating action button | Button + Framer Motion |
| **PropertyPreview** | Preview pós-extração de link | Card + Skeleton + form |
| **MoodSelector** | Seletor de humor pós-visita | Custom (emojis) |
| **InviteCode** | Exibição/input de código de convite | Card + Input + Button |

---

## 6. Padrões de Interação

### 6.1. Mobile Gestures

| Gesto | Ação | Feedback |
|---|---|---|
| **Tap** | Abrir detalhe do imóvel | Ripple + transição de página |
| **Swipe direita** | Marcar interesse ⭐ | Background verde + ícone star |
| **Swipe esquerda** | Descartar ❌ | Background vermelho + ícone X |
| **Long press** | Menu contextual | Haptic + dropdown menu |
| **Swipe horizontal tabs** | Mudar tab de status | Tab indicator segue o dedo |
| **Pull to refresh** | Resync com Supabase | Spinner no topo |

### 6.2. Transições

```css
/* Padrão: 150ms ease-out para tudo */
transition: all 150ms ease-out;

/* Hover states */
transition: background-color 150ms ease;

/* Page transitions (Framer Motion) */
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
exit: { opacity: 0, y: -10 }
transition: { duration: 0.2 }
```

### 6.3. Loading States

- **Skeleton** para conteúdo que está carregando
- **Spinner inline** para ações (nunca fullscreen)
- **Optimistic UI** — ação reflete antes do server confirmar
- **Toast** para confirmação de ações assíncronas

---

## 7. Anatomia dos Componentes Principais

### 7.1. Property Card (Mobile)

```
┌─ Card (bg-card, border, rounded-lg) ─────────────────┐
│                                                        │
│  ┌── Image (aspect-video, rounded-t-lg) ──────────┐   │
│  │  [Foto do imóvel — 16:9]                        │   │
│  │                                    [Badge: 🏷️] │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  ┌── Content (p-4) ──────────────────────────────────┐ │
│  │  Title (text-sm font-medium)                      │ │
│  │  Price • Modalidade (text-xs text-muted)          │ │
│  │  📍 Bairro • Area (text-xs text-muted)            │ │
│  │                                                    │ │
│  │  ┌── Rating Row (flex justify-between) ──────────┐│ │
│  │  │  ⭐ Lucas: 4  |  ⭐ Mí: 5   💕 Match!      ││ │
│  │  └────────────────────────────────────────────────┘│ │
│  └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 7.2. Bottom Navigation

```
┌── BottomNav (fixed bottom-0, bg-background, border-t) ───┐
│                                                            │
│  [🏠]        [➕]         [🔍]        [👤]               │
│  Home      Adicionar     Buscar      Perfil              │
│  text-xs    DESTAQUE      text-xs    text-xs              │
│                                                            │
│  ── safe-area-inset-bottom padding ──                     │
└────────────────────────────────────────────────────────────┘
```

### 7.3. Status Tabs (Dashboard Mobile)

```
┌── Tabs (overflow-x-auto, no-scrollbar) ──────────────────┐
│                                                            │
│  [Todos] [Interesse] [Agendado] [Visitado] [Favorito] [Desc..]  │
│   ^^^^                                                     │
│   active: border-b-2 border-foreground font-medium        │
│   inactive: text-muted-foreground                         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 8. Regras de Imagem

1. **Aspect ratio**: `16:9` para fotos de imóvel em cards
2. **Object fit**: `object-cover` sempre
3. **Placeholder**: skeleton com gradiente sutil enquanto carrega
4. **Fallback**: ícone de casa (Lucide `Home`) centralizado em bg-muted se sem foto
5. **Border radius**: arredondado apenas no topo do card (`rounded-t-lg`)

---

## 9. Acessibilidade

1. **Contraste mínimo**: 4.5:1 para texto, 3:1 para elementos interativos
2. **Focus visible**: ring de 2px com offset, usando `--ring` token
3. **ARIA labels**: em todos os ícones interativos e badges
4. **Keyboard navigation**: Tab order lógico, Enter/Space para ações
5. **Touch targets**: mínimo 44x44px em mobile

---

## 10. Regras de Implementação

1. **Dark mode é default** — o app abre em dark. Light mode é futuro (Fase 3)
2. **shadcn/ui primeiro** — nunca criar componente custom se shadcn tem equivalente
3. **Tailwind classes via `className`** — nunca `style={{}}` inline
4. **`cn()` helper** — sempre usar para merge de classes condicionais
5. **Lucide icons** — nunca emoji como ícone funcional (emojis ok para mood/humor)
6. **Tokens via CSS variables** — nunca hardcode de cores
7. **Mobile viewport** — testar com Chrome DevTools device toolbar (iPhone 14 Pro)
8. **Safe area insets** — considerar notch/barra no padding do bottom nav
