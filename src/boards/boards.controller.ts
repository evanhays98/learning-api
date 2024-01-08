import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BoardsService } from './services/boards.service';
import { User } from '../decorators/user.decorators';
import { sendActionDto } from './dto/actionDto';
import { ActionService } from './services/ActionService';
import { PlayerService } from './services/PlayerService';

@Controller('boards')
export class BoardsController {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly actionService: ActionService,
    private readonly playerService: PlayerService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@User() user) {
    return this.boardsService.create({
      ownerId: user.id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOneById(@Param('id') id: string, @User() user) {
    const board = await this.boardsService.getOneById(id);
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    return board;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/join')
  join(@User() user, @Param('id') id: string) {
    return this.boardsService.join(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/start')
  async start(@User() user, @Param('id') id: string) {
    const board = await this.boardsService.getOneById(id);
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    if (board.ownerId !== user.id) {
      throw new UnauthorizedException('Only owner can start the game');
    }
    if (board.isStarted) {
      throw new UnauthorizedException('Game already started');
    }
    return this.boardsService.start(board);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/action')
  async sendAction(
    @User() user,
    @Param('id') id: string,
    @Body() action: sendActionDto,
  ) {
    const player = await this.playerService.getPlayersFromBoardIdAndUserId(
      id,
      user.id,
    );
    return this.actionService.useAction(id, { ...action, madeBy: player.id });
  }
}
