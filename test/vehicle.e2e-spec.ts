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
    });

    it('should return 400 if make is missing', async () => {
      const createVehicleDto = {
        model: 'X5',
      };
      await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(400);
      // TODO - add error message as well
    });

    it('should return 400 if model is missing', async () => {
      const createVehicleDto = {
        make: 'BMW',
      };
      await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(400);
    });

    it('should return 400 if make is not string', async () => {
      const createVehicleDto = {
        make: 123,
        model: 'X5',
      };
      await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(400);
    });

    it('should return 400 if model is not string', async () => {
      const createVehicleDto = {
        make: 'BMW',
        model: 456456.35,
      };
      await request(app.getHttpServer())
        .post('/vehicle')
        .send(createVehicleDto)
        .expect(400);
    });
  });

  describe('/vehicle (GET)', () => {
    it('should return an array of vehicles', async () => {
      const response = await request(app.getHttpServer())
        .get('/vehicle')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
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
        state: 'sold',
      };

      const response = await request(app.getHttpServer())
        .patch(`/vehicle/${createdVehicle.id}`)
        .send(updateVehicleDto)
        .expect(200);

      expect(response.body.make).toBe(updateVehicleDto.make);
      expect(response.body.model).toBe(updateVehicleDto.model);
      expect(response.body.state).toBe(updateVehicleDto.state);
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

      await request(app.getHttpServer())
        .get(`/vehicle/${createdVehicle.id}/state-log`)
        .query({ timestamp: timestampBeforeCreate })
        .expect(404);
    });

    it('should return 404 if vehicle not found', async () => {
      const nonExistentId = 999999; // An ID that is unlikely to exist

      await request(app.getHttpServer())
        .get(`/vehicle/${nonExistentId}/state-log`)
        .query({ timestamp: new Date().toISOString() })
        .expect(404);
    });
  });
});
