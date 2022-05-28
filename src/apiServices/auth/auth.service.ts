import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY, ACCESS_TOKEN_EXPIRE_TIME, REFRESH_TOKEN_EXPIRE_TIME } from '@config';
import { CreateUserDto } from '@apiServices/user/dto/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@apiServices/auth/interfaces/auth.interface';
import { User } from '@apiServices/user/interfaces/users.interface';
import userModel from '@apiServices/user/models/users.model';
import { isEmpty } from '@utils/util';
import tokenJWTModel from '@/models/tokenJWT.model';

class AuthService {
  public users = userModel;

  public async signup(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await this.users.create({ ...userData, password: hashedPassword });

    return createUserData;
  }

  public async login(userData: CreateUserDto): Promise<{ tokenData: TokenData; findUser: User }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

    const tokenData = await this.createToken(findUser);

    return { tokenData, findUser };
  }

  public async logout(authorization: string, userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");
    const findUser: User = await this.users.findOne({ email: userData.email, password: userData.password });
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);
    await tokenJWTModel.deleteOne({ user: userData._id, accessToken: authorization });

    return findUser;
  }

  public async createToken(user: User): Promise<TokenData> {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const secretKey: string = SECRET_KEY;
    const expiresIn = Number(ACCESS_TOKEN_EXPIRE_TIME);
    const expiresRefreshToken = Number(REFRESH_TOKEN_EXPIRE_TIME);

    const tokenData = {
      accessToken: {
        expiresIn,
        token: sign(dataStoredInToken, secretKey, { expiresIn }),
      },
      refreshToken: {
        expiresIn: expiresRefreshToken,
        token: sign(dataStoredInToken, secretKey, { expiresIn: expiresRefreshToken }),
      },
    };
    await tokenJWTModel.create({ user: user._id, accessToken: tokenData.accessToken.token, refreshToken: tokenData.refreshToken.token });
    return tokenData;
  }
}

export default AuthService;
