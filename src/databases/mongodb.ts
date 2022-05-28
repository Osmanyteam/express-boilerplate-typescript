import { DB_URL, NODE_ENV } from '@config';

export const dbConnection = {
  url: DB_URL,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
};

import { connect, set } from 'mongoose';

if (NODE_ENV !== 'production') {
  set('debug', true);
}

export default connect(DB_URL, dbConnection.options);
