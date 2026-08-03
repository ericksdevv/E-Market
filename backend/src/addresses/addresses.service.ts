import { Injectable, NotFoundException } from '@nestjs/common';
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
    const count = await this.prisma.address.count({ where: { userId } });
    return this.prisma.$transaction(async (tx) => {
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
        data: { ...data, state: data.state.toUpperCase() },
      });
    });
  }

  async remove(userId: number, id: number) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) throw new NotFoundException('Endereço não encontrado');
    await this.prisma.address.delete({ where: { id } });
    if (address.isDefault) {
      const next = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (next)
        await this.prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
    }
    return { success: true };
  }
}
