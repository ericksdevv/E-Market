import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}
  @Get() list(@Req() req: any) { return this.orders.list(req.user.sub); }
  @Get(':id') detail(@Req() req: any, @Param('id') id: string) { return this.orders.detail(req.user.sub, Number(id)); }
  @Post() create(@Req() req: any, @Body() body: CreateOrderDto) { return this.orders.create(req.user.sub, body); }
  @Patch(':id/cancel') cancel(@Req() req: any, @Param('id') id: string) { return this.orders.cancel(req.user.sub, Number(id)); }
}
