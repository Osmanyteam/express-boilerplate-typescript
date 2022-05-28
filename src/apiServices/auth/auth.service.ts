import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { SECRET_KEY, ACCESS_TOKEN_EXPIRE_TIME, REFRESH_TOKEN_EXPIRE_TIME } from '@config';
import { CreateUserDto } from '@/apiServices/user/dto/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@/apiServices/auth/interfaces/auth.interface';
import { User } from '@/apiServices/user/interfaces/users.interface';
import userModel from '@/apiServices/user/models/users.model';
import { isEmpty } from '@utils/util';
import tokenJWTModel from '@/apiServices/auth/models/tokenJWT.model';
import { RequestWithUser } from './interfaces/auth.interface';
import { Action } from 'routing-controllers';
import { logger } from '@/utils/logger';

const secretKey: string = SECRET_KEY;

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

  public static getAuthorizationToken(req: RequestWithUser): String | null {
    return req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
  }

  public static async authorizationChecker(action: Action, roles: string[]) {
    try {
      const Authorization = AuthService.getAuthorizationToken(action.request);

      if (typeof Authorization === 'string') {
        const verificationResponse = verify(Authorization, secretKey) as DataStoredInToken;
        const userId = verificationResponse._id;
        const tokenExists = await tokenJWTModel.findOne({ accessToken: Authorization, user: userId });
        if (!tokenExists) {
          throw new HttpException(401, 'Token not found');
        }
        const user = await userModel.findById(userId);

        if (user && !roles.length) return true;
        if (user && roles.find(role => user.roles.indexOf(role) !== -1)) return true;
      }
      return false;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  public static async currentUserChecker(action: Action) {
    const Authorization = this.getAuthorizationToken(action.request);
    if (typeof Authorization !== 'string') return {};
    const secretKey: string = SECRET_KEY;
    const verificationResponse = verify(Authorization, secretKey) as DataStoredInToken;
    const userId = verificationResponse._id;
    return userModel.findById(userId);
  }
}

export default AuthService;
