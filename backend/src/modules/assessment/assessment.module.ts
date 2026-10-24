import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AUDIO_CONVERTER,
  type AudioConverterPort,
} from './application/ports/out/audio-converter.port.js';
import { FfmpegAudioConverter } from './infrastructure/audio/ffmpeg-audio-converter.adapter.js';
import { PassthroughAudioConverter } from './infrastructure/audio/passthrough-audio-converter.adapter.js';
import { AzureSpeechAssessmentAdapter } from './infrastructure/speech/azure-speech-assessment.adapter.js';
import { ASSESS_PRONUNCIATION_USE_CASE } from './application/ports/in/assess-pronunciation.port.js';
import {
  ASSESSMENT_REPOSITORY,
  type AssessmentRepositoryPort,
} from './application/ports/out/assessment.repository.port.js';
import {
  SPEECH_ASSESSMENT,
  type SpeechAssessmentPort,
} from './application/ports/out/speech-assessment.port.js';
import { AssessPronunciationUseCase } from './application/use-cases/assess-pronunciation.use-case.js';
import { InMemoryAssessmentRepository } from './infrastructure/persistence/in-memory-assessment.repository.js';
import { FakeSpeechAssessmentAdapter } from './infrastructure/speech/fake-speech-assessment.adapter.js';
import { AssessmentController } from './presentation/http/assessment.controller.js';

@Module({
  controllers: [AssessmentController],
  providers: [
    {
      provide: SPEECH_ASSESSMENT,
      useFactory: (config: ConfigService): SpeechAssessmentPort => {
        if (config.get('SPEECH_ASSESSMENT_PROVIDER') !== 'azure') {
          return new FakeSpeechAssessmentAdapter();
        }
        const key = config.get<string>('AZURE_SPEECH_KEY');
        const region = config.get<string>('AZURE_SPEECH_REGION');
        if (!key || !region) {
          throw new Error(
            'AZURE_SPEECH_KEY and AZURE_SPEECH_REGION are required when SPEECH_ASSESSMENT_PROVIDER=azure',
          );
        }
        return new AzureSpeechAssessmentAdapter({ key, region });
      },
      inject: [ConfigService],
    },
    { provide: ASSESSMENT_REPOSITORY, useClass: InMemoryAssessmentRepository },
    {
      provide: AUDIO_CONVERTER,
      useFactory: (config: ConfigService): AudioConverterPort =>
        config.get('AUDIO_CONVERTER') === 'ffmpeg'
          ? new FfmpegAudioConverter(config.get<string>('FFMPEG_PATH') ?? 'ffmpeg')
          : new PassthroughAudioConverter(),
      inject: [ConfigService],
    },
    {
      provide: ASSESS_PRONUNCIATION_USE_CASE,
      useFactory: (
        s: SpeechAssessmentPort,
        r: AssessmentRepositoryPort,
        c: AudioConverterPort,
      ) => new AssessPronunciationUseCase(s, r, c),
      inject: [SPEECH_ASSESSMENT, ASSESSMENT_REPOSITORY, AUDIO_CONVERTER],
    },
  ],
})
export class AssessmentModule {}
