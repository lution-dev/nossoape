# Plan 001 — Setup do Projeto

**Issue:** [001-setup-projeto.md](../issues/001-setup-projeto.md)
**Módulo:** Infraestrutura
**Referências:** ARCHITECTURE.md, DESIGN.md

---

## Descrição

Scaffolding completo do projeto Nosso Apê usando o CLI do shadcn/ui que gera automaticamente um projeto Vite + React + TypeScript + Tailwind CSS v4 já configurado. Após o scaffold, instalar dependências adicionais, configurar PWA, aplicar tema dark e tokens do design system, e criar a estrutura de pastas feature-based.

---

## Arquivos

### [NEW] Gerados pelo `shadcn init -t vite`
- `package.json` — dependências base
- `vite.config.ts` — Vite config com Tailwind plugin + path alias `@/`
- `tsconfig.json` + `tsconfig.app.json` — TS config com paths
- `index.html` — entry HTML
- `src/main.tsx` — entry React
- `src/App.tsx` — root component
- `src/index.css` — Tailwind imports + CSS variables (tokens shadcn)
- `src/lib/utils.ts` — helper `cn()` (clsx + tailwind-merge)
- `src/components/ui/` — componentes shadcn base

### [NEW] Criados manualmente pós-scaffold
- `src/styles/globals.css` — override do index.css com nossos tokens custom (status, match, accent gold)
- `src/app/App.tsx` — mover App para pasta `app/`
- `src/lib/constants.ts` — constantes do app (status labels, tipos, etc)
- `src/lib/types.ts` — placeholder para database types

### [MODIFY] Pós-scaffold
- `index.html` — adicionar meta tags, title "Nosso Apê", font preload (Geist + Inter)
- `vite.config.ts` — adicionar vite-plugin-pwa
- `src/index.css` — ajustar tokens para nosso tema dark custom (accent gold, status colors, match system)
- `package.json` — adicionar dependências extras

### Estrutura de pastas criada (vazias com .gitkeep ou placeholder):
```
src/
├── app/                    # App root
├── components/
│   ├── ui/                 # shadcn (já existe)
│   ├── layout/             # BottomNav, Header, AppShell (issue 002)
│   └── shared/             # PropertyCard, etc (issue 008)
├── features/
│   ├── auth/               # (issue 004)
│   ├── dashboard/          # (issue 008)
│   ├── add-property/       # (issue 006)
│   ├── property-detail/    # (issue 009)
│   ├── search/             # (futuro)
│   └── profile/            # (issue 005)
├── hooks/                  # Hooks globais
├── stores/                 # Zustand stores
├── lib/                    # Utilitários (já existe)
├── styles/                 # Estilos extras
└── references/             # Docs (já existe)
```

---

## Dependências a instalar pós-scaffold

### Runtime
```
zustand                    # Estado global
framer-motion              # Animações e gestos
react-router               # Routing
@supabase/supabase-js      # Supabase client (prep pra issue 003)
lucide-react               # Ícones (shadcn já instala, verificar)
```

### Dev
```
vite-plugin-pwa            # PWA support
@types/node                # Path alias (shadcn já instala, verificar)
```

---

## Tokens CSS Custom (além do shadcn default)

Adicionados ao `:root` do `index.css`:

```css
/* Status colors */
--status-new: 217 91% 60%;
--status-interest: 37 90% 55%;
--status-scheduled: 142 71% 45%;
--status-visited: 271 76% 53%;
--status-discarded: 240 4% 46%;
--status-favorite: 51 100% 50%;

/* Match system */
--match: 51 100% 50%;
--match-rose: 330 50% 77%;
--divergence: 0 84% 60%;

/* Accent override (gold em vez de default shadcn) */
--accent: 37 90% 55%;
--accent-foreground: 0 0% 4%;
```

---

## PWA manifest

```json
{
  "name": "Nosso Apê",
  "short_name": "NossoApê",
  "description": "Encontre o lar perfeito juntos",
  "theme_color": "#000000",
  "background_color": "#000000",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## Cenários

### Happy path
1. `npx shadcn@latest init -t vite` gera o projeto
2. Instalar deps adicionais
3. Configurar tokens customizados
4. `npm run dev` → tela preta com "Nosso Apê" em Geist Sans

### Edge cases
- Se shadcn CLI falha, fazer setup manual (create-vite + tailwind + shadcn init)
- Se Geist font não carrega, Inter como fallback
- Se vite-plugin-pwa não detecta service worker em dev, ok (só funciona em build)

---

## Checklist de Execução

- [ ] 1. Rodar `npx shadcn@latest init -t vite` no diretório do projeto
- [ ] 2. Verificar que scaffold gerou: vite.config.ts, tsconfig, src/index.css, src/lib/utils.ts
- [ ] 3. Instalar dependências extras: zustand, framer-motion, react-router, @supabase/supabase-js
- [ ] 4. Instalar vite-plugin-pwa como dev dep
- [ ] 5. Configurar PWA no vite.config.ts
- [ ] 6. Editar index.html: title, meta tags, font preload
- [ ] 7. Editar src/index.css: adicionar tokens custom (status, match, accent gold, fonts)
- [ ] 8. Criar estrutura de pastas feature-based (com placeholders)
- [ ] 9. Criar src/lib/constants.ts e src/lib/types.ts
- [ ] 10. Editar src/App.tsx: exibir "Nosso Apê" centralizado em dark mode
- [ ] 11. Rodar `npm run dev` e verificar: tela dark, texto "Nosso Apê", font correta
- [ ] 12. Rodar `npm run build` e verificar: build sem erros
