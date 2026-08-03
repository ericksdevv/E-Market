import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}
  async list(filters: {
    category?: string;
    q?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    offer?: boolean;
  }) {
    const currentPrice = {
      gte: filters.minPrice ? Number(filters.minPrice) : undefined,
      lte: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    };
    const orderBy =
      filters.sort === 'price-asc'
        ? { price: 'asc' as const }
        : filters.sort === 'price-desc'
          ? { price: 'desc' as const }
          : filters.sort === 'name'
            ? { name: 'asc' as const }
            : { createdAt: 'desc' as const };
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(filters.category ? { category: { slug: filters.category } } : {}),
        ...(filters.q
          ? {
              OR: [
                { name: { contains: filters.q, mode: 'insensitive' as const } },
                {
                  brand: { contains: filters.q, mode: 'insensitive' as const },
                },
              ],
            }
          : {}),
        ...(filters.minPrice || filters.maxPrice
          ? { price: currentPrice }
          : {}),
        ...(filters.offer ? { promotionalPrice: { not: null } } : {}),
      },
      include: {
        category: true,
      },
      orderBy,
    });
  }
  categories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
  async bySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }
}
