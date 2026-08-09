import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: number) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(userId: number, data: AddressDto) {
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.address.count({ where: { userId } });
      if (count >= 20) {
        throw new BadRequestException(
          'Você atingiu o limite de 20 endereços cadastrados',
        );
      }
      if (data.isDefault || count === 0)
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      return tx.address.create({
        data: {
          ...data,
          userId,
          state: data.state.toUpperCase(),
          isDefault: data.isDefault || count === 0,
        },
      });
    });
  }

  async update(userId: number, id: number, data: AddressDto) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) throw new NotFoundException('Endereço não encontrado');
    return this.prisma.$transaction(async (tx) => {
      if (data.isDefault)
        await tx.address.updateMany({
          where: { userId, id: { not: id } },
          data: { isDefault: false },
        });
      return tx.address.update({
        where: { id },
        data: {
          ...data,
          state: data.state.toUpperCase(),
          isDefault: data.isDefault || address.isDefault,
        },
      });
    });
  }

  async remove(userId: number, id: number) {
    return this.prisma.$transaction(async (tx) => {
      const address = await tx.address.findFirst({
        where: { id, userId },
      });
      if (!address) throw new NotFoundException('Endereço não encontrado');
      await tx.address.delete({ where: { id } });
      if (address.isDefault) {
        const next = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        if (next)
          await tx.address.update({
            where: { id: next.id },
            data: { isDefault: true },
          });
      }
      return { success: true };
    });
  }
}
