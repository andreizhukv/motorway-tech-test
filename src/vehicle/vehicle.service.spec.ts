import { Test, TestingModule } from '@nestjs/testing';
import { VehicleService } from './vehicle.service';
import { Vehicle } from './entities/vehicle.entity';
import { StateLog } from './entities/state-log.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { NotFoundException } from '@nestjs/common';
import { VehicleStateEnum } from './types/VehicleStateEnum';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

describe('VehicleService', () => {
  let service: VehicleService;

  const mockVehicleRepository = {
    create: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
    createQueryBuilder: jest.fn(),
  };

  const mockStateLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockVehicleRepository,
        },
        {
          provide: getRepositoryToken(StateLog),
          useValue: mockStateLogRepository,
        },
      ],
    }).compile();

    service = module.get<VehicleService>(VehicleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new vehicle and state log', async () => {
      const createVehicleDto: CreateVehicleDto = {
        make: 'BMW',
        model: 'X5',
      };
      const vehicle = new Vehicle();
      const savedVehicle = new Vehicle();
      const stateLog = new StateLog();

      mockVehicleRepository.create.mockReturnValue(vehicle);
      const transactionalEntityManager = {
        save: jest
          .fn()
          .mockResolvedValueOnce(savedVehicle)
          .mockResolvedValueOnce(stateLog),
      };
      mockVehicleRepository.manager.transaction.mockImplementation(async (cb) =>
        cb(transactionalEntityManager),
      );
      mockStateLogRepository.create.mockReturnValue(stateLog);

      const result = await service.create(createVehicleDto);

      expect(result).toBe(savedVehicle);
      expect(mockVehicleRepository.create).toHaveBeenCalledWith(
        createVehicleDto,
      );
      expect(mockStateLogRepository.create).toHaveBeenCalledWith({
        vehicle: savedVehicle,
        state: savedVehicle.state,
      });
      expect(mockVehicleRepository.manager.transaction).toHaveBeenCalledTimes(
        1,
      );
      expect(transactionalEntityManager.save).toHaveBeenCalledTimes(2);
      expect(transactionalEntityManager.save).toHaveBeenNthCalledWith(
        1,
        vehicle,
      );
      expect(transactionalEntityManager.save).toHaveBeenNthCalledWith(
        2,
        stateLog,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of vehicles', async () => {
      const vehicles = [new Vehicle()];
      mockVehicleRepository.find.mockReturnValue(vehicles);

      expect(await service.findAll()).toBe(vehicles);
    });
  });

  describe('findOne', () => {
    it('should return a vehicle', async () => {
      const vehicle = new Vehicle();
      mockVehicleRepository.findOneBy.mockReturnValue(vehicle);

      expect(await service.findOne(1)).toBe(vehicle);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockVehicleRepository.findOneBy.mockReturnValue(undefined);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it.each([
      {
        targetState: VehicleStateEnum.Sold,
        initialState: VehicleStateEnum.Quoted,
        isStateUpdated: true,
        description: 'state changed from quoted to sold',
      },
      {
        targetState: undefined,
        initialState: VehicleStateEnum.Sold,
        isStateUpdated: false,
        description: 'state is not passed in UpdateVehicleDto',
      },
      {
        targetState: VehicleStateEnum.Selling,
        initialState: VehicleStateEnum.Selling,
        isStateUpdated: false,
        description: 'state is the same',
      },
    ])(
      'should update a vehicle and create a state log if $description',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async ({ targetState, initialState, isStateUpdated, description }) => {
        const updateVehicleDto: UpdateVehicleDto = {
          make: 'BMW',
          ...(targetState ? { state: targetState } : {}),
        };
        const vehicle = new Vehicle();
        vehicle.state = initialState;
        const updatedVehicle = new Vehicle();
        updatedVehicle.state = targetState || initialState;
        const stateLog = new StateLog();

        mockVehicleRepository.findOneBy.mockResolvedValue(vehicle);
        const transactionalEntityManager = {
          save: jest
            .fn()
            .mockResolvedValueOnce(updatedVehicle)
            .mockResolvedValueOnce(stateLog),
        };
        mockVehicleRepository.manager.transaction.mockImplementation(
          async (cb) => cb(transactionalEntityManager),
        );
        mockStateLogRepository.create.mockReturnValue(stateLog);

        const result = await service.update(1, updateVehicleDto);

        expect(result).toBe(updatedVehicle);
        expect(mockVehicleRepository.manager.transaction).toHaveBeenCalledTimes(
          1,
        );
        expect(transactionalEntityManager.save).toHaveBeenNthCalledWith(
          1,
          vehicle,
        );
        if (isStateUpdated) {
          expect(mockStateLogRepository.create).toHaveBeenCalledWith({
            vehicle: updatedVehicle,
            state: updatedVehicle.state,
          });
          expect(transactionalEntityManager.save).toHaveBeenNthCalledWith(
            2,
            stateLog,
          );
        } else {
          expect(mockStateLogRepository.create).not.toHaveBeenCalled();
        }
      },
    );

    it('should throw NotFoundException if vehicle not found', async () => {
      mockVehicleRepository.findOneBy.mockReturnValue(undefined);

      await expect(
        service.update(1, { make: 'BMW', state: VehicleStateEnum.Selling }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findStateLog', () => {
    it('should return a vehicle with the latest state log before the timestamp', async () => {
      const vehicle = new Vehicle();
      const stateLog = new StateLog();
      stateLog.timestamp = new Date();
      vehicle.stateLogs = [stateLog];

      const queryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(vehicle),
      };

      mockVehicleRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findStateLog(1, new Date());

      expect(result).toBe(vehicle);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      const queryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      };

      mockVehicleRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(service.findStateLog(1, new Date())).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
