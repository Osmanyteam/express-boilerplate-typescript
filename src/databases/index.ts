import { DB_URL } from '@config';

export const dbConnection = {
  url: DB_URL,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
};
