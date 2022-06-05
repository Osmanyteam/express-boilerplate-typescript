import { model, Schema } from 'mongoose';
import { ITokenJWT } from '@/apiServices/auth/interfaces/tokenJWT.interface';

const tokenSchema = new Schema<ITokenJWT>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const tokenJWTModel = model<ITokenJWT>('tokenjwt', tokenSchema);

export default tokenJWTModel;
