# 001 — Setup do Projeto

**Módulo:** Infraestrutura
**Prioridade:** 🔴 Crítica (bloqueia tudo)
**Dependências:** Nenhuma

## Descrição

Scaffolding completo do projeto: Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui.
Inclui path aliases (`@/`), PWA plugin, estrutura de pastas feature-based, fonts (Geist Sans / Inter), e `globals.css` com tokens do design system.

## Checklist

- [ ] Criar projeto Vite com template React + TypeScript
- [ ] Instalar e configurar Tailwind CSS v4
- [ ] Instalar e configurar shadcn/ui (modo dark default)
- [ ] Configurar path alias `@/` no vite.config e tsconfig
- [ ] Instalar vite-plugin-pwa e configurar manifest
- [ ] Instalar dependências: zustand, framer-motion, lucide-react, react-router
- [ ] Criar estrutura de pastas conforme ARCHITECTURE.md
- [ ] Configurar fonts (Geist Sans + Inter) no globals.css
- [ ] Aplicar tokens CSS do DESIGN.md no globals.css
- [ ] Criar `src/lib/utils.ts` com helper `cn()`
- [ ] Verificar: `npm run dev` funciona, tela preta com "Nosso Apê" em fonte Geist
