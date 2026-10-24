import { randomUUID } from 'node:crypto';
import { Entity } from '../../../../shared/domain/entity.base.js';
import { Score } from '../value-objects/score.vo.js';

export interface PhonemeResult {
  phoneme: string;
  score: Score;
}

export interface WordResult {
  word: string;
  score: Score;
  phonemes: PhonemeResult[];
}

export interface AssessmentScores {
  accuracy: Score;
  fluency: Score;
  completeness: Score;
}

export class PronunciationAssessment extends Entity {
  private constructor(
    id: string,
    public readonly referenceText: string,
    public readonly locale: string,
    public readonly scores: AssessmentScores,
    public readonly overall: Score,
    public readonly words: readonly WordResult[],
    public readonly createdAt: Date,
  ) {
    super(id);
  }

  static create(input: {
    referenceText: string;
    locale: string;
    scores: AssessmentScores;
    words: WordResult[];
  }): PronunciationAssessment {
    const overall = Score.average([
      input.scores.accuracy,
      input.scores.fluency,
      input.scores.completeness,
    ]);
    return new PronunciationAssessment(
      randomUUID(),
      input.referenceText,
      input.locale,
      input.scores,
      overall,
      input.words,
      new Date(),
    );
  }

  weakestWords(limit = 3): WordResult[] {
    return [...this.words]
      .sort((a, b) => a.score.value - b.score.value)
      .slice(0, limit);
  }
}
