import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

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
}