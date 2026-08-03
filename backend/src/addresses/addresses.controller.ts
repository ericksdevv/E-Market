import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddressesService } from './addresses.service';
import { AddressDto } from './dto/address.dto';

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addresses: AddressesService) {}
  @Get() list(@Req() req: any) { return this.addresses.list(req.user.sub); }
  @Post() create(@Req() req: any, @Body() body: AddressDto) { return this.addresses.create(req.user.sub, body); }
  @Patch(':id') update(@Req() req: any, @Param('id') id: string, @Body() body: AddressDto) { return this.addresses.update(req.user.sub, Number(id), body); }
  @Delete(':id') remove(@Req() req: any, @Param('id') id: string) { return this.addresses.remove(req.user.sub, Number(id)); }
}
