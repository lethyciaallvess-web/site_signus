---
name: backend-feature
description: Usar ao criar ou alterar um endpoint/funcionalidade no backend.
---

# Backend feature

Use esta skill ao criar ou alterar endpoints/funcionalidades em `backend/`.

## Passos
1. **Siga as camadas do backend**: `rotas` -> `controladores` -> `servicos` -> `repositorios` (com modelos/config em pastas dedicadas, conforme o padrão existente).
2. **Registre o wiring** da nova funcionalidade em `backend/src/app.ts` (instanciação e montagem de rota), mantendo o prefixo de API `/api`.
3. **Não edite artefatos gerados**: nunca altere `backend/dist/`; faça mudanças apenas em `backend/src/` (e arquivos de configuração/fonte relevantes).
4. **Valide o TypeScript ao final**: rode `npm run build` em `backend/`.

## Referências úteis
- Entradas/composição: `backend/src/server.ts`, `backend/src/app.ts`
- Scripts: `backend/package.json` (`dev`, `build`, `start`)
