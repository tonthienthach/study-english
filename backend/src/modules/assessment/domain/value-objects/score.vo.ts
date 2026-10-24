import { InvalidScoreError } from '../errors/invalid-score.error.js';

export class Score {
  private constructor(public readonly value: number) {}

  static of(value: number): Score {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new InvalidScoreError(value);
    }
    return new Score(Math.round(value * 10) / 10);
  }

  static average(scores: Score[]): Score {
    if (scores.length === 0) return Score.of(0);
    return Score.of(scores.reduce((sum, s) => sum + s.value, 0) / scores.length);
  }
}
