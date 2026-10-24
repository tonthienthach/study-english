import { UseCase } from '../../../../../shared/application/use-case.js';
import { Word } from '../../../domain/entities/word.entity.js';

export interface CreateWordCommand {
  term: string;
  meaning: string;
}

export const CREATE_WORD_USE_CASE = Symbol('CREATE_WORD_USE_CASE');
export type CreateWordPort = UseCase<CreateWordCommand, Word>;
