import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { jwtConstants } from './secrets/constants';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import {SessionSerializer} from "./session.serializer";

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: true }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3660s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, SessionSerializer],
})
export class AuthModule {}
