import { validate } from 'class-validator';
import { CreateVehicleDto } from './create-vehicle.dto';

describe('CreateVehicleDto', () => {
  it('should validate successfully when all properties are valid', async () => {
    const dto = new CreateVehicleDto();
    dto.make = 'Toyota';
    dto.model = 'Corolla';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail validation when make is missing', async () => {
    const dto = new CreateVehicleDto();
    dto.model = 'Corolla';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('make');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when model is missing', async () => {
    const dto = new CreateVehicleDto();
    dto.make = 'Toyota';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('model');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when make is not a string', async () => {
    const dto = new CreateVehicleDto();
    dto.make = 123 as any; // Intentionally wrong type
    dto.model = 'Corolla';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('make');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation when model is not a string', async () => {
    const dto = new CreateVehicleDto();
    dto.make = 'Toyota';
    dto.model = 123 as any; // Intentionally wrong type

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('model');
    expect(errors[0].constraints).toHaveProperty('isString');
  });
});
