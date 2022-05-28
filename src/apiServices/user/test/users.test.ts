import request from 'supertest';
import { Application } from 'express';
import App from '../../../app';
import { clearDatabase } from '../../../tests/utilsTest';
import { CreateUserDto } from '../dto/users.dto';
import AuthService from '../../auth/auth.service';

// const userRoute = new UsersRoute();
// const app = new App([userRoute]);
// let server: Application;
// const userData: CreateUserDto = {
//   email: 'test@email.com',
//   password: 'q1w2e3r4!',
// };
// const authService = new AuthService();

// beforeAll(async () => {
//   await clearDatabase();
//   server = await app.getServer();
// });

// describe('Testing Users endpoints', () => {
//   describe('[GET] /users/:id', () => {
//     it('response should have the info the user', async () => {
//       await authService.signup(userData);
//       const userAndTokens = await authService.login(userData);
//       const response = await request(server)
//         .get(`${app.prefixRoute}${userRoute.path}${userAndTokens.findUser._id}`)
//         .set({ Authorization: `Bearer ${userAndTokens.tokenData.accessToken.token}` })
//         .send();
//       expect(response.statusCode).toBe(200);
//       expect(response.body.data).toHaveProperty('email', userData.email);
//     });
//   });
// });
