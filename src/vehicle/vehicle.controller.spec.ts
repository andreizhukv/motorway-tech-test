import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';
import { FindOneParams } from './dtos/find-one.params';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import { VehicleStateEnum } from './types/VehicleStateEnum';
import { FindStateLogQuery } from './dtos/find-state-log.query';

describe('VehicleController', () => {
  let controller: VehicleController;

  const mockVehicleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    findStateLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        {
          provide: VehicleService,
          useValue: mockVehicleService,
        },
      ],
    }).compile();

    controller = module.get<VehicleController>(VehicleController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new vehicle', async () => {
      const createVehicleDto: CreateVehicleDto = {
        make: 'BMW',
        model: 'X5',
      };
      const vehicle = new Vehicle();
      mockVehicleService.create.mockResolvedValue(vehicle);

      expect(await controller.create(createVehicleDto)).toBe(vehicle);
      expect(mockVehicleService.create).toHaveBeenCalledWith(createVehicleDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of vehicles', async () => {
      const vehicles = [new Vehicle(), new Vehicle(), new Vehicle()];
      mockVehicleService.findAll.mockResolvedValue(vehicles);

      expect(await controller.findAll()).toBe(vehicles);
      expect(mockVehicleService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single vehicle', async () => {
      const vehicleId = 1;
      const vehicle = new Vehicle();
      const params: FindOneParams = { id: `${vehicleId}` };
      mockVehicleService.findOne.mockResolvedValue(vehicle);

      expect(await controller.findOne(params)).toBe(vehicle);
      expect(mockVehicleService.findOne).toHaveBeenCalledWith(vehicleId);
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      const updateVehicleDto: UpdateVehicleDto = {
        make: 'BMW',
        model: 'X5',
        state: VehicleStateEnum.Sold,
      };
      const vehicle = new Vehicle();
      const vehicleId = 1;
      const params: FindOneParams = { id: `${vehicleId}` };
      mockVehicleService.update.mockResolvedValue(vehicle);

      expect(await controller.update(params, updateVehicleDto)).toBe(vehicle);
      expect(mockVehicleService.update).toHaveBeenCalledWith(
        vehicleId,
        updateVehicleDto,
      );
    });
  });

  describe('findStateLog', () => {
    it('should return a state log of a vehicle', async () => {
      const vehicleId = 1;
      const vehicle = new Vehicle();
      const params: FindOneParams = { id: `${vehicleId}` };
      const date = new Date();
      const query: FindStateLogQuery = { timestamp: date.toISOString() };
      mockVehicleService.findStateLog.mockResolvedValue(vehicle);

      expect(await controller.findStateLog(params, query)).toBe(vehicle);
      expect(mockVehicleService.findStateLog).toHaveBeenCalledWith(
        vehicleId,
        date,
      );
    });
  });
});
