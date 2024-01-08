import { IsString } from 'class-validator';

export class createBoardDto {
  @IsString({ always: true })
  ownerId: string;
}
