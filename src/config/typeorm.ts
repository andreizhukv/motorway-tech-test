import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Config, Environment } from './configuration';

export const getTypeOrmConfig = (
  configService: ConfigService<Config, true>,
): TypeOrmModuleOptions => {
  const env = configService.get('env', { infer: true });
  const databaseConfig = configService.get('database', { infer: true });
  const { host, username, port, password, database } = databaseConfig;

  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: env === Environment.Local || env === Environment.Test,
  };
};
