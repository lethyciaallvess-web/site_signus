---
name: docker-infra
description: Usar ao mexer em compose.yml, Dockerfile, nginx.conf ou variáveis de ambiente.
---

# Docker / Infra

Use esta skill ao alterar orquestração Docker, imagens, proxy ou configuração de ambiente.

## Regras e contexto
1. **Portas e proxy**: o backend roda na porta `3001`. O Nginx faz proxy de `/api/` e `/img/` para `backend:3001` e de `/` para `frontend:5173` (ver `compose.yml` e `nginx/nginx.conf`).
2. **Banco e inicialização**: o MySQL é inicializado montando `./backend/database/banco-de-dados.sql` em `/docker-entrypoint-initdb.d/init.sql`; esse script **só roda na criação inicial do volume `db_data`**.
3. **Variáveis de ambiente sensíveis**: **NUNCA leia ou exiba arquivos `.env`**. Consulte/atualize apenas arquivos `*.env.example` quando precisar documentar variáveis.

## Ao finalizar
- Revise consistência entre `compose.yml`, `compose.override.yml`, `nginx/nginx.conf`, Dockerfiles e `*.env.example` afetados.
- Se aplicável, valide com `docker compose config` e/ou `docker compose up --build` (raiz), respeitando a restrição sobre `.env`.
