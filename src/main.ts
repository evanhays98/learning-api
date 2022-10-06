import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app
    .use(
      session({
        secret: 'test secret',
        resave: false,
        saveUninitialized: false,
        rolling: true, // keep session alive
        cookie: {
          maxAge: 30 * 60 * 1000, // session expires in 1hr, refreshed by `rolling: true` option.
          // httpOnly: true, // so that cookie can't be accessed via client-side script
        },
      }),
    )
    .enableCors();
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(3003);
}

bootstrap();
