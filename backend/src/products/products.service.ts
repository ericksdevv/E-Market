import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}
  async list(category?: string, query?: string) {
    return this.prisma.product.findMany({
      where:{ isActive:true, ...(category ? {category:{slug:category}} : {}), ...(query ? {name:{contains:query,mode:'insensitive'}} : {}) },
      include:{category:true,images:{orderBy:{sortOrder:'asc'},take:1}}, orderBy:{createdAt:'desc'},
    });
  }
  categories(){ return this.prisma.category.findMany({where:{isActive:true},orderBy:{name:'asc'}}); }
  async bySlug(slug:string){ const product=await this.prisma.product.findUnique({where:{slug},include:{category:true,images:{orderBy:{sortOrder:'asc'}}}}); if(!product) throw new NotFoundException('Produto não encontrado'); return product; }
}
