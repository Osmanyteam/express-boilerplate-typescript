import { RequestWithUser } from '@/apiServices/auth/interfaces/auth.interface';

export const getAuthorizationToken = (req: RequestWithUser): String | null => {
  return req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
};
