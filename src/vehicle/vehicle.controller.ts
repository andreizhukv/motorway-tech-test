import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { FindOneParams } from './dtos/find-one.params';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import { FindStateLogQuery } from './dtos/find-state-log.query';

@Controller('vehicle')
@UseInterceptors(ClassSerializerInterceptor)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.create(createVehicleDto);
  }

  // TODO: add pagination
  @Get()
  findAll() {
    return this.vehicleService.findAll();
  }

  @Get(':id')
  findOne(@Param() params: FindOneParams) {
    return this.vehicleService.findOne(+params.id);
  }

  @Patch(':id')
  update(
    @Param() params: FindOneParams,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehicleService.update(+params.id, updateVehicleDto);
  }

  @Get(':id/state-log')
  findStateLog(
    @Param() params: FindOneParams,
    @Query() query: FindStateLogQuery,
  ) {
    const { timestamp } = query;
    return this.vehicleService.findStateLog(+params.id, new Date(timestamp));
  }
}
