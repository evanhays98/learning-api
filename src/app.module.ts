import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BoardsModule } from './boards/boardsModule';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'learning',
      password: 'learning',
      database: 'learning',
      synchronize: true,
      autoLoadEntities: true,
    }),
    UsersModule,
    AuthModule,
    BoardsModule,
  ],
})
export class AppModule {}
