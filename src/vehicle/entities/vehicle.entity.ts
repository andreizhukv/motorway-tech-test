import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { VehicleStateEnum } from '../types/VehicleStateEnum';
import { StateLog } from './state-log.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column({
    type: 'enum',
    enum: VehicleStateEnum,
    default: VehicleStateEnum.Quoted,
  })
  state: VehicleStateEnum;

  @Exclude()
  @OneToMany(() => StateLog, (stateLog) => stateLog.vehicle)
  stateLogs: StateLog[];
}
