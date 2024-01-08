import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { sendActionWithMadeByDto } from '../dto/actionDto';
import { ActionType } from '../../libs/BoardEnum';
import { PlayerService } from './PlayerService';
import { Board } from '../entities/boards.entities';
import { CardsService } from './CardService';

export const defaultActions = [
  ActionType.PICK_COIN_1,
  ActionType.PICK_COIN_2,
  ActionType.PICK_COIN_3,
  ActionType.ROB_COIN,
  ActionType.TRADE_CARDS,
  ActionType.KILL_COIN_3,
  ActionType.KILL_COIN_7,
];

@Injectable()
export class ActionService {
  private readonly logger = new Logger(ActionService.name);

  constructor(
    @Inject(forwardRef(() => CardsService))
    private readonly cardService: CardsService,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    @Inject(forwardRef(() => BoardsService))
    private readonly boardService: BoardsService,
  ) {}

  async useAction(boardId: string, dto: sendActionWithMadeByDto) {
    const board = await this.boardService.getOneById(boardId);
    const allowAction = await this.allowAction(board);
    const player = await this.playerService.getOneById(dto.madeBy);
    if (player.isDead) {
      throw new UnauthorizedException('You are dead');
    }
    switch (dto.action) {
      case ActionType.KILL_COIN_3:
        if (!allowAction.includes(ActionType.KILL_COIN_3)) {
          throw new UnauthorizedException('Action not allowed');
        }
        return this.killCoin3(board, dto);
      case ActionType.KILL_COIN_7:
        if (!allowAction.includes(ActionType.KILL_COIN_7)) {
          throw new UnauthorizedException('Action not allowed');
        }
        return this.killCoin7(board, dto);
      case ActionType.PICK_COIN_3:
        if (!allowAction.includes(ActionType.PICK_COIN_3)) {
          throw new UnauthorizedException('Action not allowed');
        }
        return this.pickCoin3(boardId, dto);
      case ActionType.PICK_COIN_2:
        if (!allowAction.includes(ActionType.PICK_COIN_2)) {
          throw new UnauthorizedException('Action not allowed');
        }
        return this.pickCoin2(boardId, dto);
      case ActionType.PICK_COIN_1:
        if (!allowAction.includes(ActionType.PICK_COIN_1)) {
          throw new UnauthorizedException('Action not allowed');
        }
        return this.pickCoin1(boardId, dto);
      case ActionType.BLOCK_KILL:
        if (!allowAction.includes(ActionType.BLOCK_KILL)) {
          throw new UnauthorizedException('Action not allowed');
        }
        return this.blockKill(board, dto);
      case ActionType.BLOCK_PICK:
        if (!allowAction.includes(ActionType.BLOCK_PICK)) {
          throw new UnauthorizedException('Action not allowed');
        }
        return this.blockPick(board, dto);
      case ActionType.BLOCK_ROB:
        if (!allowAction.includes(ActionType.BLOCK_ROB)) {
          throw new UnauthorizedException('Action not allowed');
        }
        return this.blockRob(board, dto);
      case ActionType.ROB_COIN:
        if (!allowAction.includes(ActionType.ROB_COIN)) {
          throw new UnauthorizedException('Action not allowed');
        }
        return this.robCoin(board, dto);
      case ActionType.TRADE_CARDS:
        if (!allowAction.includes(ActionType.TRADE_CARDS)) {
          throw new UnauthorizedException('Action not allowed');
        }
        return this.tradeCards(board, dto);
      case ActionType.CHOOSE_CARD:
        if (!allowAction.includes(ActionType.CHOOSE_CARD)) {
          throw new UnauthorizedException('Action not allowed');
        }
        return this.chooseCard(board, dto);
      case ActionType.LIE:
        if (!allowAction.includes(ActionType.LIE)) {
          throw new UnauthorizedException('Action not allowed');
        }
        return this.lie(boardId, dto);
    }
  }

  async killCoin3(board: Board, dto: sendActionWithMadeByDto) {
    if (board.currentPlayerId !== dto.madeBy) {
      throw new UnauthorizedException('Not your turn');
    }
    const playerToKill = await this.playerService.getOneById(dto.to);
    const player = await this.playerService.getOneById(dto.madeBy);
    if (!dto?.to || playerToKill.isDead) {
      throw new UnauthorizedException('No player to kill');
    }
    if (player.coins < 3) {
      throw new UnauthorizedException('Not enough coins');
    }
    player.coins -= 3;
    await this.playerService.update(player);
    const boardUpdated = await this.nextPlayer(board.id);
    return this.boardService.addActionToHistory(boardUpdated, dto);
  }

