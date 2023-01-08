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
import { LoginUserDto } from '../users/dto/create-user.dto';
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
  @Get('me')
  getProfile(@Req() req) {
    this.logger.log(req.user.id + ' Wants his profile');
    return this.authService.getAuthInfoUser(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@Body() loginForm: LoginUserDto) {
    return this.authService.login(loginForm);
  }

  @Post('signup')
  async signUp(@Body() signUpForm) {
    this.logger.debug(signUpForm);
    console.log(signUpForm);
    this.logger.log('Incoming signup...');
    return this.authService.signup(signUpForm);
  }
}
