export class CreateUserDto {
  pseudo: string;
  mail: string;
  password: string;
}

export class LoginUserDto {
  mail: string;
  password: string;
}
