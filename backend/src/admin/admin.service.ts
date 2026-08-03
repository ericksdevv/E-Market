import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma, StockMovementType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}
  async dashboard() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [ordersToday, clients, products, lowStock, revenue] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.user.count({ where: { role: 'CLIENT' } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { isActive: true, stock: { lte: 10 } } }),
      this.prisma.order.aggregate({ where: { createdAt: { gte: today }, status: { not: 'CANCELED' } }, _sum: { total: true } }),
    ]);
    return { ordersToday, clients, products, lowStock, revenueToday: Number(revenue._sum.total ?? 0) };
  }
  orders() { return this.prisma.order.findMany({ include: { user: { select: { id: true, name: true, email: true } }, payment: true, items: true }, orderBy: { createdAt: 'desc' } }); }
  updateOrder(id: number, status: OrderStatus) { return this.prisma.order.update({ where: { id }, data: { status }, include: { payment: true, items: true } }); }
  clients() { return this.prisma.user.findMany({ where: { role: 'CLIENT' }, select: { id: true, name: true, email: true, cpf: true, phone: true, isActive: true, createdAt: true, _count: { select: { orders: true } } }, orderBy: { createdAt: 'desc' } }); }
  toggleClient(id: number, isActive: boolean) { return this.prisma.user.update({ where: { id }, data: { isActive }, select: { id: true, name: true, isActive: true } }); }
  async adjustStock(productId: number, quantity: number, reason?: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({ where: { id: productId }, data: { stock: { increment: quantity } } });
      await tx.stockMovement.create({ data: { productId, quantity: Math.abs(quantity), type: quantity >= 0 ? StockMovementType.IN : StockMovementType.OUT, reason: reason ?? 'Ajuste administrativo' } });
      return updated;
    });
  }
  createProduct(data: Prisma.ProductUncheckedCreateInput) { return this.prisma.product.create({ data }); }
  updateProduct(id: number, data: Prisma.ProductUncheckedUpdateInput) { return this.prisma.product.update({ where: { id }, data }); }
}
