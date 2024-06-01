const DEFAULT_DB_PORT = 5432;

export enum Environment {
  Local = 'local',
  Test = 'test',
  Dev = 'dev',
  Staging = 'staging',
  Production = 'production',
}

export type DatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

export type Config = {
  env: Environment;
  database: DatabaseConfig;
};

// add validation + types for empty env variables
export default () => {
  const targetPort = process.env.DB_PORT
    ? parseInt(process.env.DB_PORT, 10)
    : DEFAULT_DB_PORT;

  return {
    env: process.env.NODE_ENV || 'local',
    database: {
      host: process.env.DB_HOST,
      port: targetPort,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    },
  };
};
