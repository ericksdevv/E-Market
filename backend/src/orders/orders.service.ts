import {
  BadRequestException,
  Injectable,
  NotFoundException,
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
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}
  private include = { address: true, items: true, payment: true } as const;

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
    for (const item of cart.items)
      if (!item.product.isActive || item.product.stock < item.quantity)
        throw new BadRequestException(
          `Estoque insuficiente para ${item.product.name}`,
        );

    const subtotal = cart.items.reduce(
      (sum, item) => sum.add(item.unitPrice.mul(item.quantity)),
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
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              subtotal: item.unitPrice.mul(item.quantity),
            })),
          },
          payment: {
            create: {
              method: data.paymentMethod,
              status: PaymentStatus.PENDING,
              amount: total,
              provider: 'EMARKET',
              qrCode:
                data.paymentMethod === 'PIX'
                  ? `000201EMARKET${Date.now()}`
                  : null,
            },
          },
        },
        include: this.include,
      });
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: StockMovementType.OUT,
            quantity: item.quantity,
            reason: `Pedido #${order.id}`,
          },
        });
      }
      await tx.cart.update({
        where: { id: cart.id },
        data: { status: CartStatus.CONVERTED },
      });
      if (coupon)
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      return order;
    });
  }

  async cancel(userId: number, id: number) {
    const order = await this.detail(userId, id);
    if (
      order.status !== OrderStatus.AWAITING_PAYMENT &&
      order.status !== OrderStatus.PAID
    )
      throw new BadRequestException('Este pedido não pode mais ser cancelado');
    return this.prisma.$transaction(async (tx) => {
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
      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELED },
        include: this.include,
      });
    });
  }
}
