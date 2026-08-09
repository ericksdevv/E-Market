import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, StockMovementType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}
  async dashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [ordersToday, clients, products, lowStock, revenue] =
      await Promise.all([
        this.prisma.order.count({ where: { createdAt: { gte: today } } }),
        this.prisma.user.count({ where: { role: 'CLIENT' } }),
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.product.count({
          where: { isActive: true, stock: { lte: 10 } },
        }),
        this.prisma.order.aggregate({
          where: {
            createdAt: { gte: today },
            status: {
              in: [
                OrderStatus.PAID,
                OrderStatus.PREPARING,
                OrderStatus.OUT_FOR_DELIVERY,
                OrderStatus.DELIVERED,
              ],
            },
          },
          _sum: { total: true },
        }),
      ]);
    return {
      ordersToday,
      clients,
      products,
      lowStock,
      revenueToday: Number(revenue._sum.total ?? 0),
    };
  }
  orders() {
    return this.prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        payment: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async updateOrder(id: number, status: OrderStatus) {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      AWAITING_PAYMENT: [OrderStatus.PAID, OrderStatus.CANCELED],
      PAID: [OrderStatus.PREPARING, OrderStatus.CANCELED],
      PREPARING: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELED],
      OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
      DELIVERED: [],
      CANCELED: [],
      EXPIRED: [],
    };

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true, payment: true },
      });
      if (!order) throw new NotFoundException('Pedido não encontrado');
      if (!transitions[order.status].includes(status)) {
        throw new BadRequestException('Alteração de status não permitida');
      }
      if (
        status === OrderStatus.PAID &&
        (!order.expiresAt || order.expiresAt <= new Date())
      ) {
        throw new BadRequestException(
          'O prazo de pagamento deste pedido expirou',
        );
      }

      const claimed = await tx.order.updateMany({
        where: { id, status: order.status },
        data: { status },
      });
      if (claimed.count === 0) {
        throw new BadRequestException(
          'O pedido foi atualizado por outra operação',
        );
      }

      if (status === OrderStatus.PAID && order.payment) {
        await tx.payment.update({
          where: { orderId: id },
          data: { status: PaymentStatus.PAID, paidAt: new Date() },
        });
      }

      if (status === OrderStatus.CANCELED) {
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
              reason: `Cancelamento administrativo do pedido #${id}`,
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
            data: {
              status:
                order.payment.status === PaymentStatus.PAID
                  ? PaymentStatus.REFUNDED
                  : PaymentStatus.FAILED,
            },
          });
        }
      }

      return tx.order.findUnique({
        where: { id },
        include: { payment: true, items: true },
      });
    });
  }
  clients() {
    return this.prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async toggleClient(id: number, isActive: boolean) {
    const result = await this.prisma.user.updateMany({
      where: { id, role: 'CLIENT' },
      data: {
        isActive,
        ...(!isActive ? { sessionVersion: { increment: 1 } } : {}),
      },
    });
    if (result.count === 0)
      throw new NotFoundException('Cliente não encontrado');
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, isActive: true },
    });
  }
  async adjustStock(productId: number, quantity: number, reason?: string) {
    if (quantity === 0) {
      throw new BadRequestException('A quantidade do ajuste não pode ser zero');
    }
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.product.updateMany({
        where: {
          id: productId,
          ...(quantity < 0 ? { stock: { gte: Math.abs(quantity) } } : {}),
        },
        data: { stock: { increment: quantity } },
      });
      if (result.count === 0) {
        throw new BadRequestException('O ajuste deixaria o estoque negativo');
      }
      await tx.stockMovement.create({
        data: {
          productId,
          quantity: Math.abs(quantity),
          type: quantity >= 0 ? StockMovementType.IN : StockMovementType.OUT,
          reason: reason ?? 'Ajuste administrativo',
        },
      });
      return tx.product.findUnique({ where: { id: productId } });
    });
  }
  createProduct(data: CreateProductDto) {
    if (
      data.promotionalPrice !== undefined &&
      data.promotionalPrice >= data.price
    ) {
      throw new BadRequestException(
        'O preço promocional deve ser menor que o preço normal',
      );
    }
    return this.prisma.product.create({ data });
  }
  async updateProduct(id: number, data: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    const price = data.price ?? Number(product.price);
    const promotionalPrice =
      data.promotionalPrice ??
      (product.promotionalPrice === null
        ? undefined
        : Number(product.promotionalPrice));
    if (promotionalPrice !== undefined && promotionalPrice >= price) {
      throw new BadRequestException(
        'O preço promocional deve ser menor que o preço normal',
      );
    }
    return this.prisma.product.update({ where: { id }, data });
  }
}
