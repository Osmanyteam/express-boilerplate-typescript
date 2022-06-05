import { model, Schema } from 'mongoose';
import { IUser } from '@/apiServices/user/interfaces/users.interface';

/**
 * A Mongoose schema for the User model.
 * @typedef {object} UserSchema
 * @property {string} email - The email of the user.
 * @property {string} password - The password of the user.
 */
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    private: true,
  },
  roles: {
    type: String,
    required: true,
    enum: ['user', 'admin'],
    default: 'user',
  },
});

const userModel = model<IUser>('User', userSchema);

export default userModel;
