import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createCardDto } from '../dto/cardDto';
import { Card } from '../entities/CardEntity';
import { BoardsService } from './boards.service';
import { ActionType, CardType } from '../../libs/BoardEnum';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    @InjectRepository(Card)
    private readonly repo: Repository<Card>,
    @Inject(forwardRef(() => BoardsService))
    private readonly boardService: BoardsService,
  ) {}

  getOneById(id: string): Promise<Card> {
    return this.repo.findOne({ where: { id } });
  }

  async create(card: createCardDto): Promise<Card> {
    const board = await this.boardService.getOneById(card.boardId);
    const actions = this.getActionsFromCardType(card.type);
    const newCard = await this.repo.save({ board, type: card.type, actions });
    return this.repo.findOne({ where: { id: newCard.id } });
  }

  async update(card: Card): Promise<Card> {
    return this.repo.save(card);
  }

  getActionsFromCardType(type: CardType): ActionType[] {
    switch (type) {
      case CardType.DUCHESS:
        return [ActionType.BLOCK_PICK, ActionType.PICK_COIN_3];
      case CardType.AMBASSADOR:
        return [ActionType.TRADE_CARDS, ActionType.BLOCK_ROB];
      case CardType.CAPTAIN:
        return [ActionType.BLOCK_ROB, ActionType.ROB_COIN];
      case CardType.COUNTESS:
        return [ActionType.BLOCK_KILL];
      case CardType.ASSASSIN:
        return [ActionType.KILL_COIN_3];
    }
  }

  async shuffleCards(boardId: string) {
    const cards = await this.repo.find({
      where: {
        board: {
          id: boardId,
        },
      },
    });
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    for (let i = 0; i < cards.length; i++) {
      cards[i].index = i;
      await this.update(cards[i]);
    }
    return cards;
  }

  async getNotDeadByPlayerId(
    boardId: string,
    playerId: string,
  ): Promise<Card[]> {
    return this.repo.find({
      where: {
        isDead: false,
        player: {
          id: playerId,
        },
        board: {
          id: boardId,
        },
      },
    });
  }

  async tradeCards(boardId: string, playerId: string, cardId: string) {
    const card = await this.getOneById(cardId);
    const pickaxe = await this.repo.find({
      where: {
        isDead: false,
        player: null,
        playerId: null,
        board: {
          id: boardId,
        },
      },
      order: {
        index: 'ASC',
      },
    });
    const newCard = pickaxe[0];
    newCard.playerId = playerId;
    newCard.player = card.player;
    await this.update(newCard);
    card.playerId = null;
    card.player = null;
    card.index = pickaxe[pickaxe.length - 1].index + 1;
    await this.update(card);
    return;
  }
}
