import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from './create-vehicle.dto';
import { VehicleStateEnum } from '../types/VehicleStateEnum';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
  @IsOptional()
  @IsEnum(VehicleStateEnum)
  state: VehicleStateEnum;
}
