import { Word } from '../../domain/entities/word.entity.js';
import { CreateWordCommand, CreateWordPort } from '../ports/in/create-word.port.js';
import { WordRepositoryPort } from '../ports/out/word.repository.port.js';

export class CreateWordUseCase implements CreateWordPort {
  constructor(private readonly words: WordRepositoryPort) {}

  async execute(command: CreateWordCommand): Promise<Word> {
    const word = Word.create(command);
    await this.words.save(word);
    return word;
  }
}