  async killCoin7(board: Board, dto: sendActionWithMadeByDto) {
    if (board.currentPlayerId !== dto.madeBy) {
      throw new UnauthorizedException('Not your turn');
    }
    const playerToKill = await this.playerService.getOneById(dto.to);
    const player = await this.playerService.getOneById(dto.madeBy);
    if (!dto?.to || playerToKill.isDead) {
      throw new UnauthorizedException('No player to kill');
    }
    if (player.coins < 7) {
      throw new UnauthorizedException('Not enough coins');
    }
    player.coins -= 7;
    await this.playerService.update(player);
    const boardUpdated = await this.nextPlayer(board.id);
    return this.boardService.addActionToHistory(boardUpdated, dto);
  }

  async pickCoin3(boardId: string, dto: sendActionWithMadeByDto) {
    const board = await this.boardService.getOneById(boardId);
    const player = await this.playerService.getOneById(dto.madeBy);
    if (board.currentPlayerId !== dto.madeBy) {
      throw new UnauthorizedException('Not your turn');
    }
    if (player.coins + 3 > 10) {
      throw new UnauthorizedException('Too much coins');
    }
    player.coins += 3;
    await this.playerService.update(player);
    const boardUpdated = await this.nextPlayer(boardId);
    return this.boardService.addActionToHistory(boardUpdated, dto);
  }

  async pickCoin2(boardId: string, dto: sendActionWithMadeByDto) {
    const board = await this.boardService.getOneById(boardId);
    const player = await this.playerService.getOneById(dto.madeBy);
    if (board.currentPlayerId !== dto.madeBy) {
      throw new UnauthorizedException('Not your turn');
    }
    if (player.coins + 2 > 10) {
      throw new UnauthorizedException('Too much coins');
    }
    player.coins += 2;
    await this.playerService.update(player);
    const boardUpdated = await this.nextPlayer(boardId);
    return this.boardService.addActionToHistory(boardUpdated, dto);
  }

  async pickCoin1(boardId: string, dto: sendActionWithMadeByDto) {
    const board = await this.boardService.getOneById(boardId);
    const player = await this.playerService.getOneById(dto.madeBy);
    if (board.currentPlayerId !== dto.madeBy) {
      throw new UnauthorizedException('Not your turn');
    }
    if (player.coins + 1 > 10) {
      throw new UnauthorizedException('Too much coins');
    }
    player.coins += 1;
    await this.playerService.update(player);
    const boardUpdated = await this.nextPlayer(boardId);
    return this.boardService.addActionToHistory(boardUpdated, dto);
  }

  async blockKill(board: Board, dto: sendActionWithMadeByDto) {
    const boardUpdated = await this.nextPlayer(board.id, true);
    return this.boardService.addActionToHistory(boardUpdated, dto);
  }

  async blockPick(board: Board, dto: sendActionWithMadeByDto) {
    return this.boardService.addActionToHistory(board, dto);
  }

  async blockRob(board: Board, dto: sendActionWithMadeByDto) {
    const lastAction = board.history[board.history.length - 1];
    const playerWhoRobbed = await this.playerService.getOneById(
      lastAction.madeBy,
    );
    const playerWhoWasRobbed = await this.playerService.getOneById(
      lastAction.to,
    );
    playerWhoRobbed.coins -= 2;
    playerWhoWasRobbed.coins += 2;
    await this.playerService.update(playerWhoRobbed);
    await this.playerService.update(playerWhoWasRobbed);
    const boardUpdated = await this.nextPlayer(board.id, true);
    return this.boardService.addActionToHistory(boardUpdated, dto);
  }

  async robCoin(board: Board, dto: sendActionWithMadeByDto) {
    const player = await this.playerService.getOneById(dto.madeBy);
    const playerToRob = await this.playerService.getOneById(dto.to);
    if (board.currentPlayerId !== dto.madeBy) {
      throw new UnauthorizedException('Not your turn');
    }
    if (player.coins < 2) {
      throw new UnauthorizedException('Not enough coins');
    }
    if (!playerToRob || playerToRob.isDead) {
      throw new UnauthorizedException('Player not found');
    }
    if (playerToRob.coins === 0) {
      throw new UnauthorizedException('Player has no coins');
    }
    if (playerToRob.coins === 1) {
      player.coins += 1;
      playerToRob.coins -= 1;
    }
    player.coins += 2;
    playerToRob.coins -= 2;
    await this.playerService.update(player);
    await this.playerService.update(playerToRob);
    const boardUpdated = await this.nextPlayer(board.id);
    return this.boardService.addActionToHistory(boardUpdated, dto);
  }

