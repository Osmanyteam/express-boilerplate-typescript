import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken } from '@/apiServices/auth/auth.interface';
import userModel from '@/apiServices/user/users.model';
import tokenJWTModel from '@/models/tokenJWT.model';
import { getAuthorizationtoken } from '@/utils/getAuthorizationtoken';
import { Action } from 'routing-controllers';
import { logger } from '@/utils/logger';
const secretKey: string = SECRET_KEY;

export const authorizationChecker = async (action: Action, roles: string[]) => {
  try {
    const Authorization = getAuthorizationtoken(action.request);

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
};

export const currentUserChecker = async (action: Action) => {
  const Authorization = getAuthorizationtoken(action.request);
  if (typeof Authorization !== 'string') return {};
  const secretKey: string = SECRET_KEY;
  const verificationResponse = verify(Authorization, secretKey) as DataStoredInToken;
  const userId = verificationResponse._id;
  return userModel.findById(userId);
};
