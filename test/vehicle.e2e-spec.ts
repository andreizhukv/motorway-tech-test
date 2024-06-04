import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { VehicleStateEnum } from './../src/vehicle/types/VehicleStateEnum';

describe('VehicleController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/vehicle (POST)', () => {
    it('should create a new vehicle', async () => {
      const createVehicleDto = {
        make: 'BMW',
        model: 'X5',
      };
      const response = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.make).toEqual(createVehicleDto.make);
      expect(response.body.model).toEqual(createVehicleDto.model);
      expect(response.body.state).toEqual(VehicleStateEnum.Quoted);
    });

    it('should return 400 if make is missing', async () => {
      const createVehicleDto = {
        model: 'X5',
      };
      const response = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(400);
      expect(response.body.message).toContain('make should not be empty');
    });

    it('should return 400 if make is not string', async () => {
      const createVehicleDto = {
        model: 'X5',
        make: 123,
      };
      const response = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(400);
      expect(response.body.message).toContain('make must be a string');
    });

    it('should return 400 if make is empty string', async () => {
      const createVehicleDto = {
        model: 'X5',
        make: '',
      };
      const response = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(400);
      expect(response.body.message).toContain('make should not be empty');
    });

    it('should return 400 if model is missing', async () => {
      const createVehicleDto = {
        make: 'BMW',
      };
      const response = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(400);
      expect(response.body.message).toContain('model should not be empty');
    });

    it('should return 400 if model is not string', async () => {
      const createVehicleDto = {
        make: 'BMW',
        model: 123,
      };
      const response = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(400);
      expect(response.body.message).toContain('model must be a string');
    });

    it('should return 400 if model is empty string', async () => {
      const createVehicleDto = {
        model: '',
        make: 'bla',
      };
      const response = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(400);
      expect(response.body.message).toContain('model should not be empty');
    });
  });

  describe('/vehicle (GET)', () => {
    it('should return an array of vehicles', async () => {
      await request(app.getHttpServer())
        .post('/vehicle')
        .send({
          make: 'BMW',
          model: 'X5',
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/vehicle')
        .expect(200);

      // it can be improved once response is sorted by date created and pagination implemented
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length > 0).toBe(true);
      expect(response.body[0].make).toBeDefined();
      expect(response.body[0].model).toBeDefined();
      expect(response.body[0].state).toBeDefined();
      expect(response.body[0].id).toBeDefined();
    });
  });

  describe('/vehicle/:id (GET)', () => {
    it('should return a single vehicle', async () => {
      const createVehicleDto = {
        make: 'Audi',
        model: 'Q7',
      };
      const { body: createdVehicle } = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/vehicle/${createdVehicle.id}`)
        .expect(200);

      expect(response.body.id).toBe(createdVehicle.id);
      expect(response.body.make).toBe(createVehicleDto.make);
      expect(response.body.model).toBe(createVehicleDto.model);
      expect(response.body.state).toBe(VehicleStateEnum.Quoted);
    });
  });

  describe('/vehicle/:id (PATCH)', () => {
    it('should update a vehicle', async () => {
      const createVehicleDto = {
        make: 'Tesla',
        model: 'Model S',
      };
      const { body: createdVehicle } = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(201);

      const updateVehicleDto = {
        make: 'Volve',
        model: 'CX40',
        state: VehicleStateEnum.Sold,
      };

      const response = await request(app.getHttpServer())
        .patch(`/vehicle/${createdVehicle.id}`)
        .send(updateVehicleDto)
        .expect(200);

      expect(response.body.make).toBe(updateVehicleDto.make);
      expect(response.body.model).toBe(updateVehicleDto.model);
      expect(response.body.state).toBe(updateVehicleDto.state);
    });

    it.each([
      {
        updateVehicleDto: { model: 'BMW' },
        field: 'model',
      },
      {
        updateVehicleDto: { make: 'X5' },
        field: 'make',
      },
      {
        updateVehicleDto: { state: VehicleStateEnum.Sold },
        field: 'state',
      },
    ])(
      'should allow update with only $field present',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async ({ updateVehicleDto, field }) => {
        const createVehicleDto = {
          make: 'Audi',
          model: 'Q7',
        };
        const { body: createdVehicle } = await request(app.getHttpServer())
          .post('/vehicle')
          .send(createVehicleDto)
          .expect(201);

        await request(app.getHttpServer())
          .patch(`/vehicle/${createdVehicle.id}`)
          .send(updateVehicleDto)
          .expect(200);
      },
    );

    it('should return 400 if make is not string', async () => {
      const createVehicleDto = {
        make: 'Tesla',
        model: 'Model S',
      };
      const { body: createdVehicle } = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(201);

      const updateVehicleDto = {
        make: 234,
        model: 'CX40',
        state: VehicleStateEnum.Sold,
      };

      const response = await request(app.getHttpServer())
        .patch(`/vehicle/${createdVehicle.id}`)
        .send(updateVehicleDto)
        .expect(400);
      expect(response.body.message).toContain('make must be a string');
    });

    it('should return 400 if make is empty string', async () => {
      const createVehicleDto = {
        make: 'Tesla',
        model: 'Model S',
      };
      const { body: createdVehicle } = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(201);

      const updateVehicleDto = {
        make: '',
        model: 'CX40',
        state: VehicleStateEnum.Sold,
      };

      const response = await request(app.getHttpServer())
        .patch(`/vehicle/${createdVehicle.id}`)
        .send(updateVehicleDto)
        .expect(400);
      expect(response.body.message).toContain('make should not be empty');
    });

    it('should return 400 if model is not string', async () => {
      const createVehicleDto = {
        make: 'Tesla',
        model: 'Model S',
      };
      const { body: createdVehicle } = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(201);

      const updateVehicleDto = {
        make: 'Fiat',
        model: 2,
        state: VehicleStateEnum.Sold,
      };

      const response = await request(app.getHttpServer())
        .patch(`/vehicle/${createdVehicle.id}`)
        .send(updateVehicleDto)
        .expect(400);
      expect(response.body.message).toContain('model must be a string');
    });

    it('should return 400 if model is empty string', async () => {
      const createVehicleDto = {
        make: 'Tesla',
        model: 'Model S',
      };
      const { body: createdVehicle } = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(201);

      const updateVehicleDto = {
        make: '123',
        model: '',
        state: VehicleStateEnum.Sold,
      };

      const response = await request(app.getHttpServer())
        .patch(`/vehicle/${createdVehicle.id}`)
        .send(updateVehicleDto)
        .expect(400);
      expect(response.body.message).toContain('model should not be empty');
    });

    it('should return 400 if state is not sold/quoted/selling', async () => {
      const createVehicleDto = {
        make: 'Tesla',
        model: 'Model S',
      };
      const { body: createdVehicle } = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(201);

      const updateVehicleDto = {
        make: 'Fiat',
        model: 'bla',
        state: 'resold',
      };

      const response = await request(app.getHttpServer())
        .patch(`/vehicle/${createdVehicle.id}`)
        .send(updateVehicleDto)
        .expect(400);
      expect(response.body.message).toContain(
        'state must be one of the following values: quoted, selling, sold',
      );
    });
  });

  describe('/vehicle/:id/state-log (GET)', () => {
    it('should return vehicle with state at timestamp', async () => {
      const createVehicleDto = {
        make: 'Toyota',
        model: 'Corolla',
      };
      const { body: createdVehicle } = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(201);

      const dateAfterCreate = new Date();
      const timestampAfterCreate = dateAfterCreate.toISOString();

      const quotedResponse = await request(app.getHttpServer())
        .get(`/vehicle/${createdVehicle.id}/state-log`)
        .query({ timestamp: timestampAfterCreate })
        .expect(200);

      expect(quotedResponse.body.id).toBe(createdVehicle.id);
      expect(quotedResponse.body.state).toBe(createdVehicle.state);

      const updateVehicleDto = {
        state: VehicleStateEnum.Selling,
      };

      await request(app.getHttpServer())
        .patch(`/vehicle/${createdVehicle.id}`)
        .send(updateVehicleDto)
        .expect(200);

      const timestampAfterUpdate = new Date().toISOString();

      const sellingResponse = await request(app.getHttpServer())
        .get(`/vehicle/${createdVehicle.id}/state-log`)
        .query({ timestamp: timestampAfterUpdate })
        .expect(200);

      expect(sellingResponse.body.state).toBe(updateVehicleDto.state);
    });

    it('should return 404 if timestamp is before vehicle creation', async () => {
      const createVehicleDto = {
        make: 'Toyota',
        model: 'Corolla',
      };
      const { body: createdVehicle } = await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(201);

      const dateAfterCreate = new Date();
      const timestampAfterCreate = dateAfterCreate.toISOString();

      await request(app.getHttpServer())
        .get(`/vehicle/${createdVehicle.id}/state-log`)
        .query({ timestamp: timestampAfterCreate })
        .expect(200);

      const hourInMs = 3600000;
      const timestampBeforeCreate = new Date(
        dateAfterCreate.getTime() - hourInMs,
      );

      const response = await request(app.getHttpServer())
        .get(`/vehicle/${createdVehicle.id}/state-log`)
        .query({ timestamp: timestampBeforeCreate })
        .expect(404);

      expect(response.body.message).toEqual(
        `Vehicle with ID ${createdVehicle.id} not found on ${timestampBeforeCreate}.`,
      );
    });

    it('should return 404 if vehicle not found', async () => {
      const nonExistentId = 999999; // An ID that is unlikely to exist

      const date = new Date();
      const response = await request(app.getHttpServer())
        .get(`/vehicle/${nonExistentId}/state-log`)
        .query({ timestamp: date.toISOString() })
        .expect(404);

      expect(response.body.message).toEqual(
        `Vehicle with ID ${nonExistentId} not found on ${date}.`,
      );
    });
  });
});
