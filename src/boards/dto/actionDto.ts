import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ActionType } from '../../libs/BoardEnum';

export class sendActionDto {
  @IsEnum(ActionType, { always: true })
  action: ActionType;

  @IsString({ always: true })
  @IsOptional()
  to?: string;

  @IsString({ always: true })
  @IsOptional()
  cardId?: string;
}

export class sendActionWithMadeByDto extends sendActionDto {
  @IsString({ always: true })
  madeBy: string;
}
