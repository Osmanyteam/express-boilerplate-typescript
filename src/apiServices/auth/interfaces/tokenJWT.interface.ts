export interface ITokenJWT {
  _id: string;
  user: string;
  token: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}
