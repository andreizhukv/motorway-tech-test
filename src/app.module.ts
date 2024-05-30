import { Module } from '@nestjs/common';
import { VehicleModule } from './vehicle/vehicle.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'motorway',
      // entities: [],
      // turn on only in development mode
      synchronize: true,
      autoLoadEntities: true,
    }),
    VehicleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
