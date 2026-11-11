---
name: frontend-component
description: Usar ao criar ou alterar telas/componentes React no frontend.
---

# Frontend component

Use esta skill ao criar ou alterar telas ou componentes React em `frontend/`.

## Passos
1. **Use TypeScript** e siga a estrutura/padrões existentes em `frontend/src/` (ex.: `main.tsx`, `App.tsx`, organização atual de componentes/páginas).
2. **Consuma a API via `VITE_API_URL`** (padrão `/api`, conforme `frontend/.env.example`); evite hardcode de URL/base path divergente do padrão do projeto.
3. **Valide ao final** no diretório `frontend/`: rode `npm run lint` e depois `npm run build`.

## Referências úteis
- Scripts/config: `frontend/package.json`, `frontend/vite.config.ts`, `frontend/.env.example`
- Código: `frontend/src/`
