import { CreateUserDto } from '@/apiServices/user/dto/users.dto';
import { DataStoredInToken } from '@/apiServices/auth/interfaces/auth.interface';
import { IUser } from '@/apiServices/user/interfaces/users.interface';
import AuthService from '@/apiServices/auth/auth.service';
import { HttpException } from '@/exceptions/HttpException';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '@/config';
import tokenJWTModel from '@/apiServices/auth/models/tokenJWT.model';
import { JsonController, Body, Post, Authorized, HttpCode, CurrentUser, Patch } from 'routing-controllers';
import { ResponseSchema, OpenAPI } from 'routing-controllers-openapi';
import { RefreshTokenDto, TokenDataResponseDto, UserCreatedResponseDto, UserResponse, UserTokenResponseDto } from './dto/auth.dto';
import UserService from '@/apiServices/user/users.service';
import { Service } from 'typedi';

@Service()
@JsonController('/auth')
class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(201)
  @Post('/signup')
  @OpenAPI({ summary: 'Return a new user' })
  @ResponseSchema(UserCreatedResponseDto)
  async signUp(@Body() user: CreateUserDto) {
    const signUpUserData: IUser = await this.authService.signup(user);
    return { data: signUpUserData, message: 'signup' };
  }

  @HttpCode(200)
  @Post('/login')
  @OpenAPI({ summary: 'login for user' })
  @ResponseSchema(UserTokenResponseDto)
  async logIn(@Body() user: CreateUserDto) {
    const { tokenData, findUser } = await this.authService.login(user);
    return { data: { user: findUser, tokenData }, message: 'login' };
  }

  @HttpCode(200)
  @Post('/logout')
  @Authorized()
  @OpenAPI({ summary: 'logout user', security: [{ basicAuth: [] }] })
  @ResponseSchema(UserResponse)
  async logOut(@Body() tokenData: RefreshTokenDto, @CurrentUser() user?: IUser) {
    const logOutUserData: IUser = await this.authService.logout(tokenData.accessToken, user);
    return { data: logOutUserData, message: 'logout' };
  }

  @HttpCode(200)
  @Patch('/refresh-token')
  @OpenAPI({ summary: 'generate new tokens' })
  @ResponseSchema(TokenDataResponseDto)
  async refreshToken(@Body() tokenDataBody: RefreshTokenDto) {
    const { accessToken, refreshToken } = tokenDataBody;
    const verificationResponse = verify(refreshToken, JWT_SECRET) as DataStoredInToken;
    const tokenJWT = await tokenJWTModel.findOne({ accessToken: accessToken, refreshToken, user: verificationResponse._id });
    if (!tokenJWT) {
      throw new HttpException(401, 'Token not found');
    }
    await tokenJWT.remove();
    const user = await new UserService().findUserById(verificationResponse._id);
    const tokenData = await this.authService.createToken(user);
    return { data: tokenData, message: 'refresh token' };
  }
}

export default AuthController;
