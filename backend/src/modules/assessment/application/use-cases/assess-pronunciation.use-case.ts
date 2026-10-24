import { PronunciationAssessment } from '../../domain/entities/pronunciation-assessment.entity.js';
import { InvalidAudioError } from '../../domain/errors/invalid-audio.error.js';
import { Score } from '../../domain/value-objects/score.vo.js';
import type {
  AssessPronunciationCommand,
  AssessPronunciationPort,
} from '../ports/in/assess-pronunciation.port.js';
import type { AudioConverterPort } from '../ports/out/audio-converter.port.js';
import type { AssessmentRepositoryPort } from '../ports/out/assessment.repository.port.js';
import type { SpeechAssessmentPort } from '../ports/out/speech-assessment.port.js';

export class AssessPronunciationUseCase implements AssessPronunciationPort {
  constructor(
    private readonly speech: SpeechAssessmentPort,
    private readonly assessments: AssessmentRepositoryPort,
    private readonly converter: AudioConverterPort,
  ) {}

  async execute(command: AssessPronunciationCommand): Promise<PronunciationAssessment> {
    if (command.audio.length === 0) throw new InvalidAudioError();

    const wav = await this.converter.toWav16kMono(command.audio, command.mimeType);
    const raw = await this.speech.assess({
      ...command,
      audio: wav,
      mimeType: 'audio/wav',
    });

    const assessment = PronunciationAssessment.create({
      referenceText: command.referenceText,
      locale: command.locale,
      scores: {
        accuracy: Score.of(raw.accuracy),
        fluency: Score.of(raw.fluency),
        completeness: Score.of(raw.completeness),
      },
      words: raw.words.map((w) => ({
        word: w.word,
        score: Score.of(w.score),
        phonemes: w.phonemes.map((p) => ({
          phoneme: p.phoneme,
          score: Score.of(p.score),
        })),
      })),
    });

    await this.assessments.save(assessment);
    return assessment;
  }
}
