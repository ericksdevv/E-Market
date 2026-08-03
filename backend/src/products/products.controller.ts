import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
@Controller('products')
export class ProductsController {
  constructor(private products:ProductsService) {}
  @Get() list(
    @Query('category') category?: string,
    @Query('q') q?: string,
    @Query('sort') sort?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('offer') offer?: string,
  ) { return this.products.list({ category, q, sort, minPrice, maxPrice, offer: offer === 'true' }); }
  @Get('categories') categories(){ return this.products.categories(); }
  @Get(':slug') bySlug(@Param('slug') slug:string){ return this.products.bySlug(slug); }
}
