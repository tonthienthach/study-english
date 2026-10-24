export const SPEECH_ASSESSMENT = Symbol('SPEECH_ASSESSMENT');

export interface SpeechAssessmentRequest {
  audio: Buffer;
  mimeType: string;
  referenceText: string;
  locale: string;
}

/** Raw provider result, already normalised to a 0-100 scale. */
export interface SpeechAssessmentResponse {
  accuracy: number;
  fluency: number;
  completeness: number;
  words: {
    word: string;
    score: number;
    phonemes: { phoneme: string; score: number }[];
  }[];
}

/** Outbound port: any speech-scoring engine (cloud API or local model) implements this. */
export interface SpeechAssessmentPort {
  assess(request: SpeechAssessmentRequest): Promise<SpeechAssessmentResponse>;
}
