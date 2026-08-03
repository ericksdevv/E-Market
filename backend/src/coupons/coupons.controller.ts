import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CouponsService } from './coupons.service';

@UseGuards(JwtAuthGuard)
@Controller('coupons')
export class CouponsController {
  constructor(private readonly coupons: CouponsService) {}
  @Get('validate') validate(
    @Query('code') code = '',
    @Query('subtotal') subtotal = '0',
  ) {
    return this.coupons.validate(code, Number(subtotal));
  }
}
