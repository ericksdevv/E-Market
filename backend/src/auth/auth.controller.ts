import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post('register')
  register(
    @Body() body: CreateUserDto,
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  login(
    @Body() body: LoginDto,
  ) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(
    @Req() request: { user: { sub: number } },
  ) {
    return this.authService.me(request.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(
    @Req() request: { user: { sub: number } },
    @Body() body: UpdateUserDto,
  ) {
    return this.authService.updateProfile(request.user.sub, body);
  }
}
