import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OrderStatus, Prisma, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';
import { Roles, RolesGuard } from './roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}
  @Get('dashboard') dashboard() { return this.admin.dashboard(); }
  @Get('orders') orders() { return this.admin.orders(); }
  @Patch('orders/:id/status') updateOrder(@Param('id') id: string, @Body('status') status: OrderStatus) { return this.admin.updateOrder(Number(id), status); }
  @Get('clients') clients() { return this.admin.clients(); }
  @Patch('clients/:id/status') toggleClient(@Param('id') id: string, @Body('isActive') active: boolean) { return this.admin.toggleClient(Number(id), active); }
  @Post('stock/:productId') stock(@Param('productId') productId: string, @Body() body: { quantity: number; reason?: string }) { return this.admin.adjustStock(Number(productId), Number(body.quantity), body.reason); }
  @Post('products') createProduct(@Body() body: Prisma.ProductUncheckedCreateInput) { return this.admin.createProduct(body); }
  @Patch('products/:id') updateProduct(@Param('id') id: string, @Body() body: Prisma.ProductUncheckedUpdateInput) { return this.admin.updateProduct(Number(id), body); }
}
