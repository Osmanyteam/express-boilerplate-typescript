import { model, Schema, Document } from 'mongoose';
import { User } from '@apiServices/user/interfaces/users.interface';
import { toJSON } from '../../../models/plugins';

/**
 * A Mongoose schema for the User model.
 * @typedef {object} UserSchema
 * @property {string} email - The email of the user.
 * @property {string} password - The password of the user.
 */
const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    private: true,
  },
});

// appends plugins
userSchema.plugin(toJSON);

const userModel = model<User & Document>('User', userSchema);

export default userModel;
