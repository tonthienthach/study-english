import { Word } from '../../../domain/entities/word.entity.js';

export const WORD_REPOSITORY = Symbol('WORD_REPOSITORY');

export interface WordRepositoryPort {
  save(word: Word): Promise<void>;
  findAll(): Promise<Word[]>;
}
