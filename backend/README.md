# Clinica Backend — Supabase

Backend em Node.js/Express preparado para usar Supabase (Postgres) como banco.
Contém autenticação (JWT + bcrypt) e CRUD para `usuarios`, `medicos` e `pacientes`.

## Como usar (local)

1. Copie `.env.example` para `.env` e preencha as variáveis:
```
PORT=3000
JWT_SECRET=uma_chave_secreta
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

2. Instale dependências:
```
npm install
```

3. Rode o servidor:
```
npm start
```

### Rotas principais
- `POST /api/auth/register` — criar usuário (admin can create)
- `POST /api/auth/login` — login (only admin and recepcionista allowed)
- `GET /api/usuarios` — listar usuários (admin only)
- `POST /api/usuarios` — criar usuário (admin)
- `DELETE /api/usuarios/:id` — deletar usuário (admin)
- `GET/POST/PUT/DELETE /api/medicos` — CRUD médicos (authenticated)
- `GET/POST/PUT/DELETE /api/pacientes` — CRUD pacientes (authenticated)

### Deploy
Recomendo Render or Railway for easy deployment of Express apps.
On Render: connect GitHub repo, set build command `npm install`, start command `npm start`, and add environment variables.

### Segurança
- **Não** compartilhe sua `SERVICE_ROLE_KEY`.
- Use a `SUPABASE_SERVICE_ROLE_KEY` apenas no backend.
