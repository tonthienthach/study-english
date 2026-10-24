import { ValidationPipe, type INestApplication } from '@nestjs/common';

/** Shared HTTP setup so the real app and e2e tests behave the same. */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
}
