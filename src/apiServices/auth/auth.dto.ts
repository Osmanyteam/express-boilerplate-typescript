import { IsString, IsObject, ValidateNested, IsNumber } from 'class-validator';
import { CreateUserDto } from '../user/users.dto';

export class MessageResponseDto {
  @IsString()
  public message: string;
}

export class UserCreatedResponseDto extends MessageResponseDto {
  @IsObject()
  @ValidateNested()
  public data: CreateUserDto;
}

export class RefreshTokenDto {
  @IsString()
  public accessToken: string;

  @IsString()
  public refreshToken: string;
}

export class TokenDto {
  @IsNumber()
  expiresIn: number;
  @IsString()
  token: string;
}

export class TokenDataDto {
  @ValidateNested()
  public accessToken: TokenDto;
  @ValidateNested()
  public refreshToken: TokenDto;
}

class DataDto {
  @ValidateNested()
  user: CreateUserDto;
  @ValidateNested()
  tokenData: TokenDataDto;
}

export class UserTokenResponseDto extends MessageResponseDto {
  @IsObject()
  @ValidateNested()
  data: DataDto;
}

export class UserResponse extends MessageResponseDto {
  @IsObject()
  @ValidateNested()
  data: CreateUserDto;
}

export class TokenDataResponseDto extends MessageResponseDto {
  @IsObject()
  @ValidateNested()
  data: TokenDataDto;
}
