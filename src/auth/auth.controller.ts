import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDTO } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() payload: LoginDto) {
    return await this.authService.login(payload);
  }

  @Post('register')
  async register(@Body() payload: RegisterDTO) {
    return await this.authService.register(payload);
  }
}
