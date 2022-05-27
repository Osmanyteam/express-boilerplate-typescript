export interface TokenJWT {
  _id: string;
  user: string;
  token: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}
