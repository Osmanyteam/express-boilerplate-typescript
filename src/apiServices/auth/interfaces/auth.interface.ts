import { Request } from 'express';
import { User } from '@/apiServices/user/interfaces/users.interface';

export interface DataStoredInToken {
  _id: string;
}

export interface TokenData {
  accessToken: {
    token: string;
    expiresIn: number;
  };
  refreshToken: {
    token: string;
    expiresIn: number;
  };
}

export interface RequestWithUser extends Request {
  user: User;
}
