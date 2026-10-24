import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  ASSESS_PRONUNCIATION_USE_CASE,
  type AssessPronunciationPort,
} from '../../application/ports/in/assess-pronunciation.port.js';
import { AssessPronunciationDto } from './dto/assess-pronunciation.dto.js';

@Controller('assessments')
export class AssessmentController {
  constructor(
    @Inject(ASSESS_PRONUNCIATION_USE_CASE)
    private readonly assessPronunciation: AssessPronunciationPort,
  ) {}

  @Post('pronunciation')
  async assess(@Body() dto: AssessPronunciationDto) {
    const a = await this.assessPronunciation.execute({
      audio: Buffer.from(dto.audioBase64, 'base64'),
      mimeType: dto.mimeType ?? 'audio/wav',
      referenceText: dto.referenceText,
      locale: dto.locale ?? 'en-US',
    });
    return {
      id: a.id,
      overall: a.overall.value,
      accuracy: a.scores.accuracy.value,
      fluency: a.scores.fluency.value,
      completeness: a.scores.completeness.value,
      words: a.words.map((w) => ({
        word: w.word,
        score: w.score.value,
        phonemes: w.phonemes.map((p) => ({ phoneme: p.phoneme, score: p.score.value })),
      })),
    };
  }
}
