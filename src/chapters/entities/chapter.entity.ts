import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Sentence } from '../../sentences/entities/sentence.entity';

@Entity()
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @OneToMany(() => Sentence, (sentence) => sentence.chapter)
  sentences: Sentence[];
}
