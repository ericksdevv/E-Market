# E-Market

Aplicação de e-commerce para supermercado, desenvolvida como projeto de portfólio. O sistema reúne uma vitrine de produtos, autenticação de clientes, carrinho de compras e uma API conectada ao PostgreSQL.

## Tecnologias

- Front-end: Next.js, React, TypeScript e Tailwind CSS
- Back-end: NestJS, Prisma ORM e TypeScript
- Banco de dados: PostgreSQL
- Autenticação: JWT e bcrypt

## Estrutura

```
e-market/
├── frontend/  # Aplicação web
└── backend/   # API e acesso ao banco de dados
```

## Execução local

Em dois terminais:

```bash
cd frontend
npm run dev -- --port 3001
```

```bash
cd backend
npm run start:dev
```

Depois, acesse `http://127.0.0.1:3001`.

## Variáveis de ambiente

Crie `backend/.env` a partir de `backend/.env.example` e configure `DATABASE_URL` e `JWT_SECRET`.
