import { BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsBoolean, IsDate, IsOptional } from 'class-validator';

@Entity()
export class MainEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: new Date(), type: 'timestamp' })
  @IsOptional()
  @IsDate({ always: true })
  updatedAt: Date;

  @Column({ default: new Date(), type: 'timestamp' })
  @IsOptional()
  @IsDate({ always: true })
  createdAt: Date;

  @Column({ default: false, type: 'boolean' })
  @IsOptional()
  @IsBoolean({ always: true })
  isActive: boolean;

  @BeforeUpdate()
  updateUpdatedAt() {
    this.updatedAt = new Date();
  }
}
