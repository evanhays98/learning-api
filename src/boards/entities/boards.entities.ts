import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsOptional, IsString } from 'class-validator';
import { MainEntity } from '../../libs/main.entities';
import { Card } from './CardEntity';
import { Exclude, Type } from 'class-transformer';
import { Player } from './PlayerEntity';
import { ActionType } from '../../libs/BoardEnum';

export class HistoryItem {
  madeBy: string;
  to?: string;
  action: ActionType;
}

@Entity()
export class Board extends MainEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsString({ always: true })
  ownerId: string;

  @OneToMany(() => Card, (card) => card.board, { eager: true })
  @Exclude({ toClassOnly: true })
  @Type(() => Card)
  cards?: Card[];

  @Column({ nullable: true })
  @IsString({ always: true })
  currentPlayerId?: string;

  @Column({ nullable: true })
  @IsString({ always: true })
  @IsOptional()
  intermediateCurrentPlayerId?: string;

  @OneToMany(() => Player, (player) => player.board, { eager: true })
  @Exclude({ toClassOnly: true })
  @Type(() => Player)
  players?: Player[];

  @Column({ type: 'boolean', default: false })
  isStarted: boolean;

  @Column({ default: false, type: 'boolean' })
  isFinished: boolean;

  @Column({ type: 'jsonb', default: [] })
  history: HistoryItem[];
}
