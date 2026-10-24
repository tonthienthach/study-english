import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  CREATE_WORD_USE_CASE,
  type CreateWordPort,
} from '../../application/ports/in/create-word.port.js';
import { CreateWordDto } from './dto/create-word.dto.js';

@Controller('words')
export class VocabularyController {
  constructor(
    @Inject(CREATE_WORD_USE_CASE) private readonly createWord: CreateWordPort,
  ) {}

  @Post()
  create(@Body() dto: CreateWordDto) {
    return this.createWord.execute(dto);
  }
}
