import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { FavoritesModule } from './favorites/favorites.module';
import { AddressesModule } from './addresses/addresses.module';
import { OrdersModule } from './orders/orders.module';
import { CouponsModule } from './coupons/coupons.module';
import { AdminModule } from './admin/admin.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SecurityThrottlerGuard } from './security-throttler.guard';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProductsModule,
    CartModule,
    FavoritesModule,
    AddressesModule,
    OrdersModule,
    CouponsModule,
    AdminModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: SecurityThrottlerGuard }],
})
export class AppModule {}
