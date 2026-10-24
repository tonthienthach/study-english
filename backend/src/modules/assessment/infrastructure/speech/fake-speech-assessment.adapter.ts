import type {
  SpeechAssessmentPort,
  SpeechAssessmentRequest,
  SpeechAssessmentResponse,
} from '../../application/ports/out/speech-assessment.port.js';

/**
 * Deterministic stand-in so the module runs end to end without a provider.
 * Replace with a real adapter (cloud pronunciation API or a local model)
 * implementing SpeechAssessmentPort; nothing above this layer changes.
 */
export class FakeSpeechAssessmentAdapter implements SpeechAssessmentPort {
  async assess(request: SpeechAssessmentRequest): Promise<SpeechAssessmentResponse> {
    const words = request.referenceText.split(/\s+/).filter(Boolean);
    return {
      accuracy: 80,
      fluency: 75,
      completeness: 100,
      words: words.map((word) => ({ word, score: 80, phonemes: [] })),
    };
  }
}
