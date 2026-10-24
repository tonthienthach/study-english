import { Body, Controller, Inject, Post, UseFilters } from '@nestjs/common';
import { VocabularyExceptionFilter } from './vocabulary-exception.filter.js';
import {
  CREATE_WORD_USE_CASE,
  type CreateWordPort,
} from '../../application/ports/in/create-word.port.js';
import { CreateWordDto } from './dto/create-word.dto.js';

@Controller('words')
@UseFilters(VocabularyExceptionFilter)
export class VocabularyController {
  constructor(
    @Inject(CREATE_WORD_USE_CASE) private readonly createWord: CreateWordPort,
  ) {}

  @Post()
  create(@Body() dto: CreateWordDto) {
    return this.createWord.execute(dto);
  }
}
