import { IsEnum, IsString } from 'class-validator';
import { CardType } from '../../libs/BoardEnum';

export class createCardDto {
  @IsEnum({ always: true, enum: CardType, array: true })
  type: CardType;

  @IsString({ always: true })
  boardId: string;
}
