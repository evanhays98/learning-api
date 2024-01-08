import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../entities/PlayerEntity';
import { createPlayerDto } from '../dto/playerDto';
import { BoardsService } from './boards.service';
import { ActionType } from '../../libs/BoardEnum';
import { defaultActions } from './ActionService';

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);

  constructor(
    @InjectRepository(Player)
    private readonly repo: Repository<Player>,
    @Inject(forwardRef(() => BoardsService))
    private readonly boardService: BoardsService,
  ) {}

  async create(player: createPlayerDto): Promise<Player> {
    return this.repo.save({ ...player });
  }

  async update(player: Player): Promise<Player> {
    return this.repo.save(player);
  }

  async getOneById(id: string): Promise<Player> {
    return this.repo.findOne({ where: { id } });
  }

  async getOneByUserId(userId: string): Promise<Player> {
    return this.repo.findOne({ where: { userId } });
  }

  async shufflePlayers(boardId: string) {
    const players = await this.repo.find({
      where: {
        boardId,
      },
    });
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }
    for (let i = 0; i < players.length; i++) {
      players[i].index = i;
      await this.update(players[i]);
    }
    return players;
  }

  async verifyPlayerIsDead(playerId: string) {
    const player = await this.getOneById(playerId);
    for (const card of player.cards) {
      if (!card.isDead) {
        return player;
      }
    }
    player.isDead = true;
    await this.update(player);
  }

  getPlayersFromBoardIdAndUserId(boardId: string, userId: string) {
    return this.repo.findOne({
      where: {
        boardId,
        userId,
      },
    });
  }

  async getNextPlayer(boardId: string, getLastPlayer = false) {
    const board = await this.boardService.getOneById(boardId);
    const players = await this.repo.find({
      where: {
        boardId,
        isDead: false,
      },
      order: {
        index: 'ASC',
      },
    });
    let currentPlayerId = board.currentPlayerId;
    for (let i = board.history ? board.history.length - 1 : 0; i >= 0; i--) {
      if (!defaultActions.includes(board.history[i].action)) {
        continue;
      }
      currentPlayerId = board.history[i].madeBy;
    }
    if (getLastPlayer) {
      return players[currentPlayerId];
    }
    const currentPlayer = players.find(
      (player) => player.id === currentPlayerId,
    );
    const currentPlayerIndex = players.indexOf(currentPlayer);
    let index = currentPlayerIndex + 1;
    if (index >= players.length) {
      index = 0;
    }
    return players[index];
  }

  async hadRightToPlay(playerId: string, action: ActionType) {
    const player = await this.repo.findOne({ where: { id: playerId } });
    const cards = player.cards;
    const allAction = cards.reduce((acc, card) => {
      for (const action in card.actions) {
        if (card.isDead) {
          continue;
        }
        acc.push(action);
      }
      return acc;
    }, []);
    return allAction.includes(action);
  }
}
