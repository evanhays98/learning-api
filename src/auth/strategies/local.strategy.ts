import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  Logger,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  // Logger
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'mail',
    });
  }

  async validate(mail: string, password: string): Promise<any> {
    const user = await this.authService.validateLogin(mail, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
