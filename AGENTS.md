# AGENTS.md

## Visão geral
- Monorepo com `backend/` (Node.js + TypeScript + Express + Sequelize/MySQL), `frontend/` (React + TypeScript + Vite) e `nginx/` (proxy reverso). Orquestração principal via Docker Compose na raiz.
- Não há README raiz, CI, workspace root `package.json` nem scripts de teste configurados nos manifests; use os comandos de cada subprojeto.

## Comandos
- Docker (raiz): `docker compose up --build` sobe `db`, `backend`, `frontend` e `nginx`. `compose.override.yml` expõe o MySQL localmente em `127.0.0.1:3308->3306`.
- Backend (`backend/`): `npm run dev` (tsx watch em `src/server.ts`), `npm run build` (`tsc -p tsconfig.json`), `npm start` (`node dist/server.js`). Não há script `lint`/`test` no `package.json` (existem `oxlint.json`, `test/*.cjs` e `scripts/*.cjs`, mas não estão ligados a scripts npm).    
- Frontend (`frontend/`): `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run lint` (`eslint .`), `npm run preview`.

## Arquitetura e pontos de entrada
- Backend: entrada em `src/server.ts` (conecta ao banco com retry e sobe a API) e composição/wiring em `src/app.ts` (`criarApp` monta repositórios, serviços, controladores e rotas). Prefixo da API: `/api` (ex.: `/api/autenticacao`, `/api/usuarios`, `/api/cliente`, `/api/itens`, `/api/planos`, `/api/clientes`, `/api/eventos`).
- Backend serve arquivos estáticos de `process.cwd()/src/img` em `/img` (em execução via Docker, confirme o contexto/working dir do container se alterar paths).
- Frontend: app React/Vite padrão (`src/main.tsx`, `src/App.tsx`). `frontend/.env.example` define `VITE_API_URL=/api`.

## Infra, banco e variáveis de ambiente
- `.env`/`.env.example` da raiz (usados pelo Compose): `MYSQL_ROOT_PASSWORD`, `JWT_SECRET`. O Compose fixa `DB_DATABASE=signus`, `DB_USERNAME=root`, `DB_HOST=db`, `DB_PORT=3306` e define `PORT=3001` para o backend.
- `backend/.env.example` usa nomes diferentes e `PORT=3000`; para execução em container/nginx, o alvo real é a porta `3001` (ver `compose.yml` e `nginx/nginx.conf`).
- `compose.yml` inicializa o MySQL montando `./backend/database/BANCO-DE-DADOS-21-10.sql` em `/docker-entrypoint-initdb.d/init.sql` (só roda na criação inicial do volume `db_data`).
- `nginx/nginx.conf`: proxy de `/api/` e `/img/` para `backend:3001` e `/` para `frontend:5173` (porta 80 exposta).

## Convenções e cuidados
- Preserve o padrão de camadas do backend ao alterar código: `rotas` -> `controladores` -> `servicos` -> `repositorios`, com modelos/config em pastas dedicadas (ver `src/app.ts`).
- `backend/dist/` e `backend/node_modules/` existem no repositório local; evite editar artefatos gerados em `dist/` — altere `src/` e rode build quando necessário.
- Consulte `frontend/README.md` apenas como template padrão do Vite; para comportamento real do projeto, priorize `package.json`, configs e código-fonte.

## Guardrails e segurança
- **Nunca leia, exiba, copie ou resuma** o conteúdo de arquivos `.env` (raiz, `backend/`, `frontend/`). Use apenas os `.env.example` como referência.
- **Nunca exiba credenciais** (senhas, `JWT_SECRET`, tokens, chaves de API) em respostas, logs, commits ou código. Se encontrar alguma credencial exposta, avise o usuário em vez de repeti-la.
- **Não escreva credenciais no código**: use sempre variáveis de ambiente (`process.env.*` no backend, `import.meta.env.VITE_*` no frontend).
- **Não rode comandos destrutivos** sem pedido explícito do usuário, por exemplo: `rm -rf`, `docker compose down -v` (apaga o volume do banco), `docker volume rm`, `DROP`/`TRUNCATE` no MySQL, `git push --force`, `git reset --hard`.
- **Não faça commit nem push** sem o usuário pedir.
- **Não edite** `backend/dist/` nem `node_modules/`.
- Se uma permissão for negada pelo `opencode.json`, **não tente contornar** por outro caminho (outro comando, outro tool ou outro script). Informe o usuário.