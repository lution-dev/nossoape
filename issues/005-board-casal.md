# 005 — Board do Casal

**Módulo:** Auth / Board
**Prioridade:** 🔴 Crítica
**Dependências:** 004

## Descrição

Lógica completa de criação do board, geração do invite code (6 chars alfanumérico), vinculação do segundo membro via código 
de convite, e tela de perfil com exibição/cópia do código. Validação de max 2 membros por board.

## Checklist

- [ ] Função de geração de invite code (6 chars, uppercase, alfanumérico)
- [ ] Lógica de criação do board (insert board + update user profile)
- [ ] Lógica de join via invite code (validar código, checar max 2 membros, vincular)
- [ ] Tela de perfil com seção de invite code (exibir + botão copiar)
- [ ] Feedback: toast de sucesso ao copiar código
- [ ] Feedback: toast de erro se código inválido ou board cheio
- [ ] Verificar: dois users podem se vincular ao mesmo board via código
