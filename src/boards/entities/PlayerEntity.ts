import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { MainEntity } from '../../libs/main.entities';
import { Card } from './CardEntity';
import { Exclude, Type } from 'class-transformer';
import { Board } from './boards.entities';

@Entity()
export class Player extends MainEntity {
  @Column()
  @IsString({ always: true })
  pseudo: string;

  @Column()
  userId: string;

  @OneToMany(() => Card, (card) => card.player, { nullable: true, eager: true })
  @Exclude({ toClassOnly: true })
  @Type(() => Card)
  cards?: Card[];

  @Column({ default: false, type: 'boolean' })
  @IsBoolean({ always: true })
  isDead: boolean;

  @ManyToOne(() => Board, (board) => board.players)
  @Exclude({ toClassOnly: true })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column()
  @IsString({ always: true })
  boardId: string;

  @Column({ nullable: false, default: 2 })
  @IsNumber()
  coins: number;

  @IsNumber()
  @Column({ nullable: false, default: 0 })
  index: number;
}
