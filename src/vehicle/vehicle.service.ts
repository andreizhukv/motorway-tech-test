import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Repository } from 'typeorm';
import { StateLog } from './entities/state-log.entity';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,

    @InjectRepository(StateLog)
    private stateLogsRepository: Repository<StateLog>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    return await this.vehiclesRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const vehicle = this.vehiclesRepository.create(createVehicleDto);
        const savedVehicle = await transactionalEntityManager.save(vehicle);
        const stateLog = this.stateLogsRepository.create({
          vehicle: savedVehicle,
          state: savedVehicle.state,
        });
        await transactionalEntityManager.save(stateLog);

        return savedVehicle;
      },
    );
  }

  findAll(): Promise<Vehicle[]> {
    return this.vehiclesRepository.find();
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOneBy({ id });
    if (!vehicle)
      throw new NotFoundException(`Vehicle with ID ${id} not found`);

    return vehicle;
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.vehiclesRepository.findOneBy({ id });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return await this.vehiclesRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const stateBeforeUpdate = vehicle.state;
        Object.assign(vehicle, updateVehicleDto);

        const updatedVehicle = await transactionalEntityManager.save(vehicle);

        if (
          updateVehicleDto.state &&
          stateBeforeUpdate !== updateVehicleDto.state
        ) {
          const stateLog = this.stateLogsRepository.create({
            vehicle: updatedVehicle,
            state: updatedVehicle.state,
          });
          await transactionalEntityManager.save(stateLog);
        }

        return updatedVehicle;
      },
    );
  }

  async findStateLog(id: number, timestamp: Date): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.stateLogs', 'stateLog')
      .where('vehicle.id = :id', { id })
      .andWhere('stateLog.timestamp <= :timestamp', { timestamp })
      .orderBy('stateLog.timestamp', 'DESC')
      .limit(1)
      .getOne();

    if (!vehicle)
      throw new NotFoundException(
        `Vehicle with ID ${id} not found on ${timestamp}.`,
      );

    vehicle.state = vehicle.stateLogs[0].state;

    return vehicle;
  }
}
