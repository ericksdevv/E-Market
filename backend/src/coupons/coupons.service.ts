import { BadRequestException, Injectable } from '@nestjs/common';
import { CouponType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}
  async validate(code: string, subtotal: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
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
    return { code: coupon.code, discount: Number(discount), type: coupon.type };
  }
}
