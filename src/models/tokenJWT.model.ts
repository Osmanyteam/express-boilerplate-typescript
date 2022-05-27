import { model, Schema, Document } from 'mongoose';
import { TokenJWT } from '@interfaces/tokenJWT.interface';

const tokenSchema = new Schema(
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

const tokenJWTModel = model<TokenJWT & Document>('tokenjwt', tokenSchema);

export default tokenJWTModel;
