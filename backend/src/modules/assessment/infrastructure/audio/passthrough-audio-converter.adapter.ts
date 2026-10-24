import type { AudioConverterPort } from '../../application/ports/out/audio-converter.port.js';

/** Use when clients already upload 16 kHz mono PCM WAV. */
export class PassthroughAudioConverter implements AudioConverterPort {
  async toWav16kMono(audio: Buffer): Promise<Buffer> {
    return audio;
  }
}
