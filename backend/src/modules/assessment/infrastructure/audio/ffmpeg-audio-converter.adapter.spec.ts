import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import {
  AudioConversionError,
  FfmpegAudioConverter,
  type SpawnFn,
} from './ffmpeg-audio-converter.adapter.js';

function fakeSpawn(behaviour: (proc: FakeProc) => void) {
  const calls: { cmd: string; args: string[] }[] = [];
  const spawn = ((cmd: string, args: string[]) => {
    const proc = Object.assign(new EventEmitter(), {
      stdin: new PassThrough(),
      stdout: new PassThrough(),
      stderr: new PassThrough(),
    });
    calls.push({ cmd, args });
    setImmediate(() => behaviour(proc));
    return proc;
  }) as unknown as SpawnFn;
  return { spawn, calls };
}
type FakeProc = EventEmitter & {
  stdin: PassThrough;
  stdout: PassThrough;
  stderr: PassThrough;
};

describe('FfmpegAudioConverter', () => {
  it('requests 16 kHz mono WAV and returns ffmpeg stdout', async () => {
    const { spawn, calls } = fakeSpawn((p) => {
      p.stdout.write('RIFF');
      p.stdout.write('data');
      p.emit('close', 0);
    });
    const converter = new FfmpegAudioConverter('/bin/ffmpeg', spawn);

    const out = await converter.toWav16kMono(Buffer.from('webm'), 'audio/webm');

    expect(out.toString()).toBe('RIFFdata');
    expect(calls[0].cmd).toBe('/bin/ffmpeg');
    expect(calls[0].args.join(' ')).toContain('-ac 1 -ar 16000 -f wav pipe:1');
  });

  it('rejects with stderr when ffmpeg exits non-zero', async () => {
    const { spawn } = fakeSpawn((p) => {
      p.stderr.write('Invalid data found');
      p.emit('close', 1);
    });
    const converter = new FfmpegAudioConverter('ffmpeg', spawn);

    await expect(converter.toWav16kMono(Buffer.from('x'), 'audio/webm')).rejects.toThrow(
      /code 1: Invalid data found/,
    );
  });

  it('rejects when the binary cannot be started', async () => {
    const { spawn } = fakeSpawn((p) => p.emit('error', new Error('ENOENT')));
    const converter = new FfmpegAudioConverter('missing', spawn);

    await expect(converter.toWav16kMono(Buffer.from('x'), 'audio/webm')).rejects.toThrow(
      AudioConversionError,
    );
  });
});
