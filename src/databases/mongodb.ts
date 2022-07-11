import mongoose, { connect, set, plugin } from 'mongoose';
import { DB_URL, NODE_ENV } from '@config';
import DBConnector from '@/core/dbconnector';
import { toJSON } from './plugins';

export const dbConnection = {
  url: DB_URL,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
};

class MongodbService implements DBConnector<typeof mongoose> {
  private _db: typeof mongoose;

  async connect(): Promise<typeof mongoose> {
    if (NODE_ENV !== 'production') {
      set('debug', true);
    }
    plugin(toJSON);
    this._db = await connect(DB_URL, dbConnection.options);
    return this._db;
  }

  get db() {
    return this._db;
  }
}

export default MongodbService;
