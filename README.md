# E-Market

Plataforma full stack de supermercado online desenvolvida como projeto de portfólio. O E-Market reúne catálogo por departamentos, autenticação, carrinho, favoritos, endereços, checkout, pedidos, preferências do usuário e recursos administrativos em uma experiência responsiva com temas claro e escuro.

## Principais funcionalidades

- Cadastro com nome, e-mail, CPF, telefone e endereço
- Login por e-mail ou CPF, com transições animadas e sessão protegida
- Senhas com política de complexidade e hash bcrypt
- Autenticação JWT armazenada em cookie `HttpOnly`, com revogação no logout
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

As migrations também aplicam restrições de unicidade e consistência para CPF, telefone, carrinho, favoritos, estoque, preços, totais financeiros, quantidades e expiração de pedidos.

## Início rápido

Requisitos:

- Node.js 20 ou superior
- PostgreSQL
- npm

Com o PostgreSQL em execução e o arquivo `backend/.env` configurado, abra um
único terminal do PowerShell na pasta do projeto e execute:

```powershell
Set-Location "C:\Users\erick\Desktop\e-market"
npm run dev
```

No Windows, também é possível iniciar dando dois cliques no arquivo
`iniciar-emarket.cmd` localizado na raiz do projeto.

Esse único comando:

- instala as dependências caso ainda não existam;
- cria `frontend/.env.local` quando necessário;
- gera e salva um `JWT_SECRET` seguro quando o valor estiver ausente ou inválido;
- solicita a senha do PostgreSQL de forma oculta se a conexão ainda usar os
  valores de exemplo;
- gera o Prisma Client automaticamente quando necessário;
- inicia a API na porta `3000`;
- espera a API responder e inicia o site na porta `3001`.

Depois que aparecer **E-Market iniciado com sucesso**, acesse
[http://127.0.0.1:3001](http://127.0.0.1:3001). Para encerrar os dois
servidores, pressione `Ctrl+C` no mesmo terminal.

## Primeira configuração

O projeto já possui um banco configurado nesta máquina. Em uma instalação nova,
se `backend/.env` não existir, o inicializador cria uma cópia do arquivo de
exemplo e informa que é necessário preencher:

- `DATABASE_URL`: conexão com o PostgreSQL;
- `CORS_ORIGINS`: `http://localhost:3001,http://127.0.0.1:3001`.

O `JWT_SECRET` é gerado automaticamente e nunca é exibido no terminal. Caso ele
seja substituído, somente as sessões anteriores são encerradas; contas, pedidos
e demais registros do PostgreSQL não são alterados.

Quando a `DATABASE_URL` ainda contém `user:password`, o mesmo comando solicita
a senha do usuário `postgres`, valida o acesso ao banco `emarket` e salva a
configuração localmente. A senha digitada não aparece no terminal e o arquivo
`backend/.env` é ignorado pelo Git.

Durante a digitação são mostrados apenas asteriscos. Use `Backspace` para
corrigir. Informe a senha do servidor PostgreSQL definida na instalação, não a
senha da conta do site, do Windows ou a senha mestra do pgAdmin.

Execute o comando em um PowerShell normal ou no terminal integrado do VS Code.
Não use o painel **Saída**, a extensão Code Runner ou um terminal sem interação,
pois eles não permitem a digitação protegida da senha.

O token de recuperação só é exibido localmente quando
`PASSWORD_RESET_MODE="demo"`. Mantenha esse recurso desabilitado fora do
ambiente de desenvolvimento.

## Se não iniciar

O novo inicializador mostra exatamente qual etapa falhou. As causas mais comuns
são o PostgreSQL desligado, uma `DATABASE_URL` incorreta ou outro programa já
ocupando as portas `3000` ou `3001`. Para verificar as portas:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000,3001
```

O backend agora inicia sem o modo de observação que causava o erro
`taskkill: Acesso negado` no Windows. Alterações no backend exigem reiniciar o
comando; o frontend continua com atualização automática.

Migrations não são executadas durante a inicialização normal. Quando houver uma
nova migration no projeto, aplique-a separadamente com `npm run db:migrate` na
raiz. Os dados demonstrativos podem ser recriados, quando necessário, com
`npm run db:seed`.

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
