import { spawn as nodeSpawn } from 'node:child_process';
import type { AudioConverterPort } from '../../application/ports/out/audio-converter.port.js';

export type SpawnFn = typeof nodeSpawn;

export class AudioConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AudioConversionError';
  }
}

/** Converts audio through the ffmpeg binary, streaming over stdin/stdout. */
export class FfmpegAudioConverter implements AudioConverterPort {
  constructor(
    private readonly ffmpegPath = 'ffmpeg',
    private readonly spawn: SpawnFn = nodeSpawn,
  ) {}

  toWav16kMono(audio: Buffer, _mimeType: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const args = [
        '-hide_banner',
        '-loglevel', 'error',
        '-i', 'pipe:0',
        '-ac', '1',
        '-ar', '16000',
        '-f', 'wav',
        'pipe:1',
      ];
      const proc = this.spawn(this.ffmpegPath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const out: Buffer[] = [];
      const err: Buffer[] = [];
      proc.stdout.on('data', (c: Buffer) => out.push(c));
      proc.stderr.on('data', (c: Buffer) => err.push(c));
      // ffmpeg may exit before consuming all input; the exit code is the real signal.
      proc.stdin.on('error', () => undefined);
      proc.on('error', (e) =>
        reject(new AudioConversionError(`Cannot run ffmpeg: ${e.message}`)),
      );
      proc.on('close', (code) => {
        if (code === 0) return resolve(Buffer.concat(out));
        const detail = Buffer.concat(err).toString().trim();
        reject(new AudioConversionError(`ffmpeg exited with code ${code}: ${detail}`));
      });

      proc.stdin.end(audio);
    });
  }
}
