import { InvalidAudioError } from '../../domain/errors/invalid-audio.error.js';
import { InvalidScoreError } from '../../domain/errors/invalid-score.error.js';
import { InMemoryAssessmentRepository } from '../../infrastructure/persistence/in-memory-assessment.repository.js';
import type { AudioConverterPort } from '../ports/out/audio-converter.port.js';
import type {
  SpeechAssessmentPort,
  SpeechAssessmentResponse,
} from '../ports/out/speech-assessment.port.js';
import { AssessPronunciationUseCase } from './assess-pronunciation.use-case.js';

const response: SpeechAssessmentResponse = {
  accuracy: 90,
  fluency: 60,
  completeness: 90,
  words: [
    { word: 'hello', score: 95, phonemes: [{ phoneme: 'h', score: 98 }] },
    { word: 'world', score: 40, phonemes: [] },
  ],
};

function setup(speechResponse = response) {
  const wav = Buffer.from('wav-bytes');
  const speech = { assess: vi.fn().mockResolvedValue(speechResponse) };
  const converter = { toWav16kMono: vi.fn().mockResolvedValue(wav) };
  const repo = new InMemoryAssessmentRepository();
  const useCase = new AssessPronunciationUseCase(
    speech as SpeechAssessmentPort,
    repo,
    converter as AudioConverterPort,
  );
  return { speech, converter, repo, useCase, wav };
}

const command = {
  audio: Buffer.from('webm-bytes'),
  mimeType: 'audio/webm',
  referenceText: 'hello world',
  locale: 'en-US',
};

describe('AssessPronunciationUseCase', () => {
  it('converts audio, sends the WAV to the speech engine and saves the result', async () => {
    const { speech, converter, repo, useCase, wav } = setup();

    const result = await useCase.execute(command);

    expect(converter.toWav16kMono).toHaveBeenCalledWith(command.audio, 'audio/webm');
    expect(speech.assess).toHaveBeenCalledWith({
      ...command,
      audio: wav,
      mimeType: 'audio/wav',
    });
    expect(result.overall.value).toBe(80);
    expect(result.weakestWords(1)[0].word).toBe('world');
    expect(await repo.findById(result.id)).toBe(result);
  });

  it('rejects empty audio before calling any port', async () => {
    const { speech, converter, useCase } = setup();

    await expect(
      useCase.execute({ ...command, audio: Buffer.alloc(0) }),
    ).rejects.toBeInstanceOf(InvalidAudioError);
    expect(converter.toWav16kMono).not.toHaveBeenCalled();
    expect(speech.assess).not.toHaveBeenCalled();
  });

  it('rejects provider scores outside 0-100 and saves nothing', async () => {
    const { repo, useCase } = setup({ ...response, accuracy: 120 });

    await expect(useCase.execute(command)).rejects.toBeInstanceOf(InvalidScoreError);
    expect(await repo.findById('any')).toBeNull();
  });
});
