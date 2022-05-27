import request from 'supertest';
import App from '../app';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('Testing Index', () => {
  describe('[GET] /', () => {
    it('response statusCode 200', async () => {
      const app = new App([]);

      return request(await app.getServer())
        .get(`${app.prefixRoute}`)
        .expect(200);
    });
  });
});
