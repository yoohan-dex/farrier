import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/GET /', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/GetQuestions 1 /question/1', () => {
    return request(app.getHttpServer())
      .get('/question?type=1&page=1&size=1')
      .expect(200);
  });

  it('/GetQuestions 2 /question/2', () => {
    return request(app.getHttpServer())
      .get('/question/?type=2&page=1&size=1')
      .expect(200);
  });

  it('/GetQuestions 3 /question/3', () => {
    return request(app.getHttpServer())
      .get('/question/?type=3&page=1&size=1')
      .expect(200);
  });
});
