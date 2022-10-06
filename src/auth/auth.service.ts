import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateLogin(mail: string, password: string): Promise<any> {
    const user = await this.usersService.findByMail(mail);
    if (
      user &&
      user.password == crypto.createHmac('sha256', password).digest('hex')
    ) {
      const { password, ...result } = user;
      return result;
    }
    this.logger.warn(
      `Invalid credentials : \n mail: ${mail}\n password: ${password}`,
    );
    return null;
  }

  async login(user: User) {
    const payload = { sub: user.id, mail: user.mail };
    const tmpSignedPayload = this.jwtService.sign(payload);
    return {
      access_token: tmpSignedPayload,
      userInfo: user,
    };
  }

  signup(signUpForm: CreateUserDto): Promise<{ access_token: string }> {
    return this.usersService
      .create(signUpForm)
      .then((user) => {
        return this.login(user);
      })
      .catch((err) => {
        this.logger.error(err);
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  async getAuthInfoUser(currentUser) {
    this.logger.debug(currentUser.id);
    const currentUserInfo = await this.usersService.findOne(currentUser.id);
    return { userInfo: currentUserInfo };
  }
}
