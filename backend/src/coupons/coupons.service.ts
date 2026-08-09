import { BadRequestException, Injectable } from '@nestjs/common';
import { CouponType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}
  async validate(code: string, subtotal: number) {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode || normalizedCode.length > 40) {
      throw new BadRequestException('Cupom inválido para esta compra');
    }
    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      throw new BadRequestException('Subtotal inválido');
    }
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });
    const now = new Date();
    if (
      !coupon ||
      !coupon.isActive ||
      (coupon.startsAt && coupon.startsAt > now) ||
      (coupon.expiresAt && coupon.expiresAt < now) ||
      (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) ||
      (coupon.minimumOrder &&
        new Prisma.Decimal(subtotal).lessThan(coupon.minimumOrder))
    )
      throw new BadRequestException('Cupom inválido para esta compra');
    const discount =
      coupon.type === CouponType.PERCENTAGE
        ? new Prisma.Decimal(subtotal).mul(coupon.value).div(100)
        : coupon.value;
    const limitedDiscount = discount.greaterThan(subtotal)
      ? new Prisma.Decimal(subtotal)
      : discount;
    return {
      code: coupon.code,
      discount: Number(limitedDiscount),
      type: coupon.type,
    };
  }
}
