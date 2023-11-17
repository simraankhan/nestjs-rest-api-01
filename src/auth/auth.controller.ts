import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  public register(@Body() authDto: AuthDto) {
    return this.authService.register(authDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  public login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }
}
