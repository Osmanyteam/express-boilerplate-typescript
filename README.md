# RESTful API Node Server Boilerplate

[![Build Status](https://app.travis-ci.com/Osmanyteam/express-boilerplate-typescript.svg?branch=main)](https://app.travis-ci.com/github/Osmanyteam/express-boilerplate-typescript)
[![Coverage Status](https://coveralls.io/github/Osmanyteam/express-boilerplate-typescript/badge.svg?branch=main)](https://coveralls.io/github/hagopj13/node-express-boilerplate?branch=master)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

A boilerplate project for quickly building RESTful APIs using Node.js, Express, Typescript, and Mongoose.

## Requirements
<ul>
  <li>nodejs >= 16.15.0</li>
  <li>yarn</li>
</ul>

## Installation

Cloning the repo:

```bash
git clone --depth 1 https://github.com/Osmanyteam/express-boilerplate-typescript.git
cd node-express-boilerplate
npx rimraf ./.git
```

Install the dependencies:

```bash
yarn install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

## Table of Contents

- [Features](#features)
- [Commands](#commands)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Error Handling](#error-handling)
- [Validation](#validation)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Logging](#logging)
- [Custom Mongoose Plugins](#custom-mongoose-plugins)
- [Linting](#linting)
- [Contributing](#contributing)

## Features

- **NoSQL database**: [MongoDB](https://www.mongodb.com) object data modeling using [Mongoose](https://mongoosejs.com)
- **Authentication and authorization**: using [jsonwebtoken](https://jwt.io/)
- **Validation**: request data validation using [routing-controllers](https://github.com/typestack/routing-controllers)
- **Logging**: using [winston](https://github.com/winstonjs/winston)
- **Testing**: unit and integration tests using [Jest](https://jestjs.io)
- **API documentation**: with [routing-controllers-openapi](https://github.com/epiphone/routing-controllers-openapi) and [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)
- **Process management**: advanced production process management using [PM2](https://pm2.keymetrics.io)
- **Dependency management**: with [Yarn](https://yarnpkg.com)
- **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv) and [cross-env](https://github.com/kentcdodds/cross-env#readme)
- **Security**: set security HTTP headers using [helmet](https://helmetjs.github.io)
- **Santizing**: sanitize request data against xss and query injection
- **CORS**: Cross-Origin Resource-Sharing enabled using [cors](https://github.com/expressjs/cors)
- **Compression**: gzip compression with [compression](https://github.com/expressjs/compression)
- **CI**: continuous integration with [Travis CI](https://travis-ci.org)
- **Docker support**
- **Code coverage**: using [coveralls](https://coveralls.io)
- **Git hooks**: with [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged)
- **Linting**: with [ESLint](https://eslint.org) and [Prettier](https://prettier.io)

## Commands

Running locally:

```bash
yarn dev
```

Running in production:

```bash
yarn start
```

Testing:

```bash
# run all tests
yarn test

# run all tests in watch mode
yarn test:watch

# run test coverage
yarn coverage
```

Linting:

```bash
# run ESLint
yarn lint

# fix ESLint errors
yarn lint:fix
```

## Project Structure

```
src\
 |--apiServices\    # API things, controllers, routes, services, models
 |--config\         # Environment variables and configuration related things
 |--core\           # Custom core functionality
 |--exceptions      # Custom Error handler request
 |--middlewares\    # Custom express middlewares
 |--utils\          # Utility classes and functions
 |--app.ts          # Express app
 |--server.ts       # App entry point
```

## API Documentation

To view the list of available APIs and their specifications, run the server and go to `http://localhost:3000/docs` in your browser. This documentation page is automatically generated using the [swagger](https://swagger.io/) definitions written as comments in the route files.

## Error Handling

The app has a centralized error handling mechanism.

You can use by default the custom error handler HttpException inside of the services or controller, specify number http of the error and small description about it

```typescript
export class HttpException extends Error {
  public status: number;
  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}
```

```typescript
import { HttpException } from '@exceptions/HttpException';
public async signup(userData: CreateUserDto): Promise<IUser> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: IUser = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: IUser = await this.users.create({ ...userData, password: hashedPassword });

    return createUserData;
  }
```

The error handling middleware sends an error response, which has the following format:

```json
"name": "HttpException",
"message": "You're password not matching",
"stack": "Error: You're password not matching\n    at AuthService.login (/home/osmany/work/express-boilerplate-typescript/src/apiServices/auth/auth.service.ts:41:36)\n    at async AuthController.logIn (/home/osmany/work/express-boilerplate-typescript/src/apiServices/auth/auth.controller.ts:34:37)",
  "status": 409
```

## Validation

Request data is validated using [routing-controllers](https://github.com/typestack/routing-controllers) and [class-validator](https://github.com/typestack/class-validator)

The validation schemas are defined in the `src/apiServices/service/dto/request.dto.ts`.

```typescript
import { CreateUserDto } from './dto/request.dto'

@HttpCode(200)
@Post('/login')
@OpenAPI({ summary: 'login for user' })
@ResponseSchema(UserTokenResponseDto)
async logIn(@Body() user: CreateUserDto) {
    const { tokenData, findUser } = await this.authService.login(user);
    return { data: { user: findUser, tokenData }, message: 'login' };
  }
```

## Authentication

To require authentication for certain routes, you can use the `Authorized` from [routing-controllers](https://github.com/typestack/routing-controllers).

```typescript
import { Body, Post, Authorized, HttpCode, CurrentUser } from 'routing-controllers';

@HttpCode(200)
@Post('/logout')
@Authorized()
@OpenAPI({ summary: 'logout user', security: [{ basicAuth: [] }] })
@ResponseSchema(UserResponse)
async logOut(@Body() tokenData: RefreshTokenDto, @CurrentUser() user?: IUser) {
    const logOutUserData: IUser = await this.authService.logout(tokenData.accessToken, user);
  return { data: logOutUserData, message: 'logout' };
}
```

These routes require a valid JWT access token in the Authorization request header using the Bearer schema. If the request does not contain a valid access token, an Unauthorized (401) error is thrown.

## Logging

Import the logger from `src/config/logger.js`. It is using the [Winston](https://github.com/winstonjs/winston) logging library.

Logging should be done according to the following severity levels (ascending order from most important to least important):

```typescript
import { logger } from '@utils/logger';

logger.error('message'); // level 0
logger.warn('message'); // level 1
logger.info('message'); // level 2
logger.http('message'); // level 3
logger.verbose('message'); // level 4
logger.debug('message'); // level 5
```

## Custom Mongoose Plugins

The app also contains 2 custom mongoose plugins that you can attach to any mongoose model schema or global instance. You can find the plugins in `src/databases/plugins`.

```typescript
import { toJSON } from './plugins';

async connect(): Promise<typeof mongoose> {
  if (NODE_ENV !== 'production') {
    set('debug', true);
  }
  plugin(toJSON);
  this._db = await connect(DB_URL, dbConnection.options);
  return this._db;
}
```

### toJSON

The toJSON plugin applies the following changes in the toJSON transform call:

- removes \_\_v, createdAt, updatedAt, and any schema path that has private: true
- replaces \_id with id

### paginate

The paginate plugin adds the `paginate` static method to the mongoose schema.

Adding this plugin to the `User` model schema will allow you to do the following:

```typescript
async queryUsers(filter, options): IResultsPaginated {
  const users = await this.users.paginate(filter, options);
  return users;
};
```

The `filter` param is a regular mongo filter.

The `options` param can have the following (optional) fields:

```typescript
const options: IOptionsPaginate = {
  sortBy: 'name:desc', // sort order
  limit: 5, // maximum results per page
  page: 2, // page number
};
```

The plugin also supports sorting by multiple criteria (separated by a comma): `sortBy: name:desc,role:asc`

The `paginate` method returns a Promise, which fulfills with an object having the following properties:

```json
{
  "results": [],
  "page": 2,
  "limit": 5,
  "totalPages": 10,
  "totalResults": 48
}
```

## Linting

Linting is done using [ESLint](https://eslint.org/) and [Prettier](https://prettier.io).

In this app, ESLint is configured to follow the [Airbnb JavaScript style guide](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base) with some modifications. It also extends [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) to turn off all rules that are unnecessary or might conflict with Prettier.

To modify the ESLint configuration, update the `.eslintrc.json` file. To modify the Prettier configuration, update the `.prettierrc.json` file.

To prevent a certain file or directory from being linted, add it to `.eslintignore` and `.prettierignore`.

To maintain a consistent coding style across different IDEs, the project contains `.editorconfig`

## Contributing

Contributions are more than welcome! Please check out the [contributing guide](CONTRIBUTING.md).

## Inspirations

- [hagopj13/node-express-boilerplate](https://github.com/hagopj13/node-express-boilerplate)

## License

[MIT](LICENSE)
