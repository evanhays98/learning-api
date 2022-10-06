import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as crypto from 'crypto';

@Entity()
export class User {
  @BeforeInsert()
  hashPassword() {
    this.password = crypto.createHmac('sha256', this.password).digest('hex');
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pseudo: string;

  @Column()
  mail: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;
}
