import { validate } from 'class-validator';
import { FindOneParams } from './find-one.params';

describe('FindOneParams', () => {
  it('should validate successfully when id is a number string', async () => {
    const params = new FindOneParams();
    params.id = '123';

    const errors = await validate(params);

    expect(errors.length).toBe(0);
  });

  it('should fail validation when id is not a string', async () => {
    const params = new FindOneParams();
    params.id = 123 as any; // Intentionally wrong type

    const errors = await validate(params);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('id');
    expect(errors[0].constraints).toHaveProperty('isNumberString');
  });

  it('should fail validation when id is not a number string', async () => {
    const params = new FindOneParams();
    params.id = 'abc'; // Invalid number string

    const errors = await validate(params);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('id');
    expect(errors[0].constraints).toHaveProperty('isNumberString');
  });

  it('should fail validation when id is an empty string', async () => {
    const params = new FindOneParams();
    params.id = ''; // Empty string

    const errors = await validate(params);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('id');
    expect(errors[0].constraints).toHaveProperty('isNumberString');
  });
});
