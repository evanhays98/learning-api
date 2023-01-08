import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { CreateUserDto, LoginUserDto } from '../users/dto/create-user.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateLogin(mail: string, password: string): Promise<User> {
    const user = await this.usersService.findByMail(mail);
    this.logger.debug(user.salt);
    if (
      user &&
      user.password ===
        crypto.createHmac('sha256', user.salt + password).digest('hex')
    ) {
      return user;
    }
    this.logger.warn(
      `Invalid credentials : \n mail: ${mail}\n password: ${password}`,
    );
    return null;
  }

  async loginUser(user: User) {
    const payload = { sub: user.id, mail: user.mail };
    const tmpSignedPayload = this.jwtService.sign(payload);
    return {
      access_token: tmpSignedPayload,
      userInfo: instanceToPlain(user),
    };
  }

  async login(loginForm: LoginUserDto) {
    const user = await this.validateLogin(loginForm.mail, loginForm.password);
    if (!user) {
      throw new UnauthorizedException();
    }
    const payload = { mail: user.mail, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      userInfo: instanceToPlain(user),
    };
  }

  signup(signUpForm: CreateUserDto): Promise<{ access_token: string }> {
    return this.usersService
      .create(signUpForm)
      .then((user) => {
        return this.loginUser(user);
      })
      .catch((err) => {
        this.logger.error(err);
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  async getAuthInfoUser(currentUser) {
    this.logger.debug(currentUser.id);
    const currentUserInfo = await this.usersService.findOne(currentUser.id);
    return instanceToPlain(currentUserInfo);
  }
}
