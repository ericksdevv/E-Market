import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';
import { Roles, RolesGuard } from './roles.guard';
import {
  AdjustStockDto,
  CreateProductDto,
  UpdateClientStatusDto,
  UpdateOrderStatusDto,
  UpdateProductDto,
} from './dto/admin.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}
  @Get('dashboard') dashboard() {
    return this.admin.dashboard();
  }
  @Get('orders') orders() {
    return this.admin.orders();
  }
  @Patch('orders/:id/status') updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateOrderStatusDto,
  ) {
    return this.admin.updateOrder(id, body.status);
  }
  @Get('clients') clients() {
    return this.admin.clients();
  }
  @Roles(UserRole.ADMIN)
  @Patch('clients/:id/status')
  toggleClient(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateClientStatusDto,
  ) {
    return this.admin.toggleClient(id, body.isActive);
  }
  @Post('stock/:productId') stock(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: AdjustStockDto,
  ) {
    return this.admin.adjustStock(productId, body.quantity, body.reason);
  }
  @Post('products') createProduct(@Body() body: CreateProductDto) {
    return this.admin.createProduct(body);
  }
  @Patch('products/:id') updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.admin.updateProduct(id, body);
  }
}
