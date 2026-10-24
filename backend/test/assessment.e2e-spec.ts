import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

describe('POST /assessments/pronunciation (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.SPEECH_ASSESSMENT_PROVIDER = 'fake';
    process.env.AUDIO_CONVERTER = 'none';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(() => app.close());

  const audioBase64 = Buffer.from('fake-wav').toString('base64');

  it('returns scores per word for a valid request', async () => {
    const res = await request(app.getHttpServer())
      .post('/assessments/pronunciation')
      .send({ referenceText: 'hello world', audioBase64 })
      .expect(201);

    expect(res.body).toMatchObject({
      overall: expect.any(Number),
      accuracy: 80,
      fluency: 75,
      completeness: 100,
    });
    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body.words.map((w: { word: string }) => w.word)).toEqual([
      'hello',
      'world',
    ]);
  });

  it('rejects a missing referenceText with 400', async () => {
    await request(app.getHttpServer())
      .post('/assessments/pronunciation')
      .send({ audioBase64 })
      .expect(400);
  });

  it('rejects non-base64 audio with 400', async () => {
    await request(app.getHttpServer())
      .post('/assessments/pronunciation')
      .send({ referenceText: 'hello', audioBase64: 'not base64!!' })
      .expect(400);
  });

  it('rejects empty audio with 400', async () => {
    await request(app.getHttpServer())
      .post('/assessments/pronunciation')
      .send({ referenceText: 'hello', audioBase64: '' })
      .expect(400);
  });
});
