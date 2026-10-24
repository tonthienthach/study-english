import { Module } from '@nestjs/common';
import { CREATE_WORD_USE_CASE } from './application/ports/in/create-word.port.js';
import {
  WORD_REPOSITORY,
  type WordRepositoryPort,
} from './application/ports/out/word.repository.port.js';
import { CreateWordUseCase } from './application/use-cases/create-word.use-case.js';
import { InMemoryWordRepository } from './infrastructure/persistence/in-memory-word.repository.js';
import { VocabularyController } from './presentation/http/vocabulary.controller.js';

@Module({
  controllers: [VocabularyController],
  providers: [
    { provide: WORD_REPOSITORY, useClass: InMemoryWordRepository },
    {
      provide: CREATE_WORD_USE_CASE,
      useFactory: (repo: WordRepositoryPort) => new CreateWordUseCase(repo),
      inject: [WORD_REPOSITORY],
    },
  ],
})
export class VocabularyModule {}
