import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}
  @Get() list(@Req() req: AuthenticatedRequest) {
    return this.orders.list(req.user.sub);
  }
  @Get(':id') detail(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orders.detail(req.user.sub, id);
  }
  @Post() create(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateOrderDto,
  ) {
    return this.orders.create(req.user.sub, body);
  }
  @Patch(':id/cancel') cancel(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orders.cancel(req.user.sub, id);
  }
  @Patch(':id/payment/confirm-demo') confirmDemoPayment(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orders.confirmDemoPayment(req.user.sub, id);
  }
}
