import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private favorites: FavoritesService) {}

  @Get()
  list(@Req() req: any) {
    return this.favorites.list(req.user.sub);
  }

  @Post('toggle')
  toggle(@Req() req: any, @Body() body: { productId: number }) {
    return this.favorites.toggle(req.user.sub, Number(body.productId));
  }
}
