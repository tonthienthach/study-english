import type {
  SpeechAssessmentPort,
  SpeechAssessmentRequest,
  SpeechAssessmentResponse,
} from '../../application/ports/out/speech-assessment.port.js';

export interface AzureSpeechConfig {
  key: string;
  region: string;
}

interface AzureScore {
  AccuracyScore?: number;
  FluencyScore?: number;
  CompletenessScore?: number;
}

interface AzureDetailedResponse {
  RecognitionStatus: string;
  NBest?: {
    PronunciationAssessment?: AzureScore;
    Words?: {
      Word: string;
      PronunciationAssessment?: AzureScore;
      Phonemes?: { Phoneme: string; PronunciationAssessment?: AzureScore }[];
    }[];
  }[];
}

export class AzureSpeechAssessmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AzureSpeechAssessmentError';
  }
}

/**
 * Azure Speech "short audio" REST pronunciation assessment.
 * Expects 16 kHz mono PCM WAV, up to ~30 seconds.
 */
export class AzureSpeechAssessmentAdapter implements SpeechAssessmentPort {
  constructor(private readonly config: AzureSpeechConfig) {}

  async assess(request: SpeechAssessmentRequest): Promise<SpeechAssessmentResponse> {
    const params = Buffer.from(
      JSON.stringify({
        ReferenceText: request.referenceText,
        GradingSystem: 'HundredMark',
        Granularity: 'Phoneme',
        Dimension: 'Comprehensive',
        EnableMiscue: true,
      }),
    ).toString('base64');

    const url =
      `https://${this.config.region}.stt.speech.microsoft.com` +
      '/speech/recognition/conversation/cognitiveservices/v1' +
      `?language=${encodeURIComponent(request.locale)}&format=detailed`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.config.key,
        'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
        Accept: 'application/json',
        'Pronunciation-Assessment': params,
      },
      body: new Uint8Array(request.audio),
    });

    if (!res.ok) {
      throw new AzureSpeechAssessmentError(`Azure Speech returned HTTP ${res.status}`);
    }

    const body = (await res.json()) as AzureDetailedResponse;
    const best = body.NBest?.[0];
    if (body.RecognitionStatus !== 'Success' || !best) {
      throw new AzureSpeechAssessmentError(
        `Azure Speech recognition status: ${body.RecognitionStatus}`,
      );
    }

    const overall = best.PronunciationAssessment ?? {};
    return {
      accuracy: overall.AccuracyScore ?? 0,
      fluency: overall.FluencyScore ?? 0,
      completeness: overall.CompletenessScore ?? 0,
      words: (best.Words ?? []).map((w) => ({
        word: w.Word,
        score: w.PronunciationAssessment?.AccuracyScore ?? 0,
        phonemes: (w.Phonemes ?? []).map((p) => ({
          phoneme: p.Phoneme,
          score: p.PronunciationAssessment?.AccuracyScore ?? 0,
        })),
      })),
    };
  }
}
