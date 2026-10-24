import { randomUUID } from 'node:crypto';
import { Entity } from '../../../../shared/domain/entity.base.js';
import { InvalidWordError } from '../errors/invalid-word.error.js';

export interface WordProps {
  term: string;
  meaning: string;
  createdAt: Date;
}

export class Word extends Entity {
  private constructor(
    id: string,
    public readonly term: string,
    public readonly meaning: string,
    public readonly createdAt: Date,
  ) {
    super(id);
  }

  static create(props: Pick<WordProps, 'term' | 'meaning'>): Word {
    const term = props.term?.trim();
    const meaning = props.meaning?.trim();
    if (!term || !meaning) throw new InvalidWordError();
    return new Word(randomUUID(), term, meaning, new Date());
  }

  static restore(id: string, props: WordProps): Word {
    return new Word(id, props.term, props.meaning, props.createdAt);
  }
}
