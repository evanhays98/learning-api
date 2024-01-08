import { BoardsService } from '../services/boards.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from '../services/CardService';
import { PlayerService } from '../services/PlayerService';
import { Connection } from 'typeorm';
import { Board } from './boards.entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './PlayerEntity';
import { Card } from './CardEntity';
import { ActionService } from '../services/ActionService';
import { ActionType } from '../../libs/BoardEnum';
import { UnauthorizedException } from '@nestjs/common';

describe('BoardsService', () => {
  let connection: Connection;
  let boardsService: BoardsService;
  let cardsService: CardsService;
  let playerService: PlayerService;
  let actionService: ActionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
        TypeOrmModule.forFeature([Board, Card, Player]),
      ],
      providers: [ActionService, BoardsService, CardsService, PlayerService],
    }).compile();

    boardsService = module.get<BoardsService>(BoardsService);
    cardsService = module.get<CardsService>(CardsService);
    playerService = module.get<PlayerService>(PlayerService);
    actionService = module.get<ActionService>(ActionService);
    connection = module.get<Connection>(Connection);
  });

  afterEach(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  describe('BoardsService', () => {
    it('should return all boards', async () => {
      let board = await boardsService.create({
        ownerId: '1',
      });
      await boardsService.start(board);
      const firstPlayer = board.players[0];
      const secondPlayer = board.players[1];
      console.log('board', board);
      board = await actionService.useAction(board.id, {
        action: ActionType.PICK_COIN_3,
        madeBy: firstPlayer.id,
      });
      await expect(async () => {
        await actionService.useAction(board.id, {
          action: ActionType.PICK_COIN_3,
          madeBy: firstPlayer.id,
        });
      }).rejects.toThrow(UnauthorizedException);
      expect(board.currentPlayerId).toEqual(secondPlayer.id);
      expect(board).toBeDefined();
    });

    // Add more test cases for the BoardsService methods...
  });
});
