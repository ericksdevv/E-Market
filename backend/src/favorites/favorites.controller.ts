import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { FavoritesService } from './favorites.service';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private favorites: FavoritesService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.favorites.list(req.user.sub);
  }

  @Post('toggle')
  toggle(
    @Req() req: AuthenticatedRequest,
    @Body() body: { productId: number },
  ) {
    return this.favorites.toggle(req.user.sub, Number(body.productId));
  }
}
