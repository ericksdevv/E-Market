import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}
  private include = {
    items: {
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    },
  };
  async current(userId: number) {
    const existing = await this.prisma.cart.findFirst({
      where: { userId, status: CartStatus.ACTIVE },
      include: this.include,
    });
    if (existing) return existing;
    try {
      return await this.prisma.cart.create({
        data: { userId },
        include: this.include,
      });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== 'P2002'
      ) {
        throw error;
      }
      const cart = await this.prisma.cart.findFirst({
        where: { userId, status: CartStatus.ACTIVE },
        include: this.include,
      });
      if (!cart) throw new NotFoundException('Carrinho não encontrado');
      return cart;
    }
  }
  async add(userId: number, productId: number, quantity = 1) {
    if (quantity < 1) throw new BadRequestException('Quantidade inválida');
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });
    if (!product) throw new NotFoundException('Produto indisponível');
    const cart = await this.current(userId);
    const existing = cart.items.find((item) => item.productId === productId);
    if (product.stock < (existing?.quantity ?? 0) + quantity)
      throw new BadRequestException('Estoque insuficiente');
    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: {
        quantity: { increment: quantity },
        unitPrice: product.promotionalPrice ?? product.price,
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
        unitPrice: product.promotionalPrice ?? product.price,
      },
    });
    return this.current(userId);
  }
  async change(userId: number, productId: number, quantity: number) {
    const cart = await this.current(userId);
    if (quantity <= 0) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId },
      });
      return this.current(userId);
    }
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product?.isActive || product.stock < quantity)
      throw new BadRequestException('Estoque insuficiente');
    const result = await this.prisma.cartItem.updateMany({
      where: { cartId: cart.id, productId },
      data: { quantity },
    });
    if (result.count === 0) throw new NotFoundException('Item não encontrado');
    return this.current(userId);
  }
  async remove(userId: number, productId: number) {
    const cart = await this.current(userId);
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
    return this.current(userId);
  }
  async clear(userId: number) {
    const cart = await this.current(userId);
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    return this.current(userId);
  }
}
