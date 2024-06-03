import { validate } from 'class-validator';
import { UpdateVehicleDto } from './update-vehicle.dto';
import { VehicleStateEnum } from '../types/VehicleStateEnum';

describe('UpdateVehicleDto', () => {
  it('should validate successfully when all properties are valid', async () => {
    const dto = new UpdateVehicleDto();
    dto.make = 'Toyota';
    dto.model = 'Corolla';
    dto.state = VehicleStateEnum.Sold;

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should validate successfully when state is missing', async () => {
    const dto = new UpdateVehicleDto();
    dto.make = 'Toyota';
    dto.model = 'Corolla';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail validation when state is not a valid enum value', async () => {
    const dto = new UpdateVehicleDto();
    dto.make = 'Toyota';
    dto.model = 'Corolla';
    dto.state = 'INVALID_STATE' as any; // Invalid enum value

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('state');
    expect(errors[0].constraints).toHaveProperty('isEnum');
  });

  it('should fail validation when make is not a string', async () => {
    const dto = new UpdateVehicleDto();
    dto.make = 123 as any; // Intentionally wrong type
    dto.model = 'Corolla';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('make');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation when model is not a string', async () => {
    const dto = new UpdateVehicleDto();
    dto.make = 'Toyota';
    dto.model = 123 as any; // Intentionally wrong type

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('model');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should validate successfully when make is missing', async () => {
    const dto = new UpdateVehicleDto();
    dto.model = 'Corolla';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should validate successfully when model is missing', async () => {
    const dto = new UpdateVehicleDto();
    dto.make = 'Toyota';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
