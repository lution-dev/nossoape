# 003 — Supabase Setup

**Módulo:** Backend / Dados
**Prioridade:** 🔴 Crítica
**Dependências:** 001

## Descrição

Criar projeto no Supabase, definir schema do banco (tabelas, FKs, enums), configurar Row Level Security (RLS) para isolamento por board, gerar types TypeScript, e configurar o cliente Supabase no frontend.

## Checklist

- [ ] Criar projeto no Supabase Dashboard
- [ ] Criar tabelas: `boards`, `users_profile`, `properties`, `ratings`, `visits`, `pro_cons`
- [ ] Definir enums: `property_status`, `property_type`, `modality`, `mood`
- [ ] Configurar Foreign Keys e constraints
- [ ] Criar políticas RLS: user só acessa dados do seu board
- [ ] Gerar types TypeScript a partir do schema
- [ ] Instalar `@supabase/supabase-js`
- [ ] Criar `src/lib/supabase.ts` com cliente configurado
- [ ] Criar `src/lib/types.ts` com types do database
- [ ] Configurar `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- [ ] Verificar: cliente conecta ao Supabase sem erros no console
