import request from 'supertest';
import { Application } from 'express';
import App from '../../../app';
import { clearDatabase } from '../../../tests/utilsTest';
import { CreateUserDto } from '../../user/dto/users.dto';
import { ITokenData } from '../interfaces/auth.interface';
import AuthController from '../auth.controller';

const app = new App([AuthController]);
let server: Application, tokenData: ITokenData;
const userData: CreateUserDto = {
  email: 'test@email.com',
  password: 'q1w2e3r4!',
  username: 'name',
};

beforeAll(async () => {
  await clearDatabase();
  server = await app.getServer();
});

describe('Testing Auth', () => {
  describe('[POST] /signup', () => {
    it('response should have the Create userData', async () => {
      const response = await request(server).post(`${app.prefixRoute}/auth/signup`).send(userData);
      expect(response.statusCode).toBe(201);
      expect(response.body.data).toHaveProperty('email', userData.email);
    });
  });

  describe('[POST] /login', () => {
    it('response should have the user and token authentications', async () => {
      const response = await request(server).post(`${app.prefixRoute}/auth/login`).send(userData);
      expect(response.statusCode).toBe(200);
      expect(response.body.data.user).toHaveProperty('email', userData.email);
      tokenData = response.body.data.tokenData;
    });
  });

  describe('[POST] /refresh-token', () => {
    it('should be create new tokens', async () => {
      const response = await request(server).patch(`${app.prefixRoute}/auth/refresh-token`).send({
        accessToken: tokenData.accessToken.token,
        refreshToken: tokenData.refreshToken.token,
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'refresh token');
      tokenData = response.body.data;
    });
  });

  describe('[POST] /logout', () => {
    it('should be logout to user', async () => {
      const response = await request(server)
        .post(`${app.prefixRoute}/auth/logout`)
        .set({ Authorization: `Bearer ${tokenData.accessToken.token}` })
        .send({});
      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty('email', userData.email);
    });
  });
});
