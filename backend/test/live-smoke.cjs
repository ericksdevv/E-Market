const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const baseUrl = process.env.SMOKE_API_URL || 'http://127.0.0.1:3000';
const runId = String(Date.now());
const email = `smoke-${runId}@emarket.local`;
const phone = `85${runId.slice(-9)}`;
const couponCode = `SMOKE${runId.slice(-8)}`;
const firstPassword = 'Teste@123';
const secondPassword = 'Nova@1234';
let userId;
let orderId;
let couponId;

function cpfFromSeed(seed) {
  const base = String(seed).replace(/\D/g, '').padStart(9, '1').slice(-9);
  const digit = (value, factor) => {
    let sum = 0;
    for (const char of value) sum += Number(char) * factor--;
    const result = 11 - (sum % 11);
    return result >= 10 ? 0 : result;
  };
  const first = digit(base, 10);
  const second = digit(`${base}${first}`, 11);
  return `${base}${first}${second}`;
}

async function request(path, options = {}, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path}: ${response.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  const registration = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Teste de Integração',
      email,
      phone,
      cpf: cpfFromSeed(runId),
      street: 'Rua de Teste',
      number: '100',
      neighborhood: 'Centro',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60000000',
      password: firstPassword,
    }),
  });
  userId = registration.user.id;
  let token = registration.access_token;

  const products = await request('/products', {}, token);
  if (!products.length) throw new Error('O catálogo está vazio');
  const product = products.find((item) => item.stock > 1);
  if (!product) throw new Error('Nenhum produto com estoque para o teste');
  const stockBefore = product.stock;

  await request('/auth/settings', {
    method: 'PATCH',
    body: JSON.stringify({ theme: 'dark', orderUpdates: false }),
  }, token);
  await request('/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify({ productId: product.id }),
  }, token);
  await request('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId: product.id, quantity: 2 }),
  }, token);

  const addresses = await request('/addresses', {}, token);
  couponId = (await prisma.coupon.create({
    data: {
      code: couponCode,
      type: 'PERCENTAGE',
      value: 10,
      maxUsage: 1,
      isActive: true,
    },
  })).id;
  await request(`/coupons/validate?code=${couponCode}&subtotal=${Number(product.price) * 2}`, {}, token);

  const order = await request('/orders', {
    method: 'POST',
    body: JSON.stringify({
      addressId: addresses[0].id,
      shippingMethod: 'DELIVERY',
      paymentMethod: 'PIX',
      couponCode,
    }),
  }, token);
  orderId = order.id;

  const productAfterOrder = await prisma.product.findUnique({ where: { id: product.id } });
  if (productAfterOrder.stock !== stockBefore - 2) throw new Error('A baixa de estoque falhou');
  await request(`/orders/${orderId}/payment/confirm-demo`, { method: 'PATCH' }, token);
  await request(`/orders/${orderId}/cancel`, { method: 'PATCH' }, token);
  const productAfterCancel = await prisma.product.findUnique({ where: { id: product.id } });
  if (productAfterCancel.stock !== stockBefore) throw new Error('A devolução de estoque falhou');
  const couponAfterCancel = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (couponAfterCancel.usedCount !== 0) throw new Error('A devolução do cupom falhou');
  const paymentAfterCancel = await prisma.payment.findUnique({ where: { orderId } });
  if (paymentAfterCancel.status !== 'REFUNDED') throw new Error('O estorno do pagamento falhou');

  const reset = await request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  if (!reset.resetToken) throw new Error('Token local de recuperação não retornado');
  await request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token: reset.resetToken, password: secondPassword }),
  });
  token = (await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: secondPassword }),
  })).access_token;
  await request('/auth/me', {}, token);

  console.log('Smoke test concluído: autenticação, catálogo, carrinho, favoritos, cupom, pagamento, cancelamento e recuperação validados.');
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (orderId) await prisma.order.deleteMany({ where: { id: orderId } });
    if (userId) await prisma.user.deleteMany({ where: { id: userId } });
    if (couponId) await prisma.coupon.deleteMany({ where: { id: couponId } });
    await prisma.$disconnect();
  });
