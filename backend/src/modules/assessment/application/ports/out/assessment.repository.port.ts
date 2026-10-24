import type { PronunciationAssessment } from '../../../domain/entities/pronunciation-assessment.entity.js';

export const ASSESSMENT_REPOSITORY = Symbol('ASSESSMENT_REPOSITORY');

export interface AssessmentRepositoryPort {
  save(assessment: PronunciationAssessment): Promise<void>;
  findById(id: string): Promise<PronunciationAssessment | null>;
}
