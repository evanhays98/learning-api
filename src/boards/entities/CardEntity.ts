import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MainEntity } from '../../libs/main.entities';
import { ActionType, CardType } from '../../libs/BoardEnum';
import { IsEnum } from 'class-validator';
import { Board } from './boards.entities';
import { Player } from './PlayerEntity';

@Entity()
export class Card extends MainEntity {
  @Column({ type: 'enum', enum: CardType })
  @IsEnum(CardType, { always: true })
  type: CardType;

  @Column({ default: false, type: 'boolean' })
  isDead: boolean;

  @Column({ type: 'enum', enum: ActionType, array: true })
  @IsEnum(ActionType, { always: true, each: true })
  actions: ActionType[];

  @ManyToOne(() => Board, (board) => board.cards)
  board: Board;

  @ManyToOne(() => Player, (player) => player.cards, { nullable: true })
  @JoinColumn({ name: 'playerId' })
  player?: Player;

  @Column({ nullable: true })
  playerId?: string;

  @Column({ nullable: false, default: 0 })
  index: number;
}
