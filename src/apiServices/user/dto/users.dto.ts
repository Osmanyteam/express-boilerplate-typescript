import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public username: string;

  @MinLength(8)
  public password: string;
}
