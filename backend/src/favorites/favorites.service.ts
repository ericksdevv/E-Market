import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async list(userId: number) {
    return this.prisma.favorite.findMany({
      where: { userId, product: { isActive: true } },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggle(userId: number, productId: number) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      throw new NotFoundException('Produto indisponível');
    }

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.prisma.favorite.create({ data: { userId, productId } });
    return { favorited: true };
  }
}
