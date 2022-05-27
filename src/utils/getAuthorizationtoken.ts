import { RequestWithUser } from '@/apiServices/auth/auth.interface';

export const getAuthorizationtoken = (req: RequestWithUser): String | null => {
  return req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
};
