import { NextFunction, Request, Response } from 'express';
import { User } from '@apiServices/user/interfaces/users.interface';
import userService from '@apiServices/user/users.service';

class UsersController {
  public userService = new userService();

  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const findOneUserData: User = await this.userService.findUserById(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
