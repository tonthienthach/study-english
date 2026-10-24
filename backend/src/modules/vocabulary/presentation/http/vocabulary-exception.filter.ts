import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { InvalidWordError } from '../../domain/errors/invalid-word.error.js';

/** Maps client-caused domain errors to HTTP 400. */
@Catch(InvalidWordError)
export class VocabularyExceptionFilter implements ExceptionFilter {
  catch(error: InvalidWordError, host: ArgumentsHost): void {
    const exception = new BadRequestException(error.message);
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(exception.getStatus())
      .json(exception.getResponse());
  }
}
