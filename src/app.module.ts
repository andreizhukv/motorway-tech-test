import { Module } from '@nestjs/common';
import { VehicleModule } from './vehicle/vehicle.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { Config } from './config/configuration';
import { getTypeOrmConfig } from './config/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      // cool thing to validate config on startup
      // validationSchema: EnvironmentVariables,
      // validationOptions: {
      //   allowUnknown: false,
      //   abortEarly: true,
      // },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<Config, true>) =>
        getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    VehicleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
