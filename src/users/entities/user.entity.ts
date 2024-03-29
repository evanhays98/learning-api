import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as crypto from 'crypto';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  pseudo: string;

  @Exclude()
  @Column()
  salt: string;

  @Column({ unique: true })
  mail: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @BeforeInsert()
  hashPassword() {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password = crypto
      .createHmac('sha256', this.salt + this.password)
      .digest('hex');
  }
}
