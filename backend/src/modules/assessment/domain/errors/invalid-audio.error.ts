export class InvalidAudioError extends Error {
  constructor() {
    super('Audio must not be empty');
    this.name = 'InvalidAudioError';
  }
}
