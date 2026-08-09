# E-Market

Plataforma full stack de supermercado online desenvolvida como projeto de portfólio. O E-Market reúne catálogo por departamentos, autenticação, carrinho, favoritos, endereços, checkout, pedidos, preferências do usuário e recursos administrativos em uma experiência responsiva com temas claro e escuro.

## Principais funcionalidades

- Cadastro com nome, e-mail, CPF, telefone e endereço
- Login por e-mail ou CPF, com transições animadas e sessão protegida
- Senhas com política de complexidade e hash bcrypt
- Autenticação JWT armazenada em cookie `HttpOnly`
- Catálogo integrado à API, busca, categorias, ofertas e detalhes dos produtos
- Carrinho e favoritos persistidos no PostgreSQL por usuário
- Gerenciamento de endereços e dados pessoais
- Cupons, checkout, criação de pedidos e controle de estoque
- Histórico, acompanhamento e cancelamento de pedidos
- Preferências e tema escuro persistidos na conta
- Painel administrativo para produtos, estoque, pedidos e clientes
- Recuperação segura de senha com token de uso único e expiração

## Tecnologias

### Frontend

- Next.js 16 com App Router e Turbopack
- React 19
- TypeScript
- CSS responsivo com design system próprio
- Camada BFF do Next.js para proteger o token e centralizar o consumo da API

### Backend

- NestJS 11
- Prisma ORM
- PostgreSQL
- JWT e bcrypt
- Class Validator
- Helmet, CORS restrito e limitação de requisições
- Jest para testes unitários e scripts de integração ponta a ponta

## Arquitetura

```text
e-market/
├── frontend/  interface, sessão HTTP-only e comunicação segura com a API
└── backend/   API REST, regras de negócio, Prisma e PostgreSQL
```

O navegador se comunica com as rotas internas do frontend. Essas rotas encaminham as operações autenticadas para o backend sem expor o JWT ao JavaScript do cliente.

## Banco de dados

O projeto utiliza PostgreSQL e migrations do Prisma. O modelo cobre usuários, endereços, produtos, categorias, carrinho, favoritos, cupons, pedidos, pagamentos, movimentações de estoque e tokens de recuperação de senha.

As migrations também aplicam restrições de unicidade e consistência para CPF, telefone, carrinho, favoritos, estoque e expiração de pedidos.

## Configuração

Requisitos:

- Node.js 20 ou superior
- PostgreSQL
- npm

Backend:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

Preencha `DATABASE_URL` e gere um `JWT_SECRET` aleatório com pelo menos 32 caracteres no arquivo `backend/.env`.

Frontend:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
```

## Execução local

Abra dois terminais no VS Code.

Terminal do backend:

```powershell
cd C:\Users\erick\Desktop\e-market\backend
npm run start:dev
```

Terminal do frontend:

```powershell
cd C:\Users\erick\Desktop\e-market\frontend
npm run dev -- --port 3001
```

Acesse [http://127.0.0.1:3001](http://127.0.0.1:3001). A API local responde em `http://127.0.0.1:3000`.

## Verificações

Backend:

```powershell
npm run lint
npm run build
npm test -- --runInBand
npm run test:smoke
npm run test:auth-flow
```

Frontend:

```powershell
npm run lint
npm run build
```

Os testes de integração criam registros temporários, validam autenticação, catálogo, tema, carrinho, favoritos, endereços, cupons, pedidos, pagamento demonstrativo e cancelamento, removendo os dados de teste ao final.

## Pagamentos

O pagamento atual é uma simulação destinada ao portfólio. Para cobranças reais, é necessário integrar um provedor, armazenar as credenciais somente no backend e confirmar o pagamento por webhooks assinados.
