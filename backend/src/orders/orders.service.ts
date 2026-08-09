import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  CartStatus,
  CouponType,
  OrderStatus,
  PaymentStatus,
  Prisma,
  StockMovementType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly prisma: PrismaService) {}
  private include = { address: true, items: true, payment: true } as const;
  private readonly logger = new Logger(OrdersService.name);
  private expirationTimer?: NodeJS.Timeout;

  onModuleInit() {
    this.expirationTimer = setInterval(() => {
      void this.expirePendingOrders().catch(() =>
        this.logger.warn('Falha ao processar pedidos expirados'),
      );
    }, 60_000);
    this.expirationTimer.unref();
    void this.expirePendingOrders().catch(() =>
      this.logger.warn('Falha ao processar pedidos expirados'),
    );
  }

  onModuleDestroy() {
    if (this.expirationTimer) clearInterval(this.expirationTimer);
  }

  list(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: this.include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async detail(userId: number, id: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: this.include,
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return order;
  }

  async create(userId: number, data: CreateOrderDto) {
    const [cart, address] = await Promise.all([
      this.prisma.cart.findFirst({
        where: { userId, status: CartStatus.ACTIVE },
        include: { items: { include: { product: true } } },
      }),
      this.prisma.address.findFirst({ where: { id: data.addressId, userId } }),
    ]);
    if (!cart?.items.length)
      throw new BadRequestException('Seu carrinho está vazio');
    if (!address) throw new BadRequestException('Endereço inválido');

    const pricedItems = cart.items.map((item) => ({
      ...item,
      checkoutPrice: item.product.promotionalPrice ?? item.product.price,
    }));
    const subtotal = pricedItems.reduce(
      (sum, item) => sum.add(item.checkoutPrice.mul(item.quantity)),
      new Prisma.Decimal(0),
    );
    const shippingFee =
      data.shippingMethod === 'PICKUP' || subtotal.greaterThanOrEqualTo(100)
        ? new Prisma.Decimal(0)
        : new Prisma.Decimal(7.9);
    let coupon: Prisma.CouponGetPayload<object> | null = null;
    let discount = new Prisma.Decimal(0);
    if (data.couponCode) {
      coupon = await this.prisma.coupon.findUnique({
        where: { code: data.couponCode.trim().toUpperCase() },
      });
      const now = new Date();
      if (
        !coupon ||
        !coupon.isActive ||
        (coupon.startsAt && coupon.startsAt > now) ||
        (coupon.expiresAt && coupon.expiresAt < now) ||
        (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) ||
        (coupon.minimumOrder && subtotal.lessThan(coupon.minimumOrder))
      )
        throw new BadRequestException('Cupom inválido para esta compra');
      discount =
        coupon.type === CouponType.PERCENTAGE
          ? subtotal.mul(coupon.value).div(100)
          : coupon.value;
      if (discount.greaterThan(subtotal)) discount = subtotal;
    }
    const total = subtotal.add(shippingFee).sub(discount);

    return this.prisma.$transaction(async (tx) => {
      const cartClaim = await tx.cart.updateMany({
        where: { id: cart.id, userId, status: CartStatus.ACTIVE },
        data: { status: CartStatus.CONVERTED },
      });
      if (cartClaim.count === 0) {
        throw new BadRequestException(
          'Este carrinho já foi finalizado. Atualize a página e tente novamente',
        );
      }

      for (const item of cart.items) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            isActive: true,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });
        if (stockUpdate.count === 0) {
          throw new BadRequestException(
            `Estoque insuficiente para ${item.product.name}`,
          );
        }
      }

      if (coupon) {
        const couponUpdate = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            isActive: true,
            ...(coupon.startsAt ? { startsAt: { lte: new Date() } } : {}),
            ...(coupon.expiresAt ? { expiresAt: { gte: new Date() } } : {}),
            ...(coupon.maxUsage ? { usedCount: { lt: coupon.maxUsage } } : {}),
          },
          data: { usedCount: { increment: 1 } },
        });
        if (couponUpdate.count === 0) {
          throw new BadRequestException('Cupom inválido para esta compra');
        }
      }

      const order = await tx.order.create({
        data: {
          userId,
          addressId: address.id,
          couponId: coupon?.id,
          subtotal,
          shippingFee,
          discount,
          total,
          shippingMethod: data.shippingMethod,
          notes: data.notes,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          items: {
            create: pricedItems.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              unitPrice: item.checkoutPrice,
              quantity: item.quantity,
              subtotal: item.checkoutPrice.mul(item.quantity),
            })),
          },
          payment: {
            create: {
              method: data.paymentMethod,
              status: PaymentStatus.PENDING,
              amount: total,
              provider: 'EMARKET_DEMO',
              qrCode:
                data.paymentMethod === 'PIX'
                  ? `DEMO-PIX-${Date.now()}-${userId}`
                  : null,
            },
          },
        },
        include: this.include,
      });
      for (const item of cart.items) {
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: StockMovementType.OUT,
            quantity: item.quantity,
            reason: `Pedido #${order.id}`,
          },
        });
      }
      return order;
    });
  }

  async confirmDemoPayment(userId: number, id: number) {
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.PAYMENT_MODE !== 'demo'
    ) {
      throw new BadRequestException('Pagamento de demonstração desativado');
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, userId },
        include: this.include,
      });
      if (!order) throw new NotFoundException('Pedido não encontrado');
      if (
        order.status !== OrderStatus.AWAITING_PAYMENT ||
        order.payment?.status !== PaymentStatus.PENDING
      ) {
        throw new BadRequestException('Este pagamento não está pendente');
      }
      const claim = await tx.order.updateMany({
        where: { id, userId, status: OrderStatus.AWAITING_PAYMENT },
        data: { status: OrderStatus.PAID },
      });
      if (claim.count === 0) {
        throw new BadRequestException('O pedido já foi atualizado');
      }
      await tx.payment.update({
        where: { orderId: id },
        data: { status: PaymentStatus.PAID, paidAt: new Date() },
      });
      return tx.order.findUnique({
        where: { id },
        include: this.include,
      });
    });
  }

  private async expirePendingOrders() {
    const expired = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.AWAITING_PAYMENT,
        expiresAt: { lte: new Date() },
      },
      select: { id: true },
      take: 100,
    });

    for (const { id } of expired) {
      await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id },
          include: { items: true, payment: true },
        });
        if (!order) return;
        const claim = await tx.order.updateMany({
          where: {
            id,
            status: OrderStatus.AWAITING_PAYMENT,
            expiresAt: { lte: new Date() },
          },
          data: { status: OrderStatus.EXPIRED },
        });
        if (claim.count === 0) return;

        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: StockMovementType.IN,
              quantity: item.quantity,
              reason: `Expiração do pedido #${id}`,
            },
          });
        }
        if (order.couponId) {
          await tx.coupon.updateMany({
            where: { id: order.couponId, usedCount: { gt: 0 } },
            data: { usedCount: { decrement: 1 } },
          });
        }
        if (order.payment) {
          await tx.payment.update({
            where: { orderId: id },
            data: { status: PaymentStatus.FAILED },
          });
        }
      });
    }
  }

  async cancel(userId: number, id: number) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, userId },
        include: this.include,
      });
      if (!order) throw new NotFoundException('Pedido não encontrado');
      if (
        order.status !== OrderStatus.AWAITING_PAYMENT &&
        order.status !== OrderStatus.PAID
      ) {
        throw new BadRequestException(
          'Este pedido não pode mais ser cancelado',
        );
      }

      const claim = await tx.order.updateMany({
        where: { id, userId, status: order.status },
        data: { status: OrderStatus.CANCELED },
      });
      if (claim.count === 0) {
        throw new BadRequestException('O pedido já foi atualizado');
      }

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: StockMovementType.IN,
            quantity: item.quantity,
            reason: `Cancelamento do pedido #${id}`,
          },
        });
      }
      if (order.couponId) {
        await tx.coupon.updateMany({
          where: {
            id: order.couponId,
            usedCount: { gt: 0 },
          },
          data: { usedCount: { decrement: 1 } },
        });
      }
      const payment = await tx.payment.findUnique({
        where: { orderId: order.id },
      });
      if (payment) {
        await tx.payment.update({
          where: { orderId: order.id },
          data:
            order.status === OrderStatus.PAID
              ? { status: PaymentStatus.REFUNDED }
              : { status: PaymentStatus.FAILED },
        });
      }
      return tx.order.findUnique({
        where: { id },
        include: this.include,
      });
    });
  }
}
