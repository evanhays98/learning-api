import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/boards.entities';
import { BoardsService } from './services/boards.service';
import { BoardsController } from './boards.controller';
import { Card } from './entities/CardEntity';
import { CardsService } from './services/CardService';
import { Player } from './entities/PlayerEntity';
import { PlayerService } from './services/PlayerService';
import { ActionService } from './services/ActionService';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Card, Player])],
  providers: [ActionService, BoardsService, CardsService, PlayerService],
  controllers: [BoardsController],
  exports: [BoardsService, CardsService, PlayerService, ActionService],
})
export class BoardsModule {}
