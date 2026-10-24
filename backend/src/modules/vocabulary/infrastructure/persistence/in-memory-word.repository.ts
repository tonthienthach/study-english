import { Word } from '../../domain/entities/word.entity.js';
import { WordRepositoryPort } from '../../application/ports/out/word.repository.port.js';

// Placeholder adapter; swap for a Prisma-backed adapter implementing the same port.
export class InMemoryWordRepository implements WordRepositoryPort {
  private readonly store = new Map<string, Word>();

  async save(word: Word): Promise<void> {
    this.store.set(word.id, word);
  }

  async findAll(): Promise<Word[]> {
    return [...this.store.values()];
  }
}
