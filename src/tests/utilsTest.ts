import { dbConnection } from '../databases';
import mongoose from 'mongoose';

export const clearDatabase = async () => {
  await mongoose.connect(dbConnection.url, dbConnection.options);
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map(async collection => {
      await collection.deleteMany({}); // an empty mongodb selector object ({}) must be passed as the filter argument
    }),
  );
};
