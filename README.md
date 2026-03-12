# futuro-promotora-log-sms

- **Backend**: Fastify em `src/server.ts` (build em `dist/server.js`).  
  - Dev: `npm run dev`  
  - Prod: `npm run build && npm start`  
  - Configuração: copie `.env.example` para `.env` e preencha a `MSGING_KEY`.

- **Frontend**: Next.js em `frontend/`.  
  - Instalação: `cd frontend && npm install` (ou `pnpm install`).  
  - Build estático (necessário para servir via backend): `cd frontend && npm run build` → gera `frontend/out`.  
  - Dev separado: `npm run dev` em `frontend` (API em `http://localhost:8000` por padrão).  
  - API: configure `NEXT_PUBLIC_API_URL` (ex.: `http://localhost:8000`) em `frontend/.env.local` ou use o exemplo em `frontend/.env.example`.

- Servir tudo em `http://localhost:8000`: após gerar o build do frontend, `npm start` na raiz sobe a API e entrega os arquivos estáticos de `frontend/out`.

- A API já está liberada para CORS, permitindo chamadas do frontend em outra porta caso rode separado.