  async tradeCards(board: Board, dto: sendActionWithMadeByDto) {
    if (board.currentPlayerId !== dto.madeBy) {
      throw new UnauthorizedException('Not your turn');
    }
    const cardsToTrade = await this.cardService.getNotDeadByPlayerId(
      board.id,
      dto.madeBy,
    );
    for (const card of cardsToTrade) {
      await this.cardService.tradeCards(board.id, dto.madeBy, card.id);
    }
    const boardUpdated = await this.nextPlayer(board.id);
    return this.boardService.addActionToHistory(boardUpdated, dto);
  }

  async chooseCard(board: Board, dto: sendActionWithMadeByDto) {
    if (board.currentPlayerId !== dto.madeBy) {
      throw new UnauthorizedException('Not your turn');
    }
    const card = await this.cardService.getOneById(dto.cardId);
    if (!card || card.isDead || card.playerId !== dto.madeBy) {
      throw new UnauthorizedException('Card not found');
    }
    card.isDead = true;
    await this.cardService.update(card);
    await this.playerService.verifyPlayerIsDead(dto.madeBy);
    if (board.intermediateCurrentPlayerId) {
      board.currentPlayerId = board.intermediateCurrentPlayerId;
      return this.boardService.addActionToHistory(board, dto);
    }
    const boardUpdated = await this.nextPlayer(board.id);
    return this.boardService.addActionToHistory(boardUpdated, dto);
  }

  async lie(boardId: string, dto: sendActionWithMadeByDto) {
    const board = await this.boardService.getOneById(boardId);
    const lastAction =
      board.history && board.history
        ? board.history[board.history.length - 1]
        : null;
    const lastActionType = lastAction.action;
    if (lastAction.madeBy === dto.madeBy) {
      throw new UnauthorizedException('You cannot lie on your own action');
    }
    if (
      !lastAction ||
      [
        ActionType.KILL_COIN_7,
        ActionType.PICK_COIN_1,
        ActionType.CHOOSE_CARD,
        ActionType.LIE,
      ].includes(lastActionType)
    ) {
      throw new UnauthorizedException('No action to lie');
    }
    const hadRightToPlay = this.playerService.hadRightToPlay(
      lastAction.madeBy,
      lastAction.action,
    );
    if (!hadRightToPlay) {
      if (lastAction.action === ActionType.BLOCK_KILL) {
        board.intermediateCurrentPlayerId =
          board.history[board.history.length - 2].to;
      }
      if (lastAction.action === ActionType.BLOCK_PICK) {
        // undo pick action
      }
      if (lastAction.action === ActionType.BLOCK_ROB) {
        // undo rob action
      }
      if (lastAction.action === ActionType.TRADE_CARDS) {
        // undo trade action
      }
      if (lastAction.action === ActionType.ROB_COIN) {
        // undo rob action
      }
      board.currentPlayerId = lastAction.madeBy;
    }
    board.currentPlayerId = dto.madeBy;
    return this.boardService.update(board);
  }

  async nextPlayer(boardId: string, getLastPlayer?: boolean) {
    const nextPlayer = await this.playerService.getNextPlayer(
      boardId,
      getLastPlayer,
    );
    const board = await this.boardService.getOneById(boardId);
    board.currentPlayerId = nextPlayer.id;
    return this.boardService.update(board);
  }

  async allowAction(board: Board) {
    const lastAction =
      board.history && board.history
        ? board.history[board.history.length - 1]
        : null;
    if (!lastAction) {
      return defaultActions;
    }
    switch (lastAction.action) {
      case ActionType.KILL_COIN_3:
        return [ActionType.LIE, ActionType.BLOCK_KILL, ActionType.CHOOSE_CARD];
      case ActionType.KILL_COIN_7:
        return [ActionType.CHOOSE_CARD];
      case ActionType.PICK_COIN_3:
        return [...defaultActions, ActionType.LIE];
      case ActionType.PICK_COIN_2:
        return [...defaultActions, ActionType.BLOCK_PICK, ActionType.LIE];
      case ActionType.PICK_COIN_1:
        return defaultActions;
      case ActionType.BLOCK_KILL:
        return [...defaultActions, ActionType.LIE];
      case ActionType.BLOCK_PICK:
        return [...defaultActions, ActionType.LIE];
      case ActionType.BLOCK_ROB:
        return [...defaultActions, ActionType.BLOCK_PICK, ActionType.LIE];
      case ActionType.ROB_COIN:
        return [...defaultActions, ActionType.BLOCK_ROB, ActionType.LIE];
      case ActionType.TRADE_CARDS:
        return [...defaultActions, ActionType.LIE];
      case ActionType.CHOOSE_CARD:
        return defaultActions;
      case ActionType.LIE:
        return [ActionType.CHOOSE_CARD];
    }
  }
}
