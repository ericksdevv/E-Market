import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { AddressesService } from './addresses.service';
import { AddressDto } from './dto/address.dto';

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addresses: AddressesService) {}
  @Get() list(@Req() req: AuthenticatedRequest) {
    return this.addresses.list(req.user.sub);
  }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() body: AddressDto) {
    return this.addresses.create(req.user.sub, body);
  }
  @Patch(':id') update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AddressDto,
  ) {
    return this.addresses.update(req.user.sub, id, body);
  }
  @Delete(':id') remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addresses.remove(req.user.sub, id);
  }
}
