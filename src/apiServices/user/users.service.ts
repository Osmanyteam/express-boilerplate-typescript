import { HttpException } from '@exceptions/HttpException';
import { User } from '@/apiServices/user/interfaces/users.interface';
import userModel from '@/apiServices/user/models/users.model';
import { isEmpty } from '@utils/util';

class UserService {
  public users = userModel;

  public async findUserById(userId: string): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: User = await this.users.findOne({ _id: userId });
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }
}

export default UserService;
