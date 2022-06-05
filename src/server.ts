import App from '@/app';
import AuthController from '@/apiServices/auth/auth.controller';
import validateEnv from '@utils/validateEnv';
import 'reflect-metadata';
import MongodbService from './databases/mongodb';

validateEnv();

const app = new App([AuthController]);
new MongodbService().connect().then(
  () => null,
  () => {
    process.exit();
  },
);
app.listen();
