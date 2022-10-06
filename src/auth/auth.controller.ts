import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return 'hello';
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    this.logger.log(req.user.id + ' Wants his profile');
    return this.authService.getAuthInfoUser(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@Req() req) {
    this.logger.log('Incoming login...');
    return this.authService.login(req.user);
  }

  @Post('signup')
  async signUp(@Body() signUpForm) {
    this.logger.debug(signUpForm);
    console.log(signUpForm);
    this.logger.log('Incoming signup...');
    return this.authService.signup(signUpForm);
  }
}
