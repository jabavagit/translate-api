import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const { NODE_ENV, PORT, LOG_FORMAT, LOG_DIR, ORIGIN } = process.env;

export let IMPORT_DIR: string = 'C:/Dev/Iberia/iberia-web-content/literales';
export let IMPORT_MOCK_DIR: string = '../import/literales';
