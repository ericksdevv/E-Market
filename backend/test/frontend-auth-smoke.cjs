const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const apiUrl = process.env.SMOKE_API_URL || 'http://127.0.0.1:3000';
const webUrl = process.env.SMOKE_WEB_URL || 'http://127.0.0.1:3001';
const runId = String(Date.now());
const email = `auth-flow-${runId}@emarket.local`;
const password = 'Teste@123';
let userId;

function cpfFromSeed(seed) {
  const base = String(seed).replace(/\D/g, '').padStart(9, '1').slice(-9);
  const digit = (value, factor) => {
    let sum = 0;
    for (const char of value) sum += Number(char) * factor--;
    const result = 11 - (sum % 11);
    return result >= 10 ? 0 : result;
  };
  const first = digit(base, 10);
  return `${base}${first}${digit(`${base}${first}`, 11)}`;
}

async function main() {
  const registration = await fetch(`${apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Teste do fluxo de login',
      email,
      phone: `85${runId.slice(-9)}`,
      cpf: cpfFromSeed(runId),
      street: 'Rua de Teste',
      number: '100',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60000000',
      password,
    }),
  });
  const registrationBody = await registration.json();
  if (!registration.ok) {
    throw new Error(`Cadastro de teste falhou: ${JSON.stringify(registrationBody)}`);
  }
  userId = registrationBody.user.id;

  const form = new URLSearchParams({
    mode: 'login',
    identifier: email,
    password,
  });
  const login = await fetch(`${webUrl}/api/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: webUrl,
    },
    body: form,
    redirect: 'manual',
  });

  if (login.status !== 303) {
    throw new Error(`Login retornou status ${login.status}`);
  }
  const location = login.headers.get('location');
  if (!location || !location.includes('/login?sucesso=1')) {
    throw new Error(`Destino inesperado após login: ${location}`);
  }
  const setCookie = login.headers.get('set-cookie');
  if (!setCookie?.includes('emarket-session=') || !setCookie.includes('HttpOnly')) {
    throw new Error('O cookie seguro da sessão não foi criado');
  }

  const cookie = setCookie.split(';', 1)[0];
  const confirmation = await fetch(location, {
    headers: { Cookie: cookie },
    redirect: 'manual',
  });
  const confirmationHtml = await confirmation.text();
  if (!confirmation.ok || !confirmationHtml.includes('Login efetuado com sucesso')) {
    throw new Error('A confirmacao animada do login nao foi exibida');
  }

  const market = await fetch(`${webUrl}/mercado`, {
    headers: { Cookie: cookie },
    redirect: 'manual',
  });
  if (market.status !== 200) {
    throw new Error(`A entrada no mercado retornou status ${market.status}`);
  }

  const products = await fetch(`${webUrl}/api/backend/products`, {
    headers: { Cookie: cookie },
  });
  const productList = await products.json();
  if (!products.ok || !Array.isArray(productList) || productList.length === 0) {
    throw new Error('O catálogo não carregou através do frontend');
  }

  const darkMode = await fetch(`${webUrl}/api/backend/auth/settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
      Origin: webUrl,
    },
    body: JSON.stringify({ theme: 'dark' }),
  });
  if (!darkMode.ok) {
    throw new Error(`A ativação do tema escuro retornou status ${darkMode.status}`);
  }

  const account = await fetch(`${webUrl}/api/backend/auth/me`, {
    headers: { Cookie: cookie },
  });
  const accountBody = await account.json();
  if (!account.ok || accountBody.user?.theme !== 'dark') {
    throw new Error('O tema escuro não foi persistido na conta');
  }

  console.log(
    'Fluxo web validado: login, catálogo e tema escuro funcionam pelo frontend.',
  );
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (userId) await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });
