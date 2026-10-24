export const AUDIO_CONVERTER = Symbol('AUDIO_CONVERTER');

/** Outbound port: normalise any recorded audio to 16 kHz mono PCM WAV. */
export interface AudioConverterPort {
  toWav16kMono(audio: Buffer, mimeType: string): Promise<Buffer>;
}
