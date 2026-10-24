import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

describe('POST /words (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(() => app.close());

  it('creates a word', async () => {
    const res = await request(app.getHttpServer())
      .post('/words')
      .send({ term: ' apple ', meaning: 'quả táo' })
      .expect(201);

    expect(res.body).toMatchObject({ term: 'apple', meaning: 'quả táo' });
    expect(res.body.id).toEqual(expect.any(String));
  });

  it('rejects missing fields with 400', async () => {
    await request(app.getHttpServer()).post('/words').send({ term: 'apple' }).expect(400);
  });

  it('rejects whitespace-only fields with 400', async () => {
    await request(app.getHttpServer())
      .post('/words')
      .send({ term: '   ', meaning: 'x' })
      .expect(400);
  });
});
