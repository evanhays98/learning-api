import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.pseudo = createUserDto.pseudo;
    user.mail = createUserDto.mail;
    user.password = createUserDto.password;

    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findByMail(mail: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        mail,
      },
    });
  }
}
