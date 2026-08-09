import {
  Body,
  Controller,
  Delete,
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
import { CartService } from './cart.service';
import { AddCartItemDto, ChangeCartItemDto } from './dto/cart-item.dto';
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cart: CartService) {}
  @Get() get(@Req() req: AuthenticatedRequest) {
    return this.cart.current(req.user.sub);
  }
  @Post('items') add(
    @Req() req: AuthenticatedRequest,
    @Body() body: AddCartItemDto,
  ) {
    return this.cart.add(req.user.sub, body.productId, body.quantity);
  }
  @Patch('items/:productId') change(
    @Req() req: AuthenticatedRequest,
    @Param('productId', ParseIntPipe) id: number,
    @Body() body: ChangeCartItemDto,
  ) {
    return this.cart.change(req.user.sub, id, body.quantity);
  }
  @Delete('items/:productId') remove(
    @Req() req: AuthenticatedRequest,
    @Param('productId', ParseIntPipe) id: number,
  ) {
    return this.cart.remove(req.user.sub, id);
  }
  @Delete('items') clear(@Req() req: AuthenticatedRequest) {
    return this.cart.clear(req.user.sub);
  }
}
