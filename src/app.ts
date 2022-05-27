import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { connect, set } from 'mongoose';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { dbConnection } from '@databases';
import { logger, stream } from '@utils/logger';
import { useExpressServer, getMetadataArgsStorage, RoutingControllersOptions } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import * as swaggerUiExpress from 'swagger-ui-express';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { authorizationChecker, currentUserChecker } from './utils/auth';
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public prefixRoute = '/api';
  private serverReady = false;
  private routingControllersOptions: RoutingControllersOptions;

  constructor(controllers: Function[]) {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeIndexRoute();
    // now appends routers
    this.routingControllersOptions = {
      authorizationChecker,
      currentUserChecker,
      controllers: controllers,
      defaultErrorHandler: true,
      routePrefix: this.prefixRoute,
      classTransformer: false,
      development: NODE_ENV !== 'production',
      cors: { origin: ORIGIN, credentials: CREDENTIALS },
    };
    this.app = useExpressServer(this.app, this.routingControllersOptions);
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.initializeSwagger();
    this.connectToDatabase();
  }

  public listen() {
    this.app.listen(this.port);
  }

  public async getServer() {
    do {
      await new Promise(resolve => setTimeout(resolve, 500));
    } while (!this.serverReady);
    return this.app;
  }

  private async connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }

    try {
      connect(dbConnection.url, dbConnection.options, () => {
        logger.info(`=================================`);
        logger.info(`======= ENV: ${this.env} =======`);
        logger.info(`======= MongoDB connected ======`);
        logger.info(`🚀 App listening on the port ${this.port}`);
        logger.info(`=================================`);
        this.serverReady = true;
      });
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeIndexRoute() {
    // default route
    this.app.get(this.prefixRoute, (_, res) => {
      res.status(200).send();
    });
  }

  private initializeSwagger() {
    // Parse class-validator classes into JSON Schema:
    const schemas = validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
      refPointerPrefix: '#/components/schemas/',
    });
    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(storage, this.routingControllersOptions, {
      components: {
        schemas,
        securitySchemes: {
          basicAuth: {
            scheme: 'Bearer',
            type: 'http',
          },
        },
      },
      info: {
        description: 'API Documentation for MyAva',
        title: 'API MyAva',
        version: '1.0.0',
      },
    });

    this.app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(spec));
  }
}

export default App;
