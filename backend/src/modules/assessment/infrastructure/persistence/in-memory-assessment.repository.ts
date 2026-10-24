import type { PronunciationAssessment } from '../../domain/entities/pronunciation-assessment.entity.js';
import type { AssessmentRepositoryPort } from '../../application/ports/out/assessment.repository.port.js';

export class InMemoryAssessmentRepository implements AssessmentRepositoryPort {
  private readonly store = new Map<string, PronunciationAssessment>();

  async save(assessment: PronunciationAssessment): Promise<void> {
    this.store.set(assessment.id, assessment);
  }

  async findById(id: string): Promise<PronunciationAssessment | null> {
    return this.store.get(id) ?? null;
  }
}
