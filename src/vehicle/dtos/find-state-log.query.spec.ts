import { validate } from 'class-validator';
import { FindStateLogQuery } from './find-state-log.query';

describe('FindStateLogQuery', () => {
  it('should validate successfully when timestamp is a valid date string', async () => {
    const query = new FindStateLogQuery();
    query.timestamp = '2023-05-31T15:00:00Z';

    const errors = await validate(query);

    expect(errors.length).toBe(0);
  });

  it('should fail validation when timestamp is not a string', async () => {
    const query = new FindStateLogQuery();
    query.timestamp = 123456789 as any; // Intentionally wrong type

    const errors = await validate(query);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('timestamp');
    expect(errors[0].constraints).toHaveProperty('isDateString');
  });

  it('should fail validation when timestamp is not a valid date string', async () => {
    const query = new FindStateLogQuery();
    query.timestamp = 'invalid-date-string'; // Invalid date string

    const errors = await validate(query);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('timestamp');
    expect(errors[0].constraints).toHaveProperty('isDateString');
  });

  it('should fail validation when timestamp is an empty string', async () => {
    const query = new FindStateLogQuery();
    query.timestamp = ''; // Empty string

    const errors = await validate(query);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('timestamp');
    expect(errors[0].constraints).toHaveProperty('isDateString');
  });
});
