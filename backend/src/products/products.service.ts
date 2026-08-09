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
    const query = filters.q?.trim().slice(0, 120);
    const minPrice = filters.minPrice ? Number(filters.minPrice) : undefined;
    const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : undefined;
    const validMin =
      Number.isFinite(minPrice) && minPrice! >= 0 ? minPrice : undefined;
    const validMax =
      Number.isFinite(maxPrice) && maxPrice! >= 0 ? maxPrice : undefined;
    const currentPrice = {
      gte: validMin,
      lte: validMax,
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
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' as const } },
                {
                  brand: { contains: query, mode: 'insensitive' as const },
                },
              ],
            }
          : {}),
        ...(validMin !== undefined || validMax !== undefined
          ? { price: currentPrice }
          : {}),
        ...(filters.offer ? { promotionalPrice: { not: null } } : {}),
      },
      include: {
        category: true,
      },
      orderBy,
      take: 100,
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
      include: { category: true, images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!product?.isActive)
      throw new NotFoundException('Produto não encontrado');
    return product;
  }
}
