import {
  AzureSpeechAssessmentAdapter,
  AzureSpeechAssessmentError,
} from './azure-speech-assessment.adapter.js';

const request = {
  audio: Buffer.from('wav'),
  mimeType: 'audio/wav',
  referenceText: 'hello world',
  locale: 'en-US',
};

const adapter = new AzureSpeechAssessmentAdapter({ key: 'k', region: 'eastus' });

function mockFetch(body: unknown, status = 200) {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('AzureSpeechAssessmentAdapter', () => {
  it('sends key, region URL and a base64 assessment config', async () => {
    const fetchMock = mockFetch({
      RecognitionStatus: 'Success',
      NBest: [{ PronunciationAssessment: {}, Words: [] }],
    });

    await adapter.assess(request);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('https://eastus.stt.speech.microsoft.com/');
    expect(url).toContain('language=en-US');
    expect(init.headers['Ocp-Apim-Subscription-Key']).toBe('k');
    const config = JSON.parse(
      Buffer.from(init.headers['Pronunciation-Assessment'], 'base64').toString(),
    );
    expect(config).toMatchObject({
      ReferenceText: 'hello world',
      GradingSystem: 'HundredMark',
      Granularity: 'Phoneme',
    });
  });

  it('maps scores for overall, words and phonemes', async () => {
    mockFetch({
      RecognitionStatus: 'Success',
      NBest: [
        {
          PronunciationAssessment: {
            AccuracyScore: 91,
            FluencyScore: 82,
            CompletenessScore: 100,
          },
          Words: [
            {
              Word: 'hello',
              PronunciationAssessment: { AccuracyScore: 88 },
              Phonemes: [{ Phoneme: 'h', PronunciationAssessment: { AccuracyScore: 70 } }],
            },
          ],
        },
      ],
    });

    await expect(adapter.assess(request)).resolves.toEqual({
      accuracy: 91,
      fluency: 82,
      completeness: 100,
      words: [{ word: 'hello', score: 88, phonemes: [{ phoneme: 'h', score: 70 }] }],
    });
  });

  it('fails on a non-2xx response', async () => {
    mockFetch({}, 401);
    await expect(adapter.assess(request)).rejects.toThrow(AzureSpeechAssessmentError);
  });

  it('fails when recognition did not succeed', async () => {
    mockFetch({ RecognitionStatus: 'NoMatch' });
    await expect(adapter.assess(request)).rejects.toThrow(/NoMatch/);
  });
});
