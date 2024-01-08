import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../entities/boards.entities';
import { createBoardDto } from '../dto/createBoardDto';
import { v4 } from 'uuid';
import { Card } from '../entities/CardEntity';
import { CardType } from '../../libs/BoardEnum';
import { CardsService } from './CardService';
import { PlayerService } from './PlayerService';
import { sendActionWithMadeByDto } from '../dto/actionDto';

@Injectable()
export class BoardsService {
  private readonly logger = new Logger(BoardsService.name);

  constructor(
    @InjectRepository(Board)
    private readonly repo: Repository<Board>,
    private readonly cardService: CardsService,
    private readonly playerService: PlayerService,
  ) {}

  async create(board: createBoardDto): Promise<Board> {
    const newBoard = await this.repo.save(board);
    await this.playerService.create({
      userId: board.ownerId,
      boardId: newBoard.id,
      pseudo: 'Player 1',
    });

    return this.repo.findOne({
      where: { id: newBoard.id },
    });
  }

  async update(board: Board): Promise<Board> {
    return this.repo.save(board);
  }

  async getOneById(id: string): Promise<Board> {
    return this.repo.findOne({ where: { id } });
  }

  async join(userId: string, id: string): Promise<Board> {
    const board = await this.repo.findOne({ where: { id } });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    if (board.isStarted) {
      throw new UnauthorizedException('Game already started');
    }
    const newPlayer = await this.playerService.create({
      userId,
      boardId: board.id,
      pseudo: `Player ${board.players.length + 1}`,
    });
    return this.repo.save({
      ...board,
      playersIds: [...board.players, newPlayer],
    });
  }

  async start(board: Board) {
    let players = board.players;
    //add fake user
    const newPlayer = await this.playerService.create({
      userId: v4(),
      boardId: board.id,
      pseudo: `Player ${board.players.length + 1}`,
    });
    players.push(newPlayer);
    let cards: Card[] = [];
    for (let i = 0; i < players.length; i++) {
      for (const key of Object.keys(CardType)) {
        const card = await this.cardService.create({
          type: CardType[key],
          boardId: board.id,
        });
        cards.push(card);
      }
    }
    players = await this.playerService.shufflePlayers(board.id);
    cards = await this.cardService.shuffleCards(board.id);

    await this.repo.save({
      ...board,
      isStarted: true,
      players: players,
      currentPlayerId: players[0].id,
      cards,
    });
    const updatedBoard = await this.getOneById(board.id);
    await this.distributeCards(updatedBoard);

    return this.getOneById(board.id);
  }

  async distributeCards(board: Board) {
    for (let i = 0; i < board.players.length; i++) {
      const card1 = board.cards[i];
      const card2 = board.cards[i + board.players.length];
      if (card1) {
        card1.playerId = board.players[i].id;
        await this.cardService.update(card1);
      }
      if (card2) {
        card2.playerId = board.players[i].id;
        await this.cardService.update(card2);
      }
    }
  }

  async addActionToHistory(board: Board, dto: sendActionWithMadeByDto) {
    const { action, madeBy, to } = dto;
    const history = board.history;
    history.push({
      action,
      madeBy,
      to,
    });
    return this.repo.save({
      ...board,
      history,
    });
  }
}
