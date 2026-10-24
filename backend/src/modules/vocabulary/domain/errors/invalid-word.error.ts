export class InvalidWordError extends Error {
  constructor() {
    super('Word term and meaning must not be empty');
    this.name = 'InvalidWordError';
  }
}
