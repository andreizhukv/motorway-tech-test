import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VehicleStateEnum } from '../types/VehicleStateEnum';
import { Vehicle } from './vehicle.entity';

@Entity()
export class StateLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: VehicleStateEnum,
    default: VehicleStateEnum.Quoted,
  })
  state: VehicleStateEnum;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: Date;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.stateLogs, {
    onDelete: 'CASCADE',
  })
  vehicle: Vehicle;
}
