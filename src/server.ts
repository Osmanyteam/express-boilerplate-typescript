import App from '@/app';
import AuthController from '@apiServices/auth/auth.controller';
import validateEnv from '@utils/validateEnv';
import 'reflect-metadata';

validateEnv();

const app = new App([AuthController]);

app.listen();
