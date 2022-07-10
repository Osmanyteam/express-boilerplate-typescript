import { config } from 'dotenv';
config({ path: `.env` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, DB_URL, JWT_SECRET, LOG_FORMAT, LOG_DIR, ORIGIN, JWT_ACCESS_EXPIRATION_SECONDS, JWT_REFRESH_EXPIRATION_DAYS } =
  process.env;
