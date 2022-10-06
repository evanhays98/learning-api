import { Injectable, Logger } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { jwtConstants } from '../secrets/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Say where to find the token here we chose to set the header in bearer token
      ignoreExpiration: false, // We decide here to not ignore expiration and return a 401 error to the client if
      secretOrKey: jwtConstants.secret, // Secret use to encrypt the tokens
    });
  }

  /**
   * Validate if the payload sent by the client is valid
   * @param payload Payload sent by the client
   */
  async validate(payload: any) {
    return { id: payload.sub, mail: payload.mail };
  }
}
