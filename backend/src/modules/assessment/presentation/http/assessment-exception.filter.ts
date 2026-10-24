import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { InvalidAudioError } from '../../domain/errors/invalid-audio.error.js';

/** Maps client-caused domain errors to HTTP 400. */
@Catch(InvalidAudioError)
export class AssessmentExceptionFilter implements ExceptionFilter {
  catch(error: InvalidAudioError, host: ArgumentsHost): void {
    const exception = new BadRequestException(error.message);
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(exception.getStatus())
      .json(exception.getResponse());
  }
}
