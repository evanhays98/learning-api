import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chapter } from '../../chapters/entities/chapter.entity';

@Entity()
export class Sentence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sentence: string;

  @ManyToOne(() => Chapter, (chapter) => chapter.sentences)
  chapter: Chapter;
}
