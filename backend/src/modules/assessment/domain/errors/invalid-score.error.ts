export class InvalidScoreError extends Error {
  constructor(value: number) {
    super(`Score must be a number between 0 and 100, got ${value}`);
    this.name = 'InvalidScoreError';
  }
}
