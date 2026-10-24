import type { UseCase } from '../../../../../shared/application/use-case.js';
import type { PronunciationAssessment } from '../../../domain/entities/pronunciation-assessment.entity.js';

export interface AssessPronunciationCommand {
  audio: Buffer;
  mimeType: string;
  referenceText: string;
  locale: string;
}

export const ASSESS_PRONUNCIATION_USE_CASE = Symbol('ASSESS_PRONUNCIATION_USE_CASE');
export type AssessPronunciationPort = UseCase<
  AssessPronunciationCommand,
  PronunciationAssessment
>;
